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

WITHOUT_KNOWLEDGE_RESPONSES = {
    "en": (
        "I can help with migrant worker and labour-related questions, but I don't currently have "
        "verified information for this specific question in the Migrant Saathi knowledge base. "
        "Please check with the relevant government department or provide the scheme/document details so I can help explain them."
    ),
    "hi": (
        "मैं प्रवासी श्रमिकों और श्रम संबंधी प्रश्नों में मदद कर सकता हूं, लेकिन वर्तमान में प्रवासी साथी "
        "ज्ञानकोष में इस विशिष्ट प्रश्न के लिए सत्यापित जानकारी उपलब्ध नहीं है। कृपया संबंधित सरकारी विभाग से संपर्क करें।"
    ),
    "gu": (
        "હું પ્રવાસી શ્રમિકો અને શ્રમ સંબંધિત પ્રશ્નોમાં મદદ કરી શકું છું, પરંતુ હાલમાં પ્રવાસી સાથી "
        "જ્ઞાનકોશમાં આ ચોક્કસ પ્રશ્ન માટે ચકાસાયેલ માહિતી ઉપલબ્ધ નથી. કૃપા કરીને સંબંધિત સરકારી વિભાગનો સંપર્ક કરો."
    )
}

SYSTEM_PROMPT_TEMPLATE = """You are Saathi, the AI assistance layer of Migrant Saathi.
Migrant Saathi is a platform designed to support migrant workers and workers with employment, labour, wages, welfare schemes, skills, workplace safety, grievances, migration-related worker assistance, and related government services.

YOUR PRIMARY RESPONSIBILITY:
Provide clear, useful and trustworthy assistance to migrant workers and workers.

KNOWLEDGE RULE:
Use ONLY the verified Migrant Saathi information supplied in the context. Do not invent government information.
Never invent scheme eligibility, scheme benefits, monetary amounts, deadlines, legal provisions, required documents, or government procedures.
If the provided knowledge does not contain enough information to answer a worker-related question, clearly say that verified information is not currently available.

LANGUAGE RULE:
Respond clearly and empathetically in language '{language}'. (Supported languages: English, Hindi, Gujarati).
Preserve names of official schemes (such as BOCW, PM-SYM, e-Shram, PM-JAY) in their official forms.

ANSWER STYLE:
- Be clear, concise, and structured.
- Use simple language suitable for workers.
- Use bullet points when listing requirements or benefits.
- Use numbered steps for application procedures.

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

        if not knowledge_found and not knowledge_text:
            # IN_SCOPE_WITHOUT_KNOWLEDGE fallback
            no_k_msg = WITHOUT_KNOWLEDGE_RESPONSES.get(lang, WITHOUT_KNOWLEDGE_RESPONSES["en"])
            await conversation_service.add_message_pair(
                db=db,
                conversation_id=conv.id,
                user_content=text,
                assistant_content=no_k_msg,
                classification="in_scope_without_knowledge",
                sources=[],
                message_id=message_id
            )
            return {
                "conversation_id": str(conv.id),
                "message_id": message_id or str(uuid.uuid4()),
                "classification": "in_scope_without_knowledge",
                "answer": no_k_msg,
                "sources": [],
                "timestamp": str(conv.updated_at)
            }

        # 5. Worker Context Retrieval
        worker_ctx = await worker_context_service.get_worker_context(db, user_id)
        worker_clause = f"AUTHENTICATED WORKER PROFILE:\n{worker_ctx}" if worker_ctx else "WORKER PROFILE: Unspecified"

        # 6. Retrieve Controlled Recent Conversation Memory (Last 8 messages)
        recent_history = await conversation_service.get_recent_history(db, conv.id, limit=8)

        # 7. Construct Ollama /api/chat Payload
        sys_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            language=lang,
            worker_context_clause=worker_clause,
            knowledge_context=knowledge_text
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
