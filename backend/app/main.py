from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging
import os
from pathlib import Path

from app.config.settings import get_settings
from app.models.database import init_db
from app.routers import files, query

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
app.include_router(files.router, prefix=settings.api_prefix)
app.include_router(query.router, prefix=settings.api_prefix)


# Mount static files for React frontend
frontend_dist_path = Path(__file__).parent.parent.parent / "frontend" / "dist"

if frontend_dist_path.exists():
    # Serve static assets
    app.mount(
        "/assets", StaticFiles(directory=str(frontend_dist_path / "assets")), name="assets")

    # Catch-all route to serve React app for SPA routing
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve React app for all non-API routes."""
        # Serve index.html for all routes (SPA)
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
