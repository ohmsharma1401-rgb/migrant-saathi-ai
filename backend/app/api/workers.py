from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_worker
from app.models.worker import EmploymentRecord, Skill, WorkerProfile, WorkerSkill, WageRecord
from app.schemas.worker import (
    EmploymentRecordCreate,
    EmploymentRecordResponse,
    NLSkillExtractRequest,
    NLSkillExtractResponse,
    SkillCreate,
    SkillResponse,
    WageRecordCreate,
    WageRecordResponse,
    WorkerProfileCreate,
    WorkerProfileResponse,
    WorkerProfileUpdate,
    WorkerSkillResponse,
)

router = APIRouter(prefix="/api/workers", tags=["workers"])


# ── Profile ───────────────────────────────────────────────────────────────────

@router.post("/profile", response_model=WorkerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    payload: WorkerProfileCreate,
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Worker profile already exists")

    profile = WorkerProfile(**payload.model_dump(), user_id=current_user.id)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return _profile_response(profile)


@router.get("/profile", response_model=WorkerProfileResponse)
async def get_my_profile(
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return _profile_response(profile)


@router.patch("/profile", response_model=WorkerProfileResponse)
async def update_profile(
    payload: WorkerProfileUpdate,
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return _profile_response(profile)


@router.get("/{worker_id}/profile", response_model=WorkerProfileResponse)
async def get_worker_profile(
    worker_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WorkerProfile).where(WorkerProfile.id == worker_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return _profile_response(profile)


# ── Skills ────────────────────────────────────────────────────────────────────

@router.get("/skills/catalog", response_model=List[SkillResponse])
async def list_skills(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Skill).where(Skill.is_active == True))  # noqa: E712
    return [SkillResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/skills", status_code=status.HTTP_201_CREATED)
async def add_worker_skill(
    payload: SkillCreate,
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    worker_skill = WorkerSkill(
        worker_id=profile.id,
        skill_id=payload.skill_id,
        proficiency_level=payload.proficiency_level,
        years_experience=payload.years_experience,
        is_primary=payload.is_primary,
    )
    db.add(worker_skill)
    await db.commit()
    return {"message": "Skill added"}


@router.get("/skills", response_model=List[WorkerSkillResponse])
async def get_worker_skills(
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    result = await db.execute(
        select(WorkerSkill).where(WorkerSkill.worker_id == profile.id)
    )
    skills = result.scalars().all()
    out = []
    for ws in skills:
        await db.refresh(ws, ["skill"])
        out.append(
            WorkerSkillResponse(
                id=str(ws.id),
                skill=SkillResponse.model_validate(ws.skill),
                proficiency_level=ws.proficiency_level,
                years_experience=ws.years_experience,
                is_primary=ws.is_primary,
            )
        )
    return out


# ── Employment ────────────────────────────────────────────────────────────────

@router.post(
    "/employment",
    response_model=EmploymentRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_employment(
    payload: EmploymentRecordCreate,
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    record = EmploymentRecord(**payload.model_dump(), worker_id=profile.id)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return EmploymentRecordResponse(
        id=str(record.id),
        worker_id=str(record.worker_id),
        employer_name=record.employer_name,
        sector=record.sector,
        occupation=record.occupation,
        start_date=record.start_date,
        end_date=record.end_date,
        is_current=record.is_current,
        created_at=record.created_at,
    )


@router.get("/employment", response_model=List[EmploymentRecordResponse])
async def get_employment(
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    result = await db.execute(
        select(EmploymentRecord).where(EmploymentRecord.worker_id == profile.id)
    )
    records = result.scalars().all()
    return [
        EmploymentRecordResponse(
            id=str(r.id),
            worker_id=str(r.worker_id),
            employer_name=r.employer_name,
            sector=r.sector,
            occupation=r.occupation,
            start_date=r.start_date,
            end_date=r.end_date,
            is_current=r.is_current,
            created_at=r.created_at,
        )
        for r in records
    ]


# ── Wages ─────────────────────────────────────────────────────────────────────

@router.post("/wages", response_model=WageRecordResponse, status_code=status.HTTP_201_CREATED)
async def add_wage_record(
    payload: WageRecordCreate,
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    record = WageRecord(
        worker_id=profile.id,
        employment_id=payload.employment_id,
        reported_daily_wage=payload.reported_daily_wage,
        wage_type=payload.wage_type,
        period_month=payload.period_month,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return WageRecordResponse(
        id=str(record.id),
        worker_id=str(record.worker_id),
        employment_id=str(record.employment_id) if record.employment_id else None,
        reported_daily_wage=float(record.reported_daily_wage),
        wage_type=record.wage_type,
        period_month=record.period_month,
        created_at=record.created_at,
    )


# ── NL Skill Extraction ───────────────────────────────────────────────────────

@router.post("/skills/extract", response_model=NLSkillExtractResponse)
async def extract_skills_nl(
    payload: NLSkillExtractRequest,
    current_user=Depends(require_worker),
):
    from app.services.skill_agent import skill_agent

    return await skill_agent.extract_skills_from_text(payload.text)


# ── Helper ────────────────────────────────────────────────────────────────────

def _profile_response(profile: WorkerProfile) -> WorkerProfileResponse:
    return WorkerProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        full_name=profile.full_name,
        origin_state=profile.origin_state,
        current_district=profile.current_district,
        current_city=profile.current_city,
        gender=profile.gender,
        dob=profile.dob,
        preferred_language=profile.preferred_language,
        latitude=profile.latitude,
        longitude=profile.longitude,
        profile_complete=profile.profile_complete,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )
