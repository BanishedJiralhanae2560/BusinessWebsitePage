"""
Intelligent chatbot service that understands context and provides accurate answers.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import random
import logging
from typing import Dict, List, Tuple, Optional, Any
from difflib import SequenceMatcher
import re

from app.services.data_loader import DataLoader

logger = logging.getLogger(__name__)


class ChatbotService:
    """Intelligent chatbot that understands questions and provides contextual answers."""
    
    def __init__(self, data_loader: DataLoader):
        """Initialize the chatbot service."""
        self.data_loader = data_loader
        self.conversation_history: List[Dict[str, str]] = []
        self.unknown_count = 0
        
    def process_message(self, user_message: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a user message and generate an intelligent response.
        
        Args:
            user_message: The user's input message
            user_id: Optional user identifier
            
        Returns:
            Dictionary containing response, intent, and confidence
        """
        if not user_message or not user_message.strip():
            return {
                "response": "I didn't receive a message. Could you try again?",
                "intent": "empty_message",
                "confidence": 1.0
            }
        
        # Clean and normalize the message
        cleaned_message = self._normalize_message(user_message)
        
        # Try to match basic intents first (greeting, farewell, thanks)
        intent, confidence = self._match_basic_intent(cleaned_message)
        
        # If it's a basic intent, use predefined responses
        if intent in ["greeting", "farewell", "thanks"] and confidence > 0.6:
            response = random.choice(self.data_loader.get_intent_responses(intent))
        else:
            # This is a question - search the knowledge base
            response, intent, confidence = self._search_knowledge_base(user_message, cleaned_message)
        
        # Track conversation history
        self._update_history(user_message, response, intent)
        
        # Track unknown responses
        if intent == "unknown":
            self.unknown_count += 1
        else:
            self.unknown_count = 0
        
        logger.info(
            f"Processed: '{user_message[:50]}...' -> Intent: {intent} (confidence: {confidence:.2f})"
        )
        
        return {
            "response": response,
            "intent": intent,
            "confidence": confidence,
            "bot_name": self.data_loader.get_bot_name()
        }
    
    def _normalize_message(self, message: str) -> str:
        """Normalize user message for matching."""
        if not self.data_loader.is_case_sensitive():
            message = message.lower()
        message = " ".join(message.split())
        return message.strip()
    
    def _match_basic_intent(self, message: str) -> Tuple[str, float]:
        """Match basic intents like greeting, farewell, thanks."""
        basic_intents = ["greeting", "farewell", "thanks"]
        best_match = "unknown"
        best_score = 0.0
        
        for intent_name in basic_intents:
            patterns = self.data_loader.get_intent_patterns(intent_name)
            
            for pattern in patterns:
                if not self.data_loader.is_case_sensitive():
                    pattern = pattern.lower()
                
                # Check for exact or partial match
                if pattern in message or message in pattern:
                    score = 0.9
                    if score > best_score:
                        best_score = score
                        best_match = intent_name
        
        return best_match, best_score
    
    def _search_knowledge_base(self, original_message: str, normalized_message: str) -> Tuple[str, str, float]:
        """
        Search the knowledge base for relevant information.
        
        Args:
            original_message: Original user message
            normalized_message: Normalized version
            
        Returns:
            Tuple of (response, intent, confidence)
        """
        knowledge = self.data_loader.get_full_knowledge()
        
        # Get knowledge base section
        kb = knowledge.get("knowledge_base", {})
        
        # Search topics
        topic_result = self._search_topics(normalized_message, kb.get("topics", {}))
        if topic_result:
            return topic_result
        
        # Search FAQs
        faq_result = self._search_faqs(normalized_message, kb.get("faqs", []))
        if faq_result:
            return faq_result
        
        # No match found - return fallback
        fallback_responses = self.data_loader.get_fallback_responses()
        response = random.choice(fallback_responses) if fallback_responses else "I don't have information about that."
        
        return response, "unknown", 0.0
    
    def _search_topics(self, message: str, topics: Dict) -> Optional[Tuple[str, str, float]]:
        """Search through topics in knowledge base."""
        best_match = None
        best_score = 0.0
        best_topic = None
        
        for topic_name, topic_data in topics.items():
            keywords = topic_data.get("keywords", [])
            content = topic_data.get("content", "")
            
            # Calculate match score based on keywords
            score = self._calculate_keyword_match(message, keywords)
            
            if score > best_score and score > 0.3:
                best_score = score
                best_match = content
                best_topic = topic_name
        
        if best_match:
            return best_match, f"topic_{best_topic}", best_score
        
        return None
    
    def _search_faqs(self, message: str, faqs: List[Dict]) -> Optional[Tuple[str, str, float]]:
        """Search through FAQs in knowledge base."""
        best_match = None
        best_score = 0.0
        best_question = None
        
        for faq in faqs:
            keywords = faq.get("keywords", [])
            question = faq.get("question", "")
            answer = faq.get("answer", "")
            
            # Calculate match score
            keyword_score = self._calculate_keyword_match(message, keywords)
            question_score = self._calculate_similarity(message, question.lower())
            
            # Use the higher score
            score = max(keyword_score, question_score * 0.8)
            
            if score > best_score and score > 0.3:
                best_score = score
                best_match = answer
                best_question = question
        
        if best_match:
            return best_match, "faq", best_score
        
        return None
    
    def _calculate_keyword_match(self, message: str, keywords: List[str]) -> float:
        """
        Calculate how well the message matches a list of keywords.
        Prioritizes exact phrase matches over word overlap.
        
        Returns:
            Score between 0 and 1
        """
        if not keywords:
            return 0.0
        
        message_lower = message.lower()
        message_words = set(message_lower.split())
        max_score = 0.0
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            
            # Exact phrase match (highest priority)
            if keyword_lower == message_lower:
                return 1.0
            
            # Keyword phrase is fully contained in message (very high priority)
            if keyword_lower in message_lower:
                # Longer matches score higher
                score = 0.9 + (len(keyword_lower) / len(message_lower) * 0.1)
                max_score = max(max_score, min(score, 1.0))
                continue
            
            # Message is contained in keyword
            if message_lower in keyword_lower:
                score = 0.85
                max_score = max(max_score, score)
                continue
            
            # Word overlap (lower priority)
            keyword_words = set(keyword_lower.split())
            if keyword_words and message_words:
                overlap = len(keyword_words & message_words)
                if overlap > 0:
                    score = (overlap / max(len(keyword_words), len(message_words))) * 0.7
                    max_score = max(max_score, score)
        
        return max_score
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts."""
        # Exact match
        if text1 == text2:
            return 1.0
        
        # Contains match
        if text1 in text2 or text2 in text1:
            return 0.85
        
        # Word-level matching
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if words1 and words2:
            intersection = words1 & words2
            union = words1 | words2
            jaccard = len(intersection) / len(union) if union else 0
            
            if jaccard > 0.3:
                return jaccard
        
        # Fuzzy matching
        if self.data_loader.is_fuzzy_matching_enabled():
            return SequenceMatcher(None, text1, text2).ratio()
        
        return 0.0
    
    def _update_history(self, user_message: str, bot_response: str, intent: str) -> None:
        """Update conversation history."""
        max_turns = self.data_loader.get_context_memory_turns()
        
        self.conversation_history.append({
            "user": user_message,
            "bot": bot_response,
            "intent": intent
        })
        
        if len(self.conversation_history) > max_turns:
            self.conversation_history = self.conversation_history[-max_turns:]
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get the conversation history."""
        return self.conversation_history
    
    def clear_history(self) -> None:
        """Clear conversation history."""
        self.conversation_history = []
        self.unknown_count = 0
        logger.info("Conversation history cleared")
    
    def get_bot_info(self) -> Dict[str, Any]:
        """Get bot information."""
        return {
            "name": self.data_loader.get_bot_name(),
            "personality": self.data_loader.get_personality(),
            "capabilities": list(self.data_loader.get_all_intents().keys())
        }