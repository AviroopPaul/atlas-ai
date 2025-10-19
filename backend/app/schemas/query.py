from pydantic import BaseModel
from typing import List, Optional, Dict


class QueryRequest(BaseModel):
    """Request model for query."""

    query: str
    # List of {"role": "user"/"assistant", "content": "..."}
    chat_history: List[Dict[str, str]]
    # Optional: link to existing conversation
    conversation_id: Optional[int] = None


class Source(BaseModel):
    """Source information for query response."""

    filename: str
    chunk_id: str
    relevance_score: Optional[float] = None


class QueryResponse(BaseModel):
    """Response model for query - always returns markdown."""

    markdown_response: str
    sources: List[Source]
    intent: str  # "file_retrieval" or "information_query"
    conversation_id: Optional[int] = None  # ID of conversation if saved
