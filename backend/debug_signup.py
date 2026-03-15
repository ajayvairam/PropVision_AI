import traceback
from database import SessionLocal, Base, engine
from models import User
from auth import hash_password, create_access_token

Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    print("Creating user...")
    new_user = User(
        username="debug_user3",
        password_hash=hash_password("password123")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print("User created successfully!")
except Exception as e:
    print("ERROR:")
    traceback.print_exc()
finally:
    db.close()
