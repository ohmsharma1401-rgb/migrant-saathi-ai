import logging
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.domain_classifier import domain_classifier
from app.services.knowledge_service import knowledge_service
from app.services.worker_context_service import worker_context_service
from app.services.conversation_service import conversation_service
from app.services.ollama_service import ollama_service

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are Saathi, the empathetic, expert AI assistance layer of Migrant Saathi platform.
Migrant Saathi supports migrant workers and daily-wage labourers with employment, job opportunities, minimum wages, welfare schemes (BOCW, PM-SYM, e-Shram, PM-JAY), skills, workplace safety, and grievance reporting in India.

YOUR PRIMARY RESPONSIBILITY:
Provide clear, accurate, and trustworthy guidance to migrant workers.

KNOWLEDGE RULE:
- Use the verified Migrant Saathi knowledge provided below whenever relevant.
- Do NOT invent unverified government scheme eligibility rules, fake monetary amounts, or fake deadlines.
- If specific verified scheme rules are missing for a specialized claim, clearly explain general procedures or advise contacting official Labour Helpline 14434.

LANGUAGE RULE:
Respond clearly and empathetically in language '{language}'. (Supported languages: English, Hindi, Gujarati).
Preserve names of official government schemes (BOCW, PM-SYM, e-Shram, PM-JAY) in their standard recognized forms.

ANSWER STYLE:
- Be clear, concise, and structured.
- Use simple language suitable for workers.
- Use bullet points when listing steps, requirements, or wage figures.

{worker_context_clause}

VERIFIED KNOWLEDGE CONTEXT:
{knowledge_context}
"""


class AskSaathiService:
    """Master orchestrator for Ask Saathi RAG pipeline."""

    async def process_chat(
        self,
        db: AsyncSession,
        user_id: str,
        message: str,
        conversation_id: Optional[str] = None,
        message_id: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        lang = language if language in ["en", "hi", "gu"] else "en"
        text = message.strip()

        # 1. Resolve or Create Conversation
        conv = await conversation_service.get_or_create_conversation(db, user_id, conversation_id, lang)

        # 2. Check for Duplicate Requests
        if message_id:
            dup = await conversation_service.check_duplicate_message(db, conv.id, message_id)
            if dup:
                _, dup_ast_content, dup_sources = dup
                return {
                    "conversation_id": str(conv.id),
                    "message_id": message_id,
                    "classification": "in_scope",
                    "answer": dup_ast_content,
                    "sources": dup_sources,
                    "timestamp": str(conv.updated_at)
                }

        # 3. Domain Classification (Deterministic Guard)
        classification, rej_msg = domain_classifier.classify(text, lang)
        if classification == "out_of_scope":
            await conversation_service.add_message_pair(
                db=db,
                conversation_id=conv.id,
                user_content=text,
                assistant_content=rej_msg,
                classification="out_of_scope",
                sources=[],
                message_id=message_id
            )
            return {
                "conversation_id": str(conv.id),
                "message_id": message_id or str(uuid.uuid4()),
                "classification": "out_of_scope",
                "answer": rej_msg,
                "sources": [],
                "timestamp": str(conv.updated_at)
            }

        # 4. Knowledge Retrieval (RAG)
        knowledge_text, sources, knowledge_found = await knowledge_service.retrieve_relevant_knowledge(db, text, lang)
        k_context = knowledge_text if knowledge_found else "General Migrant Saathi worker domain knowledge."

        # 5. Worker Context Retrieval
        worker_ctx = await worker_context_service.get_worker_context(db, user_id)
        worker_clause = f"AUTHENTICATED WORKER PROFILE:\n{worker_ctx}" if worker_ctx else "WORKER PROFILE: Unspecified"

        # 6. Retrieve Controlled Recent Conversation Memory (Last 8 messages)
        recent_history = await conversation_service.get_recent_history(db, conv.id, limit=8)

        # 7. Construct Ollama /api/chat Payload
        sys_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            language=lang,
            worker_context_clause=worker_clause,
            knowledge_context=k_context
        )

        ollama_messages = [{"role": "system", "content": sys_prompt}]

        for h_msg in recent_history:
            if h_msg["role"] in ["user", "assistant"]:
                ollama_messages.append({
                    "role": h_msg["role"],
                    "content": h_msg["content"]
                })

        # ALWAYS ensure current user question is the LAST user message
        ollama_messages.append({
            "role": "user",
            "content": text
        })

        # 8. Send Request to Ollama
        ollama_reply = await ollama_service.chat_completion(ollama_messages)

        if not ollama_reply:
            # Handle Ollama Server Unavailable / Timeout cleanly
            logger.warning("[AskSaathiService] Ollama chat completion returned empty response or server offline")
            err_msg = (
                "Saathi AI is temporarily unavailable. Please try again in a moment."
                if lang == "en" else
                ("साथी एआई अस्थायी रूप से अनुपलब्ध है। कृपया कुछ देर बाद पुनः प्रयास करें।"
                 if lang == "hi" else
                 "સાથી AI ક્ષણિક રીતે અનુપલબ્ધ છે. કૃપા કરીને થોડી ક્ષણો પછી ફરી પ્રયાસ કરો.")
            )
            return {
                "conversation_id": str(conv.id),
                "message_id": message_id or str(uuid.uuid4()),
                "classification": "service_unavailable",
                "answer": err_msg,
                "sources": [],
                "timestamp": str(conv.updated_at)
            }

        # 9. Save Messages to Conversation DB
        await conversation_service.add_message_pair(
            db=db,
            conversation_id=conv.id,
            user_content=text,
            assistant_content=ollama_reply,
            classification="in_scope",
            sources=sources,
            message_id=message_id
        )

        return {
            "conversation_id": str(conv.id),
            "message_id": message_id or str(uuid.uuid4()),
            "classification": "in_scope",
            "answer": ollama_reply,
            "sources": sources,
            "timestamp": str(conv.updated_at)
        }


ask_saathi_service = AskSaathiService()
