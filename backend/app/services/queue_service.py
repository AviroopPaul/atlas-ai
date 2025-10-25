import logging
import queue
import threading
from typing import Optional
from sqlalchemy.orm import Session

from app.services.document_processor import get_document_processor
from app.services.chroma_service import get_chroma_service
from app.services.backblaze_service import get_backblaze_service
from app.models.file import File
from app.models.database import SessionLocal

logger = logging.getLogger(__name__)


class FileProcessingQueue:
    """Background queue for processing files asynchronously."""

    def __init__(self):
        self.queue = queue.Queue()
        self.doc_processor = get_document_processor()
        self.chroma = get_chroma_service()
        self.backblaze = get_backblaze_service()
        self.worker_thread = None
        self.is_running = False

    def start(self):
        """Start the background worker thread."""
        if not self.is_running:
            self.is_running = True
            self.worker_thread = threading.Thread(target=self._worker, daemon=True)
            self.worker_thread.start()
            logger.info("File processing queue started")

    def stop(self):
        """Stop the background worker thread."""
        self.is_running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=5)
            logger.info("File processing queue stopped")

    def enqueue(self, file_id: int):
        """Add a file to the processing queue."""
        self.queue.put(file_id)
        logger.info(f"File {file_id} added to processing queue")

    def _worker(self):
        """Background worker that processes files from the queue."""
        logger.info("File processing worker started")
        
        while self.is_running:
            try:
                # Wait for file with timeout so we can check is_running periodically
                file_id = self.queue.get(timeout=1)
                
                try:
                    self._process_file(file_id)
                except Exception as e:
                    logger.error(f"Error processing file {file_id}: {str(e)}")
                finally:
                    self.queue.task_done()
                    
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Worker error: {str(e)}")

    def _process_file(self, file_id: int):
        """Process a single file: extract text, chunk, and store in ChromaDB."""
        db: Optional[Session] = None
        
        try:
            # Create a new database session for this thread
            db = SessionLocal()
            
            # Get file record
            file_record = db.query(File).filter(File.id == file_id).first()
            if not file_record:
                logger.error(f"File {file_id} not found in database")
                return

            logger.info(f"Processing file: {file_record.original_name}")

            # Download file from Backblaze
            file_content = self.backblaze.download_file(file_record.filename)

            # Process document (extract and chunk text)
            metadata = {
                "filename": file_record.original_name,
                "file_type": file_record.file_type,
                "file_size": file_record.file_size
            }

            chunks = self.doc_processor.process_document(
                file_content=file_content,
                file_type=file_record.file_type,
                metadata=metadata
            )

            # Store in ChromaDB
            chunk_texts = [chunk[0] for chunk in chunks]
            chunk_metadatas = [chunk[1] for chunk in chunks]

            self.chroma.add_documents(
                collection_name=file_record.chroma_collection_id,
                documents=chunk_texts,
                metadatas=chunk_metadatas
            )

            # Mark as processed
            file_record.is_processed = True
            db.commit()

            logger.info(f"Successfully processed file: {file_record.original_name}")

        except Exception as e:
            logger.error(f"Failed to process file {file_id}: {str(e)}")
            if db:
                db.rollback()
            raise
        finally:
            if db:
                db.close()


# Global queue instance
_queue_instance: Optional[FileProcessingQueue] = None


def get_queue_service() -> FileProcessingQueue:
    """Get or create the global queue service instance."""
    global _queue_instance
    if _queue_instance is None:
        _queue_instance = FileProcessingQueue()
        _queue_instance.start()
    return _queue_instance


def stop_queue_service():
    """Stop the global queue service."""
    global _queue_instance
    if _queue_instance:
        _queue_instance.stop()
        _queue_instance = None
