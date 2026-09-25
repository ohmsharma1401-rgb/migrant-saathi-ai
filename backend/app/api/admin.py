from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_admin
from app.core.security import get_password_hash
from app.models.user import Role, User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", dependencies=[Depends(require_admin)])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).limit(100))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "mobile_number": u.mobile_number,
            "email": u.email,
            "is_active": u.is_active,
            "role_id": u.role_id,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.post("/officials", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_official(
    email: str,
    password: str,
    full_name: str,
    designation: str,
    department: str,
    role_name: str = "official",
    db: AsyncSession = Depends(get_db),
):
    from app.models.official import GovernmentOfficial

    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    role_result = await db.execute(select(Role).where(Role.name == role_name))
    role = role_result.scalar_one_or_none()
    if role is None:
        role = Role(name=role_name, permissions=[])
        db.add(role)
        await db.flush()

    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    official = GovernmentOfficial(
        user_id=user.id,
        full_name=full_name,
        designation=designation,
        department=department,
    )
    db.add(official)
    await db.commit()
    return {"message": "Official created", "user_id": str(user.id)}


@router.patch("/users/{user_id}/toggle-active", dependencies=[Depends(require_admin)])
async def toggle_user_active(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"user_id": user_id, "is_active": user.is_active}


@router.get("/roles", dependencies=[Depends(require_admin)])
async def list_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Role))
    roles = result.scalars().all()
    return [{"id": r.id, "name": r.name, "permissions": r.permissions} for r in roles]


# ── Feature 3: Wage/Attendance Anomaly Detection ──────────────────────────────

@router.get("/anomalies", dependencies=[Depends(require_admin)])
async def list_anomalies(db: AsyncSession = Depends(get_db)):
    from app.models.risk_and_anomaly import AnomalyRecord

    result = await db.execute(select(AnomalyRecord).order_by(AnomalyRecord.detected_at.desc()))
    anomalies = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "worker_id": str(a.worker_id),
            "employer_name": a.employer_name,
            "anomaly_type": a.anomaly_type,
            "severity": a.severity,
            "details": a.details,
            "resolved": a.resolved,
            "detected_at": a.detected_at,
        }
        for a in anomalies
    ]


@router.post("/anomalies/run", dependencies=[Depends(require_admin)])
async def trigger_anomaly_scan(db: AsyncSession = Depends(get_db)):
    from app.services.anomaly_detection_service import anomaly_detection_service

    anomalies = await anomaly_detection_service.run_anomaly_detection_job(db)
    return {
        "message": "Anomaly scan batch job executed successfully.",
        "detected_anomalies_count": len(anomalies),
    }


# ── Feature 4: Predictive Risk Scoring ────────────────────────────────────────

@router.get("/risk-score/{worker_id}", dependencies=[Depends(require_admin)])
async def get_worker_risk_score(worker_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.risk_scoring_service import risk_scoring_service

    try:
        risk_record = await risk_scoring_service.compute_risk_score(worker_id, db)
        return {
            "id": str(risk_record.id),
            "worker_id": str(risk_record.worker_id),
            "employer_name": risk_record.employer_name,
            "risk_score": risk_record.risk_score,
            "risk_level": risk_record.risk_level,
            "top_factors": risk_record.top_factors,
            "calculated_at": risk_record.calculated_at,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

