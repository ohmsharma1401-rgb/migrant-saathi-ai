import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.workers import router as workers_router
from app.api.welfare import router as welfare_router
from app.api.wages import router as wages_router
from app.api.grievances import router as grievances_router
from app.api.dashboard import router as dashboard_router
from app.api.ai import router as ai_router
from app.api.admin import router as admin_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Migrant Saathi AI API",
    version="1.0.0",
    description="Backend API for the Migrant Saathi AI platform — protecting migrant workers through AI.",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(workers_router)
app.include_router(welfare_router)
app.include_router(wages_router)
app.include_router(grievances_router)
app.include_router(dashboard_router)
app.include_router(ai_router)
app.include_router(admin_router)


# ── Health Check & Root ────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
async def root():
    return {
        "status": "ok",
        "service": "Migrant Saathi AI API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "Migrant Saathi AI"}


# ── Startup / Shutdown ────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    logger.info("Migrant Saathi AI backend started")
