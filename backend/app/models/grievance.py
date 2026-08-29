import uuid

from sqlalchemy import Column, DateTime, ForeignKey, JSON, String, Text, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    complaint_code = Column(String(30), unique=True, nullable=False, index=True)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    category = Column(String(30), nullable=False)  # wage/safety/harassment/conditions/other
    description = Column(Text, nullable=False)
    ai_classification = Column(JSON, nullable=True)
    priority = Column(String(20), default="medium", nullable=False)  # low/medium/high/critical
    status = Column(
        String(20), default="open", nullable=False
    )  # open/under_review/resolved/closed
    location_district = Column(String(100), nullable=True)
    assigned_inspector_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    worker = relationship("WorkerProfile", back_populates="grievances")
    assigned_inspector = relationship("User", foreign_keys=[assigned_inspector_id])
    updates = relationship(
        "GrievanceUpdate", back_populates="grievance", cascade="all, delete-orphan"
    )


class GrievanceUpdate(Base):
    __tablename__ = "grievance_updates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grievance_id = Column(UUID(as_uuid=True), ForeignKey("grievances.id"), nullable=False)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status_change = Column(String(20), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    grievance = relationship("Grievance", back_populates="updates")
    updater = relationship("User", foreign_keys=[updated_by])
