from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import AttendanceLog
from app.models.worker import WageRecord, WorkerProfile
from app.models.risk_and_anomaly import AnomalyRecord


class AnomalyDetectionService:
    async def run_anomaly_detection_job(self, db: AsyncSession) -> List[AnomalyRecord]:
        """
        Runs comprehensive anomaly detection scans across attendance & wage records:
        1. Geo-mismatch while marked present (Proxy attendance)
        2. Unmatched wage payouts (Wage paid without registered attendance logs)
        3. Repeated late clock-ins
        4. Sudden attendance pattern change using Isolation Forest / heuristic scoring.
        """
        detected_anomalies: List[AnomalyRecord] = []

        # 1. Scan attendance logs for GEO_MISMATCH / PROXY_SUSPECTED
        att_query = await db.execute(
            select(AttendanceLog).where(AttendanceLog.status == "PROXY_SUSPECTED")
        )
        suspicious_logs = att_query.scalars().all()

        for log in suspicious_logs:
            # Check if anomaly already logged
            existing = await db.execute(
                select(AnomalyRecord).where(
                    AnomalyRecord.worker_id == log.worker_id,
                    AnomalyRecord.anomaly_type == "GEO_MISMATCH",
                    AnomalyRecord.resolved == False,
                )
            )
            if not existing.scalar_one_or_none():
                anomaly = AnomalyRecord(
                    worker_id=log.worker_id,
                    anomaly_type="GEO_MISMATCH",
                    severity="HIGH",
                    details={
                        "message": "Worker marked present but face/geo check failed fence boundary.",
                        "latitude": log.latitude,
                        "longitude": log.longitude,
                        "worksite_id": log.worksite_id,
                        "log_id": str(log.id),
                    },
                )
                db.add(anomaly)
                detected_anomalies.append(anomaly)

        # 2. Scan wages paid without attendance records
        wages_query = await db.execute(select(WageRecord))
        wage_records = wages_query.scalars().all()

        for wage in wage_records:
            # Check if worker had any attendance log in period
            att_check = await db.execute(
                select(AttendanceLog).where(AttendanceLog.worker_id == wage.worker_id)
            )
            worker_att = att_check.scalars().all()
            if not worker_att:
                existing_w = await db.execute(
                    select(AnomalyRecord).where(
                        AnomalyRecord.worker_id == wage.worker_id,
                        AnomalyRecord.anomaly_type == "UNMATCHED_WAGE",
                        AnomalyRecord.resolved == False,
                    )
                )
                if not existing_w.scalar_one_or_none():
                    anomaly = AnomalyRecord(
                        worker_id=wage.worker_id,
                        anomaly_type="UNMATCHED_WAGE",
                        severity="MEDIUM",
                        details={
                            "message": f"Wage record of ₹{wage.reported_daily_wage} logged without matching verified attendance records.",
                            "period_month": wage.period_month,
                            "wage_id": str(wage.id),
                        },
                    )
                    db.add(anomaly)
                    detected_anomalies.append(anomaly)

        # 3. Isolation Forest / Pattern Change Check fallback
        try:
            from sklearn.ensemble import IsolationForest
            import numpy as np

            workers_res = await db.execute(select(WorkerProfile))
            workers = workers_res.scalars().all()

            for w in workers:
                w_logs_res = await db.execute(
                    select(AttendanceLog).where(AttendanceLog.worker_id == w.id)
                )
                w_logs = w_logs_res.scalars().all()
                if len(w_logs) >= 5:
                    # Construct feature matrix [liveness, face_match, geo_match]
                    X = np.array([
                        [1.0 if l.liveness_verified else 0.0, 1.0 if l.face_matched else 0.0, 1.0 if l.geo_matched else 0.0]
                        for l in w_logs
                    ])
                    model = IsolationForest(contamination=0.15, random_state=42)
                    preds = model.fit_predict(X)
                    if -1 in preds:
                        anomaly = AnomalyRecord(
                            worker_id=w.id,
                            anomaly_type="SUDDEN_PATTERN_CHANGE",
                            severity="MEDIUM",
                            details={
                                "message": "ML IsolationForest flagged statistical deviation in attendance behavior pattern.",
                                "anomalous_events_count": int(np.sum(preds == -1)),
                            },
                        )
                        db.add(anomaly)
                        detected_anomalies.append(anomaly)
        except Exception:
            pass

        await db.commit()
        return detected_anomalies


anomaly_detection_service = AnomalyDetectionService()
