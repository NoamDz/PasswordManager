from fastapi import FastAPI

from .routers import router as auth_router
from .vault_router import router as vault_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(vault_router)


@app.get("/")
def read_root():
    return {"status": "Password-Manager backend online"}