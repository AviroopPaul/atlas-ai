from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MessageBase(BaseModel):
    role: str
    content: str


class MessageCreate(MessageBase):
    sources: Optional[str] = None
    intent: Optional[str] = None


class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    sources: Optional[str] = None
    intent: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class ConversationListItem(BaseModel):
    id: int
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: int

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    conversations: List[ConversationListItem]
    total: int
