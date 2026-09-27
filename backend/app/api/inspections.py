import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_role
from app.schemas.inspection import (
    AssignCasePayload,
    EmployerResponsePayload,
    EscalatePayload,
    EvidenceCreatePayload,
    FindingCreatePayload,
    InspectionCase,
    InspectionDashboardMetrics,
    InspectorWorkloadItem,
    ReportSubmitPayload,
    WorkerStatementPayload,
)

router = APIRouter(prefix="/api/inspections", tags=["inspections"])

# ─── RBAC Helpers ─────────────────────────────────────────────────────────────
require_inspector_or_admin = require_role("inspector", "official", "admin")
require_official_or_admin = require_role("official", "admin")

# ─── Initial Seed / Memory Store for Inspections ─────────────────────────────
# In production, these integrate into the grievances & audit_logs DB tables.
SEED_INSPECTIONS: List[dict] = [
  {
    "id": "insp-001",
    "case_code": "CASE-GJ-2026-0891",
    "worker_id": "MS-GJ-88219",
    "worker_name": "Ramesh Kumar",
    "worker_phone": "+91 98251 44102",
    "worker_occupation": "Mason (Skilled)",
    "worker_domicile": "Bihar",
    "employer_id": "c-surat-1",
    "employer_name": "Shree Construction Ltd.",
    "workplace_site": "Hazira Waterfront Commercial Tower, Plot 42",
    "location_district": "Surat",
    "complaint_category": "Wage",
    "complaint_description": "Unpaid wages for 28 working days in August 2026. Daily rate ₹550/day withheld under contractor pretext.",
    "reported_wage": 8500.0,
    "reference_wage": 12000.0,
    "wage_disparity": 3500.0,
    "priority": "High",
    "status": "Scheduled",
    "scheduled_date": "Today, 28 Sep 2026",
    "scheduled_time": "09:30 AM",
    "assigned_inspector_id": "ins-101",
    "assigned_inspector_name": "Rajendra Solanki",
    "assigned_inspector_badge": "INS-GJ-0418",
    "findings": [],
    "evidence": [
      {
        "id": "ev-1",
        "title": "August Muster Roll Screenshot",
        "evidence_type": "document",
        "url": "/evidence/muster_aug.pdf",
        "notes": "Worker marked present on 26 of 28 scheduled shifts.",
        "geotag": "21.1648 N, 72.6845 E",
        "uploaded_at": datetime.now(timezone.utc),
      }
    ],
    "worker_statement": None,
    "employer_response": None,
    "inspection_notes": ["Priority investigation flagged by AI Discrepancy detector."],
    "recommended_action": None,
    "statutory_notice_issued": False,
    "escalated_to_official": False,
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
  },
  {
    "id": "insp-002",
    "case_code": "CASE-GJ-2026-0836",
    "worker_id": "MS-GJ-77412",
    "worker_name": "Mohd. Irfan",
    "worker_phone": "+91 94280 77412",
    "worker_occupation": "Weaver (Semi-skilled)",
    "worker_domicile": "Uttar Pradesh",
    "employer_id": "c-ahm-1",
    "employer_name": "Reliance Textile & Fabrics Unit",
    "workplace_site": "Naroda GIDC Phase 3, Shed 14",
    "location_district": "Ahmedabad",
    "complaint_category": "Safety",
    "complaint_description": "Unguarded high-speed loom belts and inadequate dust exhaust causing respiratory hazards.",
    "reported_wage": 9800.0,
    "reference_wage": 11000.0,
    "wage_disparity": 1200.0,
    "priority": "Critical",
    "status": "In Progress",
    "scheduled_date": "Today, 28 Sep 2026",
    "scheduled_time": "11:45 AM",
    "assigned_inspector_id": "ins-101",
    "assigned_inspector_name": "Rajendra Solanki",
    "assigned_inspector_badge": "INS-GJ-0418",
    "findings": [
      {
        "id": "f-1",
        "category": "Machine Guarding",
        "severity": "CRITICAL",
        "description": "Loom unit #4 rotating shafts exposed without emergency stop switches.",
        "rule_violated": "Gujarat Factories Rules 1963, Rule 54",
        "created_at": datetime.now(timezone.utc),
      }
    ],
    "evidence": [
      {
        "id": "ev-2",
        "title": "Exposed Belt Drive Photograph",
        "evidence_type": "photo",
        "url": "/evidence/loom_belt.jpg",
        "notes": "Taken during physical walk-through inspection.",
        "geotag": "23.0725 N, 72.6582 E",
        "uploaded_at": datetime.now(timezone.utc),
      }
    ],
    "worker_statement": {
      "statement": "Two workers suffered minor cuts last week due to lack of gloves and machine guards. Management refused medical leave.",
      "recorded_at": datetime.now(timezone.utc),
      "witness_name": "Animesh Roy (Dyer)",
      "verified_by_worker": True,
    },
    "employer_response": None,
    "inspection_notes": ["Immediate stop-work order advised for line 4."],
    "recommended_action": "Issue Statutory Form 12 Notice",
    "statutory_notice_issued": False,
    "escalated_to_official": False,
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
  },
  {
    "id": "insp-003",
    "case_code": "CASE-GJ-2026-0792",
    "worker_id": "MS-GJ-44081",
    "worker_name": "Rajesh Sharma",
    "worker_phone": "+91 97123 44081",
    "worker_occupation": "Diamond Polisher (Highly Skilled)",
    "worker_domicile": "Rajasthan",
    "employer_id": "c-surat-2",
    "employer_name": "Surat Diamond Craft Industries",
    "workplace_site": "Katargam Diamond Hub, Floor 3",
    "location_district": "Surat",
    "complaint_category": "Illegal Overtime",
    "complaint_description": "Forced 14-hour daily shifts without statutory double overtime compensation.",
    "reported_wage": 11200.0,
    "reference_wage": 14000.0,
    "wage_disparity": 2800.0,
    "priority": "High",
    "status": "Scheduled",
    "scheduled_date": "Today, 28 Sep 2026",
    "scheduled_time": "02:30 PM",
    "assigned_inspector_id": "ins-101",
    "assigned_inspector_name": "Rajendra Solanki",
    "assigned_inspector_badge": "INS-GJ-0418",
    "findings": [],
    "evidence": [],
    "worker_statement": None,
    "employer_response": None,
    "inspection_notes": [],
    "recommended_action": None,
    "statutory_notice_issued": False,
    "escalated_to_official": False,
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
  },
  {
    "id": "insp-004",
    "case_code": "CASE-GJ-2026-0665",
    "worker_id": "MS-GJ-66308",
    "worker_name": "Sunita Devi",
    "worker_phone": "+91 99042 66308",
    "worker_occupation": "Fitter (Skilled)",
    "worker_domicile": "Jharkhand",
    "employer_id": "c-vad-1",
    "employer_name": "L&T Infrastructure Project Site #4",
    "workplace_site": "Makarpura Industrial Zone",
    "location_district": "Vadodara",
    "complaint_category": "Working Conditions",
    "complaint_description": "No clean drinking water facilities or sanitary restrooms provided at site.",
    "reported_wage": 14500.0,
    "reference_wage": 15000.0,
    "wage_disparity": 500.0,
    "priority": "Medium",
    "status": "Scheduled",
    "scheduled_date": "Today, 28 Sep 2026",
    "scheduled_time": "04:15 PM",
    "assigned_inspector_id": "ins-101",
    "assigned_inspector_name": "Rajendra Solanki",
    "assigned_inspector_badge": "INS-GJ-0418",
    "findings": [],
    "evidence": [],
    "worker_statement": None,
    "employer_response": None,
    "inspection_notes": [],
    "recommended_action": None,
    "statutory_notice_issued": False,
    "escalated_to_official": False,
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
  },
  {
    "id": "insp-005",
    "case_code": "CASE-GJ-2026-0511",
    "worker_id": "MS-GJ-55194",
    "worker_name": "Ajay Munda",
    "worker_phone": "+91 98791 55194",
    "worker_occupation": "Lathe Operator",
    "worker_domicile": "Odisha",
    "employer_id": "c-raj-1",
    "employer_name": "Rajkot Auto Components Ltd.",
    "workplace_site": "Metoda GIDC Industrial Area",
    "location_district": "Rajkot",
    "complaint_category": "Wage",
    "complaint_description": "Arbitrary ₹2,300 wage deduction marked as damage penalty without notice.",
    "reported_wage": 10200.0,
    "reference_wage": 12500.0,
    "wage_disparity": 2300.0,
    "priority": "High",
    "status": "Overdue",
    "scheduled_date": "Yesterday, 27 Sep 2026",
    "scheduled_time": "11:00 AM",
    "assigned_inspector_id": "ins-101",
    "assigned_inspector_name": "Rajendra Solanki",
    "assigned_inspector_badge": "INS-GJ-0418",
    "findings": [],
    "evidence": [],
    "worker_statement": None,
    "employer_response": None,
    "inspection_notes": ["Delayed due to travel delay in Rajkot highway."],
    "recommended_action": None,
    "statutory_notice_issued": False,
    "escalated_to_official": False,
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
  },
  {
    "id": "insp-006",
    "case_code": "CASE-GJ-2026-0498",
    "worker_id": "MS-GJ-66304",
    "worker_name": "Dinesh Sahu",
    "worker_phone": "+91 99099 66304",
    "worker_occupation": "Plumber",
    "worker_domicile": "Chhattisgarh",
    "employer_id": "c-gn-1",
    "employer_name": "GIFT City Towers Construction",
    "workplace_site": "GIFT City Zone 1, Sector 2",
    "location_district": "Gandhinagar",
    "complaint_category": "Safety",
    "complaint_description": "Lack of safety harnesses and fall prevention nets on 8th floor building frame.",
    "reported_wage": 7800.0,
    "reference_wage": 12000.0,
    "wage_disparity": 4200.0,
    "priority": "Critical",
    "status": "Overdue",
    "scheduled_date": "26 Sep 2026",
    "scheduled_time": "03:00 PM",
    "assigned_inspector_id": "ins-101",
    "assigned_inspector_name": "Rajendra Solanki",
    "assigned_inspector_badge": "INS-GJ-0418",
    "findings": [],
    "evidence": [],
    "worker_statement": None,
    "employer_response": None,
    "inspection_notes": ["Urgent follow-up requested by District Magistrate."],
    "recommended_action": None,
    "statutory_notice_issued": False,
    "escalated_to_official": False,
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
  },
]

