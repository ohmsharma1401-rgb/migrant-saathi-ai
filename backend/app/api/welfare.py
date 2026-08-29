from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_admin
from app.models.welfare import WelfareScheme
from app.schemas.welfare import (
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    WelfareSchemeCreate,
    WelfareSchemeResponse,
)

router = APIRouter(prefix="/api/welfare", tags=["welfare"])


@router.get("/schemes", response_model=List[WelfareSchemeResponse])
async def list_schemes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WelfareScheme).where(WelfareScheme.is_active == True))  # noqa: E712
    schemes = result.scalars().all()
    return [_scheme_response(s) for s in schemes]


@router.get("/schemes/{scheme_id}", response_model=WelfareSchemeResponse)
async def get_scheme(scheme_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WelfareScheme).where(WelfareScheme.id == scheme_id))
    scheme = result.scalar_one_or_none()
    if scheme is None:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return _scheme_response(scheme)


@router.post(
    "/schemes",
    response_model=WelfareSchemeResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_scheme(payload: WelfareSchemeCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(WelfareScheme).where(WelfareScheme.scheme_code == payload.scheme_code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Scheme code already exists")

    scheme = WelfareScheme(**payload.model_dump())
    db.add(scheme)
    await db.commit()
    await db.refresh(scheme)
    return _scheme_response(scheme)


@router.post("/eligibility-check", response_model=EligibilityCheckResponse)
async def check_eligibility(
    payload: EligibilityCheckRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.worker import WorkerProfile
    from app.services.welfare_agent import welfare_agent

    worker_id = payload.worker_id
    if worker_id is None:
        profile_result = await db.execute(
            select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile is None:
            raise HTTPException(status_code=404, detail="Worker profile not found")
    else:
        profile_result = await db.execute(
            select(WorkerProfile).where(WorkerProfile.id == worker_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile is None:
            raise HTTPException(status_code=404, detail="Worker profile not found")

    return await welfare_agent.check_eligibility(profile, db)


# ── Helper ────────────────────────────────────────────────────────────────────

def _scheme_response(scheme: WelfareScheme) -> WelfareSchemeResponse:
    return WelfareSchemeResponse(
        id=str(scheme.id),
        scheme_code=scheme.scheme_code,
        name=scheme.name,
        description=scheme.description,
        applicable_states=scheme.applicable_states or [],
        target_sectors=scheme.target_sectors or [],
        target_occupations=scheme.target_occupations or [],
        min_age=scheme.min_age,
        max_age=scheme.max_age,
        max_income=float(scheme.max_income) if scheme.max_income else None,
        benefits_summary=scheme.benefits_summary,
        required_documents=scheme.required_documents or [],
        application_url=scheme.application_url,
        official_source=scheme.official_source,
        is_active=scheme.is_active,
        last_verified_date=scheme.last_verified_date,
    )
