"""
app.py
======
Python / Flask backend for the storefront application.
Currently scoped to: page navigation & routing support.

Run locally:
    pip install flask flask-cors
    python app.py

The Next.js frontend calls these endpoints to resolve routes,
validate slugs, and fetch the minimal metadata each page needs
to render (breadcrumbs, page titles, nav state, etc.).
"""

from __future__ import annotations

from flask import Flask, jsonify, request, abort
from flask_cors import CORS

# ─────────────────────────────────────────────
#  App setup
# ─────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow Next.js dev server (localhost:3000) to call this API


# ─────────────────────────────────────────────
#  Static route registry
#  Maps every named page to its metadata.
#  Extend this dict as new pages are added.
# ─────────────────────────────────────────────
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

# ─────────────────────────────────────────────
#  Placeholder product catalogue
#  (mirrors ProductCatalog.tsx PRODUCTS list)
#  Replace with a real DB query later.
# ─────────────────────────────────────────────
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


# ─────────────────────────────────────────────
#  Helper utilities
# ─────────────────────────────────────────────
def _product_by_id(product_id: int) -> dict | None:
    return next((p for p in PRODUCTS if p["id"] == product_id), None)


def _product_by_slug(slug: str) -> dict | None:
    return next((p for p in PRODUCTS if p["slug"] == slug), None)


def _build_product_breadcrumb(product: dict) -> list[dict]:
    return [
        {"label": "Home",            "href": "/"},
        {"label": "Products",        "href": "/products"},
        {"label": product["category"], "href": f"/products?category={product['category']}"},
        {"label": product["name"],   "href": f"/products/{product['id']}"},
    ]


# ─────────────────────────────────────────────
#  ROUTES — Navigation / page metadata
# ─────────────────────────────────────────────

@app.route("/api/route", methods=["GET"])
def resolve_route():
    """
    Resolve page metadata for any static path.

    Query param:
        path (str): The URL path to look up, e.g. /products

    Returns:
        200  page metadata dict
        404  {"error": "Route not found"}

    Example:
        GET /api/route?path=/products
    """
    path = request.args.get("path", "").strip()
    if not path:
        abort(400, description="Missing 'path' query parameter.")

    route = ROUTES.get(path)
    if route is None:
        return jsonify({"error": f"Route '{path}' not found."}), 404

    return jsonify({"path": path, **route})


@app.route("/api/nav", methods=["GET"])
def get_nav():
    """
    Return the full navigation menu structure used by the frontend.
    The 'active' field can be passed to highlight the current page.

    Query param:
        active (str, optional): The nav_active key for the current page.

    Returns:
        200  {"items": [...], "active": str | null}

    Example:
        GET /api/nav?active=products
    """
    active = request.args.get("active", None)

    nav_items = [
        {"key": "home",     "label": "Home",    "href": "/"},
        {"key": "service",  "label": "Service",  "href": "/service",  "has_dropdown": True},
        {
            "key": "products",
            "label": "Products",
            "href": "/products",
            "has_dropdown": True,
            "dropdown": [
                {"label": "Circuit Boards",         "href": "/products?category=Circuit+Boards",          "description": "Custom PCBs for your projects"},
                {"label": "Microchips & Processors", "href": "/products?category=Microchips+%26+Processors", "description": "High-performance computing chips"},
                {"label": "Sensors & Components",   "href": "/products?category=Sensors+%26+Components",  "description": "Essential electronic components"},
                {"label": "Development Kits",        "href": "/products?category=Development+Kits",        "description": "Complete starter kits for makers"},
                {"label": "Custom Solutions",        "href": "/products?category=Custom+Solutions",        "description": "Tailored hardware for your needs"},
                {"label": "Bulk Orders",             "href": "/products?category=Bulk+Orders",             "description": "Wholesale pricing available"},
                # ── This is the "View All Products" link (circled in design) ──
                {"label": "View All Products",       "href": "/products",                                  "is_cta": True},
            ],
        },
        {"key": "pricing",  "label": "Pricing",  "href": "/pricing"},
        {"key": "blog",     "label": "Blog",      "href": "/blog"},
        {"key": "about",    "label": "About Us",  "href": "/about"},
        {"key": "contact",  "label": "Contact Us","href": "/contact"},
    ]

    return jsonify({"items": nav_items, "active": active})


@app.route("/api/breadcrumb", methods=["GET"])
def get_breadcrumb():
    """
    Return breadcrumb trail for any path, including dynamic product pages.

    Query params:
        path       (str): e.g. /products  or  /products/4
        product_id (int, optional): used when path is a product detail page.

    Returns:
        200  {"breadcrumb": [...]}
        404  if product_id is given but not found

    Examples:
        GET /api/breadcrumb?path=/products
        GET /api/breadcrumb?path=/products/4&product_id=4
    """
    path = request.args.get("path", "").strip()

    # Static route breadcrumb
    if path in ROUTES:
        return jsonify({"breadcrumb": ROUTES[path]["breadcrumb"]})

    # Dynamic product page breadcrumb
    pid_str = request.args.get("product_id")
    if pid_str:
        try:
            pid = int(pid_str)
        except ValueError:
            abort(400, description="product_id must be an integer.")

        product = _product_by_id(pid)
        if product is None:
            return jsonify({"error": f"Product with id {pid} not found."}), 404

        return jsonify({"breadcrumb": _build_product_breadcrumb(product)})

    return jsonify({"error": f"No breadcrumb defined for path '{path}'."}), 404


# ─────────────────────────────────────────────
#  ROUTES — Product catalogue (lightweight,
#  navigation-level data only)
# ─────────────────────────────────────────────

@app.route("/api/products", methods=["GET"])
def list_products():
    """
    Return all products (or a filtered subset) for the catalog page.

    Query params:
        category  (str, optional):  filter by category name
        in_stock  (bool, optional): "true" returns in-stock only
        sort      (str, optional):  "price-asc" | "price-desc" | "name"

    Returns:
        200  {"products": [...], "total": int}

    Example:
        GET /api/products?category=Circuit+Boards&in_stock=true
    """
    products = list(PRODUCTS)  # shallow copy

    # Filter by category
    category = request.args.get("category")
    if category:
        products = [p for p in products if p["category"].lower() == category.lower()]

    # Filter by stock status
    in_stock_param = request.args.get("in_stock", "").lower()
    if in_stock_param == "true":
        products = [p for p in products if p["in_stock"]]

    # Sort
    sort_param = request.args.get("sort", "")
    if sort_param == "price-asc":
        products.sort(key=lambda p: p["price"])
    elif sort_param == "price-desc":
        products.sort(key=lambda p: p["price"], reverse=True)
    elif sort_param == "name":
        products.sort(key=lambda p: p["name"].lower())

    return jsonify({"products": products, "total": len(products)})


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id: int):
    """
    Return lightweight navigation metadata for a single product.
    (Full product detail is handled client-side with placeholder data for now.)

    Returns:
        200  product dict with breadcrumb
        404  if not found

    Example:
        GET /api/products/4
    """
    product = _product_by_id(product_id)
    if product is None:
        return jsonify({"error": f"Product {product_id} not found."}), 404

    return jsonify({
        **product,
        "breadcrumb": _build_product_breadcrumb(product),
        "page_title":  product["name"],
        "nav_active":  "products",
    })


@app.route("/api/products/slug/<slug>", methods=["GET"])
def get_product_by_slug(slug: str):
    """
    Resolve a product by its URL slug (used for SEO-friendly URLs).

    Returns:
        200  product dict with breadcrumb + resolved id
        404  if slug not found

    Example:
        GET /api/products/slug/dev-kit-pro
    """
    product = _product_by_slug(slug)
    if product is None:
        return jsonify({"error": f"No product with slug '{slug}'."}), 404

    return jsonify({
        **product,
        "breadcrumb": _build_product_breadcrumb(product),
        "page_title":  product["name"],
        "nav_active":  "products",
    })


@app.route("/api/categories", methods=["GET"])
def list_categories():
    """
    Return a deduplicated list of all product categories.
    Used to populate the category filter tabs on the catalog page.

    Returns:
        200  {"categories": ["All", ...]}
    """
    cats = sorted({p["category"] for p in PRODUCTS})
    return jsonify({"categories": ["All", *cats]})


# ─────────────────────────────────────────────
#  i18n — Language & Translation Support
#  Powers the language dropdown in Header.tsx
# ─────────────────────────────────────────────

