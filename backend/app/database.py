from sqlmodel import create_engine, Session
from pathlib import Path
import os

# Simple SQLite for dev; can switch to PostgreSQL via DATABASE_URL env var
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# For SQLite we need check_same_thread=False when using threaded servers like Uvicorn
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def get_session():
    with Session(engine) as session:
        yield session 