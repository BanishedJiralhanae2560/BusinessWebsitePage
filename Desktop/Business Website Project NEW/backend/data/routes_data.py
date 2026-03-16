from __future__ import annotations

ROUTES: dict[str, dict] = {
    "/": {
        "page":       "home",
        "title":      "Home",
        "breadcrumb": [{"label": "Home", "href": "/"}],
        "nav_active": "home",
    },
    "/products": {
        "page":       "catalog",
        "title":      "All Products",
        "breadcrumb": [
            {"label": "Home",     "href": "/"},
            {"label": "Products", "href": "/products"},
        ],
        "nav_active": "products",
    },
    "/about": {
        "page":       "about",
        "title":      "About Us",
        "breadcrumb": [
            {"label": "Home",  "href": "/"},
            {"label": "About", "href": "/about"},
        ],
        "nav_active": "about",
    },
    "/contact": {
        "page":       "contact",
        "title":      "Contact",
        "breadcrumb": [
            {"label": "Home",    "href": "/"},
            {"label": "Contact", "href": "/contact"},
        ],
        "nav_active": "contact",
    },
    "/pricing": {
        "page":       "pricing",
        "title":      "Pricing",
        "breadcrumb": [
            {"label": "Home",    "href": "/"},
            {"label": "Pricing", "href": "/pricing"},
        ],
        "nav_active": "pricing",
    },
    "/blog": {
        "page":       "blog",
        "title":      "Blog",
        "breadcrumb": [
            {"label": "Home", "href": "/"},
            {"label": "Blog", "href": "/blog"},
        ],
        "nav_active": "blog",
    },
}