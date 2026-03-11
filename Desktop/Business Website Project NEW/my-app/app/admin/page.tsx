'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header/Header';
import styles from '@/app/admin/AdminPage.module.css';

/* ============================================================
   Placeholder Data
   ============================================================ */
const STATS = [
  {
    label: 'Total Revenue',
    value: '$—',
    delta: '+0.0%',
    dir: 'neutral',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    value: '—',
    delta: '+0',
    dir: 'neutral',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Customers',
    value: '—',
    delta: '+0',
    dir: 'neutral',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Products',
    value: '—',
    delta: '+0',
    dir: 'neutral',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

const ORDERS = [
  { id: '#ORD-0001', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'paid',      date: 'DD/MM/YYYY' },
  { id: '#ORD-0002', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'pending',   date: 'DD/MM/YYYY' },
  { id: '#ORD-0003', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'shipped',   date: 'DD/MM/YYYY' },
  { id: '#ORD-0004', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'paid',      date: 'DD/MM/YYYY' },
  { id: '#ORD-0005', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'cancelled', date: 'DD/MM/YYYY' },
];

const ACTIVITY = [
  { color: 'green',  text: <><strong>New order</strong> placed — awaiting confirmation.</>,          time: 'Just now' },
  { color: 'blue',   text: <><strong>Shipment</strong> dispatched for order #ORD-0003.</>,            time: '5m ago'   },
  { color: 'yellow', text: <><strong>Low stock</strong> alert on Product Name (Circuit Boards).</>,  time: '18m ago'  },
  { color: 'green',  text: <><strong>Payment received</strong> for order #ORD-0001.</>,              time: '1h ago'   },
  { color: 'red',    text: <><strong>Order #ORD-0005</strong> was cancelled by customer.</>,         time: '3h ago'   },
  { color: 'blue',   text: <><strong>New customer</strong> account registered.</>,                  time: '5h ago'   },
];

const INVENTORY = [
  { name: 'Product Name', category: 'Circuit Boards',          sku: 'SKU-001', stock: 0, max: 100, status: 'low'  },
  { name: 'Product Name', category: 'Microchips & Processors', sku: 'SKU-002', stock: 0, max: 100, status: 'low'  },
  { name: 'Product Name', category: 'Sensors & Components',    sku: 'SKU-003', stock: 0, max: 100, status: 'low'  },
  { name: 'Product Name', category: 'Development Kits',        sku: 'SKU-004', stock: 0, max: 100, status: 'low'  },
  { name: 'Product Name', category: 'Custom Solutions',        sku: 'SKU-005', stock: 0, max: 100, status: 'low'  },
  { name: 'Product Name', category: 'Bulk Orders',             sku: 'SKU-006', stock: 0, max: 100, status: 'low'  },
];

// Placeholder chart data (12 months)
const CHART_DATA = [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50];
const CHART_MAX  = Math.max(...CHART_DATA);
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type Section = 'dashboard' | 'orders' | 'products' | 'customers' | 'inventory' | 'settings';

/* ============================================================
   Status badge helper
   ============================================================ */
function StatusBadge({ status }: { status: string }) {
  const cls = {
    paid:      styles.statusPaid,
    pending:   styles.statusPending,
    shipped:   styles.statusShipped,
    cancelled: styles.statusCancelled,
  }[status] ?? styles.statusPending;
  return <span className={`${styles.statusBadge} ${cls}`}>{status}</span>;
}

/* ============================================================
   Main Admin Page
   ============================================================ */
const AdminPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard', label: 'Dashboard',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    },
    {
      id: 'orders', label: 'Orders',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    },
    {
      id: 'products', label: 'Products',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
    },
    {
      id: 'customers', label: 'Customers',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    },
    {
      id: 'inventory', label: 'Inventory',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>,
    },
    {
      id: 'settings', label: 'Settings',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>,
    },
  ];

  const dotClass: Record<string, string> = {
    green:  styles.activityDotGreen,
    yellow: styles.activityDotYellow,
    red:    styles.activityDotRed,
    blue:   styles.activityDotBlue,
  };

  return (
    <div className={styles.page}>
      <Header navOnly />

      <div className={styles.layout}>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Menu</p>
          <div className={styles.sidebarSection}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`${styles.sidebarBtn} ${activeSection === item.id ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <svg className={styles.sidebarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {/* Re-render via cloning trick — easier to just embed directly */}
                </svg>
                {item.icon && (
                  <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.sidebarDivider} />

          <p className={styles.sidebarLabel}>Account</p>
          <div className={styles.sidebarSection}>
            <button className={styles.sidebarBtn}>
              <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              Profile
            </button>
            <button className={styles.sidebarBtn}>
              <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className={styles.main}>

          {/* Page header */}
          <div className={styles.pageHeader}>
            <div className={styles.pageHeaderLeft}>
              <p className={styles.pageEyebrow}>// ADMIN</p>
              <h1 className={styles.pageTitle}>
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h1>
            </div>
            <div className={styles.pageActions}>
              <button className={styles.btnSecondary}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Export
              </button>
              <button className={styles.btnPrimary}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Add New
              </button>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <div key={i} className={styles.statCard} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className={styles.statCardTop}>
                  <span className={styles.statLabel}>{s.label}</span>
                  <div className={styles.statIconWrap}>{s.icon}</div>
                </div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={`${styles.statDelta} ${
                  s.dir === 'up' ? styles.statDeltaUp :
                  s.dir === 'down' ? styles.statDeltaDown :
                  styles.statDeltaNeutral
                }`}>
                  {s.dir === 'up' ? '↑' : s.dir === 'down' ? '↓' : '—'} {s.delta} vs last month
                </div>
              </div>
            ))}
          </div>

          {/* ── Revenue Chart + Activity ── */}
          <div className={styles.contentRow}>

            {/* Revenue chart */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Revenue Overview</span>
                <button className={styles.panelAction}>This Year ▾</button>
              </div>
              <div className={styles.panelBody}>
                <div className={styles.chartWrap}>
                  {CHART_DATA.map((val, i) => (
                    <div
                      key={i}
                      className={styles.chartBar}
                      style={{ height: `${(val / CHART_MAX) * 100}%` }}
                    >
                      <span className={styles.chartTooltip}>${val}k</span>
                    </div>
                  ))}
                </div>
                <div className={styles.chartLabels}>
                  {MONTHS.map(m => (
                    <span key={m} className={styles.chartLabel}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Recent Activity</span>
                <button className={styles.panelAction}>View all →</button>
              </div>
              <div className={styles.panelBody}>
                <div className={styles.activityList}>
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className={styles.activityItem}>
                      <div className={`${styles.activityDot} ${dotClass[a.color]}`} />
                      <p className={styles.activityText}>{a.text}</p>
                      <span className={styles.activityTime}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Orders table ── */}
          <div className={styles.fullPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Recent Orders</span>
              <button className={styles.panelAction}>View all →</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Order ID','Customer','Product','Amount','Status','Date'].map(h => (
                      <th key={h} className={styles.tableTh}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((o, i) => (
                    <tr key={i} className={styles.tableTr}>
                      <td className={styles.tableTd}><span className={styles.tableOrderId}>{o.id}</span></td>
                      <td className={styles.tableTd}><span className={styles.tableCustomer}>{o.customer}</span></td>
                      <td className={styles.tableTd}>{o.product}</td>
                      <td className={styles.tableTd}><span className={styles.tableAmount}>{o.amount}</span></td>
                      <td className={styles.tableTd}><StatusBadge status={o.status} /></td>
                      <td className={styles.tableTd}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Inventory table ── */}
          <div className={styles.fullPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Inventory Status</span>
              <button className={styles.panelAction}>Manage →</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Product','Category','SKU','Stock Level','Status'].map(h => (
                      <th key={h} className={styles.tableTh}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY.map((item, i) => {
                    const pct = item.max > 0 ? (item.stock / item.max) * 100 : 0;
                    const fillClass = pct < 20 ? styles.inventoryFillLow : pct < 50 ? styles.inventoryFillMid : styles.inventoryFill;
                    return (
                      <tr key={i} className={styles.tableTr}>
                        <td className={styles.tableTd}><span className={styles.tableCustomer}>{item.name}</span></td>
                        <td className={styles.tableTd}>{item.category}</td>
                        <td className={styles.tableTd}><span className={styles.tableOrderId}>{item.sku}</span></td>
                        <td className={styles.tableTd}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className={styles.inventoryBar}>
                              <div className={fillClass} style={{ width: `${pct}%` }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: '2rem' }}>
                              {item.stock}
                            </span>
                          </div>
                        </td>
                        <td className={styles.tableTd}>
                          <StatusBadge status={pct === 0 ? 'cancelled' : pct < 20 ? 'pending' : 'paid'} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminPage;