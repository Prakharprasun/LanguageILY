"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import db
from app.config import CORS_ORIGINS
from app.errors import AppError
from app.routers import dev, gamification, learn, sessions, users


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create and seed the database on first start so the app is usable immediately.
    conn = db.connect()
    try:
        if not db.is_seeded(conn):
            from seed.seed import seed

            seed(conn)
        else:
            db.init_schema(conn)  # idempotent (CREATE TABLE IF NOT EXISTS)
        conn.commit()
    finally:
        conn.close()
    yield


app = FastAPI(title="Duolingo Clone API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}


for router in (users.router, learn.router, sessions.router, gamification.router, dev.router):
    app.include_router(router)

