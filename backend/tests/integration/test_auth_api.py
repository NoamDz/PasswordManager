import uuid
import pytest
from backend.app.models import User
from sqlmodel import select


@pytest.mark.asyncio
async def test_register_and_login(client, db_session):
    email = f"u{uuid.uuid4()}@example.com"
    payload = {"email": email, "password": "Secret123!"}

    r = await client.post("/api/auth/register", json=payload)
    assert r.status_code == 201

    # verify user persisted in DB with hashed password
    user = db_session.exec(select(User).where(User.email == email)).first()
    assert user is not None
    assert user.email == email
    # password should be stored hashed, not equal to raw
    assert user.hashed_password != payload["password"]

    r = await client.post("/api/auth/login", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer" 