"""
Data loader service for loading and managing chatbot knowledge and configuration.
"""

import json
import os
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class DataLoader:
    """Handles loading and accessing chatbot knowledge and configuration data."""
    
    def __init__(self, data_dir: Optional[str] = None, knowledge_file: Optional[str] = None, config_file: Optional[str] = None):
        """
        Initialize the DataLoader.
        
        Args:
            data_dir: Path to the data directory. Defaults to 'data' in project root.
            knowledge_file: Name of the knowledge JSON file. Defaults to env var or 'chatbot_knowledge.json'
            config_file: Name of the config JSON file. Defaults to env var or 'chatbot_config.json'
        """
        if data_dir is None:
            # Get the project root (2 levels up from this file)
            project_root = Path(__file__).parent.parent.parent
            data_dir_env = os.getenv('DATA_DIR', 'data')
            self.data_dir = project_root / data_dir_env
        else:
            self.data_dir = Path(data_dir)
        
        # Get filenames from parameters, environment variables, or defaults
        knowledge_filename = knowledge_file or os.getenv('KNOWLEDGE_FILE', 'chatbot_knowledge.json')
        config_filename = config_file or os.getenv('CONFIG_FILE', 'chatbot_config.json')
        
        self.knowledge_path = self.data_dir / knowledge_filename
        self.config_path = self.data_dir / config_filename
        
        self.knowledge: Dict[str, Any] = {}
        self.config: Dict[str, Any] = {}
        
        logger.info(f"DataLoader initialized with knowledge file: {knowledge_filename}")
        logger.info(f"DataLoader initialized with config file: {config_filename}")
        
    def load_data(self) -> None:
        """Load both knowledge and configuration files."""
        self._load_knowledge()
        self._load_config()
        logger.info("Data loaded successfully")
    
    def _load_knowledge(self) -> None:
        """Load the chatbot knowledge JSON file."""
        try:
            if not self.knowledge_path.exists():
                raise FileNotFoundError(
                    f"Knowledge file not found at {self.knowledge_path}"
                )
            
            with open(self.knowledge_path, 'r', encoding='utf-8') as f:
                self.knowledge = json.load(f)
            
            logger.info(f"Loaded knowledge from {self.knowledge_path}")
            
            # Validate structure
            if "intents" not in self.knowledge:
                raise ValueError("Knowledge file missing 'intents' key")
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in knowledge file: {e}")
            raise
        except Exception as e:
            logger.error(f"Error loading knowledge file: {e}")
            raise
    
    def _load_config(self) -> None:
        """Load the chatbot configuration JSON file."""
        try:
            if not self.config_path.exists():
                raise FileNotFoundError(
                    f"Config file not found at {self.config_path}"
                )
            
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            
            logger.info(f"Loaded config from {self.config_path}")
            
            # Validate structure
            required_keys = ["bot_info", "personality", "behavior"]
            for key in required_keys:
                if key not in self.config:
                    raise ValueError(f"Config file missing '{key}' key")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in config file: {e}")
            raise
        except Exception as e:
            logger.error(f"Error loading config file: {e}")
            raise
    
    def reload_data(self) -> None:
        """Reload both data files (useful for hot-reloading in development)."""
        logger.info("Reloading data files...")
        self.load_data()
    
    # Knowledge accessors
    def get_all_intents(self) -> Dict[str, Any]:
        """Get all intents from knowledge base."""
        return self.knowledge.get("intents", {})
    
    def get_intent(self, intent_name: str) -> Optional[Dict[str, Any]]:
        """Get a specific intent by name."""
        return self.knowledge.get("intents", {}).get(intent_name)
    
    def get_intent_patterns(self, intent_name: str) -> List[str]:
        """Get patterns for a specific intent."""
        intent = self.get_intent(intent_name)
        return intent.get("patterns", []) if intent else []
    
    def get_intent_responses(self, intent_name: str) -> List[str]:
        """Get responses for a specific intent."""
        intent = self.get_intent(intent_name)
        return intent.get("responses", []) if intent else []
    
    def get_context_data(self) -> Dict[str, Any]:
        """Get context data for conversations."""
        return self.knowledge.get("context_data", {})
    
    def get_fallback_responses(self):
        """Get fallback responses from knowledge data."""
        # Check in knowledge data first
        if hasattr(self, 'knowledge') and self.knowledge:
            fallback = self.knowledge.get('fallback_responses')
            if fallback:
                return fallback
    
        # Fall back to config
        return self.config.get('fallback_response', 
                                ["I'm not sure I understand. Could you rephrase that?"])

    def get_knowledge_base(self):
        """Get the knowledge base (topics and FAQs)."""
        if hasattr(self, 'knowledge') and self.knowledge:
            return self.knowledge.get('knowledge_base', {})
        return {}

    def get_all_intents(self):
        """Get all intents."""
        if hasattr(self, 'knowledge') and self.knowledge:
            return self.knowledge.get('intents', {})
        return {}

    # Config accessors
    def get_bot_info(self) -> Dict[str, Any]:
        """Get bot information."""
        return self.config.get("bot_info", {})
    
    def get_bot_name(self) -> str:
        """Get the bot's name."""
        return self.config.get("bot_info", {}).get("name", "ChatBot")
    
    def get_personality(self) -> Dict[str, Any]:
        """Get personality settings."""
        return self.config.get("personality", {})
    
    def get_behavior(self) -> Dict[str, Any]:
        """Get behavior settings."""
        return self.config.get("behavior", {})
    
    def get_matching_config(self) -> Dict[str, Any]:
        """Get intent matching configuration."""
        return self.config.get("matching_config", {})
    
    def get_response_rules(self) -> Dict[str, Any]:
        """Get response rules."""
        return self.config.get("response_rules", {})
    
    def get_similarity_threshold(self) -> float:
        """Get the similarity threshold for intent matching."""
        return self.config.get("matching_config", {}).get("similarity_threshold", 0.6)
    
    def get_max_response_length(self) -> int:
        """Get maximum response length."""
        return self.config.get("behavior", {}).get("max_response_length", 500)
    
    def get_context_memory_turns(self) -> int:
        """Get number of conversation turns to remember."""
        return self.config.get("behavior", {}).get("context_memory_turns", 10)
    
    def is_case_sensitive(self) -> bool:
        """Check if matching should be case-sensitive."""
        return self.config.get("matching_config", {}).get("case_sensitive", False)
    
    def is_fuzzy_matching_enabled(self) -> bool:
        """Check if fuzzy matching is enabled."""
        return self.config.get("matching_config", {}).get("fuzzy_matching", True)
    
    def get_confidence_threshold(self) -> float:
        """Get confidence threshold for responses."""
        return self.config.get("response_rules", {}).get("confidence_threshold", 0.7)
    
    # Utility methods
    def get_full_knowledge(self) -> Dict[str, Any]:
        """Get the complete knowledge dictionary."""
        return self.knowledge
    
    def get_full_config(self) -> Dict[str, Any]:
        """Get the complete configuration dictionary."""
        return self.config
    
    def __repr__(self) -> str:
        """String representation of DataLoader."""
        return (
            f"DataLoader(knowledge_path='{self.knowledge_path}', "
            f"config_path='{self.config_path}', "
            f"intents_loaded={len(self.get_all_intents())})"
        )