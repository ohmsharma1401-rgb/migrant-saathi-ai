import uuid

from sqlalchemy import Boolean, Column, Date, DateTime, Numeric, String, UUID
from sqlalchemy.sql import func

from app.database.base import Base


class ReferenceWage(Base):
    __tablename__ = "reference_wages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True, index=True)
    sector = Column(String(100), nullable=False, index=True)
    occupation = Column(String(100), nullable=False, index=True)
    skill_level = Column(
        String(20), nullable=False, index=True
    )  # unskilled/semi_skilled/skilled/highly_skilled
    min_daily_wage = Column(Numeric(10, 2), nullable=False)
    reference_daily_wage = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    effective_date = Column(Date, nullable=False)
    source = Column(String(255), default="DEMO DATA", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
