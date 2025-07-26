import base64
from datetime import datetime, UTC

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .database import get_session, engine
from .models import Vault, SQLModel
from .schemas import VaultIn, VaultOut
from .deps import get_current_user, User

# ensure table exists
SQLModel.metadata.create_all(engine)

router = APIRouter(prefix="/api/vault", tags=["vault"])


@router.get("", response_model=VaultOut)
def get_latest_vault(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    vault = (
        session.exec(
            select(Vault).where(Vault.user_id == current_user.id).order_by(Vault.version.desc())
        ).first()
    )
    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")
    vault.blob = base64.b64encode(vault.blob).decode()
    return vault


@router.post("", response_model=VaultOut, status_code=status.HTTP_201_CREATED)
def upsert_vault(
    vault_in: VaultIn,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    last = (
        session.exec(
            select(Vault).where(Vault.user_id == current_user.id).order_by(Vault.version.desc())
        ).first()
    )
    new_version = (last.version + 1) if last else 1

    blob_bytes = base64.b64decode(vault_in.blob)
    vault = Vault(user_id=current_user.id, blob=blob_bytes, version=new_version, updated_at=datetime.now(UTC))
    session.add(vault)
    session.commit()
    session.refresh(vault)

    vault.blob = vault_in.blob  # encoded string for response
    return vault 