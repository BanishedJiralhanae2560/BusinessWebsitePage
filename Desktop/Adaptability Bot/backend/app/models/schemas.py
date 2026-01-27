"""
Pydantic models for request and response validation.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="User's message to the chatbot",
        example="Hello, how are you?"
    )
    user_id: Optional[str] = Field(
        None,
        description="Optional user identifier for tracking conversations",
        example="user_123"
    )
    session_id: Optional[str] = Field(
        None,
        description="Optional session identifier for multi-turn conversations",
        example="session_abc"
    )
    
    @validator('message')
    def message_not_empty(cls, v):
        """Validate that message is not just whitespace."""
        if not v.strip():
            raise ValueError('Message cannot be empty or whitespace only')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What can you help me with?",
                "user_id": "user_123",
                "session_id": "session_abc"
            }
        }


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    
    response: str = Field(
        ...,
        description="Bot's response message",
        example="I can help you with many things! What do you need assistance with?"
    )
    intent: str = Field(
        ...,
        description="Detected intent from user's message",
        example="help"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score for intent matching (0-1)",
        example=0.92
    )
    bot_name: str = Field(
        ...,
        description="Name of the chatbot",
        example="AdaptBot"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Timestamp of the response",
        example="2024-01-01T12:00:00.000000"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Hello! How can I assist you today?",
                "intent": "greeting",
                "confidence": 0.95,
                "bot_name": "AdaptBot",
                "timestamp": "2024-01-01T12:00:00.000000"
            }
        }


class ConversationTurn(BaseModel):
    """Model for a single conversation turn."""
    
    user: str = Field(..., description="User's message")
    bot: str = Field(..., description="Bot's response")
    intent: str = Field(..., description="Detected intent")
    timestamp: Optional[str] = Field(
        None,
        description="Timestamp of the turn"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "user": "Hello",
                "bot": "Hi there! How can I help you?",
                "intent": "greeting",
                "timestamp": "2024-01-01T12:00:00.000000"
            }
        }


class ConversationHistory(BaseModel):
    """Model for conversation history."""
    
    session_id: Optional[str] = Field(
        None,
        description="Session identifier"
    )
    turns: List[ConversationTurn] = Field(
        default_factory=list,
        description="List of conversation turns"
    )
    total_turns: int = Field(
        ...,
        description="Total number of turns in history"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_abc",
                "turns": [
                    {
                        "user": "Hello",
                        "bot": "Hi there! How can I help you?",
                        "intent": "greeting",
                        "timestamp": "2024-01-01T12:00:00.000000"
                    }
                ],
                "total_turns": 1
            }
        }


class BotInfo(BaseModel):
    """Model for bot information."""
    
    name: str = Field(..., description="Bot's name", example="AdaptBot")
    version: str = Field(..., description="Bot version", example="1.0.0")
    description: str = Field(
        ...,
        description="Bot description",
        example="An adaptive chatbot with customizable knowledge"
    )
    personality: Dict[str, Any] = Field(
        default_factory=dict,
        description="Bot's personality traits"
    )
    capabilities: List[str] = Field(
        default_factory=list,
        description="List of bot capabilities/intents"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "AdaptBot",
                "version": "1.0.0",
                "description": "An adaptive chatbot with customizable knowledge",
                "personality": {
                    "tone": "friendly",
                    "formality": "casual"
                },
                "capabilities": [
                    "greeting",
                    "farewell",
                    "help",
                    "thanks"
                ]
            }
        }


class HealthCheck(BaseModel):
    """Model for health check response."""
    
    status: str = Field(..., description="Health status", example="healthy")
    service: str = Field(..., description="Service name", example="chatbot-backend")
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Timestamp of health check"
    )
    data_loaded: bool = Field(
        default=True,
        description="Whether data files are loaded"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "service": "chatbot-backend",
                "timestamp": "2024-01-01T12:00:00.000000",
                "data_loaded": True
            }
        }


class ErrorResponse(BaseModel):
    """Model for error responses."""
    
    error: str = Field(..., description="Error type", example="ValidationError")
    message: str = Field(
        ...,
        description="Error message",
        example="Invalid input provided"
    )
    detail: Optional[str] = Field(
        None,
        description="Detailed error information"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Timestamp of error"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "ValidationError",
                "message": "Message cannot be empty",
                "detail": "The 'message' field is required and must not be empty",
                "timestamp": "2024-01-01T12:00:00.000000"
            }
        }


class ClearHistoryResponse(BaseModel):
    """Model for clear history response."""
    
    success: bool = Field(..., description="Whether history was cleared successfully")
    message: str = Field(..., description="Status message")
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Timestamp of operation"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Conversation history cleared successfully",
                "timestamp": "2024-01-01T12:00:00.000000"
            }
        }