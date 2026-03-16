"""
app.py
======
Entry point for the Flask backend.

Run locally:
    pip install flask flask-cors
    python app.py
"""

from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from routes.navigation import navigation_bp
from routes.products import products_bp
from routes.translations import translations_bp
from errors import register_error_handlers

# ─────────────────────────────────────────────
#  App setup
# ─────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow Next.js dev server (localhost:3000) to call this API

# ─────────────────────────────────────────────
#  Register blueprints
# ─────────────────────────────────────────────
app.register_blueprint(navigation_bp)
app.register_blueprint(products_bp)
app.register_blueprint(translations_bp)

# ─────────────────────────────────────────────
#  Register error handlers
# ─────────────────────────────────────────────
register_error_handlers(app)

# ─────────────────────────────────────────────
#  Dev server entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)