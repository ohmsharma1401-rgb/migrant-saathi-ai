from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ── Feature 1 & 2: Attendance & Geo-Fencing ─────────────────────────────────────

class FaceEnrollRequest(BaseModel):
    worker_id: str
    image_base64: str  # Base64 encoded image string


class FaceEnrollResponse(BaseModel):
    success: bool
    worker_id: str
    message: str


class AttendanceVerifyRequest(BaseModel):
    worker_id: str
    image_base64: str
    worksite_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    blink_count: Optional[int] = Field(default=0, description="Observed blink count for liveness verification")
    head_turn_detected: Optional[bool] = Field(default=False, description="Head turn challenge verification flag")


class AttendanceVerifyResponse(BaseModel):
    verified: bool
    face_matched: bool
    geo_matched: bool
    liveness_verified: bool
    status: str  # PRESENT, PROXY_SUSPECTED, REJECTED
    distance_meters: Optional[float] = None
    message: str


class WorksiteGeofenceCreate(BaseModel):
    worksite_id: str
    worksite_name: Optional[str] = None
    center_lat: float
    center_lng: float
    radius_meters: float = 500.0


class WorksiteGeofenceResponse(BaseModel):
    id: str
    worksite_id: str
    worksite_name: Optional[str]
    center_lat: float
    center_lng: float
    radius_meters: float
    created_at: datetime


class OfflineAttendanceRecord(BaseModel):
    worker_id: str
    worksite_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: str
    face_matched: bool
    geo_matched: bool
    liveness_verified: bool
    status: str


class SyncOfflineAttendanceRequest(BaseModel):
    logs: List[OfflineAttendanceRecord]


# ── Feature 3: Anomaly Detection ──────────────────────────────────────────────

class AnomalyResponse(BaseModel):
    id: str
    worker_id: str
    employer_name: Optional[str]
    anomaly_type: str
    severity: str
    details: Dict[str, Any]
    resolved: bool
    detected_at: datetime


# ── Feature 4: Predictive Risk Scoring ───────────────────────────────────────

class RiskScoreResponse(BaseModel):
    id: str
    worker_id: str
    employer_name: Optional[str]
    risk_score: float
    risk_level: str
    top_factors: List[str]
    calculated_at: datetime


# ── Feature 5: Multilingual NLP Chatbot & Voice ──────────────────────────────

class MultilingualChatRequest(BaseModel):
    query: Optional[str] = None
    language: Optional[str] = "hi"  # hi, bn, or, mr, en
    audio_base64: Optional[str] = None  # Base64 encoded audio for Whisper speech-to-text


class MultilingualChatResponse(BaseModel):
    reply: str
    language: str
    detected_intent: str
    confidence: float
    transcribed_text: Optional[str] = None


# ── Feature 6: Skill Extraction & Matching ───────────────────────────────────

class SkillExtractMatchRequest(BaseModel):
    text: str


class MatchedJobPosting(BaseModel):
    title: str
    sector: str
    required_skills: List[str]
    match_percentage: float


class SkillExtractMatchResponse(BaseModel):
    extracted_skills: List[str]
    matched_jobs: List[MatchedJobPosting]


# ── Feature 7: Document OCR ───────────────────────────────────────────────────

class DocumentOCRRequest(BaseModel):
    image_base64: str
    document_type: Optional[str] = "aadhaar"  # aadhaar / labour_card / auto


class DocumentOCRResponse(BaseModel):
    document_type: str
    extracted_fields: Dict[str, Optional[str]]
    confidence: float
    raw_text: str
