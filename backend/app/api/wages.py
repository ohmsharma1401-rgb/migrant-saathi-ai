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
        .where(ReferenceWage.is_active == True)  # noqa: E712
        .order_by(ReferenceWage.created_at.desc())
    )
    wages = result.scalars().all()
    return [
        {
            "id": str(w.id),
            "state": w.state,
            "district": w.district or "General",
            "sector": w.sector,
            "occupation": w.occupation,
            "skill_level": w.skill_level,
            "min_daily_wage": float(w.min_daily_wage),
            "reference_daily_wage": float(w.reference_daily_wage),
            "daily_wage": float(w.reference_daily_wage),
            "monthly_wage": int(float(w.reference_daily_wage) * 26),
            "effective_date": w.effective_date.isoformat(),
            "source": w.source,
        }
        for w in wages
    ]


@router.post("/reference")
async def create_reference_wage(
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    from datetime import date
    from app.models.wage import ReferenceWage

    eff_date = payload.get("effective_date")
    if isinstance(eff_date, str) and eff_date:
        try:
            parsed_date = date.fromisoformat(eff_date)
        except Exception:
            parsed_date = date.today()
    else:
        parsed_date = date.today()

    daily = float(payload.get("reference_daily_wage") or payload.get("daily_wage") or payload.get("min_daily_wage") or 500)
    min_daily = float(payload.get("min_daily_wage") or daily)

    wage = ReferenceWage(
        state=payload.get("state", "Gujarat").strip(),
        district=payload.get("district", "Ahmedabad").strip(),
        sector=payload.get("sector", "Construction").strip(),
        occupation=payload.get("occupation", "Worker").strip(),
        skill_level=payload.get("skill_level", "semi_skilled").strip(),
        min_daily_wage=min_daily,
        reference_daily_wage=daily,
        effective_date=parsed_date,
        source=payload.get("source", "Gujarat Labour Department").strip(),
    )
    db.add(wage)
    await db.commit()
    await db.refresh(wage)
    return {
        "id": str(wage.id),
        "state": wage.state,
        "district": wage.district,
        "sector": wage.sector,
        "occupation": wage.occupation,
        "skill_level": wage.skill_level,
        "min_daily_wage": float(wage.min_daily_wage),
        "reference_daily_wage": float(wage.reference_daily_wage),
        "daily_wage": float(wage.reference_daily_wage),
        "monthly_wage": int(float(wage.reference_daily_wage) * 26),
        "effective_date": wage.effective_date.isoformat(),
        "source": wage.source,
    }
