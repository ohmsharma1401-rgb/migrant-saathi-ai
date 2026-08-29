import uuid

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UUID,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    origin_state = Column(String(100), nullable=False)
    current_district = Column(String(100), nullable=False)
    current_city = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    aadhaar_last4 = Column(String(4), nullable=True)
    preferred_language = Column(String(10), default="en", nullable=False)
    profile_complete = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="worker_profile")
    skills = relationship("WorkerSkill", back_populates="worker", cascade="all, delete-orphan")
    employment_records = relationship(
        "EmploymentRecord", back_populates="worker", cascade="all, delete-orphan"
    )
    wage_records = relationship(
        "WageRecord", back_populates="worker", cascade="all, delete-orphan"
    )
    scheme_matches = relationship(
        "WorkerSchemeMatch", back_populates="worker", cascade="all, delete-orphan"
    )
    grievances = relationship("Grievance", back_populates="worker", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    sector = Column(String(100), nullable=False)
    category = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    worker_skills = relationship("WorkerSkill", back_populates="skill")


class WorkerSkill(Base):
    __tablename__ = "worker_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency_level = Column(String(50), nullable=False)
    years_experience = Column(Integer, nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)

    worker = relationship("WorkerProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="worker_skills")


class EmploymentRecord(Base):
    __tablename__ = "employment_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    employer_name = Column(String(255), nullable=True)
    sector = Column(String(100), nullable=False)
    occupation = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    worker = relationship("WorkerProfile", back_populates="employment_records")
    wage_records = relationship("WageRecord", back_populates="employment")


class WageRecord(Base):
    __tablename__ = "wage_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    employment_id = Column(
        UUID(as_uuid=True), ForeignKey("employment_records.id"), nullable=True
    )
    reported_daily_wage = Column(Numeric(10, 2), nullable=False)
    wage_type = Column(String(20), nullable=False)  # daily/monthly/weekly
    period_month = Column(String(7), nullable=True)  # e.g. "2024-05"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    worker = relationship("WorkerProfile", back_populates="wage_records")
    employment = relationship("EmploymentRecord", back_populates="wage_records")
