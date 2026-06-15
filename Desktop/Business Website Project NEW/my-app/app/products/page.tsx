'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ProductCatalog.module.css';
import Header from '@/app/components/Header/Header';
import { useLanguage } from '@/app/components/Header/LanguageContext';
import { CatalogProduct, fetchCatalogProducts } from '@/app/products/productsApi';

/* ============================================================
   Types
   ============================================================ */
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

/* ============================================================
   Category slug → display name map
   Must stay in sync with Header.tsx hrefs
   e.g. /products/Circuitboards → 'Circuit Boards'
   ============================================================ */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  Circuitboards: 'Circuit Boards',
  Microchips:    'Microchips & Processors',
  Sensors:       'Sensors & Components',
  Devkits:       'Development Kits',
  Custom:        'Custom Solutions',
  Bulkorders:    'Bulk Orders',
};

export const STATIC_CATEGORIES = ['All', ...Object.values(CATEGORY_SLUG_MAP)];

/* ============================================================
   Shared Product Data
   Import this in app/products/[id]/page.tsx too
   ============================================================ */
export const ALL_PRODUCTS: CatalogProduct[] = [];

/* ============================================================
   Sub-components
   ============================================================ */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} className={styles.starIcon} viewBox="0 0 24 24">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={star <= Math.round(rating) ? '#4ade80' : '#1f2a1f'}
            stroke="#4ade80"
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  );
}

function BadgeChip({ badge }: { badge: CatalogProduct['badge'] }) {
  if (!badge) return null;
  return <span className={`${styles.badge} ${styles[`badge${badge.replace(' ', '')}`]}`}>{badge}</span>;
}

