'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';

/* ── Types ── */
type OrderStatus = 'delivered' | 'transit' | 'processing' | 'cancelled';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  icon: string;
  tracking?: string;
}

/* ── Mock data (replace with real Supabase fetch) ── */
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-0091',
    date: 'Apr 18, 2026',
    status: 'transit',
    total: 284.00,
    icon: '🔌',
    tracking: '1Z999AA10123456784',
    items: [
      { name: 'Custom Circuit Board — Rev 3', qty: 1, price: 284.00 },
    ],
  },
  {
    id: 'ORD-2026-0088',
    date: 'Apr 12, 2026',
    status: 'delivered',
    total: 639.00,
    icon: '💻',
    items: [
      { name: 'ARM Cortex-M7 Dev Kit', qty: 2, price: 319.50 },
    ],
  },
  {
    id: 'ORD-2026-0079',
    date: 'Mar 30, 2026',
    status: 'delivered',
    total: 412.50,
    icon: '📡',
    items: [
      { name: 'MEMS IMU Sensor Array', qty: 50, price: 8.25 },
    ],
  },
  {
    id: 'ORD-2026-0071',
    date: 'Mar 15, 2026',
    status: 'processing',
    total: 1200.00,
    icon: '⚙️',
    items: [
      { name: 'Custom Enclosure', qty: 100, price: 12.00 },
    ],
  },
  {
    id: 'ORD-2026-0058',
    date: 'Feb 28, 2026',
    status: 'delivered',
    total: 89.00,
    icon: '🛠️',
    items: [
      { name: 'ESP32-S3 Dev Kit', qty: 1, price: 89.00 },
    ],
  },
  {
    id: 'ORD-2026-0044',
    date: 'Feb 10, 2026',
    status: 'cancelled',
    total: 56.50,
    icon: '📦',
    items: [
      { name: 'Bulk Resistor Kit', qty: 2, price: 28.25 },
    ],
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  delivered:  { label: 'Delivered',  cls: 'statusDelivered'  },
  transit:    { label: 'In Transit', cls: 'statusTransit'    },
  processing: { label: 'Processing', cls: 'statusProcessing' },
  cancelled:  { label: 'Cancelled',  cls: 'statusCancelled'  },
};

const FILTER_TABS = ['All', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];

/* ── Expanded order row ── */
function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className={`${styles.orderCard} ${expanded ? styles.orderCardExpanded : ''}`}>
      {/* Main row */}
      <button
        className={styles.orderMain}
        onClick={() => setExpanded(p => !p)}
        aria-expanded={expanded}
      >
        <div className={styles.orderIcon}>{order.icon}</div>

        <div className={styles.orderInfo}>
          <div className={styles.orderName}>{order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}</div>
          <div className={styles.orderMeta}>{order.id} · {order.date}</div>
        </div>

        <div className={styles.orderMiddle}>
          <span className={`${styles.statusBadge} ${styles[cfg.cls]}`}>{cfg.label}</span>
        </div>

        <div className={styles.orderRight}>
          <div className={styles.orderPrice}>${order.total.toFixed(2)}</div>
          <div className={styles.orderItems}>{order.items.reduce((a, i) => a + i.qty, 0)} item{order.items.reduce((a, i) => a + i.qty, 0) !== 1 ? 's' : ''}</div>
        </div>

        <svg
          className={`${styles.expandChevron} ${expanded ? styles.expandChevronOpen : ''}`}
          width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className={styles.orderDetail}>
          <div className={styles.orderDetailDivider} />

          <div className={styles.orderDetailInner}>
            {/* Items table */}
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Items</div>
              {order.items.map((item, i) => (
                <div key={i} className={styles.detailItemRow}>
                  <span className={styles.detailItemName}>{item.name}</span>
                  <span className={styles.detailItemQty}>×{item.qty}</span>
                  <span className={styles.detailItemPrice}>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Tracking */}
            {order.tracking && (
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Tracking</div>
                <div className={styles.trackingCode}>{order.tracking}</div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.detailActions}>
              {order.status === 'delivered' && (
                <button className={styles.actionBtn}>Reorder</button>
              )}
              {(order.status === 'transit' || order.status === 'processing') && (
                <button className={`${styles.actionBtn} ${styles.actionBtnOutline}`}>Cancel Order</button>
              )}
              <button className={`${styles.actionBtn} ${styles.actionBtnGhost}`}>View Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page ── */
export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/signup'); return; }
      setLoading(false);
    });
  }, [router]);

  const filtered = MOCK_ORDERS.filter(o => {
    const statusMatch =
      activeFilter === 'All' ||
      STATUS_CONFIG[o.status].label === activeFilter ||
      (activeFilter === 'In Transit' && o.status === 'transit');
    const searchMatch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const totalSpent = MOCK_ORDERS
    .filter(o => o.status === 'delivered')
    .reduce((a, o) => a + o.total, 0);

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner} />
        <span>Loading orders…</span>
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
          <p className={styles.heroEyebrow}>Purchase History</p>
          <h1 className={styles.heroTitle}>My Orders</h1>
          <p className={styles.heroSub}>Track, review, and manage all your past and active orders.</p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentWrap}>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{MOCK_ORDERS.length}</span>
            <span className={styles.statLabel}>Total Orders</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{MOCK_ORDERS.filter(o => o.status === 'delivered').length}</span>
            <span className={styles.statLabel}>Delivered</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{MOCK_ORDERS.filter(o => o.status === 'transit' || o.status === 'processing').length}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statNum} ${styles.statNumAccent}`}>${totalSpent.toFixed(2)}</span>
            <span className={styles.statLabel}>Total Spent</span>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Search */}
          <div className={styles.searchBar}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search by order ID or product…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Filter tabs */}
          <div className={styles.filterTabs}>
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                className={`${styles.filterTab} ${activeFilter === tab ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
                {tab === 'All' && <span className={styles.filterCount}>{MOCK_ORDERS.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className={styles.resultCount}>
          Showing {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <div className={styles.emptyTitle}>No orders found</div>
            <div className={styles.emptySub}>Try adjusting your search or filter.</div>
            <button className={styles.emptyReset} onClick={() => { setSearch(''); setActiveFilter('All'); }}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filtered.map(order => <OrderRow key={order.id} order={order} />)}
          </div>
        )}

      </div>
    </div>
    </>
  );
}