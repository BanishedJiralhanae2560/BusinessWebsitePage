"""
Chatbot Service - Integrates Universal Intent Matcher
Works with ANY knowledge base - no hardcoding needed!
"""

from typing import Dict, List, Optional
import random
from datetime import datetime

# Import the universal intent matcher
from .intent_matcher import UniversalIntentMatcher


class ChatbotSession:
    """Represents a single chat session with conversation history."""
    
    def __init__(self, session_id: str, bot_name: str, matcher: UniversalIntentMatcher):
        self.session_id = session_id
        self.bot_name = bot_name
        self.matcher = matcher
        self.conversation_history = []
        self.created_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()
    
    def add_message(self, role: str, content: str):
        """Add a message to conversation history."""
        self.conversation_history.append({
            'role': role,
            'content': content,
            'timestamp': datetime.utcnow().isoformat()
        })
        self.last_activity = datetime.utcnow()
    
    def get_response(self, user_message: str, debug: bool = False) -> Dict:
        """
        Get a response for the user's message.
        
        Args:
            user_message: The user's input
            debug: If True, include debug information in response
            
        Returns:
            Dictionary with response and optional debug info
        """
        # Add user message to history
        self.add_message('user', user_message)
        
        # Get response from universal matcher
        bot_response = self.matcher.get_response(user_message)
        
        # Add bot response to history
        self.add_message('assistant', bot_response)
        
        result = {
            'response': bot_response,
            'session_id': self.session_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Include debug info if requested
        if debug:
            result['debug'] = self.matcher.get_debug_info(user_message)
        
        return result
    
    def get_history(self, limit: Optional[int] = None) -> List[Dict]:
        """Get conversation history, optionally limited to recent messages."""
        if limit:
            return self.conversation_history[-limit:]
        return self.conversation_history


class AdaptiveChatbot:
    """
    Main chatbot class that works with any knowledge base.
    Completely universal - no hardcoding needed!
    """
    
    def __init__(self, knowledge_data: Dict, config: Dict):
        """
        Initialize chatbot with knowledge and config.
        
        Args:
            knowledge_data: Loaded knowledge base (from JSON)
            config: Configuration settings
        """
        self.bot_name = knowledge_data.get('bot_name', 'ChatBot')
        self.description = knowledge_data.get('description', '')
        self.theme = knowledge_data.get('theme', {})
        
        # Extract components from knowledge data
        self.intents = knowledge_data.get('intents', {})
        self.knowledge_base = knowledge_data.get('knowledge_base', {})
        self.fallback_responses = knowledge_data.get(
            'fallback_responses',
            config.get('fallback_response', ["I'm not sure about that."])
        )
        
        # Ensure fallback_responses is a list
        if isinstance(self.fallback_responses, str):
            self.fallback_responses = [self.fallback_responses]
        
        # Create universal intent matcher
        self.matcher = UniversalIntentMatcher(
            intents=self.intents,
            knowledge_base=self.knowledge_base,
            fallback_responses=self.fallback_responses
        )
        
        # Session management
        self.sessions: Dict[str, ChatbotSession] = {}
    
    def create_session(self, session_id: str) -> ChatbotSession:
        """Create a new chat session."""
        session = ChatbotSession(session_id, self.bot_name, self.matcher)
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[ChatbotSession]:
        """Get an existing session."""
        return self.sessions.get(session_id)
    
    def get_or_create_session(self, session_id: str) -> ChatbotSession:
        """Get existing session or create new one."""
        session = self.get_session(session_id)
        if not session:
            session = self.create_session(session_id)
        return session
    
    def chat(self, session_id: str, user_message: str, debug: bool = False) -> Dict:
        """
        Process a chat message and return response.
        
        Args:
            session_id: Unique session identifier
            user_message: User's input message
            debug: Include debug information
            
        Returns:
            Response dictionary with bot's reply
        """
        # Get or create session
        session = self.get_or_create_session(session_id)
        
        # Get response using universal matcher
        response = session.get_response(user_message, debug=debug)
        
        # Add bot metadata
        response['bot_name'] = self.bot_name
        
        return response
    
    def get_bot_info(self) -> Dict:
        """Get information about the bot."""
        return {
            'bot_name': self.bot_name,
            'description': self.description,
            'theme': self.theme,
            'intents_count': len(self.intents),
            'topics_count': len(self.knowledge_base.get('topics', {})),
            'faqs_count': len(self.knowledge_base.get('faqs', []))
        }
    
    def clear_session(self, session_id: str) -> bool:
        """Clear a specific session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def clear_all_sessions(self):
        """Clear all sessions."""
        self.sessions.clear()


# Example of how this would be used in your routes/chat.py
"""
from app.services.chatbot import AdaptiveChatbot

# Global storage for chatbot instances per session
chatbot_sessions = {}

@router.post("/chat")
async def chat(request: Request, message: ChatMessage):
    # Get the data loader from app state
    data_loader = request.app.state.data_loader
    
    # Get knowledge and config
    knowledge_data = {
        'bot_name': data_loader.get_bot_name(),
        'description': data_loader.config.get('description', ''),
        'theme': data_loader.config.get('theme', {}),
        'intents': data_loader.get_all_intents(),
        'knowledge_base': data_loader.get_knowledge_base(),
        'fallback_responses': data_loader.get_fallback_responses()
    }
    
    # Create or get chatbot for this session
    session_id = message.session_id
    if session_id not in chatbot_sessions:
        chatbot_sessions[session_id] = AdaptiveChatbot(knowledge_data, data_loader.config)
    
    chatbot = chatbot_sessions[session_id]
    
    # Get response
    response = chatbot.chat(session_id, message.content, debug=message.debug)
    
    return response
"""