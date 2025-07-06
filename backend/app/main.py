from fastapi import FastAPI

from .routers import router as auth_router

app = FastAPI()

app.include_router(auth_router)


@app.get("/")
def read_root():
    return {"status": "Password-Manager backend online"}