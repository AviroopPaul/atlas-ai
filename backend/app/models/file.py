from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.models.database import Base


class File(Base):
    """File model for storing uploaded file metadata."""

    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True, nullable=False)
    original_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    backblaze_url = Column(String, nullable=False)
    backblaze_file_id = Column(String, nullable=False)
    chroma_collection_id = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    is_processed = Column(Boolean, default=False)

    def __repr__(self):
        return f"<File(id={self.id}, filename={self.filename}, original_name={self.original_name})>"
