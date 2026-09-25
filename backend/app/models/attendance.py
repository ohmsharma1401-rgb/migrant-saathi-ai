import uuid
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    UUID,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), unique=True, nullable=False)
    embedding_vector = Column(JSON, nullable=False)  # List[float] vector representation
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    worker = relationship("WorkerProfile")


class WorksiteGeofence(Base):
    __tablename__ = "worksite_geofences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worksite_id = Column(String(100), unique=True, nullable=False, index=True)
    worksite_name = Column(String(255), nullable=True)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_meters = Column(Float, nullable=False, default=500.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID(as_uuid=True), ForeignKey("worker_profiles.id"), nullable=False)
    worksite_id = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    face_matched = Column(Boolean, nullable=False, default=False)
    geo_matched = Column(Boolean, nullable=False, default=False)
    liveness_verified = Column(Boolean, nullable=False, default=False)
    status = Column(String(50), nullable=False, default="REJECTED")  # PRESENT, PROXY_SUSPECTED, REJECTED
    distance_meters = Column(Float, nullable=True)
    synced_from_edge = Column(Boolean, nullable=False, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    worker = relationship("WorkerProfile")
