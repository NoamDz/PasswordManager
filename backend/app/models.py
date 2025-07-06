from datetime import datetime
from sqlmodel import Field, SQLModel
from typing import Optional
import uuid
from dotenv import load_dotenv

load_dotenv()


class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False) 