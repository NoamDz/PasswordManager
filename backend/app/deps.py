from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
import uuid

from .database import get_session
from .auth import decode_access_token
from .models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    # Decode the JWT and convert the returned subject (user id)
    # into a ``uuid.UUID`` instance. When running against SQLite
    # in tests the SQLAlchemy UUID type expects a real ``uuid.UUID``
    # object and will attempt to access the ``hex`` attribute of the
    # value that is passed in. If we keep it as a plain ``str`` this
    # results in an ``AttributeError`` ("'str' object has no attribute 'hex'").
    raw_user_id = decode_access_token(token)
    if not raw_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        user_uuid = uuid.UUID(str(raw_user_id))
    except (ValueError, AttributeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = session.get(User, user_uuid)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user 