# Supported languages: code → display label
SUPPORTED_LANGUAGES: dict[str, str] = {
    "en": "English",
    "es": "Español",
    "fr": "Français",
    "zh": "中文",
    "ja": "日本語",
    "ko": "한국어",
}

# Default language fallback
DEFAULT_LANG = "en"

# Translation strings for every supported language.
# Add new keys here as the UI grows — the frontend reads
# them by key so the component never needs hardcoded strings.
TRANSLATIONS: dict[str, dict[str, str]] = {
    "en": {
        # ── Navigation ──
        "nav.home":            "Home",
        "nav.service":         "Service",
        "nav.products":        "Products",
        "nav.pricing":         "Pricing",
        "nav.blog":            "Blog",
        "nav.about":           "About Us",
        "nav.contact":         "Contact Us",
        "nav.view_all_products": "View All Products",
        "nav.view_all_services": "View All Services",
        "nav.sign_in":         "Sign In / Register",

        # ── Hero ──
        "hero.eyebrow":        "Your Services",
        "hero.title":          "Decode your limits with our carefully crafted products.",
        "hero.body":           "Whenever you want a part for your work or engineering, we make it happen.",
        "hero.cta":            "Apply Now",

        # ── Product Catalog ──
        "catalog.eyebrow":     "// CATALOG",
        "catalog.title":       "All Products",
        "catalog.subtitle":    "Browse our full range of circuit boards, microchips, sensors, dev kits, and custom solutions.",
        "catalog.search":      "Search products\u2026",
        "catalog.in_stock":    "In stock only",
        "catalog.sort":        "Sort",
        "catalog.sort.featured":    "Featured",
        "catalog.sort.price_asc":   "Price: Low \u2192 High",
        "catalog.sort.price_desc":  "Price: High \u2192 Low",
        "catalog.sort.rating":      "Top Rated",
        "catalog.sort.newest":      "Newest",
        "catalog.results":     "{count} product(s)",
        "catalog.view":        "View \u2192",
        "catalog.unavailable": "Unavailable",
        "catalog.out_of_stock": "Out of Stock",
        "catalog.no_results":  "No products match your filters.",
        "catalog.reset":       "Reset filters",

        # ── Product Detail ──
        "product.select_option":  "Select Option",
        "product.quantity":       "Quantity",
        "product.add_to_cart":    "Add to Cart",
        "product.added":          "\u2713 Added to Cart",
        "product.description":    "Description",
        "product.details":        "Product Details",
        "product.shipping":       "Free shipping on orders over $XX \u00b7 Ships in X\u2013X business days",
        "product.related":        "You May Also Like",
        "product.reviews":        "{count} reviews",
        "nav.admin": "Admin",
        "catalog.eyebrow.sensors": "// SENSORS & COMPONENTS",
        "catalog.title.sensors": "Sensors & Components",
        "catalog.eyebrow.dev_kits": "// DEVELOPMENT KITS",
        "catalog.title.dev_kits": "Development Kits",
        "catalog.eyebrow.custom": "// CUSTOM SOLUTIONS",
        "catalog.title.custom": "Custom Solutions",
        "catalog.eyebrow.bulk": "// BULK ORDERS",
        "catalog.title.bulk": "Bulk Orders",
        "catalog.eyebrow.microchips": "// MICROCHIPS & PROCESSORS",
        "catalog.title.microchips": "Microchips & Processors",
        "catalog.circuit_boards": "Circuit Boards",
        "catalog.eyebrow.circuit_boards": "// CIRCUIT BOARDS",
        "catalog.title.circuit_boards": "Circuit Boards",
        "catalog.reviews_none": "— reviews",
        "catalog.cat.all": "All",
        "catalog.cat.circuit_boards": "Circuit Boards",
        "catalog.cat.microchips": "Microchips & Processors",
        "catalog.cat.sensors": "Sensors & Components",
        "catalog.cat.dev_kits": "Development Kits",
        "catalog.cat.custom": "Custom Solutions",
        "catalog.cat.bulk": "Bulk Orders",
    },

    "es": {
        # ── Navigation ──
        "nav.home":            "Inicio",
        "nav.service":         "Servicio",
        "nav.products":        "Productos",
        "nav.pricing":         "Precios",
        "nav.blog":            "Blog",
        "nav.about":           "Nosotros",
        "nav.contact":         "Cont\u00e1ctenos",
        "nav.view_all_products": "Ver todos los productos",
        "nav.view_all_services": "Ver todos los servicios",
        "nav.sign_in":         "Iniciar sesi\u00f3n / Registrarse",

        # ── Hero ──
        "hero.eyebrow":        "Tus Servicios",
        "hero.title":          "Decodifica tus l\u00edmites con nuestros productos cuidadosamente dise\u00f1ados.",
        "hero.body":           "Cuando necesites una pieza para tu trabajo o ingenier\u00eda, nosotros lo hacemos posible.",
        "hero.cta":            "Aplicar ahora",

        # ── Product Catalog ──
        "catalog.eyebrow":     "// CAT\u00c1LOGO",
        "catalog.title":       "Todos los productos",
        "catalog.subtitle":    "Explora nuestra gama completa de placas de circuito, microchips, sensores, kits de desarrollo y soluciones personalizadas.",
        "catalog.search":      "Buscar productos\u2026",
        "catalog.in_stock":    "Solo en existencia",
        "catalog.sort":        "Ordenar",
        "catalog.sort.featured":    "Destacados",
        "catalog.sort.price_asc":   "Precio: menor a mayor",
        "catalog.sort.price_desc":  "Precio: mayor a menor",
        "catalog.sort.rating":      "Mejor valorados",
        "catalog.sort.newest":      "M\u00e1s recientes",
        "catalog.results":     "{count} producto(s)",
        "catalog.view":        "Ver \u2192",
        "catalog.unavailable": "No disponible",
        "catalog.out_of_stock": "Agotado",
        "catalog.no_results":  "Ning\u00fan producto coincide con tus filtros.",
        "catalog.reset":       "Restablecer filtros",

        # ── Product Detail ──
        "product.select_option":  "Seleccionar opci\u00f3n",
        "product.quantity":       "Cantidad",
        "product.add_to_cart":    "Agregar al carrito",
        "product.added":          "\u2713 Agregado al carrito",
        "product.description":    "Descripci\u00f3n",
        "product.details":        "Detalles del producto",
        "product.shipping":       "Env\u00edo gratis en pedidos superiores a $XX \u00b7 Entrega en X\u2013X d\u00edas h\u00e1biles",
        "product.related":        "Tambi\u00e9n te puede gustar",
        "product.reviews":        "{count} rese\u00f1as",
        "nav.admin": "Admin",
        "catalog.eyebrow.sensors": "// SENSORES Y COMPONENTES",
        "catalog.title.sensors": "Sensores y Componentes",
        "catalog.eyebrow.dev_kits": "// KITS DE DESARROLLO",
        "catalog.title.dev_kits": "Kits de Desarrollo",
        "catalog.eyebrow.custom": "// SOLUCIONES PERSONALIZADAS",
        "catalog.title.custom": "Soluciones Personalizadas",
        "catalog.eyebrow.bulk": "// PEDIDOS AL POR MAYOR",
        "catalog.title.bulk": "Pedidos al por Mayor",
        "catalog.eyebrow.microchips": "// MICROCHIPS Y PROCESADORES",
        "catalog.title.microchips": "Microchips y Procesadores",
        "catalog.eyebrow.circuit_boards": "// PLACAS DE CIRCUITO",
        "catalog.title.circuit_boards": "Placas de Circuito",
        "catalog.reviews_none": "— reseñas",
        "catalog.cat.all": "Todos",
        "catalog.cat.circuit_boards": "Placas de Circuito",
        "catalog.cat.microchips": "Microchips y Procesadores",
        "catalog.cat.sensors": "Sensores y Componentes",
        "catalog.cat.dev_kits": "Kits de Desarrollo",
        "catalog.cat.custom": "Soluciones Personalizadas",
        "catalog.cat.bulk": "Pedidos al por Mayor",
    },

    "fr": {
        # ── Navigation ──
        "nav.home":            "Accueil",
        "nav.service":         "Service",
        "nav.products":        "Produits",
        "nav.pricing":         "Tarifs",
        "nav.blog":            "Blog",
        "nav.about":           "\u00c0 propos",
        "nav.contact":         "Contactez-nous",
        "nav.view_all_products": "Voir tous les produits",
        "nav.view_all_services": "Voir tous les services",
        "nav.sign_in":         "Connexion / Inscription",

        # ── Hero ──
        "hero.eyebrow":        "Vos Services",
        "hero.title":          "D\u00e9passez vos limites avec nos produits soigneusement con\u00e7us.",
        "hero.body":           "Chaque fois que vous avez besoin d\u2019une pi\u00e8ce pour votre travail ou ing\u00e9nierie, nous la trouvons.",
        "hero.cta":            "Postuler maintenant",

        # ── Product Catalog ──
        "catalog.eyebrow":     "// CATALOGUE",
        "catalog.title":       "Tous les produits",
        "catalog.subtitle":    "Parcourez notre gamme compl\u00e8te de circuits imprim\u00e9s, microprocesseurs, capteurs, kits de d\u00e9veloppement et solutions sur mesure.",
        "catalog.search":      "Rechercher des produits\u2026",
        "catalog.in_stock":    "En stock uniquement",
        "catalog.sort":        "Trier",
        "catalog.sort.featured":    "En vedette",
        "catalog.sort.price_asc":   "Prix : croissant",
        "catalog.sort.price_desc":  "Prix : d\u00e9croissant",
        "catalog.sort.rating":      "Mieux not\u00e9s",
        "catalog.sort.newest":      "Plus r\u00e9cents",
        "catalog.results":     "{count} produit(s)",
        "catalog.view":        "Voir \u2192",
        "catalog.unavailable": "Indisponible",
        "catalog.out_of_stock": "Rupture de stock",
        "catalog.no_results":  "Aucun produit ne correspond \u00e0 vos filtres.",
        "catalog.reset":       "R\u00e9initialiser les filtres",

        # ── Product Detail ──
        "product.select_option":  "S\u00e9lectionner une option",
        "product.quantity":       "Quantit\u00e9",
        "product.add_to_cart":    "Ajouter au panier",
        "product.added":          "\u2713 Ajout\u00e9 au panier",
        "product.description":    "Description",
        "product.details":        "D\u00e9tails du produit",
        "product.shipping":       "Livraison gratuite pour les commandes sup\u00e9rieures \u00e0 XX\u20ac \u00b7 Livraison en X\u2013X jours ouvrables",
        "product.related":        "Vous aimerez aussi",
        "product.reviews":        "{count} avis",
        "nav.admin": "Admin",
        "catalog.eyebrow.sensors": "// CAPTEURS ET COMPOSANTS",
        "catalog.title.sensors": "Capteurs et Composants",
        "catalog.eyebrow.dev_kits": "// KITS DE DÉVELOPPEMENT",
        "catalog.title.dev_kits": "Kits de Développement",
        "catalog.eyebrow.custom": "// SOLUTIONS SUR MESURE",
        "catalog.title.custom": "Solutions sur Mesure",
        "catalog.eyebrow.bulk": "// COMMANDES EN GROS",
        "catalog.title.bulk": "Commandes en Gros",
        "catalog.eyebrow.microchips": "// MICROPROCESSEURS",
        "catalog.title.microchips": "Microprocesseurs",
        "catalog.eyebrow.circuit_boards": "// CIRCUITS IMPRIMÉS",
        "catalog.title.circuit_boards": "Circuits Imprimés",
        "catalog.reviews_none": "— avis",
        "catalog.cat.all": "Tous",
        "catalog.cat.circuit_boards": "Circuits Imprimés",
        "catalog.cat.microchips": "Microprocesseurs",
        "catalog.cat.sensors": "Capteurs et Composants",
        "catalog.cat.dev_kits": "Kits de Développement",
        "catalog.cat.custom": "Solutions sur Mesure",
        "catalog.cat.bulk": "Commandes en Gros",
    },
    "zh": {
        # ── Navigation ──
        "nav.home":            "首页",
        "nav.service":         "服务",
        "nav.products":        "产品",
        "nav.pricing":         "价格",
        "nav.blog":            "博客",
        "nav.about":           "关于我们",
        "nav.contact":         "联系我们",
        "nav.view_all_products": "查看所有产品",
        "nav.view_all_services": "查看所有服务",
        "nav.sign_in":         "登录 / 注册",

        # ── Hero ──
        "hero.eyebrow":        "您的服务",
        "hero.title":          "用我们精心打造的产品突破您的极限。",
        "hero.body":           "无论您需要什么零件用于工作或工程，我们都能为您实现。",
        "hero.cta":            "立即申请",

        # ── Product Catalog ──
        "catalog.eyebrow":     "// 产品目录",
        "catalog.title":       "所有产品",
        "catalog.subtitle":    "浏览我们完整的电路板、微芯片、传感器、开发套件和定制解决方案系列。",
        "catalog.search":      "搜索产品…",
        "catalog.in_stock":    "仅显示有货",
        "catalog.sort":        "排序",
        "catalog.sort.featured":    "推荐",
        "catalog.sort.price_asc":   "价格：从低到高",
        "catalog.sort.price_desc":  "价格：从高到低",
        "catalog.sort.rating":      "评分最高",
        "catalog.sort.newest":      "最新",
        "catalog.results":     "{count} 件产品",
        "catalog.view":        "查看 →",
        "catalog.unavailable": "暂无库存",
        "catalog.out_of_stock": "缺货",
        "catalog.no_results":  "没有符合筛选条件的产品。",
        "catalog.reset":       "重置筛选",

        # ── Product Detail ──
        "product.select_option":  "选择选项",
        "product.quantity":       "数量",
        "product.add_to_cart":    "加入购物车",
        "product.added":          "✓ 已加入购物车",
        "product.description":    "描述",
        "product.details":        "产品详情",
        "product.shipping":       "订单满XX元免运费 · X–X个工作日内发货",
        "product.related":        "您可能还喜欢",
        "product.reviews":        "{count} 条评价",
        "nav.admin": "管理",
        "catalog.eyebrow.sensors": "// 传感器与元件",
        "catalog.title.sensors": "传感器与元件",
        "catalog.eyebrow.dev_kits": "// 开发套件",
        "catalog.title.dev_kits": "开发套件",
        "catalog.eyebrow.custom": "// 定制解决方案",
        "catalog.title.custom": "定制解决方案",
        "catalog.eyebrow.bulk": "// 批量订单",
        "catalog.title.bulk": "批量订单",
        "catalog.eyebrow.microchips": "// 微芯片与处理器",
        "catalog.title.microchips": "微芯片与处理器",
        "catalog.eyebrow.circuit_boards": "// 电路板",
        "catalog.title.circuit_boards": "电路板",
        "catalog.reviews_none": "— 条评价",
        "catalog.cat.all": "全部",
        "catalog.cat.circuit_boards": "电路板",
        "catalog.cat.microchips": "微芯片与处理器",
        "catalog.cat.sensors": "传感器与元件",
        "catalog.cat.dev_kits": "开发套件",
        "catalog.cat.custom": "定制解决方案",
        "catalog.cat.bulk": "批量订单",
    },

    "ja": {
        # ── Navigation ──
        "nav.home":            "ホーム",
        "nav.service":         "サービス",
        "nav.products":        "製品",
        "nav.pricing":         "料金",
        "nav.blog":            "ブログ",
        "nav.about":           "会社概要",
        "nav.contact":         "お問い合わせ",
        "nav.view_all_products": "すべての製品を見る",
        "nav.view_all_services": "すべてのサービスを見る",
        "nav.sign_in":         "ログイン / 登録",

        # ── Hero ──
        "hero.eyebrow":        "サービスのご案内",
        "hero.title":          "精巧な製品で、あなたの限界を超えよう。",
        "hero.body":           "お仕事やエンジニアリングに必要なパーツを、私たちが実現します。",
        "hero.cta":            "今すぐ申し込む",

        # ── Product Catalog ──
        "catalog.eyebrow":     "// カタログ",
        "catalog.title":       "すべての製品",
        "catalog.subtitle":    "回路基板、マイクロチップ、センサー、開発キット、カスタムソリューションの全ラインナップをご覧ください。",
        "catalog.search":      "製品を検索…",
        "catalog.in_stock":    "在庫ありのみ",
        "catalog.sort":        "並び替え",
        "catalog.sort.featured":    "おすすめ",
        "catalog.sort.price_asc":   "価格：低い順",
        "catalog.sort.price_desc":  "価格：高い順",
        "catalog.sort.rating":      "評価が高い順",
        "catalog.sort.newest":      "新着順",
        "catalog.results":     "{count} 件の製品",
        "catalog.view":        "詳細を見る →",
        "catalog.unavailable": "在庫なし",
        "catalog.out_of_stock": "売り切れ",
        "catalog.no_results":  "条件に一致する製品が見つかりません。",
        "catalog.reset":       "フィルターをリセット",

        # ── Product Detail ──
        "product.select_option":  "オプションを選択",
        "product.quantity":       "数量",
        "product.add_to_cart":    "カートに追加",
        "product.added":          "✓ カートに追加しました",
        "product.description":    "説明",
        "product.details":        "製品詳細",
        "product.shipping":       "XX円以上のご注文で送料無料 · X〜X営業日以内に発送",
        "product.related":        "こちらもおすすめ",
        "product.reviews":        "{count} 件のレビュー",
        "nav.admin": "管理",
        "catalog.eyebrow.sensors": "// センサー・部品",
        "catalog.title.sensors": "センサー・部品",
        "catalog.eyebrow.dev_kits": "// 開発キット",
        "catalog.title.dev_kits": "開発キット",
        "catalog.eyebrow.custom": "// カスタムソリューション",
        "catalog.title.custom": "カスタムソリューション",
        "catalog.eyebrow.bulk": "// まとめ買い",
        "catalog.title.bulk": "まとめ買い",
        "catalog.eyebrow.microchips": "// マイクロチップ・プロセッサ",
        "catalog.title.microchips": "マイクロチップ・プロセッサ",
        "catalog.eyebrow.circuit_boards": "// 回路基板",
        "catalog.title.circuit_boards": "回路基板",
        "catalog.reviews_none": "— 件のレビュー",
        "catalog.cat.all": "すべて",
        "catalog.cat.circuit_boards": "回路基板",
        "catalog.cat.microchips": "マイクロチップ・プロセッサ",
        "catalog.cat.sensors": "センサー・部品",
        "catalog.cat.dev_kits": "開発キット",
        "catalog.cat.custom": "カスタムソリューション",
        "catalog.cat.bulk": "まとめ買い",
    },

    "ko": {
        # ── Navigation ──
        "nav.home":            "홈",
        "nav.service":         "서비스",
        "nav.products":        "제품",
        "nav.pricing":         "가격",
        "nav.blog":            "블로그",
        "nav.about":           "회사 소개",
        "nav.contact":         "문의하기",
        "nav.view_all_products": "모든 제품 보기",
        "nav.view_all_services": "모든 서비스 보기",
        "nav.sign_in":         "로그인 / 회원가입",

        # ── Hero ──
        "hero.eyebrow":        "서비스 안내",
        "hero.title":          "정성껏 만든 제품으로 당신의 한계를 넘어서세요.",
        "hero.body":           "작업이나 엔지니어링에 필요한 부품이 있다면 저희가 해결해 드립니다.",
        "hero.cta":            "지금 신청하기",

        # ── Product Catalog ──
        "catalog.eyebrow":     "// 카탈로그",
        "catalog.title":       "모든 제품",
        "catalog.subtitle":    "회로 기판, 마이크로칩, 센서, 개발 키트, 맞춤형 솔루션 등 전체 제품 라인업을 둘러보세요.",
        "catalog.search":      "제품 검색…",
        "catalog.in_stock":    "재고 있는 제품만",
        "catalog.sort":        "정렬",
        "catalog.sort.featured":    "추천순",
        "catalog.sort.price_asc":   "가격: 낮은순",
        "catalog.sort.price_desc":  "가격: 높은순",
        "catalog.sort.rating":      "평점 높은순",
        "catalog.sort.newest":      "최신순",
        "catalog.results":     "{count}개 제품",
        "catalog.view":        "보기 →",
        "catalog.unavailable": "품절",
        "catalog.out_of_stock": "재고 없음",
        "catalog.no_results":  "필터 조건에 맞는 제품이 없습니다.",
        "catalog.reset":       "필터 초기화",

        # ── Product Detail ──
        "product.select_option":  "옵션 선택",
        "product.quantity":       "수량",
        "product.add_to_cart":    "장바구니에 추가",
        "product.added":          "✓ 장바구니에 추가됨",
        "product.description":    "설명",
        "product.details":        "제품 상세정보",
        "product.shipping":       "XX원 이상 무료 배송 · X~X 영업일 이내 발송",
        "product.related":        "이런 제품은 어떠세요",
        "product.reviews":        "{count}개 리뷰",
        "nav.admin": "관리자",
        "catalog.eyebrow.sensors": "// 센서 & 부품",
        "catalog.title.sensors": "센서 & 부품",
        "catalog.eyebrow.dev_kits": "// 개발 키트",
        "catalog.title.dev_kits": "개발 키트",
        "catalog.eyebrow.custom": "// 맞춤형 솔루션",
        "catalog.title.custom": "맞춤형 솔루션",
        "catalog.eyebrow.bulk": "// 대량 주문",
        "catalog.title.bulk": "대량 주문",
        "catalog.eyebrow.microchips": "// 마이크로칩 & 프로세서",
        "catalog.title.microchips": "마이크로칩 & 프로세서",
        "catalog.eyebrow.circuit_boards": "// 회로 기판",
        "catalog.title.circuit_boards": "회로 기판",
        "catalog.reviews_none": "— 개 리뷰",
        "catalog.cat.all": "전체",
        "catalog.cat.circuit_boards": "회로 기판",
        "catalog.cat.microchips": "마이크로칩 & 프로세서",
        "catalog.cat.sensors": "센서 & 부품",
        "catalog.cat.dev_kits": "개발 키트",
        "catalog.cat.custom": "맞춤형 솔루션",
        "catalog.cat.bulk": "대량 주문",
    },
}


