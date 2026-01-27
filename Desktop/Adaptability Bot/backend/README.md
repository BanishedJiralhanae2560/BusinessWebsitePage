# Adaptive Chatbot Backend

A flexible, customizable chatbot backend built with FastAPI and Python. Features include intent-based conversation handling, configurable personality and behavior, and session-aware context management.

## 🚀 Features

- **Intent-Based Recognition**: Pattern matching with fuzzy logic
- **Customizable Knowledge Base**: Easy-to-edit JSON files
- **Configurable Behavior**: Personality, tone, and response rules
- **Session Management**: Per-user conversation history and context
- **RESTful API**: Clean, documented endpoints
- **Type Safety**: Pydantic models for validation
- **Test Coverage**: Comprehensive unit and integration tests
- **Hot Reload**: Development-friendly data reloading

## 📁 Project Structure

```
backend/
├── data/                           # Data files
│   ├── chatbot_knowledge.json     # Intents, patterns, responses
│   └── chatbot_config.json        # Bot behavior and settings
├── app/
│   ├── __init__.py
│   ├── main.py                    # Application entry point
│   ├── routes/
│   │   ├── __init__.py
│   │   └── chat.py                # API endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_loader.py         # JSON data management
│   │   └── chatbot_service.py     # Core chatbot logic
│   └── models/
│       ├── __init__.py
│       └── schemas.py             # Pydantic models
├── tests/
│   ├── __init__.py
│   └── test_chatbot.py            # Test suite
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## 🛠️ Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Setup Steps

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   ```bash
   # On macOS/Linux
   source venv/bin/activate
   
   # On Windows
   venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

6. **Verify data files exist**
   ```bash
   ls data/
   # Should see: chatbot_knowledge.json and chatbot_config.json
   ```

## 🚀 Running the Application

### Development Mode

```bash
# Method 1: Using the main script
python -m app.main

# Method 2: Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Available Endpoints

#### Chat Endpoints

**POST `/api/chat`** - Send a message to the chatbot
```json
Request:
{
  "message": "Hello!",
  "user_id": "user_123",
  "session_id": "session_abc"
}

Response:
{
  "response": "Hi there! How can I help you?",
  "intent": "greeting",
  "confidence": 0.95,
  "bot_name": "AdaptBot",
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

**GET `/api/chat/history?session_id=default`** - Get conversation history
```json
Response:
{
  "session_id": "default",
  "turns": [
    {
      "user": "Hello",
      "bot": "Hi there!",
      "intent": "greeting"
    }
  ],
  "total_turns": 1
}
```

**DELETE `/api/chat/history?session_id=default`** - Clear conversation history

#### Bot Information

**GET `/api/bot/info`** - Get bot information
```json
Response:
{
  "name": "AdaptBot",
  "version": "1.0.0",
  "description": "An adaptive chatbot",
  "personality": {
    "tone": "friendly",
    "formality": "casual"
  },
  "capabilities": ["greeting", "farewell", "help", "thanks"]
}
```

#### Health & Utility

**GET `/api/health`** - Health check endpoint
**POST `/api/reload-data`** - Reload JSON files (development)

## 🧪 Testing

### Run All Tests
```bash
pytest
```

### Run with Coverage
```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html  # View coverage report
```

### Run Specific Tests
```bash
# Test a specific class
pytest tests/test_chatbot.py::TestChatAPI -v

# Test with detailed output
pytest -v -s

# Test and stop on first failure
pytest -x
```

## 🔧 Customization

### Adding New Intents

Edit `data/chatbot_knowledge.json`:

```json
{
  "intents": {
    "your_new_intent": {
      "patterns": [
        "keyword1",
        "keyword2",
        "phrase to match"
      ],
      "responses": [
        "Response option 1",
        "Response option 2",
        "Response option 3"
      ]
    }
  }
}
```

### Adjusting Bot Behavior

Edit `data/chatbot_config.json`:

```json
{
  "personality": {
    "tone": "friendly",        // friendly, professional, casual
    "formality": "casual",     // formal, casual, neutral
    "empathy_level": "high"    // low, medium, high
  },
  "matching_config": {
    "similarity_threshold": 0.6,  // 0.0 - 1.0
    "fuzzy_matching": true
  }
}
```

### Hot Reload (Development)

The backend supports hot-reloading of data files:

```bash
# Make changes to JSON files
# Then reload without restarting the server
curl -X POST http://localhost:8000/api/reload-data
```

## 🔐 Environment Variables

Key environment variables (see `.env.example` for all options):

```bash
# Application
APP_ENV=development
DEBUG=true
PORT=8000

# CORS (for React Native)
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19000

# Logging
LOG_LEVEL=INFO

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

## 📊 Logging

Logs are output to the console with the following format:
```
2024-01-01 12:00:00 - app.services.chatbot_service - INFO - Processed message: 'hello' -> Intent: greeting (confidence: 0.95)
```

Adjust log level in `.env`:
```bash
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

## 🐛 Troubleshooting

### Common Issues

**1. Module not found error**
```bash
# Make sure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt
```

**2. Port already in use**
```bash
# Change port in command
uvicorn app.main:app --reload --port 8001
```

**3. Data files not found**
```bash
# Check data directory exists
ls data/

# Verify JSON files are valid
python -m json.tool data/chatbot_knowledge.json
python -m json.tool data/chatbot_config.json
```

**4. CORS errors from frontend**
```bash
# Add your frontend URL to .env
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.x:8081
```

## 🚀 Deployment

### Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t chatbot-backend .
docker run -p 8000:8000 chatbot-backend
```

### Production Checklist

- [ ] Set `DEBUG=false` in `.env`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure specific `ALLOWED_ORIGINS`
- [ ] Set up Redis for session persistence
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging service
- [ ] Use HTTPS
- [ ] Configure firewall rules
- [ ] Set up automated backups for data files

## 🤝 Contributing

1. Make changes to the code
2. Write/update tests
3. Run tests: `pytest`
4. Format code: `black app/`
5. Lint code: `flake8 app/`
6. Type check: `mypy app/`

## 📝 License

[Your License Here]

## 👤 Author

[Your Name]

## 🔗 Related

- Frontend (React Native): `../mobile/`
- API Documentation: http://localhost:8000/docs

---

**Need help?** Check the API documentation at `/docs` or review the test file for usage examples.