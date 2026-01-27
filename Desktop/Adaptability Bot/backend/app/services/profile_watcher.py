"""
Profile File Watcher - Monitors data directory for changes
Detects when JSON files are added, modified, or deleted
"""

import os
import time
import logging
from pathlib import Path
from typing import Dict, Set, Callable
from threading import Thread
from datetime import datetime

logger = logging.getLogger(__name__)


class ProfileWatcher:
    """
    Watches the data directory for changes to profile files.
    Triggers callbacks when files are added, modified, or deleted.
    """
    
    def __init__(self, data_dir: str = "data", check_interval: float = 2.0):
        """
        Initialize the profile watcher.
        
        Args:
            data_dir: Directory to watch
            check_interval: How often to check for changes (seconds)
        """
        self.data_dir = Path(data_dir)
        self.check_interval = check_interval
        self.is_running = False
        self.watch_thread = None
        
        # Track file states
        self._file_states: Dict[str, float] = {}  # filename -> last_modified_time
        self._callbacks = {
            'added': [],
            'modified': [],
            'deleted': []
        }
        
        # Initialize current state
        self._scan_directory()
    
    def _scan_directory(self) -> Dict[str, float]:
        """Scan directory and return current file states."""
        current_states = {}
        
        if not self.data_dir.exists():
            return current_states
        
        for file_path in self.data_dir.glob("*.json"):
            try:
                # Get last modified time
                mtime = file_path.stat().st_mtime
                current_states[file_path.name] = mtime
            except Exception as e:
                logger.error(f"Error scanning {file_path.name}: {e}")
        
        return current_states
    
    def on_file_added(self, callback: Callable[[str], None]):
        """Register callback for when files are added."""
        self._callbacks['added'].append(callback)
    
    def on_file_modified(self, callback: Callable[[str], None]):
        """Register callback for when files are modified."""
        self._callbacks['modified'].append(callback)
    
    def on_file_deleted(self, callback: Callable[[str], None]):
        """Register callback for when files are deleted."""
        self._callbacks['deleted'].append(callback)
    
    def _trigger_callbacks(self, event_type: str, filename: str):
        """Trigger all callbacks for an event type."""
        for callback in self._callbacks.get(event_type, []):
            try:
                callback(filename)
            except Exception as e:
                logger.error(f"Error in {event_type} callback for {filename}: {e}")
    
    def _check_for_changes(self):
        """Check for file changes and trigger appropriate callbacks."""
        current_states = self._scan_directory()
        
        # Check for new files
        for filename in current_states:
            if filename not in self._file_states:
                logger.info(f"New profile detected: {filename}")
                self._trigger_callbacks('added', filename)
        
        # Check for deleted files
        for filename in list(self._file_states.keys()):
            if filename not in current_states:
                logger.info(f"Profile deleted: {filename}")
                self._trigger_callbacks('deleted', filename)
        
        # Check for modified files
        for filename, mtime in current_states.items():
            if filename in self._file_states:
                if mtime > self._file_states[filename]:
                    logger.info(f"Profile modified: {filename}")
                    self._trigger_callbacks('modified', filename)
        
        # Update tracked states
        self._file_states = current_states
    
    def _watch_loop(self):
        """Main watch loop (runs in background thread)."""
        logger.info(f"Profile watcher started, monitoring: {self.data_dir}")
        
        while self.is_running:
            try:
                self._check_for_changes()
                time.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"Error in watch loop: {e}")
                time.sleep(self.check_interval)
    
    def start(self):
        """Start watching for file changes."""
        if self.is_running:
            logger.warning("Profile watcher already running")
            return
        
        self.is_running = True
        self.watch_thread = Thread(target=self._watch_loop, daemon=True)
        self.watch_thread.start()
        logger.info("Profile watcher started")
    
    def stop(self):
        """Stop watching for file changes."""
        if not self.is_running:
            return
        
        self.is_running = False
        if self.watch_thread:
            self.watch_thread.join(timeout=self.check_interval * 2)
        logger.info("Profile watcher stopped")
    
    def get_current_files(self) -> Set[str]:
        """Get set of currently tracked files."""
        return set(self._file_states.keys())