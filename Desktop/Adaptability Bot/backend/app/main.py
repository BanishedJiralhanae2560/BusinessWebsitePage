"""
FastAPI application entry point for the adaptive chatbot backend.
Universal profile system - automatically discovers all knowledge files.
"""

import sys
from pathlib import Path

# Add backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from contextlib import asynccontextmanager
import uvicorn
import logging
from datetime import datetime
from dotenv import load_dotenv
import os
import json
from typing import List, Dict, Optional  # ← This line should be here

from app.routes import chat
from app.services.data_loader import DataLoader
from app.services.profile_watcher import ProfileWatcher
# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ProfileManager:
    """Manages dynamic discovery and loading of chatbot profiles."""
    
    def __init__(self, knowledge_dir: str = "data"):
        self.knowledge_dir = Path(knowledge_dir)
        self.config_file = os.getenv('CONFIG_FILE', 'chatbot_config.json')
        self._profile_cache = {}
        self._last_scan_time = None
        
    def discover_profiles(self, force_refresh: bool = False) -> List[Dict]:
        """
        Automatically discover all JSON knowledge files in the data directory.
        Returns list of profile metadata.
        
        Args:
            force_refresh: If True, bypass cache and rescan filesystem
        """
        # Use cache if available and not forcing refresh
        current_time = datetime.now()
        if (not force_refresh and self._profile_cache and self._last_scan_time and 
            (current_time - self._last_scan_time).seconds < 5):  # Cache for 5 seconds
            return self._profile_cache.get('profiles', [])
        
        profiles = []
        
        if not self.knowledge_dir.exists():
            logger.warning(f"Knowledge directory {self.knowledge_dir} does not exist")
            self._profile_cache = {'profiles': profiles}
            self._last_scan_time = current_time
            return profiles
        
        # Find all .json files in the knowledge directory
        json_files = list(self.knowledge_dir.glob("*.json"))
        
        for json_file in json_files:
            # Skip config files
            if json_file.name == self.config_file:
                continue
                
            try:
                # Try to load and extract metadata from the file
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Extract profile info from the knowledge file itself
                profile = {
                    "id": json_file.stem,  # filename without extension
                    "name": data.get("bot_name", json_file.stem.replace("_", " ").title()),
                    "description": data.get("description", f"Chatbot profile from {json_file.name}"),
                    "file": json_file.name,
                    "theme": data.get("theme", self._generate_theme(json_file.stem)),
                    "intents_count": len(data.get("intents", [])),
                    "last_modified": datetime.fromtimestamp(json_file.stat().st_mtime).isoformat(),
                    "file_size": json_file.stat().st_size,
                    "exists": True  # File exists on disk
                }
                
                profiles.append(profile)
                logger.info(f"Discovered profile: {profile['name']} ({json_file.name})")
                
            except json.JSONDecodeError:
                logger.warning(f"Skipping invalid JSON file: {json_file.name}")
            except Exception as e:
                logger.warning(f"Error reading {json_file.name}: {e}")
        
        # Sort by name
        profiles.sort(key=lambda x: x['name'])
        
        # Update cache
        self._profile_cache = {'profiles': profiles}
        self._last_scan_time = current_time
        
        return profiles
    
    def _generate_theme(self, file_stem: str) -> Dict:
        """Generate a theme based on filename hash for consistency."""
        # Simple hash-based color generation
        hash_val = hash(file_stem) % 360
        
        themes = [
            {"primary": "#667eea", "secondary": "#764ba2", "avatar": "🤖"},
            {"primary": "#3b82f6", "secondary": "#1e40af", "avatar": "💻"},
            {"primary": "#10b981", "secondary": "#059669", "avatar": "✨"},
            {"primary": "#f59e0b", "secondary": "#d97706", "avatar": "🌟"},
            {"primary": "#ef4444", "secondary": "#dc2626", "avatar": "🔥"},
            {"primary": "#8b5cf6", "secondary": "#7c3aed", "avatar": "🚀"},
        ]
        
        return themes[hash_val % len(themes)]
    
    def profile_exists(self, filename: str) -> bool:
        """Check if a profile file exists."""
        knowledge_path = self.knowledge_dir / filename
        return knowledge_path.exists()
    
    def get_profile_info(self, filename: str) -> Optional[Dict]:
        """Get information about a specific profile without loading it."""
        knowledge_path = self.knowledge_dir / filename
        
        if not knowledge_path.exists():
            return None
        
        try:
            with open(knowledge_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return {
                "id": knowledge_path.stem,
                "name": data.get("bot_name", knowledge_path.stem.replace("_", " ").title()),
                "description": data.get("description", ""),
                "file": filename,
                "theme": data.get("theme", {}),
                "exists": True
            }
        except Exception as e:
            logger.error(f"Error reading profile {filename}: {e}")
            return None

    def load_profile(self, filename: str) -> DataLoader:
        """Load a specific profile by filename."""
        knowledge_path = self.knowledge_dir / filename
        
        if not knowledge_path.exists():
            raise FileNotFoundError(f"Knowledge file not found: {filename}")
        
        return DataLoader(knowledge_file=filename, config_file=self.config_file)


# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    # Startup
    logger.info("Starting up chatbot application...")
    try:
        # Initialize profile manager
        knowledge_dir = os.getenv('KNOWLEDGE_DIR', 'data')
        profile_manager = ProfileManager(knowledge_dir=knowledge_dir)
        app.state.profile_manager = profile_manager
        
        # Discover all available profiles
        profiles = profile_manager.discover_profiles()
        logger.info(f"✓ Discovered {len(profiles)} profile(s)")
        
        # Load default profile (from env or first available)
        default_file = os.getenv('DEFAULT_KNOWLEDGE_FILE')
        
        if default_file:
            logger.info(f"Loading specified default: {default_file}")
            data_loader = profile_manager.load_profile(default_file)
        elif profiles:
            # Load first discovered profile as default
            default_file = profiles[0]['file']
            logger.info(f"Loading first available profile: {default_file}")
            data_loader = profile_manager.load_profile(default_file)
        else:
            raise FileNotFoundError("No knowledge files found in data directory")
        
        data_loader.load_data()
        
        # Store in app state
        app.state.data_loader = data_loader
        app.state.current_knowledge_file = default_file
        
        # Initialize and start profile watcher
        profile_watcher = ProfileWatcher(data_dir=knowledge_dir, check_interval=3.0)
        
        # Register callbacks for file changes
        def on_profile_deleted(filename: str):
            """Handle when a profile is deleted."""
            logger.warning(f"Profile deleted: {filename}")
            # If current profile was deleted, switch to first available
            if filename == app.state.current_knowledge_file:
                logger.warning(f"Current profile {filename} was deleted, switching to fallback")
                remaining_profiles = profile_manager.discover_profiles(force_refresh=True)
                if remaining_profiles:
                    fallback_file = remaining_profiles[0]['file']
                    try:
                        new_loader = profile_manager.load_profile(fallback_file)
                        new_loader.load_data()
                        app.state.data_loader = new_loader
                        app.state.current_knowledge_file = fallback_file
                        logger.info(f"Switched to fallback profile: {fallback_file}")
                    except Exception as e:
                        logger.error(f"Failed to switch to fallback: {e}")
        
        def on_profile_added(filename: str):
            """Handle when a new profile is added."""
            logger.info(f"New profile added: {filename}")
            # Force refresh cache
            profile_manager.discover_profiles(force_refresh=True)
        
        def on_profile_modified(filename: str):
            """Handle when a profile is modified."""
            logger.info(f"Profile modified: {filename}")
            # If it's the current profile, reload it
            if filename == app.state.current_knowledge_file:
                try:
                    logger.info(f"Reloading modified current profile: {filename}")
                    new_loader = profile_manager.load_profile(filename)
                    new_loader.load_data()
                    app.state.data_loader = new_loader
                    # Clear chatbot sessions to use new data
                    from app.routes.chat import chatbot_sessions
                    chatbot_sessions.clear()
                except Exception as e:
                    logger.error(f"Failed to reload modified profile: {e}")
        
        profile_watcher.on_file_deleted(on_profile_deleted)
        profile_watcher.on_file_added(on_profile_added)
        profile_watcher.on_file_modified(on_profile_modified)
        
        profile_watcher.start()
        app.state.profile_watcher = profile_watcher
        
        logger.info(f"✓ Bot name: {data_loader.get_bot_name()}")
        logger.info(f"✓ Loaded {len(data_loader.get_all_intents())} intents")
        logger.info("✓ Profile watcher started")
        
    except Exception as e:
        logger.error(f"✗ Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down chatbot application...")
    
    # Stop profile watcher
    if hasattr(app.state, 'profile_watcher'):
        app.state.profile_watcher.stop()
        logger.info("✓ Profile watcher stopped")


# Initialize FastAPI app
app = FastAPI(
    title="Adaptive Chatbot API",
    description="Backend API for an adaptive chatbot with dynamic profile discovery",
    version="2.0.0",
    lifespan=lifespan
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:19000",
        "http://localhost:19006",
        "exp://localhost:8081",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Adaptive Chatbot API - Universal Profile System",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "chatbot-backend"
    }


# Get available chatbot profiles (DYNAMIC)
@app.get("/api/profiles")
async def get_profiles(request: Request, refresh: bool = False):
    """
    Dynamically discover and return all available chatbot profiles.
    No hardcoding needed - scans the data directory for JSON files.
    
    Args:
        refresh: If True, force rescan of filesystem (bypass cache)
    """
    try:
        profile_manager = request.app.state.profile_manager
        profiles = profile_manager.discover_profiles(force_refresh=refresh)
        
        return {
            "profiles": profiles,
            "count": len(profiles),
            "current": request.app.state.current_knowledge_file,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error discovering profiles: {e}", exc_info=True)
        return {"profiles": [], "count": 0, "error": str(e)}


# Get current profile info
@app.get("/api/profile/current")
async def get_current_profile(request: Request):
    """Get information about the currently active profile."""
    try:
        data_loader = request.app.state.data_loader
        current_file = request.app.state.current_knowledge_file
        
        return {
            "file": current_file,
            "bot_name": data_loader.get_bot_name(),
            "intents_count": len(data_loader.get_all_intents()),
            "fallback_response": data_loader.config.get("fallback_response", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Switch chatbot profile (SIMPLIFIED)
@app.post("/api/switch-profile")
async def switch_profile(request: Request, profile_data: dict):
    """
    Switch to any available chatbot profile by filename.
    
    Args:
        profile_data: {"file": "your_knowledge_file.json"}
    """
    try:
        filename = profile_data.get("file")
        if not filename:
            raise HTTPException(status_code=400, detail="Missing 'file' parameter")
        
        # Check if file exists first
        profile_manager = request.app.state.profile_manager
        if not profile_manager.profile_exists(filename):
            raise HTTPException(
                status_code=404, 
                detail=f"Profile file '{filename}' not found. It may have been deleted."
            )
        
        logger.info(f"Switching to profile: {filename}")
        
        # Load new profile using profile manager
        new_data_loader = profile_manager.load_profile(filename)
        new_data_loader.load_data()
        
        # Update app state
        request.app.state.data_loader = new_data_loader
        request.app.state.current_knowledge_file = filename
        
        # Clear all existing chatbot sessions
        from app.routes.chat import chatbot_sessions
        chatbot_sessions.clear()
        
        logger.info(f"✓ Switched to {filename} successfully")
        
        return {
            "success": True,
            "message": f"Switched to profile: {filename}",
            "bot_name": new_data_loader.get_bot_name(),
            "intents_loaded": len(new_data_loader.get_all_intents())
        }
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Error switching profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to switch profile: {str(e)}")


# Reload current profile (useful for development)
@app.post("/api/profile/reload")
async def reload_profile(request: Request):
    """Reload the current profile to pick up changes."""
    try:
        current_file = request.app.state.current_knowledge_file
        profile_manager = request.app.state.profile_manager
        
        # Check if current file still exists
        if not profile_manager.profile_exists(current_file):
            raise HTTPException(
                status_code=404,
                detail=f"Current profile '{current_file}' no longer exists. Please switch to another profile."
            )
        
        # Reload the current profile
        new_data_loader = profile_manager.load_profile(current_file)
        new_data_loader.load_data()
        
        request.app.state.data_loader = new_data_loader
        
        # Clear chatbot sessions
        from app.routes.chat import chatbot_sessions
        chatbot_sessions.clear()
        
        logger.info(f"✓ Reloaded {current_file}")
        
        return {
            "success": True,
            "message": f"Reloaded profile: {current_file}",
            "intents_loaded": len(new_data_loader.get_all_intents())
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Check if current profile still exists
@app.get("/api/profile/status")
async def check_profile_status(request: Request):
    """Check if the current profile file still exists."""
    try:
        current_file = request.app.state.current_knowledge_file
        profile_manager = request.app.state.profile_manager
        
        exists = profile_manager.profile_exists(current_file)
        
        if not exists:
            # Get available profiles as fallback options
            available_profiles = profile_manager.discover_profiles(force_refresh=True)
            
            return {
                "exists": False,
                "current_file": current_file,
                "message": f"Profile '{current_file}' has been deleted",
                "available_profiles": available_profiles,
                "action_required": True
            }
        
        # Get profile info
        profile_info = profile_manager.get_profile_info(current_file)
        
        return {
            "exists": True,
            "current_file": current_file,
            "profile": profile_info,
            "action_required": False
        }
        
    except Exception as e:
        logger.error(f"Error checking profile status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    return JSONResponse(
        status_code=422,
        content={
            "error": "ValidationError",
            "message": "Invalid request data",
            "detail": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPException",
            "message": str(exc.detail),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": exc.__class__.__name__,
            "message": "An internal server error occurred",
            "detail": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Run the application
if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )