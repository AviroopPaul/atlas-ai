from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging
import os
from pathlib import Path

from app.config.settings import get_settings
from app.models.database import init_db
from app.models import user as user_models  # noqa: F401 ensure models are imported
from app.routers import files, query
from app.routers import auth as auth_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="RAG-powered document chatbot API with intelligent querying",
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup."""
    logger.info("Starting application...")
    try:
        init_db()
        logger.info("Database initialized successfully")
        # Optionally seed an admin user for development
        try:
            from sqlalchemy.orm import Session
            from app.models.database import SessionLocal
            from app.models.user import User
            from app.config.settings import get_settings
            from app.services.auth_service import hash_password

            settings_local = get_settings()
            if settings_local.seed_admin_email and settings_local.seed_admin_password:
                db: Session = SessionLocal()
                try:
                    existing = db.query(User).filter(User.email == settings_local.seed_admin_email).first()
                    if not existing:
                        user = User(
                            email=settings_local.seed_admin_email,
                            hashed_password=hash_password(settings_local.seed_admin_password),
                        )
                        db.add(user)
                        db.commit()
                        logger.info("Seeded admin user %s", settings_local.seed_admin_email)
                finally:
                    db.close()
        except Exception as se:
            logger.warning("Admin seeding skipped: %s", se)
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version
    }


# Include routers
app.include_router(auth_router.router, prefix=settings.api_prefix)
app.include_router(files.router, prefix=settings.api_prefix)
app.include_router(query.router, prefix=settings.api_prefix)


# Mount static files for React frontend
frontend_dist_path = Path(__file__).parent.parent.parent / "frontend" / "dist"

if frontend_dist_path.exists():
    # Serve static assets from /assets directory
    app.mount(
        "/assets", StaticFiles(directory=str(frontend_dist_path / "assets")), name="assets")

    # Catch-all route to serve React app for SPA routing and root-level static files
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve React app for all non-API routes and static files."""
        # Check if the requested file exists in dist root (for images, vite.svg, etc.)
        file_path = frontend_dist_path / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))

        # Otherwise serve index.html for SPA routing
        index_path = frontend_dist_path / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"message": "Frontend not built. Run 'cd frontend && npm run build'"}
else:
    # Fallback root endpoint if frontend not built
    @app.get("/", tags=["root"])
    async def root():
        """Root endpoint with API information."""
        return {
            "message": "Welcome to My Stuff AI API",
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/health",
            "note": "Frontend not built. Run 'cd frontend && npm run build' to build the React app."
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
