"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/components/Header/Header';
import { useLanguage } from '@/app/components/Header/LanguageContext';
import { CatalogProduct, fetchCatalogProducts } from '@/app/products/productsApi';
import styles from './product.module.css';

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'Circuit Boards': 'Circuitboards',
  'Microchips & Processors': 'Microchips',
  'Sensors & Components': 'Sensors',
  'Development Kits': 'Devkits',
  'Custom Solutions': 'Custom',
  'Bulk Orders': 'Bulkorders',
};

/* ============================================================
   Helpers
   ============================================================ */
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24">
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

/* ============================================================
   Main Page
   ============================================================ */
export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const id = typeof idParam === 'string' ? idParam : Array.isArray(idParam) ? idParam[0] : undefined;
  if (!id) {
    // Show a simple fallback while params resolve
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading…</p>
      </div>
    );
  }
  const { t }   = useLanguage();

  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [qty, setQty]         = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addedCart, setAddedCart] = useState(false);
  const [wished, setWished]       = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchCatalogProducts()
      .then(products => {
        if (!mounted) return;
        const found = products.find(p => p.id === Number(id));
        if (found) {
          setProduct(found);
        } else {
          setError('Product not found.');
        }
      })
      .catch(err => {
        if (!mounted) return;
        setError(err?.message || 'Unable to load product.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [id]);

  const IMAGES = [0, 1, 2, 3];

  if (loading) {
    return (
      <div className={styles.page}>
        <Header navOnly />
        <div className={styles.notFound}>
          <p className={styles.notFoundText}>Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className={styles.page}>
        <Header navOnly />
        <div className={styles.notFound}>
          <p className={styles.notFoundCode}>404</p>
          <p className={styles.notFoundText}>{error || 'Product not found.'}</p>
          <button className={styles.backBtn} onClick={() => router.push('/products')}>
            ← Back to catalog
          </button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice > product.price;
  const discount    = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const categorySlug = CATEGORY_SLUG_MAP[product.category];

  const handleAddToCart = () => {
    if (!product.inStock) return;
    setAddedCart(true);
    setTimeout(() => setAddedCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    router.push(`/checkout?productId=${product.id}&qty=${qty}`);
  };

  return (
    <div className={styles.page}>
      <Header navOnly />

      {/* ── Main layout ── */}
      <main className={styles.main}>

        {/* LEFT — Image Gallery */}
        <section className={styles.gallery}>
          <div className={styles.mainImgWrap}>
            <div className={styles.scanlines} aria-hidden="true" />
            <svg className={styles.mainImgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            {product.badge && (
              <span className={`${styles.badge} ${styles[`badge${product.badge.replace(' ', '')}`]}`}>
                {product.badge}
              </span>
            )}
            {hasDiscount && <span className={styles.discountPill}>−{discount}%</span>}
            {!product.inStock && (
              <div className={styles.outOfStockOverlay}>Out of Stock</div>
            )}
          </div>

          <div className={styles.thumbRow}>
            {IMAGES.map(i => (
              <button
                key={i}
                className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
              >
                <div className={styles.thumbInner}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" opacity="0.4">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* RIGHT — Product Info */}
        <section className={styles.info}>
          <p className={styles.infoCategory}>{product.category}</p>
          <h1 className={styles.infoName}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <StarRating rating={product.rating} size={18} />
            <span className={styles.ratingScore}>
              {product.rating > 0 ? product.rating.toFixed(1) : '—'}
            </span>
            <span className={styles.reviewCount}>
              ({product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'no reviews yet'})
            </span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>
              {product.price > 0 ? `$${product.price.toFixed(2)}` : 'Price TBD'}
            </span>
            {hasDiscount && (
              <>
                <span className={styles.priceOrig}>${product.originalPrice.toFixed(2)}</span>
                <span className={styles.savePill}>Save {discount}%</span>
              </>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.divider} />

          {/* Quantity */}
          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>Quantity</span>
            <div className={styles.qtyControl}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >−</button>
              <span className={styles.qtyValue}>{qty}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQty(q => q + 1)}
                disabled={!product.inStock}
                aria-label="Increase quantity"
              >+</button>
            </div>
          </div>

          <p className={`${styles.stockStatus} ${product.inStock ? styles.inStock : styles.outOfStock}`}>
            {product.inStock ? '● In Stock' : '● Out of Stock'}
          </p>

          {/* CTAs */}
          <div className={styles.ctaRow}>
            <button className={styles.buyBtn} onClick={handleBuyNow} disabled={!product.inStock}>
              Buy Now
            </button>
            <button
              className={`${styles.cartBtn} ${addedCart ? styles.cartBtnAdded : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {addedCart ? '✓ Added!' : 'Add to Cart'}
            </button>
            <button
              className={`${styles.wishBtn} ${wished ? styles.wishBtnActive : ''}`}
              onClick={() => setWished(w => !w)}
              aria-label="Add to wishlist"
            >
              <svg fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>

          <div className={styles.divider} />

          {/* Meta */}
          <dl className={styles.metaList}>
            <div className={styles.metaRow}>
              <dt className={styles.metaKey}>Category</dt>
              <dd className={styles.metaVal}>{product.category}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaKey}>SKU</dt>
              <dd className={styles.metaVal}>PRD-{String(product.id).padStart(4, '0')}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaKey}>Availability</dt>
              <dd className={styles.metaVal}>{product.inStock ? 'In Stock' : 'Out of Stock'}</dd>
            </div>
          </dl>
        </section>
      </main>

      <div className={styles.backRow}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← Back
        </button>
      </div>
    </div>
  );
}