import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, JSON, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    permissions = Column(JSON, nullable=True, default=list)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    mobile_number = Column(String(20), nullable=True, unique=True, index=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    role = relationship("Role", back_populates="users")
    worker_profile = relationship("WorkerProfile", back_populates="user", uselist=False)
    official_profile = relationship("GovernmentOfficial", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    ai_interactions = relationship("AIInteraction", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class OTPSession(Base):
    __tablename__ = "otp_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mobile_number = Column(String(20), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    otp_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
