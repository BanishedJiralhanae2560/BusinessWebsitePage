'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

/* ── Types ── */
interface CartItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  qty: number;
  icon: string;
  inStock: boolean;
}

/* ── Mock data (replace with real Supabase fetch) ── */
const INITIAL_CART: CartItem[] = [
  {
    id: 'ci-001',
    name: 'ESP32-S3 Development Kit',
    description: 'Dual-core Xtensa LX7 · Wi-Fi + BT 5.0 · 8MB Flash',
    category: 'Dev Kits',
    price: 38.00,
    qty: 2,
    icon: '🛠️',
    inStock: true,
  },
  {
    id: 'ci-002',
    name: 'Bulk Resistor Kit (1000 pcs)',
    description: 'E24 series · 1% tolerance · Through-hole',
    category: 'Components',
    price: 24.99,
    qty: 1,
    icon: '📦',
    inStock: true,
  },
  {
    id: 'ci-003',
    name: 'STM32H7 Microcontroller',
    description: '480 MHz Cortex-M7 · LQFP-208 · 1MB SRAM',
    category: 'Microchips',
    price: 89.00,
    qty: 5,
    icon: '💻',
    inStock: true,
  },
  {
    id: 'ci-004',
    name: '4-Layer PCB Prototype — Custom',
    description: '100×80mm · ENIG finish · 1.6mm thickness',
    category: 'Circuit Boards',
    price: 156.00,
    qty: 1,
    icon: '🔌',
    inStock: false,
  },
];

const TAX_RATE   = 0.0875; // CA 8.75%
const SHIP_FLAT  = 18.00;
const FREE_SHIP  = 500;

/* ── Cart item row ── */
function CartRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: CartItem;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`${styles.cartRow} ${!item.inStock ? styles.cartRowOos : ''}`}>
      <div className={styles.cartIcon}>{item.icon}</div>

      <div className={styles.cartInfo}>
        <div className={styles.cartItemName}>{item.name}</div>
        <div className={styles.cartItemDesc}>{item.description}</div>
        <div className={styles.cartItemMeta}>
          <span className={styles.cartItemCategory}>{item.category}</span>
          {!item.inStock && <span className={styles.oosTag}>Out of Stock</span>}
        </div>
      </div>

      <div className={styles.cartControls}>
        {/* Quantity stepper */}
        <div className={styles.qtyWrapper}>
          <button
            className={styles.qtyBtn}
            onClick={() => onQtyChange(item.id, Math.max(1, item.qty - 1))}
            disabled={item.qty <= 1}
            aria-label="Decrease quantity"
          >−</button>
          <span className={styles.qtyVal}>{item.qty}</span>
          <button
            className={styles.qtyBtn}
            onClick={() => onQtyChange(item.id, item.qty + 1)}
            aria-label="Increase quantity"
          >+</button>
        </div>

        {/* Line total */}
        <div className={styles.lineTotal}>${(item.price * item.qty).toFixed(2)}</div>

        {/* Remove */}
        <button
          className={styles.removeBtn}
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function CartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/signup'); return; }
      setLoading(false);
    });
  }, [router]);

  const handleQtyChange = (id: string, qty: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePromo = () => {
    if (promoCode.toUpperCase() === 'TECH10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code.');
      setPromoApplied(false);
    }
  };

  // Totals
  const subtotal   = items.reduce((a, i) => a + i.price * i.qty, 0);
  const discount   = promoApplied ? subtotal * 0.1 : 0;
  const shipping   = subtotal >= FREE_SHIP ? 0 : SHIP_FLAT;
  const taxable    = subtotal - discount;
  const tax        = taxable * TAX_RATE;
  const total      = taxable + tax + shipping;
  const totalItems = items.reduce((a, i) => a + i.qty, 0);

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner} />
        <span>Loading cart…</span>
      </div>
    </div>
  );

  return (
    <>
      <Header navOnly={true} />
      <div className={styles.page}>

      {/* Hero */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Shopping Cart</p>
          <h1 className={styles.heroTitle}>My Cart</h1>
          <p className={styles.heroSub}>Review your items, adjust quantities, and proceed to checkout.</p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentWrap}>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <div className={styles.emptyTitle}>Your cart is empty</div>
            <div className={styles.emptySub}>Browse our products and add items to your cart.</div>
            <Link href="/products" className={styles.shopLink}>Browse Products →</Link>
          </div>
        ) : (
          <div className={styles.layout}>

            {/* Left — Cart items */}
            <div className={styles.cartMain}>
              <div className={styles.cartHeader}>
                <span className={styles.cartHeaderTitle}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
                <button className={styles.clearAllBtn} onClick={() => setItems([])}>
                  Clear all
                </button>
              </div>

              <div className={styles.cartList}>
                {items.map(item => (
                  <CartRow
                    key={item.id}
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Free shipping progress */}
              {shipping > 0 && (
                <div className={styles.shipProgress}>
                  <div className={styles.shipProgressText}>
                    Add <strong>${(FREE_SHIP - subtotal).toFixed(2)}</strong> more for free shipping
                  </div>
                  <div className={styles.shipProgressBar}>
                    <div
                      className={styles.shipProgressFill}
                      style={{ width: `${Math.min((subtotal / FREE_SHIP) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {shipping === 0 && (
                <div className={styles.freeShipBanner}>
                  🎉 You qualify for <strong>free shipping!</strong>
                </div>
              )}
            </div>

            {/* Right — Order summary */}
            <aside className={styles.summary}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>

                {/* Promo */}
                <div className={styles.promoRow}>
                  <input
                    className={styles.promoInput}
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handlePromo()}
                  />
                  <button className={styles.promoBtn} onClick={handlePromo}>Apply</button>
                </div>
                {promoApplied && (
                  <div className={styles.promoSuccess}>✓ TECH10 applied — 10% off!</div>
                )}
                {promoError && (
                  <div className={styles.promoErrorMsg}>{promoError}</div>
                )}

                <div className={styles.summaryDivider} />

                {/* Line items */}
                <div className={styles.summaryLines}>
                  <div className={styles.summaryLine}>
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className={`${styles.summaryLine} ${styles.summaryLineDiscount}`}>
                      <span>Discount (10%)</span>
                      <span>−${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.summaryLine}>
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className={styles.freeTag}>FREE</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className={styles.summaryLine}>
                    <span>Tax (CA 8.75%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button className={styles.checkoutBtn}>
                  Proceed to Checkout →
                </button>

                <p className={styles.summaryNote}>
                  Secure checkout · SSL encrypted
                </p>

                <div className={styles.summaryDivider} />

                <Link href="/products" className={styles.continueShopping}>
                  ← Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
    </>
  );
}