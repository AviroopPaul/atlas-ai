from pydantic import BaseModel
from datetime import datetime
from typing import List


class FileUploadResponse(BaseModel):
    """Response model for file upload."""

    id: int
    filename: str
    original_name: str
    file_type: str
    file_size: int
    backblaze_url: str
    upload_date: datetime
    is_processed: bool

    class Config:
        from_attributes = True


class FileResponse(BaseModel):
    """Response model for file details."""

    id: int
    filename: str
    original_name: str
    file_type: str
    file_size: int
    backblaze_url: str
    chroma_collection_id: str
    upload_date: datetime
    is_processed: bool

    class Config:
        from_attributes = True


class FileListResponse(BaseModel):
    """Response model for list of files."""

    files: List[FileResponse]
    total: int


class FileDeleteResponse(BaseModel):
    """Response model for file deletion."""

    message: str
    file_id: int
    filename: str
