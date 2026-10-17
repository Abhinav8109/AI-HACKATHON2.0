import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, get_db
from app.fixtures.seed_data import seed_database
from app.routers import (
    auth, campaigns, candidates, invitations, portal, interviews, dashboard, reports, audit
)

# Create all database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database if fresh
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agentic AI Recruitment and Adaptive Interview Intelligence Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under API v1 prefix
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(campaigns.router, prefix=settings.API_V1_PREFIX)
app.include_router(candidates.router, prefix=settings.API_V1_PREFIX)
app.include_router(invitations.router, prefix=settings.API_V1_PREFIX)
app.include_router(portal.router, prefix=settings.API_V1_PREFIX)
app.include_router(interviews.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(audit.router, prefix=settings.API_V1_PREFIX)

@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_connected": db_ok,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }

# Check for production built frontend dist
dist_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not dist_path.exists():
    dist_path = Path(__file__).resolve().parent.parent / "dist"

if dist_path.exists():
    assets_path = dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str, request: Request):
        # Allow API endpoints to fall through
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_candidate = dist_path / full_path
        if file_candidate.is_file():
            return FileResponse(file_candidate)
        index_file = dist_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "TalentPilot AI API"}
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "TalentPilot AI Enterprise Platform API",
            "docs_url": "/docs",
            "version": settings.VERSION
        }
