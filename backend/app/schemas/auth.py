from pydantic import BaseModel
from typing import Optional


class SendOTPRequest(BaseModel):
    email: Optional[str] = None
    mobile_number: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    otp: str


class OfficialLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


class RefreshRequest(BaseModel):
    refresh_token: str
