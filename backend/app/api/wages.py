from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.schemas.wages import WageCheckRequest, WageCheckResponse

router = APIRouter(prefix="/api/wages", tags=["wages"])


@router.post("/check", response_model=WageCheckResponse)
async def check_wage(
    payload: WageCheckRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.wage_agent import wage_agent

    return await wage_agent.check_wage_fairness(
        reported_wage=payload.reported_daily_wage,
        occupation=payload.occupation,
        district=payload.district,
        state=payload.state,
        skill_level=payload.skill_level,
        db=db,
    )


@router.get("/reference")
async def list_reference_wages(
    state: str = "Gujarat",
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    from app.models.wage import ReferenceWage

    result = await db.execute(
        select(ReferenceWage)
        .where(ReferenceWage.state == state)
        .where(ReferenceWage.is_active == True)  # noqa: E712
    )
    wages = result.scalars().all()
    return [
        {
            "id": str(w.id),
            "state": w.state,
            "district": w.district,
            "sector": w.sector,
            "occupation": w.occupation,
            "skill_level": w.skill_level,
            "min_daily_wage": float(w.min_daily_wage),
            "reference_daily_wage": float(w.reference_daily_wage),
            "effective_date": w.effective_date.isoformat(),
            "source": w.source,
        }
        for w in wages
    ]
