import logging
import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.models.user import OTPSession, Role, User
from app.schemas.auth import (
    OfficialLoginRequest,
    RefreshRequest,
    SendOTPRequest,
    TokenResponse,
    VerifyOTPRequest,
)
from app.utils.otp import generate_otp, hash_otp, verify_otp_hash, send_sms_via_fast2sms

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/worker/send-otp")
async def send_otp(payload: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Generate and send a 6-digit OTP to the worker's email or mobile number."""
    identifier = (payload.email or payload.mobile_number or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or mobile number is required")

    otp = generate_otp()
    otp_hash = hash_otp(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    session = OTPSession(
        email=payload.email,
        mobile_number=payload.mobile_number or payload.email or "N/A",
        otp_hash=otp_hash,
        expires_at=expires_at,
    )
    db.add(session)
    await db.commit()

    from app.utils.otp import send_sms_via_twilio, send_email_otp

    # 1. Attempt real email delivery if email is provided
    if payload.email:
        email_sent = await send_email_otp(payload.email, otp)
        if email_sent:
            return {"message": f"Verification OTP code sent to your Gmail account: {payload.email}", "email_sent": True}

    # 2. Attempt real SMS delivery if mobile number is provided
    if not settings.OTP_MOCK_MODE and payload.mobile_number:
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            sent = await send_sms_via_twilio(payload.mobile_number, otp)
            if sent:
                return {"message": "OTP sent via Twilio SMS to your mobile number", "otp_sent": True}

        if settings.FAST2SMS_API_KEY:
            sent = await send_sms_via_fast2sms(payload.mobile_number, otp)
            if sent:
                return {"message": "OTP sent via Fast2SMS to your mobile number", "otp_sent": True}

    logger.info(f"[MOCK OTP] target={identifier} otp={otp}")
    return {"message": f"OTP generated for {identifier}", "mock_otp": otp}


@router.post("/worker/verify-otp", response_model=TokenResponse)
async def verify_otp(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP and issue tokens; create user account on first login."""
    identifier = (payload.email or payload.mobile_number or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or mobile number is required")

    query = select(OTPSession).where(OTPSession.used == False)  # noqa: E712
    if payload.email:
        query = query.where(
            (OTPSession.email == payload.email) | (OTPSession.mobile_number == payload.email)
        )
    else:
        query = query.where(OTPSession.mobile_number == payload.mobile_number)

    query = query.order_by(OTPSession.created_at.desc())
    result = await db.execute(query)
    session = result.scalars().first()

    if session is None:
        raise HTTPException(status_code=400, detail="OTP session not found. Please request a new OTP.")

    expires_at = session.expires_at if session.expires_at.tzinfo else session.expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new OTP.")
    if not verify_otp_hash(payload.otp.strip(), session.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Mark session as used
    session.used = True
    await db.flush()

    # Find or create worker role
    role_result = await db.execute(select(Role).where(Role.name == "worker"))
    role = role_result.scalar_one_or_none()
    if role is None:
        role = Role(name="worker", permissions=[])
        db.add(role)
        await db.flush()

    # Find or create user by email or mobile
    if payload.email:
        user_result = await db.execute(select(User).where(User.email == payload.email))
        user = user_result.scalar_one_or_none()
        if user is None:
            user = User(email=payload.email, role_id=role.id, is_active=True)
            db.add(user)
            await db.flush()
    else:
        user_result = await db.execute(select(User).where(User.mobile_number == payload.mobile_number))
        user = user_result.scalar_one_or_none()
        if user is None:
            user = User(mobile_number=payload.mobile_number, role_id=role.id, is_active=True)
            db.add(user)
            await db.flush()

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": "worker"})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": "worker"})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role="worker",
        user_id=str(user.id),
    )


@router.post("/official/login", response_model=TokenResponse)
async def official_login(payload: OfficialLoginRequest, db: AsyncSession = Depends(get_db)):
    """Email + password login for government officials and admins."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account inactive")

    role_result = await db.execute(select(Role).where(Role.id == user.role_id))
    role = role_result.scalar_one_or_none()
    role_name = role.name if role else "official"

    access_token = create_access_token({"sub": str(user.id), "role": role_name})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": role_name})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=role_name,
        user_id=str(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Issue a new access token from a valid refresh token."""
    claims = verify_token(payload.refresh_token)
    if claims.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")

    user_id = claims.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    role_result = await db.execute(select(Role).where(Role.id == user.role_id))
    role = role_result.scalar_one_or_none()
    role_name = role.name if role else "worker"

    access_token = create_access_token({"sub": str(user.id), "role": role_name})
    new_refresh = create_refresh_token({"sub": str(user.id), "role": role_name})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        role=role_name,
        user_id=str(user.id),
    )
