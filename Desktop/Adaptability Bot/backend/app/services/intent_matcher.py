"""
Universal Intent Matcher - Works with ANY knowledge base structure
No hardcoding needed - intelligently matches user messages to intents
"""

import re
from typing import Dict, List, Tuple, Optional
import random


class UniversalIntentMatcher:
    """
    A flexible intent matching system that works with any knowledge base.
    Handles pattern matching, keyword detection, and contextual understanding.
    """
    
    def __init__(self, intents: Dict, knowledge_base: Dict, fallback_responses: List[str]):
        """
        Initialize the intent matcher.
        
        Args:
            intents: Dictionary of intents with patterns and responses
            knowledge_base: Dictionary of topics with keywords and content
            fallback_responses: List of fallback responses when no match found
        """
        self.intents = intents
        self.knowledge_base = knowledge_base
        self.fallback_responses = fallback_responses
        
        # Build a scoring system for better matching
        self._build_pattern_index()
    
    def _build_pattern_index(self):
        """Pre-process patterns for faster matching."""
        self.pattern_index = {}
        
        for intent_name, intent_data in self.intents.items():
            patterns = intent_data.get('patterns', [])
            self.pattern_index[intent_name] = {
                'patterns': patterns,
                'responses': intent_data.get('responses', []),
                'priority': self._calculate_intent_priority(intent_name, patterns)
            }
    
    def _calculate_intent_priority(self, intent_name: str, patterns: List[str]) -> int:
        """
        Calculate priority based on intent characteristics.
        Higher priority = checked first.
        """
        priority = 50  # Default priority
        
        # Specific action requests get higher priority
        action_keywords = ['solve', 'calculate', 'find', 'answer', 'show', 'help']
        if any(keyword in intent_name.lower() for keyword in action_keywords):
            priority += 30
        
        # More patterns = more specific = higher priority
        priority += min(len(patterns), 20)
        
        # Longer average pattern length = more specific = higher priority
        if patterns:
            avg_length = sum(len(p) for p in patterns) / len(patterns)
            priority += min(int(avg_length), 20)
        
        return priority
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for matching."""
        # Convert to lowercase
        text = text.lower().strip()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        return text
    
    def _pattern_matches(self, user_message: str, pattern: str) -> Tuple[bool, float]:
        """
        Check if a pattern matches the user message.
        Returns (match_found, match_score).
        """
        user_msg = self._normalize_text(user_message)
        pattern_normalized = self._normalize_text(pattern)
        
        # Exact substring match (highest score)
        if pattern_normalized in user_msg:
            # Calculate score based on pattern length relative to message
            score = len(pattern_normalized) / max(len(user_msg), 1) * 100
            return True, min(score, 100)
        
        # Word boundary match (medium-high score)
        pattern_escaped = re.escape(pattern_normalized)
        if re.search(r'\b' + pattern_escaped + r'\b', user_msg):
            score = len(pattern_normalized) / max(len(user_msg), 1) * 90
            return True, min(score, 90)
        
        # Fuzzy word match - check if all words in pattern appear in message
        pattern_words = set(pattern_normalized.split())
        message_words = set(user_msg.split())
        
        if pattern_words and pattern_words.issubset(message_words):
            # Score based on word overlap
            score = (len(pattern_words) / max(len(message_words), 1)) * 70
            return True, min(score, 70)
        
        # Partial word overlap (low score)
        overlap = pattern_words.intersection(message_words)
        if overlap and len(overlap) >= max(1, len(pattern_words) * 0.5):
            score = (len(overlap) / max(len(pattern_words), 1)) * 50
            return True, min(score, 50)
        
        return False, 0
    
    def _match_intent(self, user_message: str, intent_name: str, intent_info: Dict) -> Tuple[bool, float]:
        """
        Match user message against a single intent.
        Returns (matched, confidence_score).
        """
        patterns = intent_info['patterns']
        priority = intent_info['priority']
        
        best_score = 0
        matched = False
        
        for pattern in patterns:
            is_match, score = self._pattern_matches(user_message, pattern)
            if is_match:
                matched = True
                best_score = max(best_score, score)
        
        # Boost score based on intent priority
        if matched:
            final_score = best_score + (priority * 0.2)
            return True, min(final_score, 200)
        
        return False, 0
    
    def _match_knowledge_topic(self, user_message: str) -> Optional[Dict]:
        """
        Match user message against knowledge base topics.
        Returns the best matching topic or None.
        """
        if not self.knowledge_base or 'topics' not in self.knowledge_base:
            return None
        
        best_match = None
        best_score = 0
        user_msg = self._normalize_text(user_message)
        
        for topic_name, topic_data in self.knowledge_base['topics'].items():
            keywords = topic_data.get('keywords', [])
            score = 0
            
            for keyword in keywords:
                is_match, keyword_score = self._pattern_matches(user_message, keyword)
                if is_match:
                    score = max(score, keyword_score)
            
            if score > best_score:
                best_score = score
                best_match = {
                    'topic': topic_name,
                    'content': topic_data.get('content', ''),
                    'score': score
                }
        
        # Only return if confidence is reasonable
        return best_match if best_score > 30 else None
    
    def _match_faq(self, user_message: str) -> Optional[Dict]:
        """
        Match user message against FAQs.
        Returns the best matching FAQ or None.
        """
        if not self.knowledge_base or 'faqs' not in self.knowledge_base:
            return None
        
        best_match = None
        best_score = 0
        
        for faq in self.knowledge_base['faqs']:
            keywords = faq.get('keywords', [])
            score = 0
            
            for keyword in keywords:
                is_match, keyword_score = self._pattern_matches(user_message, keyword)
                if is_match:
                    score = max(score, keyword_score)
            
            if score > best_score:
                best_score = score
                best_match = {
                    'question': faq.get('question', ''),
                    'answer': faq.get('answer', ''),
                    'score': score
                }
        
        return best_match if best_score > 30 else None
    
    def get_response(self, user_message: str) -> str:
        """
        Main method to get a response for user message.
        Intelligently matches against intents, topics, and FAQs.
        """
        if not user_message or not user_message.strip():
            return random.choice(self.fallback_responses)
        
        # Sort intents by priority (highest first)
        sorted_intents = sorted(
            self.pattern_index.items(),
            key=lambda x: x[1]['priority'],
            reverse=True
        )
        
        # Try to match intents with scoring
        matches = []
        for intent_name, intent_info in sorted_intents:
            is_match, score = self._match_intent(user_message, intent_name, intent_info)
            if is_match:
                matches.append({
                    'type': 'intent',
                    'name': intent_name,
                    'score': score,
                    'responses': intent_info['responses']
                })
        
        # Try to match knowledge topics
        topic_match = self._match_knowledge_topic(user_message)
        if topic_match:
            matches.append({
                'type': 'topic',
                'name': topic_match['topic'],
                'score': topic_match['score'],
                'content': topic_match['content']
            })
        
        # Try to match FAQs
        faq_match = self._match_faq(user_message)
        if faq_match:
            matches.append({
                'type': 'faq',
                'name': faq_match['question'],
                'score': faq_match['score'],
                'answer': faq_match['answer']
            })
        
        # If we have matches, return the best one
        if matches:
            # Sort by score (highest first)
            matches.sort(key=lambda x: x['score'], reverse=True)
            best_match = matches[0]
            
            # Return appropriate response based on match type
            if best_match['type'] == 'intent':
                return random.choice(best_match['responses'])
            elif best_match['type'] == 'topic':
                return best_match['content']
            elif best_match['type'] == 'faq':
                return best_match['answer']
        
        # No good matches found - use fallback
        return random.choice(self.fallback_responses)
    
    def get_debug_info(self, user_message: str) -> Dict:
        """
        Get detailed matching information for debugging.
        Useful for understanding why certain responses are chosen.
        """
        debug_info = {
            'user_message': user_message,
            'normalized': self._normalize_text(user_message),
            'intent_matches': [],
            'topic_matches': [],
            'faq_matches': []
        }
        
        # Check all intents
        for intent_name, intent_info in self.pattern_index.items():
            is_match, score = self._match_intent(user_message, intent_name, intent_info)
            if is_match:
                debug_info['intent_matches'].append({
                    'intent': intent_name,
                    'score': score,
                    'priority': intent_info['priority']
                })
        
        # Check topics
        topic_match = self._match_knowledge_topic(user_message)
        if topic_match:
            debug_info['topic_matches'].append(topic_match)
        
        # Check FAQs
        faq_match = self._match_faq(user_message)
        if faq_match:
            debug_info['faq_matches'].append(faq_match)
        
        # Sort matches by score
        debug_info['intent_matches'].sort(key=lambda x: x['score'], reverse=True)
        
        return debug_info


# Example usage
if __name__ == "__main__":
    # Example knowledge base structure
    example_intents = {
        "greeting": {
            "patterns": ["hello", "hi", "hey"],
            "responses": ["Hello!", "Hi there!", "Hey!"]
        },
        "solve_request": {
            "patterns": ["solve", "find x", "what is x", "answer"],
            "responses": [
                "Let me guide you through solving this!",
                "I'll help you figure this out step by step."
            ]
        }
    }
    
    example_knowledge = {
        "topics": {
            "linear_equations": {
                "keywords": ["linear", "slope", "y=mx+b"],
                "content": "Linear equations form straight lines..."
            }
        },
        "faqs": [
            {
                "question": "How do I study?",
                "keywords": ["study", "prepare", "learn"],
                "answer": "Study by practicing daily!"
            }
        ]
    }
    
    fallbacks = ["I'm not sure about that.", "Can you rephrase?"]
    
    # Create matcher
    matcher = UniversalIntentMatcher(example_intents, example_knowledge, fallbacks)
    
    # Test messages
    test_messages = [
        "hello",
        "solve 2x + 5 = 15",
        "what is x in this equation",
        "tell me about linear equations",
        "how do I study for math"
    ]
    
    for msg in test_messages:
        print(f"\nUser: {msg}")
        response = matcher.get_response(msg)
        print(f"Bot: {response}")
        
        # Show debug info
        debug = matcher.get_debug_info(msg)
        print(f"Debug: {debug['intent_matches']}")