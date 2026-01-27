"""
Unit tests for chatbot service and API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import json

from app.main import app
from app.services.data_loader import DataLoader
from app.services.chatbot_service import ChatbotService


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def data_loader():
    """Create a DataLoader instance for testing."""
    loader = DataLoader()
    loader.load_data()
    return loader


@pytest.fixture
def chatbot_service(data_loader):
    """Create a ChatbotService instance for testing."""
    return ChatbotService(data_loader)


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


# ============================================================================
# DataLoader Tests
# ============================================================================

class TestDataLoader:
    """Tests for DataLoader class."""
    
    def test_load_data_success(self, data_loader):
        """Test successful data loading."""
        assert len(data_loader.get_all_intents()) > 0
        assert data_loader.get_bot_name() is not None
    
    def test_get_all_intents(self, data_loader):
        """Test retrieving all intents."""
        intents = data_loader.get_all_intents()
        assert isinstance(intents, dict)
        assert "greeting" in intents
        assert "farewell" in intents
        assert "help" in intents
    
    def test_get_intent(self, data_loader):
        """Test retrieving a specific intent."""
        greeting_intent = data_loader.get_intent("greeting")
        assert greeting_intent is not None
        assert "patterns" in greeting_intent
        assert "responses" in greeting_intent
    
    def test_get_intent_patterns(self, data_loader):
        """Test retrieving intent patterns."""
        patterns = data_loader.get_intent_patterns("greeting")
        assert isinstance(patterns, list)
        assert len(patterns) > 0
        assert "hello" in [p.lower() for p in patterns]
    
    def test_get_intent_responses(self, data_loader):
        """Test retrieving intent responses."""
        responses = data_loader.get_intent_responses("greeting")
        assert isinstance(responses, list)
        assert len(responses) > 0
    
    def test_get_bot_name(self, data_loader):
        """Test retrieving bot name."""
        bot_name = data_loader.get_bot_name()
        assert isinstance(bot_name, str)
        assert len(bot_name) > 0
    
    def test_get_similarity_threshold(self, data_loader):
        """Test retrieving similarity threshold."""
        threshold = data_loader.get_similarity_threshold()
        assert isinstance(threshold, float)
        assert 0.0 <= threshold <= 1.0
    
    def test_get_fallback_responses(self, data_loader):
        """Test retrieving fallback responses."""
        fallbacks = data_loader.get_fallback_responses()
        assert isinstance(fallbacks, list)
        assert len(fallbacks) > 0


# ============================================================================
# ChatbotService Tests
# ============================================================================

class TestChatbotService:
    """Tests for ChatbotService class."""
    
    def test_process_greeting(self, chatbot_service):
        """Test processing a greeting message."""
        result = chatbot_service.process_message("hello")
        assert result["intent"] == "greeting"
        assert result["confidence"] > 0.5
        assert len(result["response"]) > 0
    
    def test_process_farewell(self, chatbot_service):
        """Test processing a farewell message."""
        result = chatbot_service.process_message("goodbye")
        assert result["intent"] == "farewell"
        assert result["confidence"] > 0.5
    
    def test_process_thanks(self, chatbot_service):
        """Test processing a thank you message."""
        result = chatbot_service.process_message("thank you")
        assert result["intent"] == "thanks"
        assert result["confidence"] > 0.5
    
    def test_process_help(self, chatbot_service):
        """Test processing a help request."""
        result = chatbot_service.process_message("can you help me")
        assert result["intent"] == "help"
        assert result["confidence"] > 0.5
    
    def test_process_unknown(self, chatbot_service):
        """Test processing an unknown message."""
        result = chatbot_service.process_message("xyzabc123random")
        assert result["intent"] == "unknown"
        assert len(result["response"]) > 0
    
    def test_process_empty_message(self, chatbot_service):
        """Test processing an empty message."""
        result = chatbot_service.process_message("")
        assert result["intent"] == "empty_message"
        assert "didn't receive" in result["response"].lower()
    
    def test_case_insensitive_matching(self, chatbot_service):
        """Test case-insensitive intent matching."""
        result1 = chatbot_service.process_message("HELLO")
        result2 = chatbot_service.process_message("hello")
        assert result1["intent"] == result2["intent"]
    
    def test_conversation_history(self, chatbot_service):
        """Test conversation history tracking."""
        chatbot_service.process_message("hello")
        chatbot_service.process_message("thank you")
        
        history = chatbot_service.get_conversation_history()
        assert len(history) == 2
        assert history[0]["user"] == "hello"
        assert history[1]["user"] == "thank you"
    
    def test_clear_history(self, chatbot_service):
        """Test clearing conversation history."""
        chatbot_service.process_message("hello")
        chatbot_service.clear_history()
        
        history = chatbot_service.get_conversation_history()
        assert len(history) == 0
    
    def test_consecutive_unknown_messages(self, chatbot_service):
        """Test handling of consecutive unknown messages."""
        for _ in range(5):
            result = chatbot_service.process_message("xyzabc123")
        
        # Should still return a response
        assert len(result["response"]) > 0
    
    def test_normalize_message(self, chatbot_service):
        """Test message normalization."""
        normalized = chatbot_service._normalize_message("  Hello!!!  ")
        assert normalized == "hello"
    
    def test_similarity_calculation(self, chatbot_service):
        """Test similarity score calculation."""
        # Exact match
        score1 = chatbot_service._calculate_similarity("hello", "hello")
        assert score1 == 1.0
        
        # Partial match
        score2 = chatbot_service._calculate_similarity("hello there", "hello")
        assert score2 > 0.5
        
        # No match
        score3 = chatbot_service._calculate_similarity("xyz", "abc")
        assert score3 < 0.5


# ============================================================================
# API Endpoint Tests
# ============================================================================

class TestChatAPI:
    """Tests for chat API endpoints."""
    
    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["data_loaded"] is True
    
    def test_chat_endpoint(self, client):
        """Test chat endpoint with valid message."""
        response = client.post(
            "/api/chat",
            json={"message": "hello"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "intent" in data
        assert "confidence" in data
        assert data["intent"] == "greeting"
    
    def test_chat_endpoint_with_session(self, client):
        """Test chat endpoint with session ID."""
        response = client.post(
            "/api/chat",
            json={
                "message": "hello",
                "session_id": "test_session"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
    
    def test_chat_endpoint_empty_message(self, client):
        """Test chat endpoint with empty message."""
        response = client.post(
            "/api/chat",
            json={"message": ""}
        )
        assert response.status_code == 422  # Validation error
    
    def test_chat_endpoint_missing_message(self, client):
        """Test chat endpoint without message field."""
        response = client.post(
            "/api/chat",
            json={}
        )
        assert response.status_code == 422  # Validation error
    
    def test_get_history_endpoint(self, client):
        """Test get history endpoint."""
        # Send a message first
        client.post("/api/chat", json={"message": "hello"})
        
        # Get history
        response = client.get("/api/chat/history")
        assert response.status_code == 200
        data = response.json()
        assert "turns" in data
        assert "total_turns" in data
        assert data["total_turns"] > 0
    
    def test_clear_history_endpoint(self, client):
        """Test clear history endpoint."""
        # Send a message first
        client.post("/api/chat", json={"message": "hello"})
        
        # Clear history
        response = client.delete("/api/chat/history")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify history is cleared
        response = client.get("/api/chat/history")
        data = response.json()
        assert data["total_turns"] == 0
    
    def test_bot_info_endpoint(self, client):
        """Test bot info endpoint."""
        response = client.get("/api/bot/info")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "capabilities" in data
        assert isinstance(data["capabilities"], list)
    
    def test_reload_data_endpoint(self, client):
        """Test reload data endpoint."""
        response = client.post("/api/reload-data")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "intents_loaded" in data


# ============================================================================
# Integration Tests
# ============================================================================

class TestIntegration:
    """Integration tests for end-to-end workflows."""
    
    def test_complete_conversation_flow(self, client):
        """Test a complete conversation flow."""
        # Greeting
        response1 = client.post("/api/chat", json={"message": "hello"})
        assert response1.status_code == 200
        
        # Help request
        response2 = client.post("/api/chat", json={"message": "what can you do"})
        assert response2.status_code == 200
        
        # Thanks
        response3 = client.post("/api/chat", json={"message": "thank you"})
        assert response3.status_code == 200
        
        # Farewell
        response4 = client.post("/api/chat", json={"message": "goodbye"})
        assert response4.status_code == 200
        
        # Check history
        history = client.get("/api/chat/history")
        data = history.json()
        assert data["total_turns"] == 4
    
    def test_multiple_sessions(self, client):
        """Test multiple independent sessions."""
        # Session 1
        client.post(
            "/api/chat",
            json={"message": "hello", "session_id": "session1"}
        )
        
        # Session 2
        client.post(
            "/api/chat",
            json={"message": "hi there", "session_id": "session2"}
        )
        
        # Check history for session 1
        response1 = client.get("/api/chat/history?session_id=session1")
        data1 = response1.json()
        assert data1["total_turns"] == 1
        
        # Check history for session 2
        response2 = client.get("/api/chat/history?session_id=session2")
        data2 = response2.json()
        assert data2["total_turns"] == 1


# ============================================================================
# Run tests
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])