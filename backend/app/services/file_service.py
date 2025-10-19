import logging
from typing import List
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
import uuid
import mimetypes

from app.models.file import File
from app.services.backblaze_service import get_backblaze_service
from app.services.document_processor import get_document_processor
from app.services.chroma_service import get_chroma_service
from app.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class FileService:
    """Service for orchestrating file operations across multiple services."""

    def __init__(self):
        self.backblaze = get_backblaze_service()
        self.doc_processor = get_document_processor()
        self.chroma = get_chroma_service()

    def upload_file(self, upload_file: UploadFile, db: Session) -> File:
        """
        Upload file and process it through the complete pipeline.

        Pipeline:
        1. Validate file
        2. Upload to Backblaze B2
        3. Extract text and chunk
        4. Store in ChromaDB
        5. Save metadata to database

        Args:
            upload_file: FastAPI UploadFile object
            db: Database session

        Returns:
            File model instance
        """
        backblaze_file_id = None
        collection_name = None

        try:
            # Step 1: Validate file
            self._validate_file(upload_file)

            # Read file content
            file_content = upload_file.file.read()
            upload_file.file.seek(0)  # Reset file pointer

            # Extract file info
            file_type = upload_file.filename.split('.')[-1].lower()
            original_name = upload_file.filename
            file_size = len(file_content)

            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}_{original_name}"

            # Determine content type
            content_type = upload_file.content_type or mimetypes.guess_type(
                original_name)[0] or 'application/octet-stream'

            # Step 2: Upload to Backblaze B2
            logger.info(f"Uploading file to B2: {unique_filename}")
            backblaze_url, backblaze_file_id = self.backblaze.upload_file_to_b2(
                file_content=file_content,
                file_name=unique_filename,
                content_type=content_type
            )

            # Step 3: Process document (extract and chunk text)
            logger.info(f"Processing document: {unique_filename}")
            metadata = {
                "filename": original_name,
                "file_type": file_type,
                "file_size": file_size
            }

            chunks = self.doc_processor.process_document(
                file_content=file_content,
                file_type=file_type,
                metadata=metadata
            )

            # Step 4: Store in ChromaDB
            collection_name = f"file_{uuid.uuid4().hex[:16]}"
            logger.info(f"Storing in ChromaDB collection: {collection_name}")

            chunk_texts = [chunk[0] for chunk in chunks]
            chunk_metadatas = [chunk[1] for chunk in chunks]

            self.chroma.add_documents(
                collection_name=collection_name,
                documents=chunk_texts,
                metadatas=chunk_metadatas
            )

            # Step 5: Save to database
            logger.info(f"Saving file metadata to database")
            file_record = File(
                filename=unique_filename,
                original_name=original_name,
                file_type=file_type,
                file_size=file_size,
                backblaze_url=backblaze_url,
                backblaze_file_id=backblaze_file_id,
                chroma_collection_id=collection_name,
                is_processed=True
            )

            db.add(file_record)
            db.commit()
            db.refresh(file_record)

            logger.info(
                f"Successfully uploaded and processed file: {original_name}")
            return file_record

        except Exception as e:
            logger.error(f"Error during file upload pipeline: {str(e)}")

            # Rollback: Clean up resources
            try:
                if backblaze_file_id:
                    logger.info("Rolling back: Deleting file from B2")
                    self.backblaze.delete_file_from_b2(
                        backblaze_file_id, unique_filename)
            except:
                pass

            try:
                if collection_name:
                    logger.info("Rolling back: Deleting ChromaDB collection")
                    self.chroma.delete_collection(collection_name)
            except:
                pass

            raise HTTPException(
                status_code=500, detail=f"Failed to upload file: {str(e)}")

    def delete_file(self, file_id: int, db: Session) -> File:
        """
        Delete file and all associated data.

        Args:
            file_id: Database file ID
            db: Database session

        Returns:
            Deleted File model instance
        """
        try:
            # Get file record
            file_record = db.query(File).filter(File.id == file_id).first()
            if not file_record:
                raise HTTPException(status_code=404, detail="File not found")

            # Delete from Backblaze
            logger.info(f"Deleting file from B2: {file_record.filename}")
            try:
                self.backblaze.delete_file_from_b2(
                    file_id=file_record.backblaze_file_id,
                    file_name=file_record.filename
                )
            except Exception as e:
                logger.warning(f"Failed to delete from B2: {str(e)}")

            # Delete from ChromaDB
            logger.info(
                f"Deleting ChromaDB collection: {file_record.chroma_collection_id}")
            try:
                self.chroma.delete_collection(file_record.chroma_collection_id)
            except Exception as e:
                logger.warning(f"Failed to delete from ChromaDB: {str(e)}")

            # Delete from database
            db.delete(file_record)
            db.commit()

            logger.info(
                f"Successfully deleted file: {file_record.original_name}")
            return file_record

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to delete file: {str(e)}")

    def get_file(self, file_id: int, db: Session) -> File:
        """
        Get file by ID.

        Args:
            file_id: Database file ID
            db: Database session

        Returns:
            File model instance
        """
        file_record = db.query(File).filter(File.id == file_id).first()
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")
        return file_record

    def list_files(self, db: Session) -> List[File]:
        """
        List all files.

        Args:
            db: Database session

        Returns:
            List of File model instances
        """
        return db.query(File).order_by(File.upload_date.desc()).all()

    def _validate_file(self, upload_file: UploadFile):
        """
        Validate file before upload.

        Args:
            upload_file: FastAPI UploadFile object

        Raises:
            HTTPException if validation fails
        """
        # Check if file has an extension
        if '.' not in upload_file.filename:
            raise HTTPException(
                status_code=400, detail="File must have an extension")

        # Check file extension
        file_ext = upload_file.filename.split('.')[-1].lower()
        if file_ext not in settings.allowed_extensions_list:
            raise HTTPException(
                status_code=400,
                detail=f"File type .{file_ext} not allowed. Allowed types: {', '.join(settings.allowed_extensions_list)}"
            )

        # Check file size
        upload_file.file.seek(0, 2)  # Seek to end
        file_size = upload_file.file.tell()
        upload_file.file.seek(0)  # Reset

        if file_size > settings.max_file_size_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB"
            )

        if file_size == 0:
            raise HTTPException(status_code=400, detail="File is empty")


def get_file_service() -> FileService:
    """Get FileService instance."""
    return FileService()
