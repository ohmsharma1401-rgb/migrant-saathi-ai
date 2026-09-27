from pydantic import BaseModel, Field
from typing import Optional, List


class AskSaathiChatRequest(BaseModel):
    conversation_id: Optional[str] = Field(None, description="UUID of existing conversation session")
    message_id: Optional[str] = Field(None, description="Unique client request ID for deduplication")
    message: str = Field(..., description="User text question")
    language: Optional[str] = Field("en", description="Target response language: en, hi, or gu")


class AskSaathiChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    classification: str
    answer: str
    sources: List[str] = []
    timestamp: str


class NewConversationRequest(BaseModel):
    language: Optional[str] = Field("en", description="Preferred conversation language")


class NewConversationResponse(BaseModel):
    conversation_id: str
    title: str
    language: str
    status: str
    created_at: str


class AskSaathiHealthResponse(BaseModel):
    ollama: bool
    model: str
    status: str
    installed_models: List[str] = []
    message: str
