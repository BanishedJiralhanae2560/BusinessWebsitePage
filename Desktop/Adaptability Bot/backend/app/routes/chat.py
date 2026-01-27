"""
API routes for chat functionality.
"""

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
import logging
from datetime import datetime

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationHistory,
    ConversationTurn,
    BotInfo,
    HealthCheck,
    ErrorResponse,
    ClearHistoryResponse
)
from app.services.chatbot_service import ChatbotService

logger = logging.getLogger(__name__)

router = APIRouter()

# Store chatbot service instances per session (in production, use Redis/database)
chatbot_sessions = {}


def get_chatbot_service(request: Request, session_id: str = "default") -> ChatbotService:
    """
    Get or create a chatbot service for a session.
    
    Args:
        request: FastAPI request object
        session_id: Session identifier
        
    Returns:
        ChatbotService instance
    """
    if session_id not in chatbot_sessions:
        data_loader = request.app.state.data_loader
        chatbot_sessions[session_id] = ChatbotService(data_loader)
        logger.info(f"Created new chatbot session: {session_id}")
    
    return chatbot_sessions[session_id]


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(chat_request: ChatRequest, request: Request):
    """
    Process a chat message and return bot response.
    
    Args:
        chat_request: ChatRequest with user message
        request: FastAPI request object
        
    Returns:
        ChatResponse with bot's reply
    """
    try:
        # Get session-specific chatbot service
        session_id = chat_request.session_id or "default"
        chatbot = get_chatbot_service(request, session_id)
        
        # Process the message
        result = chatbot.process_message(
            user_message=chat_request.message,
            user_id=chat_request.user_id
        )
        
        # Return response
        return ChatResponse(
            response=result["response"],
            intent=result["intent"],
            confidence=result["confidence"],
            bot_name=result["bot_name"],
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error processing chat message: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing message: {str(e)}"
        )


@router.get("/chat/history", response_model=ConversationHistory)
async def get_history(request: Request, session_id: str = "default"):
    """
    Get conversation history for a session.
    
    Args:
        request: FastAPI request object
        session_id: Session identifier
        
    Returns:
        ConversationHistory with all turns
    """
    try:
        chatbot = get_chatbot_service(request, session_id)
        history = chatbot.get_conversation_history()
        
        # Convert history to ConversationTurn objects
        turns = [
            ConversationTurn(
                user=turn["user"],
                bot=turn["bot"],
                intent=turn["intent"],
                timestamp=turn.get("timestamp", datetime.utcnow().isoformat())
            )
            for turn in history
        ]
        
        return ConversationHistory(
            session_id=session_id,
            turns=turns,
            total_turns=len(turns)
        )
        
    except Exception as e:
        logger.error(f"Error retrieving history: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving history: {str(e)}"
        )


@router.delete("/chat/history", response_model=ClearHistoryResponse)
async def clear_history(request: Request, session_id: str = "default"):
    """
    Clear conversation history for a session.
    
    Args:
        request: FastAPI request object
        session_id: Session identifier
        
    Returns:
        ClearHistoryResponse confirming deletion
    """
    try:
        chatbot = get_chatbot_service(request, session_id)
        chatbot.clear_history()
        
        return ClearHistoryResponse(
            success=True,
            message=f"Conversation history cleared for session: {session_id}",
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error clearing history: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing history: {str(e)}"
        )


@router.get("/bot/info", response_model=BotInfo)
async def get_bot_info(request: Request):
    """
    Get information about the bot.
    
    Args:
        request: FastAPI request object
        
    Returns:
        BotInfo with bot details
    """
    try:
        chatbot = get_chatbot_service(request)
        info = chatbot.get_bot_info()
        bot_config = request.app.state.data_loader.config
        
        return BotInfo(
            name=info["name"],
            version=bot_config.get("version", "1.0.0"),
            description=bot_config.get("description", "An adaptive chatbot"),
            personality=info["personality"],
            capabilities=info["capabilities"]
        )
        
    except Exception as e:
        logger.error(f"Error retrieving bot info: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving bot info: {str(e)}"
        )


@router.get("/health", response_model=HealthCheck)
async def health_check(request: Request):
    """
    Health check endpoint.
    
    Args:
        request: FastAPI request object
        
    Returns:
        HealthCheck with service status
    """
    try:
        # Check if data is loaded
        data_loader = request.app.state.data_loader
        data_loaded = (
            len(data_loader.get_all_intents()) > 0 and
            data_loader.get_bot_name() is not None
        )
        
        return HealthCheck(
            status="healthy" if data_loaded else "unhealthy",
            service="chatbot-backend",
            timestamp=datetime.utcnow().isoformat(),
            data_loaded=data_loaded
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return HealthCheck(
            status="unhealthy",
            service="chatbot-backend",
            timestamp=datetime.utcnow().isoformat(),
            data_loaded=False
        )


@router.post("/reload-data")
async def reload_data(request: Request):
    """
    Reload knowledge and config files (useful for development).
    
    Args:
        request: FastAPI request object
        
    Returns:
        Success message
    """
    try:
        data_loader = request.app.state.data_loader
        data_loader.load_data()
        
        # Clear all existing chatbot sessions to use new data
        global chatbot_sessions
        chatbot_sessions.clear()
        
        return {
            "success": True,
            "message": "Data reloaded successfully",
            "intents_loaded": len(data_loader.get_all_intents()),
            "bot_name": data_loader.get_bot_name(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error reloading data: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reloading data: {str(e)}"
        )