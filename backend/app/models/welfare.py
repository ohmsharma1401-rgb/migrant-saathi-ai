import uuid

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    UUID,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class WelfareScheme(Base):
    __tablename__ = "welfare_schemes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    applicable_states = Column(JSON, nullable=True, default=list)
    target_sectors = Column(JSON, nullable=True, default=list)
    target_occupations = Column(JSON, nullable=True, default=list)
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    max_income = Column(Numeric(12, 2), nullable=True)
    benefits_summary = Column(Text, nullable=True)
    required_documents = Column(JSON, nullable=True, default=list)
    application_url = Column(String(500), nullable=True)
    official_source = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    last_verified_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    eligibility_rules = relationship(
        "SchemeEligibilityRule", back_populates="scheme", cascade="all, delete-orphan"
    )
    worker_matches = relationship(
        "WorkerSchemeMatch", back_populates="scheme", cascade="all, delete-orphan"
    )


class SchemeEligibilityRule(Base):
    __tablename__ = "scheme_eligibility_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("welfare_schemes.id"), nullable=False)
    rule_type = Column(String(50), nullable=False)
    operator = Column(String(20), nullable=False)
    field_name = Column(String(100), nullable=False)
    value = Column(String(255), nullable=False)
    is_mandatory = Column(Boolean, default=True, nullable=False)

    scheme = relationship("WelfareScheme", back_populates="eligibility_rules")


class WorkerSchemeMatch(Base):
    __tablename__ = "worker_scheme_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("welfare_schemes.id"), nullable=False)
    match_status = Column(String(30), nullable=False)  # potentially_eligible/needs_verification/not_eligible
    match_score = Column(Float, nullable=False, default=0.0)
    ai_explanation = Column(Text, nullable=True)
    missing_info = Column(JSON, nullable=True, default=list)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    worker = relationship("WorkerProfile", back_populates="scheme_matches")
    scheme = relationship("WelfareScheme", back_populates="worker_matches")
