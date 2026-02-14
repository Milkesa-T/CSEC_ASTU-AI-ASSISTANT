import os
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Clean password in case user copied it with spaces
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "").replace(" ", "")
MAIL_FROM = os.getenv("MAIL_FROM")

conf = ConnectionConfig(
    MAIL_USERNAME = MAIL_USERNAME,
    MAIL_PASSWORD = MAIL_PASSWORD,
    MAIL_FROM = MAIL_USERNAME if "<" not in (MAIL_FROM or "") else MAIL_FROM,
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS = str(os.getenv("MAIL_STARTTLS", "True")).upper() == "TRUE",
    MAIL_SSL_TLS = str(os.getenv("MAIL_SSL_TLS", "False")).upper() == "TRUE",
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_verification_email(email: str, token: str):
    # In a real app, this would be a link to your frontend
    # For now, we'll just send the token/link
    verify_url = f"http://127.0.0.1:8000/verify-email/{token}"
    
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #0d1117; color: #fff; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #161b22; border-radius: 10px; padding: 40px; border: 1px solid #30363d;">
            <h2 style="color: #f85149;">CSEC_ASTU AI ASSISTANT</h2>
            <h3>Verify Your Email</h3>
            <p>Welcome to the CSEC ASTU Knowledge Base Portal! Please click the button below to verify your email address and activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verify_url}" style="background-color: #f85149; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Account</a>
            </div>
            <p style="font-size: 0.8rem; color: #8b949e;">If the button doesn't work, copy and paste this link: <br> {verify_url}</p>
        </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="CSEC_ASTU AI ASSISTANT - Account Verification",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        # Always print to console for development ease
        print(f"\n📧 VERIFICATION EMAIL (Simulation):\nTo: {email}\nLink: {verify_url}\n")
        
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"❌ SMTP Error: {e}")
        print(f"⚠️ Could not send to {email}. If you are in development, use the link printed above in the terminal!")
        # We return True here so the user is created anyway. 
        # They can use the link printed in the terminal to verify.
        return True