@app.route("/api/languages", methods=["GET"])
def list_languages():
    """
    Return all supported languages for the language dropdown in Header.tsx.

    Returns:
        200  {"languages": [{"code": "en", "label": "English"}, ...],
               "default": "en"}

    Example:
        GET /api/languages
    """
    languages = [
        {"code": code, "label": label}
        for code, label in SUPPORTED_LANGUAGES.items()
    ]
    return jsonify({"languages": languages, "default": DEFAULT_LANG})


@app.route("/api/translations/<lang_code>", methods=["GET"])
def get_translations(lang_code: str):
    """
    Return the full translation map for a given language code.
    The frontend stores this after the user picks a language and
    uses the keys to render all UI strings.

    Path param:
        lang_code (str): e.g. "en", "es", "fr"

    Query param:
        keys (str, optional): comma-separated list of specific keys
            to return instead of the full map.
            e.g. ?keys=nav.home,nav.products,hero.cta

    Returns:
        200  {"lang": "es", "translations": {"key": "value", ...}}
        404  if lang_code is not supported

    Examples:
        GET /api/translations/es
        GET /api/translations/fr?keys=nav.home,nav.products
    """
    lang_code = lang_code.lower().strip()

    if lang_code not in TRANSLATIONS:
        supported = list(SUPPORTED_LANGUAGES.keys())
        return jsonify({
            "error": f"Language '{lang_code}' is not supported.",
            "supported": supported,
        }), 404

    trans = TRANSLATIONS[lang_code]

    # Optional: return only requested keys
    keys_param = request.args.get("keys", "").strip()
    if keys_param:
        requested_keys = [k.strip() for k in keys_param.split(",") if k.strip()]
        trans = {k: trans[k] for k in requested_keys if k in trans}

    return jsonify({"lang": lang_code, "translations": trans})