function ProductCard({ product, onClick }: { product: CatalogProduct; onClick: () => void }) {
  const { t } = useLanguage();
  const [wished, setWished] = useState(false);
  const hasDiscount = product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article className={`${styles.card} ${!product.inStock ? styles.cardOutOfStock : ''}`}>
      <div className={styles.cardImg} onClick={onClick}>
        <div className={styles.scanlines} aria-hidden="true" />
        <svg className={styles.cardImgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
        <BadgeChip badge={product.badge} />
        {hasDiscount && <span className={styles.discountPill}>−{discount}%</span>}
        {!product.inStock && (
          <div className={styles.outOfStockOverlay}>
            {t['catalog.out_of_stock'] || 'Out of Stock'}
          </div>
        )}
      </div>

      <button
        className={`${styles.wishBtn} ${wished ? styles.wishBtnActive : ''}`}
        onClick={() => setWished(w => !w)}
        aria-label="Wishlist"
      >
        <svg fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      <div className={styles.cardBody}>
        <p className={styles.cardCategory}>{product.category}</p>
        <h3 className={styles.cardName} onClick={onClick}>{product.name}</h3>
        <p className={styles.cardDesc}>{product.description}</p>
        <StarRating rating={product.rating} />
        <span className={styles.reviewCount}>
          {product.reviewCount > 0
            ? `${product.reviewCount} ${t['product.reviews']?.replace('{count}', '').trim() || 'reviews'}`
            : '— reviews'}
        </span>
        <div className={styles.cardFooter}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>
              {product.price > 0 ? `$${product.price.toFixed(2)}` : '$—'}
            </span>
            {hasDiscount && (
              <span className={styles.priceOrig}>${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button className={styles.viewBtn} onClick={onClick} disabled={!product.inStock}>
            {product.inStock
              ? (t['catalog.view'] || 'View →')
              : (t['catalog.unavailable'] || 'Unavailable')}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Inner catalog — reads ?category= from URL
   ============================================================ */
function CatalogInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { t }        = useLanguage();

  const [products, setProducts] = useState<CatalogProduct[] | null>(null);

  const normalizeAny = (row: any): CatalogProduct => ({
    id: Number(row?.id ?? row?.dbId ?? 0),
    name: String(row?.name ?? ''),
    category: String(row?.category ?? ''),
    price: Number(row?.price ?? row?.original_price ?? row?.originalPrice ?? 0),
    originalPrice: Number(row?.originalPrice ?? row?.original_price ?? row?.price ?? 0),
    rating: Number(row?.rating ?? 0),
    reviewCount: Number(row?.reviewCount ?? row?.review_count ?? 0),
    badge: row?.badge ?? undefined,
    inStock: Boolean(row?.inStock ?? row?.in_stock),
    description: String(row?.description ?? ''),
    sku: row?.sku ? String(row.sku) : undefined,
    tags: row?.tags ? (Array.isArray(row.tags) ? String(row.tags) : String(row.tags)) : undefined,
    imageUrl: row?.image_url ?? row?.imageUrl ?? null,
  });

  // Load products from the API and keep a localStorage snapshot for other client pages.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const fetched = await fetchCatalogProducts();
        if (!mounted) return;

        // If API returned products, use them and update the local snapshot.
        if (Array.isArray(fetched) && fetched.length > 0) {
          setProducts(fetched);
          try { localStorage.setItem('catalog_products', JSON.stringify(fetched)); } catch {}
        } else {
          // If API returned an empty array, prefer an existing local snapshot
          // so we don't wipe out locally-saved admin data.
          try {
            const raw = localStorage.getItem('catalog_products');
            if (raw) {
              const parsed = JSON.parse(raw) as CatalogProduct[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                setProducts(parsed.map(normalizeAny));
              } else {
                setProducts([]);
              }
            } else {
              setProducts([]);
            }
          } catch (err) {
            setProducts([]);
          }
        }
      } catch (err) {
        // fallback to localStorage if the API cannot be reached
        try {
          const raw = localStorage.getItem('catalog_products');
          if (raw) {
            const parsed = JSON.parse(raw) as any[];
            if (Array.isArray(parsed)) {
              setProducts(parsed.map(normalizeAny));
            }
          }
        } catch (err) {
          // ignore
        }
      }
    })();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'catalog_products') {
        try {
          const parsed = JSON.parse(e.newValue || '[]') as any[];
          if (Array.isArray(parsed)) setProducts(parsed.map(normalizeAny));
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    // Listen for BroadcastChannel messages from other tabs (immediate sync)
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('catalog-sync');
      bc.onmessage = (ev) => {
        try {
          const payload = ev.data as any[];
          if (Array.isArray(payload)) setProducts(payload.map(normalizeAny));
        } catch (err) {
          // ignore
        }
      };
    } catch (e) {
      bc = null;
    }
    return () => {
      mounted = false;
      window.removeEventListener('storage', onStorage);
      try { if (bc) bc.close(); } catch {}
    };
    // cleanup BroadcastChannel when unmounting
    // (note: return already happens above, so close here is redundant in this scope)
  }, []);

  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy,         setSortBy]         = useState<SortOption>('featured');
  const [inStockOnly,    setInStockOnly]    = useState(false);
  const [sortOpen,       setSortOpen]       = useState(false);

  /* Sync active category from URL param on mount / param change */
  useEffect(() => {
    const slug = searchParams.get('category');
    if (slug && CATEGORY_SLUG_MAP[slug]) {
      setActiveCategory(CATEGORY_SLUG_MAP[slug]);
    } else if (!slug) {
      setActiveCategory('All');
    }
  }, [searchParams]);

  const SORT_LABELS: Record<SortOption, string> = {
    featured:     t['catalog.sort.featured']   || 'Featured',
    'price-asc':  t['catalog.sort.price_asc']  || 'Price: Low → High',
    'price-desc': t['catalog.sort.price_desc'] || 'Price: High → Low',
    rating:       t['catalog.sort.rating']     || 'Top Rated',
    newest:       t['catalog.sort.newest']     || 'Newest',
  };

  const filtered = useMemo(() => {
    let list = products ? [...products] : [];
    if (activeCategory !== 'All')
      list = list.filter(p => p.category === activeCategory);
    if (search.trim())
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    if (inStockOnly)
      list = list.filter(p => p.inStock);
    switch (sortBy) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price);             break;
      case 'price-desc': list.sort((a, b) => b.price - a.price);             break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating);           break;
      case 'newest':     list.sort((a, b) => b.id - a.id);                   break;
      default:           list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
    return list;
  }, [products, search, activeCategory, sortBy, inStockOnly]);

  const categories = useMemo(() => {
    const dynamicCategories = (products || [])
      .map(p => p.category?.trim())
      .filter(Boolean);

    const merged = [
      ...STATIC_CATEGORIES,
      ...dynamicCategories,
    ];

    if (activeCategory && activeCategory !== 'All' && !merged.includes(activeCategory)) {
      merged.push(activeCategory);
    }

    return Array.from(new Set(merged));
  }, [products, activeCategory]);

  const handleProductClick = (id: number) => router.push(`/products/${id}`);

  /* When user clicks a category tab, also update the URL */
  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      router.replace('/products', { scroll: false });
    } else {
      const slug = Object.entries(CATEGORY_SLUG_MAP).find(([, v]) => v === cat)?.[0];
      if (slug) router.replace(`/products?category=${slug}`, { scroll: false });
    }
  };

  const resetFilters = () => {
    setSearch('');
    setActiveCategory('All');
    setInStockOnly(false);
    router.replace('/products', { scroll: false });
  };

  return (
    <>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={t['catalog.search'] || 'Search products…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>}
        </div>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => setInStockOnly(e.target.checked)}
            className={styles.toggleInput}
          />
          <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
          <span className={styles.toggleLabel}>{t['catalog.in_stock'] || 'In stock only'}</span>
        </label>

        <div className={styles.sortWrap}>
          <button className={styles.sortBtn} onClick={() => setSortOpen(o => !o)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="21" y2="12"/><line x1="11" y1="18" x2="21" y2="18"/>
            </svg>
            {SORT_LABELS[sortBy]}
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="12" height="12">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          {sortOpen && (
            <div className={styles.sortDropdown}>
              {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                <button
                  key={opt}
                  className={`${styles.sortOption} ${sortBy === opt ? styles.sortOptionActive : ''}`}
                  onClick={() => { setSortBy(opt); setSortOpen(false); }}
                >
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className={styles.resultCount}>
            {(t['catalog.results'] || '{count} products').replace('{count}', String(filtered.length))}
          </span>
      </div>

      {/* ── Category Tabs ── */}
      <div className={styles.categoryRow}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.catTab} ${activeCategory === cat ? styles.catTabActive : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Product Grid ── */}
      <main className={styles.main}>
        {products === null ? (
          <div style={{ padding: '2rem', color: '#4ade80', opacity: 0.8 }}>Loading…</div>
        ) : filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48" opacity="0.3">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className={styles.emptyText}>{t['catalog.no_results'] || 'No products match your filters.'}</p>
            <button className={styles.emptyReset} onClick={resetFilters}>
              {t['catalog.reset'] || 'Reset filters'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}

/* ============================================================
   Main Page (wraps CatalogInner in Suspense for useSearchParams)
   ============================================================ */
const ProductCatalog: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>{t['catalog.eyebrow'] || '// CATALOG'}</p>
          <h1 className={styles.heroTitle}>{t['catalog.title'] || 'Our Products'}</h1>
          <p className={styles.heroSub}>
            {t['catalog.subtitle'] || 'Browse our full range of electronics, components, and custom solutions.'}
          </p>
        </div>
        <div className={styles.heroGrid} aria-hidden="true">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className={styles.heroGridCell} />
          ))}
        </div>
      </div>

      {/* useSearchParams requires Suspense boundary in Next.js App Router */}
      <Suspense fallback={<div style={{ padding: '2rem', color: '#4ade80', opacity: 0.5 }}>Loading…</div>}>
        <CatalogInner />
      </Suspense>
    </div>
  );
};

export default ProductCatalog;