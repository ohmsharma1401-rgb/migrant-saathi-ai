import hashlib
import hmac
import json
import random
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode


def generate_otp() -> str:
    """Generate a 6-digit numeric OTP."""
    return f"{random.randint(100000, 999999)}"


def hash_otp(otp: str) -> str:
    """Hash OTP using SHA-256 (fast, sufficient for short-lived tokens)."""
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp_hash(otp: str, hashed: str) -> bool:
    """Verify OTP against its stored hash."""
    return hmac.compare_digest(hashlib.sha256(otp.encode()).hexdigest(), hashed)


def normalize_indian_mobile(mobile_number: str) -> str:
    """Return a 10-digit Indian mobile number, or empty string if invalid."""
    digits = "".join(ch for ch in (mobile_number or "") if ch.isdigit())
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    if len(digits) == 10 and digits[0] in "6789":
        return digits
    return ""


def _otp_secret() -> str:
    from app.core.config import settings

    return settings.SECRET_KEY or "dev-secret-key-change-in-production-32bytes"


def create_otp_token(identifier: str, otp: str, channel: str, ttl_seconds: int = 600) -> str:
    payload = {
        "id": identifier.strip().lower() if "@" in identifier else identifier.strip(),
        "ch": channel,
        "h": hash_otp(otp.strip()),
        "exp": int(time.time()) + ttl_seconds,
    }
    raw = urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    sig = hmac.new(_otp_secret().encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{sig}"


def verify_otp_token(token: str, identifier: str, otp: str) -> bool:
    try:
        raw, sig = (token or "").split(".", 1)
    except ValueError:
        return False
    expected = hmac.new(_otp_secret().encode(), raw.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return False
    pad = "=" * (-len(raw) % 4)
    payload = json.loads(urlsafe_b64decode(raw + pad).decode())
    if int(time.time()) > int(payload.get("exp", 0)):
        return False
    ident = identifier.strip().lower() if "@" in identifier else identifier.strip()
    stored = str(payload.get("id", ""))
    stored_norm = stored.lower() if "@" in stored else stored
    if stored_norm != ident and stored != identifier.strip():
        mobile = normalize_indian_mobile(identifier)
        if not mobile or stored != mobile:
            return False
    return verify_otp_hash(otp.strip(), payload.get("h", ""))


async def send_sms_via_fast2sms(mobile_number: str, otp: str) -> bool:
    """Send OTP to Indian mobile number via Fast2SMS API."""
    import logging
    import httpx
    from app.core.config import settings

    logger = logging.getLogger(__name__)
    api_key = (settings.FAST2SMS_API_KEY or "").strip()
    if not api_key:
        logger.warning("Fast2SMS API key is not set in environment/config")
        return False

    number = normalize_indian_mobile(mobile_number)
    if not number:
        logger.error("Invalid Indian mobile number for Fast2SMS: %s", mobile_number)
        return False

    url = "https://www.fast2sms.com/dev/bulkV2"
    headers = {"cache-control": "no-cache"}
    attempts = [
        {
            "authorization": api_key,
            "route": "otp",
            "variables_values": otp,
            "numbers": number,
        },
        {
            "authorization": api_key,
            "route": "q",
            "message": f"Your Migrant Saathi AI verification OTP is {otp}. Valid for 10 minutes. Do not share this code.",
            "language": "english",
            "flash": "0",
            "numbers": number,
        },
    ]

    try:
        async with httpx.AsyncClient() as client:
            for params in attempts:
                response = await client.get(url, params=params, headers=headers, timeout=15.0)
                try:
                    data = response.json()
                except Exception:
                    logger.error("Fast2SMS non-JSON response: %s", response.text[:500])
                    continue
                if data.get("return") is True:
                    logger.info("Fast2SMS OTP sent successfully to %s via %s", number, params["route"])
                    return True
                logger.error("Fast2SMS API error response (%s): %s", params["route"], data)
        return False
    except Exception as e:
        logger.error("Fast2SMS request exception: %s", e)
        return False


async def send_sms_via_twilio(mobile_number: str, otp: str) -> bool:
    """Send OTP via Twilio REST API."""
    import logging
    import httpx
    from app.core.config import settings

    logger = logging.getLogger(__name__)
    sid = (settings.TWILIO_ACCOUNT_SID or "").strip()
    token = (settings.TWILIO_AUTH_TOKEN or "").strip()
    from_num = (settings.TWILIO_PHONE_NUMBER or "").strip()

    if not sid or not token or not from_num:
        logger.warning("Twilio credentials not configured")
        return False

    number = normalize_indian_mobile(mobile_number)
    to_num = mobile_number.strip() if mobile_number.strip().startswith("+") else f"+91{number}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    data = {
        "From": from_num,
        "To": to_num,
        "Body": f"Your Migrant Saathi AI verification OTP is {otp}. Valid for 10 minutes. Do not share this code.",
    }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, data=data, auth=(sid, token), timeout=15.0)
            if res.status_code in (200, 201):
                logger.info("Twilio SMS sent successfully to %s", to_num)
                return True
            logger.error("Twilio API error status=%s body=%s", res.status_code, res.text)
            return False
    except Exception as e:
        logger.error("Twilio request exception: %s", e)
        return False


