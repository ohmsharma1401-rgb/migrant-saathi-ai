from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class GrievanceCreate(BaseModel):
    description: str
    location_district: Optional[str] = None


class GrievanceResponse(BaseModel):
    id: str
    complaint_code: str
    category: str
    description: str
    priority: str
    status: str
    location_district: Optional[str] = None
    created_at: datetime
    ai_classification: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class GrievanceUpdateCreate(BaseModel):
    status_change: Optional[str] = None
    note: Optional[str] = None


class GrievanceListResponse(BaseModel):
    items: List[GrievanceResponse]
    total: int
    page: int
    page_size: int
    pages: int