SEED_INSPECTORS: List[dict] = [
  {
    "id": "ins-101",
    "name": "Rajendra Solanki",
    "badge_number": "INS-GJ-0418",
    "district": "Surat",
    "email": "solanki.insp@gujarat.gov.in",
    "phone": "+91 98250 88412",
    "active_inspections": 6,
    "completed_this_month": 22,
    "overdue_count": 2,
    "status": "In Field",
  },
  {
    "id": "ins-102",
    "name": "Vikram Rathore",
    "badge_number": "INS-GJ-0294",
    "district": "Ahmedabad",
    "email": "rathore.insp@gujarat.gov.in",
    "phone": "+91 94260 77102",
    "active_inspections": 5,
    "completed_this_month": 28,
    "overdue_count": 0,
    "status": "In Field",
  },
  {
    "id": "ins-103",
    "name": "Sonal Vaghela",
    "badge_number": "INS-GJ-0512",
    "district": "Vadodara",
    "email": "vaghela.insp@gujarat.gov.in",
    "phone": "+91 98791 22394",
    "active_inspections": 4,
    "completed_this_month": 19,
    "overdue_count": 1,
    "status": "Active",
  },
  {
    "id": "ins-104",
    "name": "Kiritbhai Makwana",
    "badge_number": "INS-GJ-0188",
    "district": "Rajkot",
    "email": "makwana.insp@gujarat.gov.in",
    "phone": "+91 99044 55188",
    "active_inspections": 3,
    "completed_this_month": 16,
    "overdue_count": 1,
    "status": "In Field",
  },
  {
    "id": "ins-105",
    "name": "Priyanka Desai",
    "badge_number": "INS-GJ-0365",
    "district": "Gandhinagar",
    "email": "desai.insp@gujarat.gov.in",
    "phone": "+91 98242 11983",
    "active_inspections": 2,
    "completed_this_month": 24,
    "overdue_count": 0,
    "status": "Active",
  },
  {
    "id": "ins-106",
    "name": "Harish Jadeja",
    "badge_number": "INS-GJ-0701",
    "district": "Kutch",
    "email": "jadeja.insp@gujarat.gov.in",
    "phone": "+91 94080 33419",
    "active_inspections": 4,
    "completed_this_month": 15,
    "overdue_count": 0,
    "status": "Active",
  },
]


