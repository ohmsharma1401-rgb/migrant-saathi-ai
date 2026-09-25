import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.attendance import FaceEmbedding, WorksiteGeofence, AttendanceLog
from app.models.worker import WorkerProfile
from app.schemas.new_features import (
    FaceEnrollRequest,
    FaceEnrollResponse,
    AttendanceVerifyRequest,
    AttendanceVerifyResponse,
    WorksiteGeofenceCreate,
    WorksiteGeofenceResponse,
    SyncOfflineAttendanceRequest,
)
from app.services.face_attendance_service import face_attendance_service
from app.services.geofence_service import geofence_service

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post("/enroll-face", response_model=FaceEnrollResponse, status_code=status.HTTP_201_CREATED)
async def enroll_face(
    payload: FaceEnrollRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    image_np = face_attendance_service.decode_image_base64(payload.image_base64)
    if image_np is None:
        raise HTTPException(status_code=400, detail="Invalid image encoding")

    embedding_vec = face_attendance_service.extract_face_embedding(image_np)

    # Check existing embedding
    existing = await db.execute(
        select(FaceEmbedding).where(FaceEmbedding.worker_id == payload.worker_id)
    )
    face_emb = existing.scalar_one_or_none()
    if face_emb:
        face_emb.embedding_vector = embedding_vec
    else:
        face_emb = FaceEmbedding(
            worker_id=payload.worker_id,
            embedding_vector=embedding_vec,
        )
        db.add(face_emb)

    await db.commit()
    return FaceEnrollResponse(
        success=True,
        worker_id=payload.worker_id,
        message="Face vector embedding successfully enrolled (raw photo deleted).",
    )


@router.post("/verify", response_model=AttendanceVerifyResponse)
async def verify_attendance(
    payload: AttendanceVerifyRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch Enrolled Embedding
    emb_res = await db.execute(
        select(FaceEmbedding).where(FaceEmbedding.worker_id == payload.worker_id)
    )
    face_emb = emb_res.scalar_one_or_none()
    if not face_emb:
        raise HTTPException(status_code=404, detail="Worker face not enrolled yet.")

    # 2. Extract verification embedding & test liveness
    image_np = face_attendance_service.decode_image_base64(payload.image_base64)
    ver_vector = face_attendance_service.extract_face_embedding(image_np)

    is_live, liveness_score = face_attendance_service.check_liveness(
        blink_count=payload.blink_count or 0,
        head_turn_detected=payload.head_turn_detected or False,
        image_array=image_np,
    )

    face_matched, similarity = face_attendance_service.compare_embeddings(
        face_emb.embedding_vector, ver_vector
    )

    # 3. Geo-fencing Validation
    geo_matched = False
    dist_meters = None
    if payload.worksite_id and payload.latitude and payload.longitude:
        geo_res = await db.execute(
            select(WorksiteGeofence).where(WorksiteGeofence.worksite_id == payload.worksite_id)
        )
        fence = geo_res.scalar_one_or_none()
        if fence:
            geo_matched, dist_meters = geofence_service.verify_location(
                worker_lat=payload.latitude,
                worker_lng=payload.longitude,
                center_lat=fence.center_lat,
                center_lng=fence.center_lng,
                radius_meters=fence.radius_meters,
            )
        else:
            # Default fallback radius check
            geo_matched, dist_meters = geofence_service.verify_location(
                worker_lat=payload.latitude,
                worker_lng=payload.longitude,
                center_lat=payload.latitude,
                center_lng=payload.longitude,
                radius_meters=500.0,
            )
    else:
        geo_matched = True

    # 4. Combined Status Determination
    if face_matched and geo_matched and is_live:
        attendance_status = "PRESENT"
        msg = "Attendance verified successfully."
    elif face_matched and not geo_matched:
        attendance_status = "PROXY_SUSPECTED"
        msg = f"Face matched but location is {dist_meters}m outside the worksite geofence."
    elif not face_matched and geo_matched:
        attendance_status = "PROXY_SUSPECTED"
        msg = "Location matched but face verification failed."
    else:
        attendance_status = "REJECTED"
        msg = "Face and location verification failed."

    # 5. Log Attendance Entry
    att_log = AttendanceLog(
        worker_id=payload.worker_id,
        worksite_id=payload.worksite_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        face_matched=face_matched,
        geo_matched=geo_matched,
        liveness_verified=is_live,
        status=attendance_status,
        distance_meters=dist_meters,
    )
    db.add(att_log)
    await db.commit()

    return AttendanceVerifyResponse(
        verified=(attendance_status == "PRESENT"),
        face_matched=face_matched,
        geo_matched=geo_matched,
        liveness_verified=is_live,
        status=attendance_status,
        distance_meters=dist_meters,
        message=msg,
    )


@router.post("/geofences", response_model=WorksiteGeofenceResponse, status_code=status.HTTP_201_CREATED)
async def create_geofence(
    payload: WorksiteGeofenceCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fence = WorksiteGeofence(**payload.model_dump())
    db.add(fence)
    await db.commit()
    await db.refresh(fence)
    return WorksiteGeofenceResponse(
        id=str(fence.id),
        worksite_id=fence.worksite_id,
        worksite_name=fence.worksite_name,
        center_lat=fence.center_lat,
        center_lng=fence.center_lng,
        radius_meters=fence.radius_meters,
        created_at=fence.created_at,
    )


@router.post("/sync-offline")
async def sync_offline_attendance(
    payload: SyncOfflineAttendanceRequest,
    db: AsyncSession = Depends(get_db),
):
    synced_count = 0
    for record in payload.logs:
        att_log = AttendanceLog(
            worker_id=record.worker_id,
            worksite_id=record.worksite_id,
            latitude=record.latitude,
            longitude=record.longitude,
            face_matched=record.face_matched,
            geo_matched=record.geo_matched,
            liveness_verified=record.liveness_verified,
            status=record.status,
            synced_from_edge=True,
        )
        db.add(att_log)
        synced_count += 1

    await db.commit()
    return {"message": f"Successfully synced {synced_count} offline attendance records."}
