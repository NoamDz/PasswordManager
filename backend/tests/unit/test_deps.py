from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException
from sqlmodel import SQLModel, Session, create_engine

from backend.app.auth import create_access_token, hash_password
from backend.app.deps import get_current_user
from backend.app.models import User


@pytest.fixture()
def memory_session():
    """Provide an in-memory SQLite session with fresh schema for each test."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def _create_user(session: Session, email: str, password: str) -> User:
    user = User(email=email, hashed_password=hash_password(password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def test_get_current_user_success(memory_session: Session):
    """Valid JWT and existing user should return the user instance."""
    user = _create_user(memory_session, "alice@example.com", "Secret123!")
    token = create_access_token(str(user.id))

    retrieved = get_current_user(token=token, session=memory_session)

    assert retrieved.id == user.id
    assert retrieved.email == user.email


def test_get_current_user_invalid_token(memory_session: Session):
    """Completely invalid token should raise HTTP 401."""
    invalid_token = "not.a.valid.jwt"
    with pytest.raises(HTTPException) as exc:
        get_current_user(token=invalid_token, session=memory_session)
    assert exc.value.status_code == 401


def test_get_current_user_missing_user(memory_session: Session):
    """Valid JWT but user no longer exists should raise HTTP 401."""
    random_id = uuid.uuid4()
    token = create_access_token(str(random_id))
    with pytest.raises(HTTPException) as exc:
        get_current_user(token=token, session=memory_session)
    assert exc.value.status_code == 401