'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/products/ProductCatalog.module.css';
import Header from '@/app/components/Header/Header';
import { useLanguage } from '@/app/components/Header/LanguageContext';

/* ============================================================
   Types
   ============================================================ */
interface CatalogProduct {
  id:            number;
  name:          string;
  category:      string;
  price:         number;
  originalPrice: number;
  rating:        number;
  reviewCount:   number;
  badge?:        'NEW' | 'SALE' | 'HOT' | 'LOW STOCK';
  inStock:       boolean;
  description:   string;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

/* ============================================================
   Placeholder Product Data
   ============================================================ */
const ALL_PRODUCTS: CatalogProduct[] = [
  { id: 1,  name: 'Product Name', category: 'Circuit Boards',          price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: 'NEW',       inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 2,  name: 'Product Name', category: 'Microchips & Processors', price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: 'SALE',      inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 3,  name: 'Product Name', category: 'Sensors & Components',    price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: 'HOT',       inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 4,  name: 'Product Name', category: 'Development Kits',        price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: undefined,   inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 5,  name: 'Product Name', category: 'Custom Solutions',        price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: 'LOW STOCK', inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 6,  name: 'Product Name', category: 'Bulk Orders',             price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: undefined,   inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 7,  name: 'Product Name', category: 'Microchips & Processors', price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: 'NEW',       inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 8,  name: 'Product Name', category: 'Microchips & Processors', price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: undefined,   inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 9,  name: 'Product Name', category: 'Microchips & Processors', price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: undefined,   inStock: false, description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 10, name: 'Product Name', category: 'Circuit Boards',          price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: 'SALE',      inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 11, name: 'Product Name', category: 'Sensors & Components',    price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: undefined,   inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
  { id: 12, name: 'Product Name', category: 'Bulk Orders',             price: 0.00, originalPrice: 0.00, rating: 0, reviewCount: 0, badge: undefined,   inStock: true,  description: 'Short product description goes here. Highlight key features or benefits in one to two sentences.' },
];

const CATEGORIES = ['All', ...Array.from(new Set(ALL_PRODUCTS.map(p => p.category)))];

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
            : (t['catalog.reviews_none'] || '— reviews')}
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
              ? (t['catalog.view']        || 'View →')
              : (t['catalog.unavailable'] || 'Unavailable')}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Main Page
   ============================================================ */
const MicrochipsPage: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState('Microchips & Processors'); // ← pre-selected
  const [sortBy,         setSortBy]         = useState<SortOption>('featured');
  const [inStockOnly,    setInStockOnly]    = useState(false);
  const [sortOpen,       setSortOpen]       = useState(false);

  const SORT_LABELS: Record<SortOption, string> = {
    featured:     t['catalog.sort.featured']   || 'Featured',
    'price-asc':  t['catalog.sort.price_asc']  || 'Price: Low → High',
    'price-desc': t['catalog.sort.price_desc'] || 'Price: High → Low',
    rating:       t['catalog.sort.rating']     || 'Top Rated',
    newest:       t['catalog.sort.newest']     || 'Newest',
  };

  const CAT_LABELS: Record<string, string> = {
    'All':                     t['catalog.cat.all']           || 'All',
    'Circuit Boards':          t['catalog.cat.circuit_boards']|| 'Circuit Boards',
    'Microchips & Processors': t['catalog.cat.microchips']    || 'Microchips & Processors',
    'Sensors & Components':    t['catalog.cat.sensors']       || 'Sensors & Components',
    'Development Kits':        t['catalog.cat.dev_kits']      || 'Development Kits',
    'Custom Solutions':        t['catalog.cat.custom']        || 'Custom Solutions',
    'Bulk Orders':             t['catalog.cat.bulk']          || 'Bulk Orders',
  };

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];
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
      case 'price-asc':  list.sort((a, b) => a.price - b.price);            break;
      case 'price-desc': list.sort((a, b) => b.price - a.price);            break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating);          break;
      case 'newest':     list.sort((a, b) => b.id - a.id);                  break;
      default:           list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
    return list;
  }, [search, activeCategory, sortBy, inStockOnly]);

  const handleProductClick = (id: number) => router.push(`/products/${id}`);

  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>{t['catalog.eyebrow.microchips'] || '// MICROCHIPS & PROCESSORS'}</p>
          <h1 className={styles.heroTitle}>{t['catalog.title.microchips'] || 'Microchips & Processors'}</h1>
          <p className={styles.heroSub}>
            {t['catalog.subtitle'] || 'High-performance microchips and processors coming soon. Placeholder listings are shown below — real products will appear here once available.'}
          </p>
        </div>
        <div className={styles.heroGrid} aria-hidden="true">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className={styles.heroGridCell} />
          ))}
        </div>
      </div>

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

      {/* ── Category Tabs — Microchips & Processors pre-selected ── */}
      <div className={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.catTab} ${activeCategory === cat ? styles.catTabActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CAT_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* ── Product Grid ── */}
      <main className={styles.main}>
        {filtered.length > 0 ? (
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
            <p className={styles.emptyText}>
              {t['catalog.no_results'] || 'No products match your filters.'}
            </p>
            <button
              className={styles.emptyReset}
              onClick={() => { setSearch(''); setActiveCategory('Microchips & Processors'); setInStockOnly(false); }}
            >
              {t['catalog.reset'] || 'Reset filters'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MicrochipsPage;