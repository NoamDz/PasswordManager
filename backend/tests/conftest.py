import asyncio
import os
import warnings
from typing import Generator

import pytest
import pytest_asyncio
from httpx import AsyncClient
try:
    from httpx import ASGITransport  # httpx >=0.25
except ImportError:  # Legacy versions
    ASGITransport = None  # type: ignore
from sqlmodel import SQLModel, Session
from testcontainers.postgres import PostgresContainer

from backend.app.main import app  # noqa: E402, import after env setup
from backend.app.database import engine, get_session  # noqa: E402


@pytest.fixture(scope="session")
def event_loop():
    """Override pytest-asyncio default to session-wide loop."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def pg_container() -> Generator[PostgresContainer, None, None]:
    """Spin up a temporary Postgres DB in Docker for the whole test session."""
    with PostgresContainer("postgres:16", username="pm_user", password="pm_pass", dbname="password_manager") as postgres:
        os.environ["DATABASE_URL"] = postgres.get_connection_url()
        yield postgres


@pytest.fixture()
def db_session(pg_container):  # noqa: PT004, PT019
    """Create all tables and provide a transaction-scoped Session."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
        session.rollback()


@pytest_asyncio.fixture()
async def client(db_session):  # noqa: PT004, PT019
    """FastAPI test client that shares the already-created DB session."""

    # Dependency override so routes use the same Session
    def _get_test_session():
        with Session(engine) as s:  # same engine (Postgres container)
            yield s

    app.dependency_overrides[get_session] = _get_test_session  # type: ignore

    if ASGITransport is not None:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac
    else:
        async with AsyncClient(app=app, base_url="http://test") as ac:  # type: ignore[arg-type]
            yield ac

    app.dependency_overrides.clear()

warnings.filterwarnings(
    "ignore",
    message="'crypt' is deprecated and slated for removal in Python 3.13",
    category=DeprecationWarning,
    module=r"passlib\\.utils",
)

# Passlib's argon2 handler accesses argon2.__version__, which is deprecated.
warnings.filterwarnings(
    "ignore",
    message="Accessing argon2.__version__ is deprecated",
    category=DeprecationWarning,
    module=r"passlib\\.handlers\\.argon2",
) 