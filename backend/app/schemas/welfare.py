from datetime import date
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class WelfareSchemeCreate(BaseModel):
    scheme_code: str
    name: str
    description: Optional[str] = None
    applicable_states: List[str] = []
    target_sectors: List[str] = []
    target_occupations: List[str] = []
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_income: Optional[float] = None
    benefits_summary: Optional[str] = None
    required_documents: List[Any] = []
    application_url: Optional[str] = None
    official_source: Optional[str] = None
    is_active: bool = True
    last_verified_date: Optional[date] = None


class WelfareSchemeResponse(BaseModel):
    id: str
    scheme_code: str
    name: str
    description: Optional[str] = None
    applicable_states: List[str] = []
    target_sectors: List[str] = []
    target_occupations: List[str] = []
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_income: Optional[float] = None
    benefits_summary: Optional[str] = None
    required_documents: List[Any] = []
    application_url: Optional[str] = None
    official_source: Optional[str] = None
    is_active: bool
    last_verified_date: Optional[date] = None

    class Config:
        from_attributes = True


class EligibilityCheckRequest(BaseModel):
    worker_id: Optional[str] = None  # defaults to current authenticated user's worker profile


class SchemeMatchResponse(BaseModel):
    scheme_name: str
    scheme_code: str
    status: str  # potentially_eligible / needs_verification / not_eligible
    reason: Optional[str] = None
    match_score: float
    missing_information: List[str] = []
    required_documents: List[Any] = []
    ai_explanation: Optional[str] = None


class EligibilityCheckResponse(BaseModel):
    worker_summary: Dict[str, Any]
    potential_matches: List[SchemeMatchResponse] = []
    needs_verification: List[SchemeMatchResponse] = []
    recommendations: List[str] = []
