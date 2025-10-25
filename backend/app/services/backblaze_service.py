from b2sdk.v2 import InMemoryAccountInfo, B2Api
from app.config.settings import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class BackblazeService:
    """Service for managing file storage in Backblaze B2."""

    def __init__(self):
        self.info = InMemoryAccountInfo()
        self.b2_api = B2Api(self.info)
        self._authorize()

    def _authorize(self):
        """Authorize with Backblaze B2."""
        try:
            self.b2_api.authorize_account(
                "production",
                settings.backblaze_key_id,
                settings.backblaze_application_key
            )
            logger.info("Successfully authorized with Backblaze B2")
        except Exception as e:
            logger.error(f"Failed to authorize with Backblaze B2: {str(e)}")
            raise

    def upload_file_to_b2(self, file_content: bytes, file_name: str, content_type: str) -> tuple[str, str]:
        """
        Upload file to Backblaze B2.

        Args:
            file_content: File content as bytes
            file_name: Name of the file
            content_type: MIME type of the file

        Returns:
            Tuple of (file_url, file_id)
        """
        try:
            bucket = self.b2_api.get_bucket_by_name(
                settings.backblaze_bucket_name)

            # Upload file
            file_info = bucket.upload_bytes(
                data_bytes=file_content,
                file_name=file_name,
                content_type=content_type
            )

            # Get download URL
            download_url = self.b2_api.get_download_url_for_file_name(
                settings.backblaze_bucket_name,
                file_name
            )

            logger.info(f"Successfully uploaded file: {file_name}")
            return download_url, file_info.id_

        except Exception as e:
            logger.error(f"Failed to upload file to B2: {str(e)}")
            raise

    def delete_file_from_b2(self, file_id: str, file_name: str) -> bool:
        """
        Delete file from Backblaze B2.

        Args:
            file_id: Backblaze file ID
            file_name: Name of the file

        Returns:
            True if successful
        """
        try:
            file_version = self.b2_api.get_file_info(file_id)
            self.b2_api.delete_file_version(file_id, file_name)
            logger.info(f"Successfully deleted file: {file_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete file from B2: {str(e)}")
            raise

    def get_download_url(self, file_name: str, duration_seconds: int = 3600) -> str:
        """
        Generate authorized download URL for a file with expiration.

        Args:
            file_name: Name of the file
            duration_seconds: How long the URL should be valid (default 1 hour)

        Returns:
            Authorized download URL
        """
        try:
            # Get the bucket
            bucket = self.b2_api.get_bucket_by_name(
                settings.backblaze_bucket_name)

            # Get download authorization token
            auth_token = bucket.get_download_authorization(
                file_name_prefix=file_name,
                valid_duration_in_seconds=duration_seconds
            )

            # Get base download URL
            base_url = self.b2_api.get_download_url_for_file_name(
                settings.backblaze_bucket_name,
                file_name
            )

            # Add authorization token to URL
            download_url = f"{base_url}?Authorization={auth_token}"

            return download_url

        except Exception as e:
            logger.error(f"Failed to get download URL: {str(e)}")
            raise

    def download_file(self, file_name: str) -> bytes:
        """
        Download file content from Backblaze B2.

        Args:
            file_name: Name of the file

        Returns:
            File content as bytes
        """
        try:
            bucket = self.b2_api.get_bucket_by_name(
                settings.backblaze_bucket_name)

            # Download file
            downloaded_file = bucket.download_file_by_name(file_name)
            file_content = downloaded_file.read()
            
            logger.info(f"Successfully downloaded file: {file_name}")
            return file_content

        except Exception as e:
            logger.error(f"Failed to download file from B2: {str(e)}")
            raise


# Singleton instance
_backblaze_service = None


def get_backblaze_service() -> BackblazeService:
    """Get or create BackblazeService instance."""
    global _backblaze_service
    if _backblaze_service is None:
        _backblaze_service = BackblazeService()
    return _backblaze_service
