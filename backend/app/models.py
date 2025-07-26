from datetime import datetime, UTC
from sqlmodel import Field, SQLModel
from typing import Optional
import uuid
from dotenv import load_dotenv

load_dotenv()


class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC), nullable=False)


# Encrypted vault blob rows
class Vault(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, nullable=False)
    blob: bytes  # opaque encrypted data
    version: int = Field(default=1, nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC), nullable=False) 