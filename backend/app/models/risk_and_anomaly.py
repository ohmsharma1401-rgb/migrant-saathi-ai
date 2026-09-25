import uuid
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    String,
    UUID,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    employer_name = Column(String(255), nullable=True)
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    top_factors = Column(JSON, nullable=False)  # List[str] of explainable drivers
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    worker = relationship("WorkerProfile")


class AnomalyRecord(Base):
    __tablename__ = "anomalies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    employer_name = Column(String(255), nullable=True)
    anomaly_type = Column(String(100), nullable=False)  # GEO_MISMATCH, REPEATED_LATE_CLOCKIN, UNMATCHED_WAGE, SUDDEN_PATTERN_CHANGE
    severity = Column(String(20), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH
    details = Column(JSON, nullable=False)
    resolved = Column(Boolean, nullable=False, default=False)
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    worker = relationship("WorkerProfile")
