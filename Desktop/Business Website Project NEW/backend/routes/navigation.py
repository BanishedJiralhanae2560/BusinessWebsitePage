from __future__ import annotations

from flask import Blueprint, jsonify, request, abort
from data.routes_data import ROUTES

navigation_bp = Blueprint("navigation", __name__)


@navigation_bp.route("/api/route", methods=["GET"])
def resolve_route():
    """
    Resolve page metadata for any static path.

    Query param:
        path (str): The URL path to look up, e.g. /products

    Returns:
        200  page metadata dict
        404  {"error": "Route not found"}
    """
    path = request.args.get("path", "").strip()
    if not path:
        abort(400, description="Missing 'path' query parameter.")

    route = ROUTES.get(path)
    if route is None:
        return jsonify({"error": f"Route '{path}' not found."}), 404

    return jsonify({"path": path, **route})


@navigation_bp.route("/api/nav", methods=["GET"])
def get_nav():
    """
    Return the full navigation menu structure used by the frontend.

    Query param:
        active (str, optional): The nav_active key for the current page.
    """
    active = request.args.get("active", None)

    nav_items = [
        {"key": "home",     "label": "Home",     "href": "/"},
        {"key": "service",  "label": "Service",  "href": "/service", "has_dropdown": True},
        {
            "key": "products",
            "label": "Products",
            "href": "/products",
            "has_dropdown": True,
            "dropdown": [
                {"label": "Circuit Boards",          "href": "/products?category=Circuit+Boards",           "description": "Custom PCBs for your projects"},
                {"label": "Microchips & Processors", "href": "/products?category=Microchips+%26+Processors","description": "High-performance computing chips"},
                {"label": "Sensors & Components",    "href": "/products?category=Sensors+%26+Components",   "description": "Essential electronic components"},
                {"label": "Development Kits",        "href": "/products?category=Development+Kits",         "description": "Complete starter kits for makers"},
                {"label": "Custom Solutions",        "href": "/products?category=Custom+Solutions",         "description": "Tailored hardware for your needs"},
                {"label": "Bulk Orders",             "href": "/products?category=Bulk+Orders",              "description": "Wholesale pricing available"},
                {"label": "View All Products",       "href": "/products",                                   "is_cta": True},
            ],
        },
        {"key": "pricing", "label": "Pricing",  "href": "/pricing"},
        {"key": "blog",    "label": "Blog",      "href": "/blog"},
        {"key": "about",   "label": "About Us",  "href": "/about"},
        {"key": "contact", "label": "Contact Us","href": "/contact"},
    ]

    return jsonify({"items": nav_items, "active": active})


@navigation_bp.route("/api/breadcrumb", methods=["GET"])
def get_breadcrumb():
    """
    Return breadcrumb trail for any path, including dynamic product pages.

    Query params:
        path       (str): e.g. /products  or  /products/4
        product_id (int, optional): used when path is a product detail page.
    """
    from data.products_data import product_by_id, build_product_breadcrumb

    path = request.args.get("path", "").strip()

    if path in ROUTES:
        return jsonify({"breadcrumb": ROUTES[path]["breadcrumb"]})

    pid_str = request.args.get("product_id")
    if pid_str:
        try:
            pid = int(pid_str)
        except ValueError:
            abort(400, description="product_id must be an integer.")

        product = product_by_id(pid)
        if product is None:
            return jsonify({"error": f"Product with id {pid} not found."}), 404

        return jsonify({"breadcrumb": build_product_breadcrumb(product)})

    return jsonify({"error": f"No breadcrumb defined for path '{path}'."}), 404