from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.models.database import get_db
from app.models.file import File
from app.schemas.query import QueryRequest, QueryResponse, Source
from app.services.chroma_service import get_chroma_service
from app.services.groq_service import get_groq_service
from app.services.backblaze_service import get_backblaze_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
async def query_documents(
    request: QueryRequest,
    db: Session = Depends(get_db)
):
    """
    Query documents using natural language.

    The system will:
    1. Detect the intent (file retrieval vs information query)
    2. Search ChromaDB for relevant content
    3. Use Groq LLM to generate a response
    4. Return markdown-formatted response with download links if applicable
    """
    try:
        chroma_service = get_chroma_service()
        groq_service = get_groq_service()
        backblaze_service = get_backblaze_service()

        # Get all files for intent detection
        all_files = db.query(File).all()
        if not all_files:
            raise HTTPException(
                status_code=404,
                detail="No files have been uploaded yet. Please upload files first."
            )

        file_names = [f.original_name for f in all_files]

        # Step 1: Detect query intent
        logger.info(f"Detecting intent for query: {request.query}")
        intent_result = groq_service.detect_query_intent(
            request.query, file_names)
        intent = intent_result.get('intent', 'information_query')
        target_file = intent_result.get('target_file')

        logger.info(f"Detected intent: {intent}, target_file: {target_file}")

        # Step 2: Search ChromaDB for relevant chunks
        logger.info("Querying ChromaDB for relevant content")
        results = chroma_service.query_all_collections(
            query_text=request.query,
            n_results_per_collection=3
        )

        if not results:
            return QueryResponse(
                markdown_response="I couldn't find any relevant information in your documents to answer that question.",
                sources=[],
                intent=intent
            )

        # Step 3: Prepare file URLs for response generation
        file_urls = {}

        if intent == "file_retrieval":
            # Build URL mapping for files with fresh authorized URLs
            for file in all_files:
                try:
                    # Generate fresh authorized URL (valid for 1 hour)
                    authorized_url = backblaze_service.get_download_url(
                        file.filename)
                    file_urls[file.original_name] = authorized_url
                except Exception as e:
                    logger.error(
                        f"Failed to generate URL for {file.filename}: {str(e)}")
                    # Fallback to stored URL if generation fails
                    file_urls[file.original_name] = file.backblaze_url

            # If specific file was identified, prioritize it
            if target_file:
                matching_file = next(
                    (f for f in all_files if target_file.lower() in f.original_name.lower()), None)
                if matching_file:
                    try:
                        authorized_url = backblaze_service.get_download_url(
                            matching_file.filename)
                        file_urls = {
                            matching_file.original_name: authorized_url}
                    except Exception as e:
                        logger.error(
                            f"Failed to generate URL for {matching_file.filename}: {str(e)}")
                        file_urls = {
                            matching_file.original_name: matching_file.backblaze_url}

        # Step 4: Generate response using Groq
        logger.info("Generating RAG response")
        markdown_response = groq_service.generate_rag_response(
            query=request.query,
            context_chunks=results[:5],
            intent=intent,
            chat_history=request.chat_history,
            file_urls=file_urls if intent == "file_retrieval" else None
        )

        # Step 5: Build source information (only most relevant source)
        sources = []

        if results:
            # Only return the most relevant source
            most_relevant = results[0]
            metadata = most_relevant.get('metadata', {})
            filename = metadata.get('filename', 'unknown')

            sources.append(Source(
                filename=filename,
                chunk_id=most_relevant.get('id', ''),
                relevance_score=1 - most_relevant.get('distance', 0)
                if most_relevant.get('distance') is not None else None
            ))

        return QueryResponse(
            markdown_response=markdown_response,
            sources=sources,
            intent=intent
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process query: {str(e)}"
        )