@app.route("/api/translations/<lang_code>/<path:key>", methods=["GET"])
def get_single_translation(lang_code: str, key: str):
    """
    Return a single translation string by language and key.
    Useful for lightweight on-demand lookups.

    Path params:
        lang_code (str): e.g. "en"
        key       (str): dot-notation key e.g. "nav.home"

    Returns:
        200  {"lang": "en", "key": "nav.home", "value": "Home"}
        404  if language or key not found

    Example:
        GET /api/translations/es/nav.home
    """
    lang_code = lang_code.lower().strip()

    if lang_code not in TRANSLATIONS:
        return jsonify({"error": f"Language '{lang_code}' not supported."}), 404

    value = TRANSLATIONS[lang_code].get(key)
    if value is None:
        # Graceful fallback: try English before returning 404
        value = TRANSLATIONS[DEFAULT_LANG].get(key)
        if value is None:
            return jsonify({"error": f"Key '{key}' not found."}), 404
        return jsonify({"lang": DEFAULT_LANG, "key": key, "value": value, "fallback": True})

    return jsonify({"lang": lang_code, "key": key, "value": value})


# ─────────────────────────────────────────────
#  Error handlers
# ─────────────────────────────────────────────

@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": str(e.description)}), 400


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found."}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed."}), 405


# ─────────────────────────────────────────────
#  Dev server entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)