from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings."""

    # Application settings
    app_name: str = "My Stuff AI API"
    app_version: str = "1.0.0"
    debug: bool = True

    # Database settings
    # For SQLite (local dev): sqlite:///./app.db
    # For Supabase: postgresql://user:password@host:port/database
    database_url: str = "sqlite:///./app.db"

    # API settings
    api_prefix: str = "/api/v1"

    # Auth/JWT settings
    jwt_secret_key: str = "change-me-in-prod"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Optional admin seeding (for local/dev convenience)
    seed_admin_email: str | None = None
    seed_admin_password: str | None = None

    # Groq API settings
    groq_api_key: str
    # Available models: llama-3.3-70b-versatile, llama-3.1-8b-instant, gemma2-9b-it
    groq_model: str = "llama-3.3-70b-versatile"

    # Backblaze B2 settings
    backblaze_application_key: str
    backblaze_key_id: str
    backblaze_key_name: str
    backblaze_bucket_name: str  # You'll need to add this

    # ChromaDB Cloud settings
    chroma_tenant: str
    chroma_database: str
    chroma_api_key: str

    # File upload settings
    max_file_size_mb: int = 50
    allowed_extensions: str = "pdf,docx,doc,txt,csv,xlsx,xls"

    # Text chunking settings
    chunk_size: int = 500
    chunk_overlap: int = 50

    # CORS settings
    cors_origins: str = "http://localhost:5173,http://localhost:3000,https://atlas-ai-production.up.railway.app"

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def allowed_extensions_list(self) -> List[str]:
        """Get allowed extensions as a list."""
        return [ext.strip() for ext in self.allowed_extensions.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        """Get max file size in bytes."""
        return self.max_file_size_mb * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
