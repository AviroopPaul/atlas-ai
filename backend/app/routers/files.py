from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from app.models.database import get_db
from app.schemas.file import FileUploadResponse, FileResponse, FileListResponse, FileDeleteResponse
from app.services.file_service import get_file_service
from app.services.backblaze_service import get_backblaze_service
from app.services.auth_service import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["files"], dependencies=[Depends(get_current_user)])


def get_authorized_url(file_record, backblaze_service) -> str:
    """Generate fresh authorized URL for a file."""
    try:
        return backblaze_service.get_download_url(file_record.filename)
    except Exception as e:
        logger.error(
            f"Failed to generate authorized URL for {file_record.filename}: {str(e)}")
        # Fallback to stored URL
        return file_record.backblaze_url


def get_file_response_with_auth_url(file_record, backblaze_service) -> FileResponse:
    """Convert File model to FileResponse with fresh authorized URL."""
    authorized_url = get_authorized_url(file_record, backblaze_service)

    return FileResponse(
        id=file_record.id,
        filename=file_record.filename,
        original_name=file_record.original_name,
        file_type=file_record.file_type,
        file_size=file_record.file_size,
        backblaze_url=authorized_url,
        chroma_collection_id=file_record.chroma_collection_id,
        upload_date=file_record.upload_date,
        is_processed=file_record.is_processed
    )


@router.post("/upload", response_model=FileUploadResponse, status_code=201)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db)
):
    """
    Upload a file.

    The file will be:
    1. Uploaded to Backblaze B2
    2. Processed to extract text
    3. Chunked and stored in ChromaDB for vector search
    4. Metadata saved to database

    Returns a fresh authorized download URL valid for 1 hour.
    """
    file_service = get_file_service()
    backblaze_service = get_backblaze_service()
    file_record = file_service.upload_file(file, db)

    # Generate fresh authorized URL
    authorized_url = get_authorized_url(file_record, backblaze_service)

    return FileUploadResponse(
        id=file_record.id,
        filename=file_record.filename,
        original_name=file_record.original_name,
        file_type=file_record.file_type,
        file_size=file_record.file_size,
        backblaze_url=authorized_url,
        upload_date=file_record.upload_date,
        is_processed=file_record.is_processed
    )


@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    """
    Get file metadata and download URL by ID.
    Returns a fresh authorized download URL valid for 1 hour.
    """
    file_service = get_file_service()
    backblaze_service = get_backblaze_service()
    file_record = file_service.get_file(file_id, db)
    return get_file_response_with_auth_url(file_record, backblaze_service)


@router.get("/", response_model=FileListResponse)
async def list_files(
    db: Session = Depends(get_db)
):
    """
    List all uploaded files.
    Returns fresh authorized download URLs valid for 1 hour.
    """
    file_service = get_file_service()
    backblaze_service = get_backblaze_service()
    files = file_service.list_files(db)

    # Convert each file to response with fresh authorized URL
    file_responses = [
        get_file_response_with_auth_url(file, backblaze_service)
        for file in files
    ]

    return FileListResponse(files=file_responses, total=len(file_responses))


@router.delete("/{file_id}", response_model=FileDeleteResponse)
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a file.

    This will:
    1. Delete the file from Backblaze B2
    2. Delete the ChromaDB collection
    3. Delete the database record
    """
    file_service = get_file_service()
    file_record = file_service.delete_file(file_id, db)

    return FileDeleteResponse(
        message="File deleted successfully",
        file_id=file_record.id,
        filename=file_record.original_name
    )
