from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


# ── Worker Profile ────────────────────────────────────────────────────────────

class WorkerProfileCreate(BaseModel):
    full_name: str
    origin_state: str
    current_district: str
    current_city: str
    gender: Optional[str] = None
    dob: Optional[date] = None
    preferred_language: str = "en"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class WorkerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    origin_state: Optional[str] = None
    current_district: Optional[str] = None
    current_city: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[date] = None
    preferred_language: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class WorkerProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    origin_state: str
    current_district: str
    current_city: str
    gender: Optional[str] = None
    dob: Optional[date] = None
    preferred_language: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_complete: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Skills ────────────────────────────────────────────────────────────────────

class SkillCreate(BaseModel):
    skill_id: int
    proficiency_level: str
    years_experience: Optional[int] = None
    is_primary: bool = False


class SkillResponse(BaseModel):
    id: int
    name: str
    sector: str
    category: Optional[str] = None

    class Config:
        from_attributes = True


class WorkerSkillResponse(BaseModel):
    id: str
    skill: SkillResponse
    proficiency_level: str
    years_experience: Optional[int] = None
    is_primary: bool

    class Config:
        from_attributes = True


# ── Employment ────────────────────────────────────────────────────────────────

class EmploymentRecordCreate(BaseModel):
    employer_name: Optional[str] = None
    sector: str
    occupation: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = True


class EmploymentRecordResponse(BaseModel):
    id: str
    worker_id: str
    employer_name: Optional[str] = None
    sector: str
    occupation: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Wages ─────────────────────────────────────────────────────────────────────

class WageRecordCreate(BaseModel):
    reported_daily_wage: float
    wage_type: str  # daily/monthly/weekly
    employment_id: Optional[str] = None
    period_month: Optional[str] = None


class WageRecordResponse(BaseModel):
    id: str
    worker_id: str
    employment_id: Optional[str] = None
    reported_daily_wage: float
    wage_type: str
    period_month: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── NL Skill Extraction ───────────────────────────────────────────────────────

class NLSkillExtractRequest(BaseModel):
    text: str


class NLSkillExtractResponse(BaseModel):
    extracted_occupation: Optional[str] = None
    extracted_skills: List[str] = []
    origin_state: Optional[str] = None
    current_location: Optional[str] = None
    experience_years: Optional[int] = None
    note: Optional[str] = None