async def send_sms_otp(mobile_number: str, otp: str) -> bool:
    """Send a live SMS OTP using Twilio first, then Fast2SMS."""
    from app.core.config import settings

    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        if await send_sms_via_twilio(mobile_number, otp):
            return True
    if settings.FAST2SMS_API_KEY:
        if await send_sms_via_fast2sms(mobile_number, otp):
            return True
    return False


async def send_email_otp(to_email: str, otp: str) -> bool:
    """Send OTP to the exact recipient address via SMTP (Gmail app password supported)."""
    import asyncio
    import logging
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.utils import formataddr, formatdate, make_msgid
    from app.core.config import settings

    logger = logging.getLogger(__name__)

    smtp_host = (settings.SMTP_HOST or "smtp.gmail.com").strip()
    smtp_port = int(settings.SMTP_PORT or 587)
    smtp_user = (settings.SMTP_USER or "").strip()
    smtp_password = (settings.SMTP_PASSWORD or "").replace(" ", "")
    sender = (settings.SENDER_EMAIL or smtp_user or "").strip()
    recipient = (to_email or "").strip().lower()
    otp = str(otp).strip()

    if "@" not in recipient:
        logger.error("Refusing to send OTP: invalid recipient email %s", to_email)
        return False

    if not smtp_user or not smtp_password:
        logger.warning(
            "SMTP_USER/SMTP_PASSWORD credentials missing. Cannot deliver email to %s",
            recipient,
        )
        return False

    def _sync_send():
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Migrant Saathi AI verification code: {otp}"
        msg["From"] = formataddr(("Migrant Saathi AI", sender))
        msg["To"] = recipient
        msg["Date"] = formatdate(localtime=False)
        msg["Message-ID"] = make_msgid(domain=sender.split("@")[-1] if "@" in sender else "saathi.ai")
        msg["Reply-To"] = sender

        text_body = (
            f"Your verification code for Migrant Saathi AI is: {otp}\n\n"
            "This code expires in 10 minutes. Do not share it with anyone.\n"
        )
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #0f766e; text-align: center; margin-bottom: 8px;">Migrant Saathi AI</h2>
          <p style="font-size: 15px; color: #475569; text-align: center; margin-top: 0;">Verification code for worker portal login</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 34px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #0f766e; background: #f0fdfa; padding: 12px 28px; border-radius: 12px; border: 1px solid #99f6e4; display: inline-block;">
              {otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;">Sent to {recipient}. Expires in 10 minutes.</p>
        </div>
        """
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        errors = []
        if smtp_port == 587:
            try:
                with smtplib.SMTP(smtp_host, 587, timeout=20) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(smtp_user, smtp_password)
                    refused = server.sendmail(sender, [recipient], msg.as_string())
                    if refused:
                        raise RuntimeError(f"SMTP refused recipients: {refused}")
                return
            except Exception as e_tls:
                errors.append(f"STARTTLS 587: {e_tls}")

        if smtp_port == 465 or smtp_host.endswith("gmail.com"):
            try:
                with smtplib.SMTP_SSL(smtp_host, 465, timeout=20) as server:
                    server.login(smtp_user, smtp_password)
                    refused = server.sendmail(sender, [recipient], msg.as_string())
                    if refused:
                        raise RuntimeError(f"SMTP refused recipients: {refused}")
                return
            except Exception as e_ssl:
                errors.append(f"SSL 465: {e_ssl}")

        if smtp_port != 587:
            try:
                with smtplib.SMTP(smtp_host, 587, timeout=20) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(smtp_user, smtp_password)
                    refused = server.sendmail(sender, [recipient], msg.as_string())
                    if refused:
                        raise RuntimeError(f"SMTP refused recipients: {refused}")
                return
            except Exception as e_tls:
                errors.append(f"STARTTLS 587 fallback: {e_tls}")
                raise RuntimeError("; ".join(errors)) from e_tls
        else:
            raise RuntimeError("; ".join(errors))

    try:
        await asyncio.to_thread(_sync_send)
        logger.info("Successfully sent OTP email to %s", recipient)
        return True
    except Exception as e:
        logger.error("SMTP error sending email to %s: %s", recipient, e)
        return False
