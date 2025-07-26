from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Vault schemas
class VaultIn(BaseModel):
    blob: str  # base64-encoded
    version: int


class VaultOut(BaseModel):
    blob: str
    version: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True) 