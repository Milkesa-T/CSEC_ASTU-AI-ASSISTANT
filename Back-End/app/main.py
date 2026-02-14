from fastapi import FastAPI, Depends, HTTPException, status, responses
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.rag import router as rag_router
from app import models, database, auth
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
import uuid
import os
from app import mail

load_dotenv()

# Initialize Database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="RAG Backend",
    description="AI-powered chatbot with Retrieval-Augmented Generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Routes
@app.post("/signup")
async def signup(username: str, email: str, password: str, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth.get_password_hash(password)
    verification_token = str(uuid.uuid4())
    
    new_user = models.User(
        username=username, 
        email=email, 
        hashed_password=hashed_password, 
        is_admin=False,
        is_verified=False,
        verification_token=verification_token
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email
    email_sent = await mail.send_verification_email(email, verification_token)
    
    if not email_sent:
        # We delete the user if email fail so they can try again with correct email/config
        db.delete(new_user)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please check your SMTP configuration in .env."
        )
    
    return {"message": "User created. Please check your email to verify your account."}

@app.get("/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        return {"error": "Invalid or expired verification token"}
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    
    return responses.RedirectResponse(url="http://localhost:5173/login?verified=true")

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not verified. Please check your inbox."
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"username": user.username, "is_admin": user.is_admin}}

@app.get("/me")
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

app.include_router(rag_router)

@app.get("/")
def root():
    return {"status": "RAG backend is running 🚀"}
