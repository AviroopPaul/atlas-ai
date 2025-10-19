import chromadb
import logging
from typing import List, Dict, Any
from app.config.settings import get_settings
import uuid

logger = logging.getLogger(__name__)
settings = get_settings()


class ChromaService:
    """Service for managing ChromaDB vector storage and retrieval."""

    def __init__(self):
        self.client = self._get_chroma_client()

    def _get_chroma_client(self):
        """Initialize ChromaDB cloud client."""
        try:
            client = chromadb.CloudClient(
                tenant=settings.chroma_tenant,
                database=settings.chroma_database,
                api_key=settings.chroma_api_key
            )
            logger.info("Successfully connected to ChromaDB Cloud")
            return client

        except Exception as e:
            logger.error(f"Failed to connect to ChromaDB: {str(e)}")
            raise

    def create_collection(self, collection_name: str):
        """
        Create or get a collection in ChromaDB.

        Args:
            collection_name: Unique name for the collection

        Returns:
            Collection object
        """
        try:
            collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"Created/retrieved collection: {collection_name}")
            return collection

        except Exception as e:
            logger.error(f"Failed to create collection: {str(e)}")
            raise

    def add_documents(
        self,
        collection_name: str,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str] = None
    ) -> bool:
        """
        Add documents to a collection.

        Args:
            collection_name: Name of the collection
            documents: List of document texts
            metadatas: List of metadata dicts
            ids: Optional list of IDs (will be generated if not provided)

        Returns:
            True if successful
        """
        try:
            collection = self.create_collection(collection_name)

            # Generate IDs if not provided
            if ids is None:
                ids = [str(uuid.uuid4()) for _ in range(len(documents))]

            collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )

            logger.info(
                f"Added {len(documents)} documents to collection {collection_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to add documents to ChromaDB: {str(e)}")
            raise

    def query_collection(
        self,
        collection_name: str,
        query_text: str,
        n_results: int = 5
    ) -> Dict[str, Any]:
        """
        Query a specific collection.

        Args:
            collection_name: Name of the collection to query
            query_text: Query text
            n_results: Number of results to return

        Returns:
            Query results dict
        """
        try:
            collection = self.client.get_collection(name=collection_name)

            results = collection.query(
                query_texts=[query_text],
                n_results=n_results
            )

            logger.info(
                f"Queried collection {collection_name} with {n_results} results")
            return results

        except Exception as e:
            logger.error(f"Failed to query collection: {str(e)}")
            raise

    def query_all_collections(
        self,
        query_text: str,
        n_results_per_collection: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Query across all collections.

        Args:
            query_text: Query text
            n_results_per_collection: Number of results per collection

        Returns:
            List of results from all collections
        """
        try:
            collections = self.client.list_collections()
            all_results = []

            for collection in collections:
                try:
                    results = collection.query(
                        query_texts=[query_text],
                        n_results=n_results_per_collection
                    )

                    # Add collection name to metadata
                    if results and results.get('documents'):
                        for i in range(len(results['documents'][0])):
                            all_results.append({
                                'document': results['documents'][0][i],
                                'metadata': results['metadatas'][0][i] if results.get('metadatas') else {},
                                'distance': results['distances'][0][i] if results.get('distances') else None,
                                'id': results['ids'][0][i] if results.get('ids') else None,
                                'collection': collection.name
                            })

                except Exception as e:
                    logger.warning(
                        f"Failed to query collection {collection.name}: {str(e)}")
                    continue

            # Sort by distance (lower is better)
            all_results.sort(
                key=lambda x: x['distance'] if x['distance'] is not None else float('inf'))

            logger.info(
                f"Queried all collections, found {len(all_results)} results")
            return all_results

        except Exception as e:
            logger.error(f"Failed to query all collections: {str(e)}")
            raise

    def delete_collection(self, collection_name: str) -> bool:
        """
        Delete a collection.

        Args:
            collection_name: Name of the collection to delete

        Returns:
            True if successful
        """
        try:
            self.client.delete_collection(name=collection_name)
            logger.info(f"Deleted collection: {collection_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete collection: {str(e)}")
            raise

    def search_by_filename(self, filename: str) -> List[str]:
        """
        Search for collections matching a filename.

        Args:
            filename: Filename to search for

        Returns:
            List of matching collection names
        """
        try:
            collections = self.client.list_collections()
            matching = []

            # Normalize filename for comparison
            filename_lower = filename.lower()

            for collection in collections:
                # Collection names are typically based on filenames
                if filename_lower in collection.name.lower():
                    matching.append(collection.name)

            return matching

        except Exception as e:
            logger.error(f"Failed to search by filename: {str(e)}")
            raise


# Singleton instance
_chroma_service = None


def get_chroma_service() -> ChromaService:
    """Get or create ChromaService instance."""
    global _chroma_service
    if _chroma_service is None:
        _chroma_service = ChromaService()
    return _chroma_service
