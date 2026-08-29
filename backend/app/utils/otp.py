import hashlib
import random


def generate_otp() -> str:
    """Generate a 6-digit numeric OTP."""
    return f"{random.randint(100000, 999999)}"


def hash_otp(otp: str) -> str:
    """Hash OTP using SHA-256 (fast, sufficient for short-lived tokens)."""
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp_hash(otp: str, hashed: str) -> bool:
    """Verify OTP against its stored hash."""
    return hashlib.sha256(otp.encode()).hexdigest() == hashed


async def send_sms_via_fast2sms(mobile_number: str, otp: str) -> bool:
    """Send OTP to Indian mobile number via Fast2SMS API."""
    import logging
    import httpx
    from app.core.config import settings

    logger = logging.getLogger(__name__)
    api_key = settings.FAST2SMS_API_KEY
    if not api_key:
        logger.warning("Fast2SMS API key is not set in environment/config")
        return False

    url = "https://www.fast2sms.com/dev/bulkV2"
    params = {
        "authorization": api_key,
        "route": "otp",
        "variables_values": otp,
        "numbers": mobile_number,
    }
    headers = {"cache-control": "no-cache"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers, timeout=10.0)
            data = response.json()
            if data.get("return") is True:
                logger.info(f"Fast2SMS OTP sent successfully to {mobile_number}")
                return True
            else:
                logger.error(f"Fast2SMS API error response: {data}")
                return False
    except Exception as e:
        logger.error(f"Fast2SMS request exception: {e}")
        return False


async def send_sms_via_twilio(mobile_number: str, otp: str) -> bool:
    """Send OTP via Twilio REST API."""
    import logging
    import httpx
    from app.core.config import settings

    logger = logging.getLogger(__name__)
    sid = settings.TWILIO_ACCOUNT_SID
    token = settings.TWILIO_AUTH_TOKEN
    from_num = settings.TWILIO_PHONE_NUMBER

    if not sid or not token or not from_num:
        logger.warning("Twilio credentials not configured")
        return False

    to_num = mobile_number if mobile_number.startswith("+") else f"+91{mobile_number}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    data = {
        "From": from_num,
        "To": to_num,
        "Body": f"Your Migrant Saathi AI verification OTP code is: {otp}. Valid for 10 minutes.",
    }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, data=data, auth=(sid, token), timeout=10.0)
            if res.status_code in (200, 201):
                logger.info(f"Twilio SMS sent successfully to {to_num}")
                return True
            else:
                logger.error(f"Twilio API error status={res.status_code} body={res.text}")
                return False
    except Exception as e:
        logger.error(f"Twilio request exception: {e}")
        return False


async def send_email_otp(to_email: str, otp: str) -> bool:
    """Send real OTP verification email to user's Gmail / email address via SMTP."""
    import logging
    import smtplib
    import asyncio
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from app.core.config import settings

    logger = logging.getLogger(__name__)

    smtp_host = settings.SMTP_HOST or "smtp.gmail.com"
    smtp_port = settings.SMTP_PORT or 587
    smtp_user = settings.SMTP_USER
    smtp_password = settings.SMTP_PASSWORD
    sender = settings.SENDER_EMAIL or smtp_user or "noreply@saathi.ai"

    if not smtp_user or not smtp_password:
        logger.warning(f"SMTP_USER/SMTP_PASSWORD credentials missing in backend configuration. Cannot deliver email to {to_email}")
        return False

    def _sync_send():
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Migrant Saathi AI Verification Code: {otp}"
        msg["From"] = f"Migrant Saathi AI <{sender}>"
        msg["To"] = to_email

        text_body = f"Your verification code for Migrant Saathi AI is: {otp}\n\nThis code will expire in 10 minutes."
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 8px;">🛡️ Migrant Saathi AI</h2>
          <p style="font-size: 15px; color: #475569; text-align: center; margin-top: 0;">Verification Code for Worker Portal Login</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 34px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #1e40af; background: #eff6ff; padding: 12px 28px; border-radius: 12px; border: 1px solid #bfdbfe; display: inline-block;">
              {otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;">This code will expire in 10 minutes. Do not share this OTP with anyone.</p>
        </div>
        """

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(sender, [to_email], msg.as_string())
        except Exception as e_ssl:
            logger.warning(f"SSL 465 failed, trying STARTTLS 587: {e_ssl}")
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password)
                server.sendmail(sender, [to_email], msg.as_string())

    try:
        await asyncio.to_thread(_sync_send)
        logger.info(f"Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"SMTP error sending email to {to_email}: {e}")
        return False
