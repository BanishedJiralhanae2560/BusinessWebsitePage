from __future__ import annotations

from flask import Blueprint, jsonify, request
from data.translations_data import SUPPORTED_LANGUAGES, TRANSLATIONS, DEFAULT_LANG

translations_bp = Blueprint("translations", __name__)


@translations_bp.route("/api/languages", methods=["GET"])
def list_languages():
    """
    Return all supported languages for the language dropdown in Header.tsx.
    """
    languages = [
        {"code": code, "label": label}
        for code, label in SUPPORTED_LANGUAGES.items()
    ]
    return jsonify({"languages": languages, "default": DEFAULT_LANG})


@translations_bp.route("/api/translations/<lang_code>", methods=["GET"])
def get_translations(lang_code: str):
    """
    Return the full translation map for a given language code.

    Path param:
        lang_code (str): e.g. "en", "es", "fr"

    Query param:
        keys (str, optional): comma-separated list of specific keys to return.
    """
    lang_code = lang_code.lower().strip()

    if lang_code not in TRANSLATIONS:
        return jsonify({
            "error": f"Language '{lang_code}' is not supported.",
            "supported": list(SUPPORTED_LANGUAGES.keys()),
        }), 404

    trans = TRANSLATIONS[lang_code]

    keys_param = request.args.get("keys", "").strip()
    if keys_param:
        requested_keys = [k.strip() for k in keys_param.split(",") if k.strip()]
        trans = {k: trans[k] for k in requested_keys if k in trans}

    return jsonify({"lang": lang_code, "translations": trans})


@translations_bp.route("/api/translations/<lang_code>/<path:key>", methods=["GET"])
def get_single_translation(lang_code: str, key: str):
    """
    Return a single translation string by language and key.
    Falls back to English if the key is missing in the requested language.
    """
    lang_code = lang_code.lower().strip()

    if lang_code not in TRANSLATIONS:
        return jsonify({"error": f"Language '{lang_code}' not supported."}), 404

    value = TRANSLATIONS[lang_code].get(key)
    if value is None:
        value = TRANSLATIONS[DEFAULT_LANG].get(key)
        if value is None:
            return jsonify({"error": f"Key '{key}' not found."}), 404
        return jsonify({"lang": DEFAULT_LANG, "key": key, "value": value, "fallback": True})

    return jsonify({"lang": lang_code, "key": key, "value": value})