from __future__ import annotations

from flask import Blueprint, jsonify, request
from data.products_data import (
    PRODUCTS,
    product_by_id,
    product_by_slug,
    build_product_breadcrumb,
)

products_bp = Blueprint("products", __name__)


@products_bp.route("/api/products", methods=["GET"])
def list_products():
    """
    Return all products (or a filtered subset) for the catalog page.

    Query params:
        category  (str, optional):  filter by category name
        in_stock  (bool, optional): "true" returns in-stock only
        sort      (str, optional):  "price-asc" | "price-desc" | "name"
    """
    products = list(PRODUCTS)

    category = request.args.get("category")
    if category:
        products = [p for p in products if p["category"].lower() == category.lower()]

    in_stock_param = request.args.get("in_stock", "").lower()
    if in_stock_param == "true":
        products = [p for p in products if p["in_stock"]]

    sort_param = request.args.get("sort", "")
    if sort_param == "price-asc":
        products.sort(key=lambda p: p["price"])
    elif sort_param == "price-desc":
        products.sort(key=lambda p: p["price"], reverse=True)
    elif sort_param == "name":
        products.sort(key=lambda p: p["name"].lower())

    return jsonify({"products": products, "total": len(products)})


@products_bp.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id: int):
    """
    Return lightweight navigation metadata for a single product.
    """
    product = product_by_id(product_id)
    if product is None:
        return jsonify({"error": f"Product {product_id} not found."}), 404

    return jsonify({
        **product,
        "breadcrumb": build_product_breadcrumb(product),
        "page_title":  product["name"],
        "nav_active":  "products",
    })


@products_bp.route("/api/products/slug/<slug>", methods=["GET"])
def get_product_by_slug(slug: str):
    """
    Resolve a product by its URL slug (used for SEO-friendly URLs).
    """
    product = product_by_slug(slug)
    if product is None:
        return jsonify({"error": f"No product with slug '{slug}'."}), 404

    return jsonify({
        **product,
        "breadcrumb": build_product_breadcrumb(product),
        "page_title":  product["name"],
        "nav_active":  "products",
    })


@products_bp.route("/api/categories", methods=["GET"])
def list_categories():
    """
    Return a deduplicated list of all product categories.
    """
    cats = sorted({p["category"] for p in PRODUCTS})
    return jsonify({"categories": ["All", *cats]})