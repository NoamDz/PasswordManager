from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .database import get_session, engine
from .models import User
from sqlmodel import SQLModel
from .schemas import UserCreate, UserRead, Token
from .auth import hash_password, verify_password, create_access_token

# Create tables if not exist
SQLModel.metadata.create_all(engine)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=user_in.email, hashed_password=hash_password(user_in.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(user_in: UserCreate, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_in.email)).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return Token(access_token=token) 