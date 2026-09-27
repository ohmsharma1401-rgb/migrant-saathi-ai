from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class FindingItem(BaseModel):
    id: str
    category: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    description: str
    rule_violated: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EvidenceItem(BaseModel):
    id: str
    title: str
    evidence_type: str  # photo, document, statement, audio
    url: Optional[str] = None
    notes: Optional[str] = None
    geotag: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class WorkerStatement(BaseModel):
    statement: str
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
    witness_name: Optional[str] = None
    verified_by_worker: bool = True


class EmployerResponse(BaseModel):
    representative_name: str
    designation: str
    response_text: str
    rectification_timeline_days: Optional[int] = None
    recorded_at: datetime = Field(default_factory=datetime.utcnow)


class InspectionCase(BaseModel):
    id: str
    case_code: str
    worker_id: str
    worker_name: str
    worker_phone: str
    worker_occupation: str
    worker_domicile: str
    employer_id: str
    employer_name: str
    workplace_site: str
    location_district: str
    complaint_category: str  # Wage, Safety, Harassment, Working Conditions, Illegal Overtime
    complaint_description: str
    reported_wage: Optional[float] = None
    reference_wage: Optional[float] = None
    wage_disparity: Optional[float] = None
    priority: str  # Critical, High, Medium, Normal
    status: str  # Scheduled, In Progress, Verified, Unresolved, Escalated, Closed
    scheduled_date: str
    scheduled_time: str
    assigned_inspector_id: str
    assigned_inspector_name: str
    assigned_inspector_badge: str
    findings: List[FindingItem] = []
    evidence: List[EvidenceItem] = []
    worker_statement: Optional[WorkerStatement] = None
    employer_response: Optional[EmployerResponse] = None
    inspection_notes: List[str] = []
    recommended_action: Optional[str] = None
    statutory_notice_issued: bool = False
    escalated_to_official: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class InspectionDashboardMetrics(BaseModel):
    today_inspections: int
    assigned_cases: int
    high_priority_cases: int
    overdue_inspections: int
    pending_reports: int
    today_roster: List[InspectionCase]


class FindingCreatePayload(BaseModel):
    category: str
    severity: str
    description: str
    rule_violated: Optional[str] = None


class EvidenceCreatePayload(BaseModel):
    title: str
    evidence_type: str
    url: Optional[str] = None
    notes: Optional[str] = None
    geotag: Optional[str] = None


class WorkerStatementPayload(BaseModel):
    statement: str
    witness_name: Optional[str] = None
    verified_by_worker: bool = True


class EmployerResponsePayload(BaseModel):
    representative_name: str
    designation: str
    response_text: str
    rectification_timeline_days: Optional[int] = None


class ReportSubmitPayload(BaseModel):
    summary: str
    statutory_violations: List[str]
    penalty_recommended_inr: Optional[float] = 0
    rectification_days: int = 14
    issue_formal_notice: bool = True
    final_status: str = "Verified"  # Verified, Unresolved, Escalated


class EscalatePayload(BaseModel):
    reason: str
    urgency: str = "HIGH"
    official_id: Optional[str] = None


class AssignCasePayload(BaseModel):
    grievance_id: str
    inspector_id: str
    scheduled_date: str
    scheduled_time: str
    priority: str
    instructions: Optional[str] = None


class InspectorWorkloadItem(BaseModel):
    id: str
    name: str
    badge_number: str
    district: str
    email: str
    phone: str
    active_inspections: int
    completed_this_month: int
    overdue_count: int
    status: str  # Active, In Field, On Leave
