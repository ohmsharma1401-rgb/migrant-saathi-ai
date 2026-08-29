 import json
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

# Gmail SMTP Credentials
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "ohmsharma1401@gmail.com"
SMTP_PASSWORD = "bknr kxpl xizd uqrx"
SENDER_EMAIL = "ohmsharma1401@gmail.com"

def send_real_email(to_email: str, otp: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Migrant Saathi AI Verification Code: {otp}"
        msg["From"] = f"Migrant Saathi AI <{SENDER_EMAIL}>"
        msg["To"] = to_email

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #0d9488; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #0f766e; text-align: center; margin-bottom: 8px;">🛡️ Migrant Saathi AI</h2>
          <p style="font-size: 15px; color: #334155; text-align: center; margin-top: 0;">Verification Code for Worker Portal Login</p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="font-size: 34px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #0d9488; background: #f0fdf4; padding: 12px 28px; border-radius: 12px; border: 1px solid #99f6e4; display: inline-block;">
              {otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
        </div>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, [to_email], msg.as_string())
        return True
    except Exception as e:
        print("SMTP ERROR:", e)
        return False

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        
        try:
            payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            payload = {}

        path = self.path

        if "send-otp" in path:
            email = payload.get("email") or payload.get("mobile_number") or "ohmsharma1401@gmail.com"
            otp = f"{random.randint(100000, 999999)}"
            email_sent = send_real_email(email, otp)

            response_data = {
                "message": f"Verification OTP code sent to your email: {email}",
                "email_sent": email_sent,
                "mock_otp": otp
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            return

        if "verify-otp" in path:
            response_data = {
                "access_token": "ver_access_token_12345",
                "refresh_token": "ver_refresh_token_12345",
                "token_type": "bearer",
                "role": "worker",
                "user_id": "usr_" + str(random.randint(1000, 9999))
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode("utf-8"))
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode("utf-8"))
