from __future__ import annotations

PRODUCTS: list[dict] = [
    {"id": 1,  "name": "Circuit Board Alpha",       "category": "Circuit Boards",          "slug": "circuit-board-alpha",       "price": 49.99,  "in_stock": True},
    {"id": 2,  "name": "Microchip X-Series",        "category": "Microchips & Processors", "slug": "microchip-x-series",        "price": 89.99,  "in_stock": True},
    {"id": 3,  "name": "Sensor Array Kit",          "category": "Sensors & Components",    "slug": "sensor-array-kit",          "price": 34.99,  "in_stock": True},
    {"id": 4,  "name": "Dev Kit Pro",               "category": "Development Kits",        "slug": "dev-kit-pro",               "price": 129.99, "in_stock": True},
    {"id": 5,  "name": "Bulk Resistor Pack",        "category": "Bulk Orders",             "slug": "bulk-resistor-pack",        "price": 19.99,  "in_stock": True},
    {"id": 6,  "name": "Custom PCB Module",         "category": "Custom Solutions",        "slug": "custom-pcb-module",         "price": 249.99, "in_stock": True},
    {"id": 7,  "name": "GPIO Expander Chip",        "category": "Microchips & Processors", "slug": "gpio-expander-chip",        "price": 12.99,  "in_stock": True},
    {"id": 8,  "name": "Temperature Sensor TH-1",  "category": "Sensors & Components",    "slug": "temperature-sensor-th-1",   "price": 8.99,   "in_stock": True},
    {"id": 9,  "name": "Power Regulator Board",    "category": "Circuit Boards",          "slug": "power-regulator-board",     "price": 27.99,  "in_stock": False},
    {"id": 10, "name": "Nano Dev Board",           "category": "Development Kits",        "slug": "nano-dev-board",            "price": 64.99,  "in_stock": True},
    {"id": 11, "name": "Ultrasonic Sensor Pack",   "category": "Sensors & Components",    "slug": "ultrasonic-sensor-pack",    "price": 14.99,  "in_stock": True},
    {"id": 12, "name": "Bulk Capacitor Set",       "category": "Bulk Orders",             "slug": "bulk-capacitor-set",        "price": 24.99,  "in_stock": True},
]


def product_by_id(product_id: int) -> dict | None:
    return next((p for p in PRODUCTS if p["id"] == product_id), None)


def product_by_slug(slug: str) -> dict | None:
    return next((p for p in PRODUCTS if p["slug"] == slug), None)


def build_product_breadcrumb(product: dict) -> list[dict]:
    return [
        {"label": "Home",               "href": "/"},
        {"label": "Products",           "href": "/products"},
        {"label": product["category"],  "href": f"/products?category={product['category']}"},
        {"label": product["name"],      "href": f"/products/{product['id']}"},
    ]