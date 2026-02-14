import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models

# Configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def promote_user(username: str):
    db = SessionLocal()
    try:
        # Try both direct username and with '@' prefix if common in your UI
        user = db.query(models.User).filter(
            (models.User.username == username) | 
            (models.User.username == username.lstrip('@'))
        ).first()
        
        if not user:
            print(f"❌ Error: User '{username}' not found in database.")
            return

        user.is_admin = True
        user.is_verified = True # Auto-verify if promoting to admin
        db.commit()
        print(f"✅ Success: User '{user.username}' has been promoted to Admin and Verified!")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        uname = input("Enter the username to promote to admin: ").strip()
        if uname:
            promote_user(uname)
        else:
            print("Usage: python promote_user.py <username>")
    else:
        promote_user(sys.argv[1])
