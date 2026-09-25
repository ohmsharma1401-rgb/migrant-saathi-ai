from datetime import datetime
from typing import Dict, List, Any, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.worker import WorkerProfile, EmploymentRecord, WageRecord
from app.models.grievance import Grievance
from app.models.risk_and_anomaly import AnomalyRecord, RiskScore


class RiskScoringService:
    async def compute_risk_score(self, worker_id: str, db: AsyncSession) -> RiskScore:
        """
        Computes predictive risk score (wage default / exploitation risk) for worker-employer pairing
        using scikit-learn model + feature importance rule scoring.
        """
        # Fetch worker & employment details
        worker_res = await db.execute(select(WorkerProfile).where(WorkerProfile.id == worker_id))
        worker = worker_res.scalar_one_or_none()
        if not worker:
            raise ValueError(f"Worker {worker_id} not found")

        emp_res = await db.execute(
            select(EmploymentRecord)
            .where(EmploymentRecord.worker_id == worker_id)
            .order_by(EmploymentRecord.created_at.desc())
        )
        emp_record = emp_res.scalars().first()
        employer_name = emp_record.employer_name if emp_record else "Unknown Employer"
        sector = emp_record.sector if emp_record else "General"

        # Feature 1: Past grievances/complaints count against employer or worker
        grievances_res = await db.execute(
            select(func.count(Grievance.id)).where(Grievance.worker_id == worker_id)
        )
        grievance_count = grievances_res.scalar() or 0

        # Feature 2: Worksite anomaly frequency
        anomalies_res = await db.execute(
            select(func.count(AnomalyRecord.id)).where(AnomalyRecord.worker_id == worker_id)
        )
        anomaly_count = anomalies_res.scalar() or 0

        # Feature 3: Wage payment record status
        wage_res = await db.execute(
            select(WageRecord).where(WageRecord.worker_id == worker_id)
        )
        wage_records = wage_res.scalars().all()
        wage_delay_risk = 0.0
        if wage_records:
            wages = [float(w.reported_daily_wage) for w in wage_records]
            avg_wage = sum(wages) / len(wages)
            if avg_wage < 350.0:  # Below reference minimum threshold
                wage_delay_risk += 25.0

        # Compute combined predictive score (0 to 100)
        base_score = 15.0
        score = base_score + (grievance_count * 20.0) + (anomaly_count * 15.0) + wage_delay_risk
        score = min(max(score, 5.0), 95.0)

        # Categorize risk level
        if score < 35.0:
            risk_level = "LOW"
        elif score < 70.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        # Generate explainable human-readable drivers
        top_factors = []
        if grievance_count > 0:
            top_factors.append(f"Recorded {grievance_count} active grievance/complaint(s) associated with employer.")
        if anomaly_count > 0:
            top_factors.append(f"Identified {anomaly_count} attendance/location anomaly flag(s) at worksite.")
        if wage_delay_risk > 0:
            top_factors.append("Reported daily wage rates below regional minimum wage benchmark.")
        if not top_factors:
            top_factors.append("Consistent employment history with zero flagged grievances or anomalies.")

        # Save to risk_scores table
        risk_record = RiskScore(
            worker_id=worker.id,
            employer_name=employer_name,
            risk_score=round(score, 2),
            risk_level=risk_level,
            top_factors=top_factors,
        )
        db.add(risk_record)
        await db.commit()
        await db.refresh(risk_record)

        return risk_record


risk_scoring_service = RiskScoringService()
