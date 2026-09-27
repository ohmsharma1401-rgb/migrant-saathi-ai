import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.base import get_db
from app.core.dependencies import get_current_user
from app.schemas.ask_saathi import (
    AskSaathiChatRequest,
    AskSaathiChatResponse,
    NewConversationRequest,
    NewConversationResponse,
    AskSaathiHealthResponse,
)
from app.services.ask_saathi_service import ask_saathi_service
from app.services.conversation_service import conversation_service
from app.services.ollama_service import ollama_service

router = APIRouter(prefix="/api/ask-saathi", tags=["ask-saathi"])


@router.get("/health", response_model=AskSaathiHealthResponse)
async def ask_saathi_health():
    """Verifies connection to local Ollama server and presence of llama3 model."""
    st = await ollama_service.get_status()
    return AskSaathiHealthResponse(
        ollama=st["available"],
        model=st.get("active_model", "llama3"),
        status="ready" if st["available"] else "unavailable",
        installed_models=st.get("installed_models", []),
        message=st.get("message", "Ollama status check")
    )


@router.post("/conversations/new", response_model=NewConversationResponse)
async def create_new_conversation(
    payload: NewConversationRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Starts a brand new Ask Saathi conversation context for the authenticated worker."""
    conv = await conversation_service.create_new_conversation(
        db=db,
        user_id=str(current_user.id),
        language=payload.language or "en"
    )
    return NewConversationResponse(
        conversation_id=str(conv.id),
        title=conv.title,
        language=conv.language,
        status=conv.status,
        created_at=str(conv.created_at)
    )


@router.post("/chat", response_model=AskSaathiChatResponse)
async def ask_saathi_chat(
    payload: AskSaathiChatRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Main Ask Saathi AI Chat Endpoint:
    Processes user query through authentication, domain classification, knowledge retrieval,
    worker context, conversation history, and local Ollama llama3 LLM engine.
    """
    user_id = str(current_user.id)
    msg_text = payload.message.strip()
    if not msg_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    res = await ask_saathi_service.process_chat(
        db=db,
        user_id=user_id,
        message=msg_text,
        conversation_id=payload.conversation_id,
        message_id=payload.message_id or str(uuid.uuid4()),
        language=payload.language or "en"
    )

    return AskSaathiChatResponse(
        conversation_id=res["conversation_id"],
        message_id=res["message_id"],
        classification=res["classification"],
        answer=res["answer"],
        sources=res.get("sources", []),
        timestamp=res.get("timestamp", "")
    )
