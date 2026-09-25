from fastapi import APIRouter
from app.schemas.new_features import MultilingualChatRequest, MultilingualChatResponse
from app.services.multilingual_chatbot_service import multilingual_chatbot_service

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


@router.get("/ollama-status")
async def get_ollama_status():
    """Checks connection status of local Ollama NLP server."""
    return await multilingual_chatbot_service.get_ollama_status()


@router.post("/query", response_model=MultilingualChatResponse)
async def query_chatbot(payload: MultilingualChatRequest):
    transcription = None
    query_text = payload.query or ""

    if payload.audio_base64:
        transcription = multilingual_chatbot_service.transcribe_audio_base64(payload.audio_base64)
        if transcription:
            query_text = transcription

    reply, intent, conf = await multilingual_chatbot_service.classify_intent_and_respond_async(
        text=query_text, language=payload.language or "hi"
    )

    return MultilingualChatResponse(
        reply=reply,
        language=payload.language or "hi",
        detected_intent=intent,
        confidence=conf,
        transcribed_text=transcription,
    )

