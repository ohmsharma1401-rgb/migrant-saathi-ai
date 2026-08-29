import random
import string
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_worker
from app.models.grievance import Grievance, GrievanceUpdate
from app.models.worker import WorkerProfile
from app.schemas.grievance import (
    GrievanceCreate,
    GrievanceListResponse,
    GrievanceResponse,
    GrievanceUpdateCreate,
)

router = APIRouter(prefix="/api/grievances", tags=["grievances"])


def _generate_complaint_code() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"GRV-{suffix}"


def _grievance_response(g: Grievance) -> GrievanceResponse:
    return GrievanceResponse(
        id=str(g.id),
        complaint_code=g.complaint_code,
        category=g.category,
        description=g.description,
        priority=g.priority,
        status=g.status,
        location_district=g.location_district,
        created_at=g.created_at,
        ai_classification=g.ai_classification,
    )


@router.post("/", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED)
async def file_grievance(
    payload: GrievanceCreate,
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    from app.services.grievance_agent import grievance_agent

    profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    # AI classification
    classification = grievance_agent.classify_grievance(payload.description)
    category = classification.get("category", "other")
    priority = classification.get("severity", "medium")

    grievance = Grievance(
        complaint_code=_generate_complaint_code(),
        worker_id=profile.id,
        category=category,
        description=payload.description,
        ai_classification=classification,
        priority=priority,
        status="open",
        location_district=payload.location_district or classification.get("location_mentioned"),
    )
    db.add(grievance)
    await db.commit()
    await db.refresh(grievance)
    return _grievance_response(grievance)


@router.get("/", response_model=GrievanceListResponse)
async def list_grievances(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(require_worker),
    db: AsyncSession = Depends(get_db),
):
    profile_result = await db.execute(
        select(WorkerProfile).where(WorkerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")

    count_result = await db.execute(
        select(func.count(Grievance.id)).where(Grievance.worker_id == profile.id)
    )
    total = count_result.scalar_one()

    offset = (page - 1) * page_size
    result = await db.execute(
        select(Grievance)
        .where(Grievance.worker_id == profile.id)
        .order_by(Grievance.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    items = result.scalars().all()

    return GrievanceListResponse(
        items=[_grievance_response(g) for g in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.get("/{grievance_id}", response_model=GrievanceResponse)
async def get_grievance(
    grievance_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Grievance).where(Grievance.id == grievance_id))
    grievance = result.scalar_one_or_none()
    if grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return _grievance_response(grievance)


@router.post("/{grievance_id}/updates", status_code=status.HTTP_201_CREATED)
async def add_update(
    grievance_id: str,
    payload: GrievanceUpdateCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Grievance).where(Grievance.id == grievance_id))
    grievance = result.scalar_one_or_none()
    if grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if payload.status_change:
        grievance.status = payload.status_change

    update = GrievanceUpdate(
        grievance_id=grievance.id,
        updated_by=current_user.id,
        status_change=payload.status_change,
        note=payload.note,
    )
    db.add(update)
    await db.commit()
    return {"message": "Update recorded"}