# ─── 1. Inspector Dashboard Summary ──────────────────────────────────────────
@router.get("/dashboard", response_model=InspectionDashboardMetrics)
async def get_inspector_dashboard(
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Field-operation dashboard metrics for labour inspector."""
    today_cases = [c for c in SEED_INSPECTIONS if "Today" in c["scheduled_date"]]
    high_priority = [c for c in SEED_INSPECTIONS if c["priority"] in ["High", "Critical"]]
    overdue = [c for c in SEED_INSPECTIONS if c["status"] == "Overdue"]
    pending_reports = [c for c in SEED_INSPECTIONS if c["status"] in ["In Progress", "Overdue"]]

    return InspectionDashboardMetrics(
        today_inspections=len(today_cases),
        assigned_cases=len(SEED_INSPECTIONS),
        high_priority_cases=len(high_priority),
        overdue_inspections=len(overdue),
        pending_reports=len(pending_reports),
        today_roster=today_cases,
    )


# ─── 2. Inspection Roster ────────────────────────────────────────────────────
@router.get("/roster")
async def get_inspection_roster(
    status_filter: Optional[str] = Query(None),
    priority_filter: Optional[str] = Query(None),
    district_filter: Optional[str] = Query(None),
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Scheduled field inspections with date, time, site, employer, and status."""
    cases = SEED_INSPECTIONS
    if status_filter and status_filter != "All":
        cases = [c for c in cases if c["status"].lower() == status_filter.lower()]
    if priority_filter and priority_filter != "All":
        cases = [c for c in cases if c["priority"].lower() == priority_filter.lower()]
    if district_filter and district_filter != "All":
        cases = [c for c in cases if c["location_district"].lower() == district_filter.lower()]
    return cases


# ─── 3. Assigned Cases ───────────────────────────────────────────────────────
@router.get("/cases")
async def get_assigned_cases(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """List of all grievance and audit cases assigned to inspector."""
    cases = SEED_INSPECTIONS
    if category and category != "All":
        cases = [c for c in cases if c["complaint_category"].lower() == category.lower()]
    if priority and priority != "All":
        cases = [c for c in cases if c["priority"].lower() == priority.lower()]
    return cases


# ─── 4. Case Details ─────────────────────────────────────────────────────────
@router.get("/cases/{case_id}")
async def get_case_detail(
    case_id: str,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get full case details including worker info, complaint, findings, and evidence."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            return c
    raise HTTPException(status_code=404, detail="Inspection case not found")


# ─── 5. Start Inspection ─────────────────────────────────────────────────────
@router.post("/cases/{case_id}/start")
async def start_inspection(
    case_id: str,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Mark an assigned inspection as In Progress upon arriving at the worksite."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            c["status"] = "In Progress"
            c["updated_at"] = datetime.now(timezone.utc)
            c["inspection_notes"].append(f"Inspection commenced on site at {datetime.now().strftime('%H:%M')}.")
            return {"message": "Inspection marked In Progress", "case": c}
    raise HTTPException(status_code=404, detail="Case not found")


# ─── 6. Record Finding ───────────────────────────────────────────────────────
@router.post("/cases/{case_id}/findings")
async def add_finding(
    case_id: str,
    payload: FindingCreatePayload,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Add a statutory or safety violation finding during field inspection."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            new_finding = {
                "id": f"f-{uuid.uuid4().hex[:6]}",
                "category": payload.category,
                "severity": payload.severity,
                "description": payload.description,
                "rule_violated": payload.rule_violated,
                "created_at": datetime.now(timezone.utc),
            }
            c["findings"].append(new_finding)
            c["updated_at"] = datetime.now(timezone.utc)
            return {"message": "Finding recorded successfully", "finding": new_finding}
    raise HTTPException(status_code=404, detail="Case not found")


# ─── 7. Upload Evidence ──────────────────────────────────────────────────────
@router.post("/cases/{case_id}/evidence")
async def add_evidence(
    case_id: str,
    payload: EvidenceCreatePayload,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Upload photo, document, or audio evidence with geotag and timestamp."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            new_ev = {
                "id": f"ev-{uuid.uuid4().hex[:6]}",
                "title": payload.title,
                "evidence_type": payload.evidence_type,
                "url": payload.url or "/evidence/sample_evidence.jpg",
                "notes": payload.notes,
                "geotag": payload.geotag or "Gujarat Industrial Zone",
                "uploaded_at": datetime.now(timezone.utc),
            }
            c["evidence"].append(new_ev)
            c["updated_at"] = datetime.now(timezone.utc)
            return {"message": "Evidence attached successfully", "evidence": new_ev}
    raise HTTPException(status_code=404, detail="Case not found")


# ─── 8. Record Worker Statement ──────────────────────────────────────────────
@router.post("/cases/{case_id}/worker-statement")
async def record_worker_statement(
    case_id: str,
    payload: WorkerStatementPayload,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Record worker interview statement with witness verification."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            c["worker_statement"] = {
                "statement": payload.statement,
                "witness_name": payload.witness_name,
                "verified_by_worker": payload.verified_by_worker,
                "recorded_at": datetime.now(timezone.utc),
            }
            c["updated_at"] = datetime.now(timezone.utc)
            return {"message": "Worker testimony logged"}
    raise HTTPException(status_code=404, detail="Case not found")


# ─── 9. Record Employer Response ─────────────────────────────────────────────
@router.post("/cases/{case_id}/employer-response")
async def record_employer_response(
    case_id: str,
    payload: EmployerResponsePayload,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Record employer site manager response and remediation commitment."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            c["employer_response"] = {
                "representative_name": payload.representative_name,
                "designation": payload.designation,
                "response_text": payload.response_text,
                "rectification_timeline_days": payload.rectification_timeline_days,
                "recorded_at": datetime.now(timezone.utc),
            }
            c["updated_at"] = datetime.now(timezone.utc)
            return {"message": "Employer response recorded"}
    raise HTTPException(status_code=404, detail="Case not found")


# ─── 10. Submit Inspection Report ────────────────────────────────────────────
@router.post("/cases/{case_id}/report")
async def submit_inspection_report(
    case_id: str,
    payload: ReportSubmitPayload,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Finalize field inspection report and issue statutory notice or penalty order."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            c["status"] = payload.final_status
            c["recommended_action"] = payload.summary
            c["statutory_notice_issued"] = payload.issue_formal_notice
            c["updated_at"] = datetime.now(timezone.utc)
            c["inspection_notes"].append(
                f"Formal report filed: {payload.summary}. Rectification window: {payload.rectification_days} days."
            )
            return {
                "message": "Inspection report submitted successfully",
                "notice_issued": payload.issue_formal_notice,
                "case_status": c["status"],
            }
    raise HTTPException(status_code=404, detail="Case not found")


# ─── 11. Escalate Case ───────────────────────────────────────────────────────
@router.post("/cases/{case_id}/escalate")
async def escalate_case(
    case_id: str,
    payload: EscalatePayload,
    current_user=Depends(require_inspector_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Escalate critical violation directly to Government Official / Department Head."""
    for c in SEED_INSPECTIONS:
        if c["id"] == case_id or c["case_code"] == case_id:
            c["status"] = "Escalated"
            c["escalated_to_official"] = True
            c["priority"] = "Critical"
            c["updated_at"] = datetime.now(timezone.utc)
            c["inspection_notes"].append(f"ESCALATION: {payload.reason} (Urgency: {payload.urgency})")
            return {
                "message": "Case escalated to Government Official and District Magistrate",
                "case_id": c["id"],
                "status": "Escalated",
            }
    raise HTTPException(status_code=404, detail="Case not found")


# ─── 12. Government Official: Inspector Management & Workload ────────────────
@router.get("/inspectors", response_model=List[InspectorWorkloadItem])
async def list_inspectors(
    current_user=Depends(require_official_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Government Official view: monitor inspector workloads, deployment status, and backlogs."""
    return SEED_INSPECTORS


# ─── 13. Government Official: Assign Case to Inspector ───────────────────────
@router.post("/assign", status_code=status.HTTP_201_CREATED)
async def assign_case_to_inspector(
    payload: AssignCasePayload,
    current_user=Depends(require_official_or_admin),
    db: AsyncSession = Depends(get_db),
):
    """Government Official action: assign grievance or site audit to field inspector."""
    # Find matching inspector
    inspector = next((ins for ins in SEED_INSPECTORS if ins["id"] == payload.inspector_id), None)
    if not inspector:
        inspector = SEED_INSPECTORS[0]

    new_case = {
        "id": f"insp-{uuid.uuid4().hex[:6]}",
        "case_code": f"CASE-GJ-2026-{uuid.uuid4().hex[:4].upper()}",
        "worker_id": "MS-GJ-10992",
        "worker_name": "Assigned Case Worker",
        "worker_phone": "+91 98000 00000",
        "worker_occupation": "Site Operative",
        "worker_domicile": "Gujarat Domicile",
        "employer_id": "c-assigned",
        "employer_name": "Designated Contractor Unit",
        "workplace_site": f"{inspector['district']} GIDC Industrial Zone",
        "location_district": inspector["district"],
        "complaint_category": "Grievance Investigation",
        "complaint_description": payload.instructions or "Government official assigned case for immediate investigation.",
        "reported_wage": 9000.0,
        "reference_wage": 12000.0,
        "wage_disparity": 3000.0,
        "priority": payload.priority,
        "status": "Scheduled",
        "scheduled_date": payload.scheduled_date,
        "scheduled_time": payload.scheduled_time,
        "assigned_inspector_id": inspector["id"],
        "assigned_inspector_name": inspector["name"],
        "assigned_inspector_badge": inspector["badge_number"],
        "findings": [],
        "evidence": [],
        "worker_statement": None,
        "employer_response": None,
        "inspection_notes": [f"Assigned by Government Official on {datetime.now().strftime('%d %b %Y')}."],
        "recommended_action": None,
        "statutory_notice_issued": False,
        "escalated_to_official": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    SEED_INSPECTIONS.insert(0, new_case)
    inspector["active_inspections"] += 1

    return {"message": "Case assigned to inspector successfully", "case": new_case}
