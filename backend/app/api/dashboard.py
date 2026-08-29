from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.schemas.dashboard import AIInsight, ChartData, DashboardOverview

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardOverview)
async def get_overview(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.grievance import Grievance
    from app.models.welfare import WorkerSchemeMatch
    from app.models.worker import WorkerProfile, WageRecord

    total_workers = (await db.execute(select(func.count(WorkerProfile.id)))).scalar_one()
    total_welfare_matches = (
        await db.execute(
            select(func.count(WorkerSchemeMatch.id)).where(
                WorkerSchemeMatch.match_status == "potentially_eligible"
            )
        )
    ).scalar_one()
    total_wage_alerts = (
        await db.execute(
            select(func.count(WageRecord.id))
        )
    ).scalar_one()
    total_grievances = (await db.execute(select(func.count(Grievance.id)))).scalar_one()
    high_priority = (
        await db.execute(
            select(func.count(Grievance.id)).where(
                Grievance.priority.in_(["high", "critical"])
            )
        )
    ).scalar_one()
    open_safety = (
        await db.execute(
            select(func.count(Grievance.id)).where(
                Grievance.category == "safety",
                Grievance.status == "open",
            )
        )
    ).scalar_one()

    return DashboardOverview(
        total_workers=total_workers,
        total_welfare_matches=total_welfare_matches,
        total_wage_alerts=total_wage_alerts,
        total_grievances=total_grievances,
        high_priority_cases=high_priority,
        open_safety_issues=open_safety,
    )


@router.get("/charts", response_model=ChartData)
async def get_charts(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.grievance import Grievance
    from app.models.worker import EmploymentRecord, WorkerSkill, Skill

    sector_result = await db.execute(
        select(EmploymentRecord.sector, func.count(EmploymentRecord.id))
        .where(EmploymentRecord.is_current == True)  # noqa: E712
        .group_by(EmploymentRecord.sector)
        .limit(10)
    )
    workers_by_sector = [
        {"sector": row[0], "count": row[1]} for row in sector_result.all()
    ]

    grievance_result = await db.execute(
        select(Grievance.category, func.count(Grievance.id)).group_by(Grievance.category)
    )
    grievances_by_category = [
        {"category": row[0], "count": row[1]} for row in grievance_result.all()
    ]

    skill_result = await db.execute(
        select(Skill.name, func.count(WorkerSkill.id))
        .join(WorkerSkill, WorkerSkill.skill_id == Skill.id)
        .group_by(Skill.name)
        .order_by(func.count(WorkerSkill.id).desc())
        .limit(10)
    )
    top_skills = [{"skill": row[0], "count": row[1]} for row in skill_result.all()]

    return ChartData(
        workers_by_sector=workers_by_sector,
        workers_by_district=[],
        top_skills=top_skills,
        grievances_by_category=grievances_by_category,
    )


@router.get("/insights")
async def get_insights(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.grievance import Grievance
    from app.models.worker import WorkerProfile
    from app.services.dashboard_insight_service import dashboard_insight_service

    total_workers = (await db.execute(select(func.count(WorkerProfile.id)))).scalar_one()
    total_grievances = (await db.execute(select(func.count(Grievance.id)))).scalar_one()
    open_grievances = (
        await db.execute(
            select(func.count(Grievance.id)).where(Grievance.status == "open")
        )
    ).scalar_one()

    stats = {
        "total_workers": total_workers,
        "total_grievances": total_grievances,
        "open_grievances": open_grievances,
    }

    insights = dashboard_insight_service.generate_insights(stats)
    return {"insights": [i.model_dump() for i in insights]}
