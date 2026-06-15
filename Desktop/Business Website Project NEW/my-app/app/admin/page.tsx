'use client';
import { createClient } from '@/lib/supabase/client';
import { BlogSection } from '@/app/admin/AdminBlogSection';
import ProductSection from '@/app/admin/AdminProductSection';
import { SignOutButton } from '@/app/admin/SignOutButton';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header/Header';
import styles from '@/app/admin/AdminPage.module.css';

/* ============================================================
   Placeholder Data
   ============================================================ */
const STATS = [
  {
    label: 'Total Revenue', value: '$—', delta: '+0.0%', dir: 'neutral',
    icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  },
  {
    label: 'Orders', value: '—', delta: '+0', dir: 'neutral',
    icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
  },
  {
    label: 'Customers', value: '—', delta: '+0', dir: 'neutral',
    icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  },
  {
    label: 'Products', value: '—', delta: '+0', dir: 'neutral',
    icon: (<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>),
  },
];

const ORDERS = [
  { id: '#ORD-0001', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'paid',      date: 'DD/MM/YYYY' },
  { id: '#ORD-0002', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'pending',   date: 'DD/MM/YYYY' },
  { id: '#ORD-0003', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'shipped',   date: 'DD/MM/YYYY' },
  { id: '#ORD-0004', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'paid',      date: 'DD/MM/YYYY' },
  { id: '#ORD-0005', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'cancelled', date: 'DD/MM/YYYY' },
  { id: '#ORD-0006', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'shipped',   date: 'DD/MM/YYYY' },
  { id: '#ORD-0007', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'pending',   date: 'DD/MM/YYYY' },
  { id: '#ORD-0008', customer: 'Customer Name', product: 'Product Name', amount: '$—', status: 'paid',      date: 'DD/MM/YYYY' },
];

const PRODUCTS_DATA = [
  { id: 'SAMPLE-A', name: 'Circuit Board Alpha',      category: 'Circuit Boards',          sku: 'SKU-001', price: '$49.99',  stock: 0,  status: 'active'   },
  { id: 'SAMPLE-B', name: 'Microchip X-Series',       category: 'Microchips & Processors', sku: 'SKU-002', price: '$89.99',  stock: 0,  status: 'active'   },
  { id: 'SAMPLE-C', name: 'Sensor Array Kit',         category: 'Sensors & Components',    sku: 'SKU-003', price: '$34.99',  stock: 0,  status: 'active'   },
  { id: 'SAMPLE-D', name: 'Dev Kit Pro',              category: 'Development Kits',        sku: 'SKU-004', price: '$129.99', stock: 0,  status: 'active'   },
  { id: 'SAMPLE-E', name: 'Bulk Resistor Pack',       category: 'Bulk Orders',             sku: 'SKU-005', price: '$19.99',  stock: 0,  status: 'active'   },
  { id: 'SAMPLE-F', name: 'Custom PCB Module',        category: 'Custom Solutions',        sku: 'SKU-006', price: '$249.99', stock: 0,  status: 'inactive' },
  { id: 'SAMPLE-G', name: 'GPIO Expander Chip',       category: 'Microchips & Processors', sku: 'SKU-007', price: '$12.99',  stock: 0,  status: 'active'   },
  { id: 'SAMPLE-H', name: 'Temperature Sensor TH-1', category: 'Sensors & Components',    sku: 'SKU-008', price: '$8.99',   stock: 0,  status: 'active'   },
];

const CUSTOMERS_DATA = [
  { id: 'CUS-001', name: 'Customer Name', email: 'customer@email.com', orders: 0, spent: '$—', joined: 'DD/MM/YYYY', status: 'active'   },
  { id: 'CUS-002', name: 'Customer Name', email: 'customer@email.com', orders: 0, spent: '$—', joined: 'DD/MM/YYYY', status: 'active'   },
  { id: 'CUS-003', name: 'Customer Name', email: 'customer@email.com', orders: 0, spent: '$—', joined: 'DD/MM/YYYY', status: 'inactive' },
  { id: 'CUS-004', name: 'Customer Name', email: 'customer@email.com', orders: 0, spent: '$—', joined: 'DD/MM/YYYY', status: 'active'   },
  { id: 'CUS-005', name: 'Customer Name', email: 'customer@email.com', orders: 0, spent: '$—', joined: 'DD/MM/YYYY', status: 'active'   },
  { id: 'CUS-006', name: 'Customer Name', email: 'customer@email.com', orders: 0, spent: '$—', joined: 'DD/MM/YYYY', status: 'inactive' },
];

const INVENTORY = [
  { name: 'Circuit Board Alpha',      category: 'Circuit Boards',          sku: 'SKU-001', stock: 18, max: 100, reorder: 20, location: 'Main warehouse',    notes: 'Fast-moving item used in prototyping kits.' },
  { name: 'Microchip X-Series',       category: 'Microchips & Processors', sku: 'SKU-002', stock: 6,  max: 100, reorder: 15, location: 'East hub',          notes: 'High demand for embedded systems.' },
  { name: 'Sensor Array Kit',         category: 'Sensors & Components',    sku: 'SKU-003', stock: 12, max: 100, reorder: 25, location: 'Main warehouse',    notes: 'Popular for monitoring assemblies.' },
  { name: 'Dev Kit Pro',              category: 'Development Kits',        sku: 'SKU-004', stock: 3,  max: 100, reorder: 10, location: 'Secondary warehouse', notes: 'Premium kit with extended lead time.' },
  { name: 'Custom PCB Module',        category: 'Custom Solutions',        sku: 'SKU-005', stock: 0,  max: 100, reorder: 20, location: 'East hub',          notes: 'Awaiting supplier restock.' },
  { name: 'Bulk Resistor Pack',       category: 'Bulk Orders',             sku: 'SKU-006', stock: 42, max: 100, reorder: 30, location: 'Main warehouse',    notes: 'Always kept in stock for fast shipments.' },
];

type InventoryItem = {
  name: string;
  category: string;
  sku: string;
  stock: number;
  max: number;
  reorder: number;
  location: string;
  notes: string;
};

type InventoryForm = {
  name: string;
  category: string;
  sku: string;
  stock: string;
  max: string;
  reorder: string;
  location: string;
  notes: string;
};

const ACTIVITY = [
  { color: 'green',  text: <><strong>New order</strong> placed — awaiting confirmation.</>,         time: 'Just now' },
  { color: 'blue',   text: <><strong>Shipment</strong> dispatched for order #ORD-0003.</>,           time: '5m ago'   },
  { color: 'yellow', text: <><strong>Low stock</strong> alert on Product Name (Circuit Boards).</>, time: '18m ago'  },
  { color: 'green',  text: <><strong>Payment received</strong> for order #ORD-0001.</>,             time: '1h ago'   },
  { color: 'red',    text: <><strong>Order #ORD-0005</strong> was cancelled by customer.</>,        time: '3h ago'   },
  { color: 'blue',   text: <><strong>New customer</strong> account registered.</>,                 time: '5h ago'   },
];

const CHART_DATA = [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50];
const CHART_MAX  = Math.max(...CHART_DATA);
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type Section = 'dashboard' | 'orders' | 'products' | 'customers' | 'inventory' | 'settings' | 'blog' | 'profile';

/* ============================================================
   Helpers
   ============================================================ */
function StatusBadge({ status }: { status: string }) {
  const cls = {
    paid:      styles.statusPaid,
    pending:   styles.statusPending,
    shipped:   styles.statusShipped,
    cancelled: styles.statusCancelled,
    active:    styles.statusPaid,
    inactive:  styles.statusCancelled,
  }[status] ?? styles.statusPending;
  return <span className={`${styles.statusBadge} ${cls}`}>{status}</span>;
}

function SectionHeader({ title, eyebrow, actions }: { title: string; eyebrow: string; actions?: React.ReactNode }) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderLeft}>
        <p className={styles.pageEyebrow}>{eyebrow}</p>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </div>
  );
}

function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className={styles.searchBar}>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
      </svg>
      <input type="text" placeholder={placeholder} className={styles.searchInput} />
    </div>
  );
}

/* ============================================================
   Section: Orders
   ============================================================ */
function OrdersSection() {
  const ORDER_STATS = [
    { label: 'Total Orders', value: '—', sub: 'All time' },
    { label: 'Pending',      value: '—', sub: 'Awaiting processing' },
    { label: 'Shipped',      value: '—', sub: 'In transit' },
    { label: 'Cancelled',    value: '—', sub: 'This month' },
  ];

  return (
    <>
      <SectionHeader
        eyebrow="// ORDERS"
        title="Orders"
        actions={
          <>
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
              New Order
            </button>
          </>
        }
      />

      {/* Mini stat row */}
      <div className={styles.miniStatsRow}>
        {ORDER_STATS.map((s, i) => (
          <div key={i} className={styles.miniStatCard}>
            <p className={styles.miniStatValue}>{s.value}</p>
            <p className={styles.miniStatLabel}>{s.label}</p>
            <p className={styles.miniStatSub}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <SearchBar placeholder="Search orders…" />
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect}>
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Shipped</option>
            <option>Cancelled</option>
          </select>
          <select className={styles.filterSelect}>
            <option>All Time</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* Orders table */}
      <div className={styles.fullPanel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>All Orders</span>
          <span className={styles.panelMeta}>— orders total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Order ID','Customer','Product','Amount','Status','Date','Actions'].map(h => (
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
                  <td className={styles.tableTd}>
                    <div className={styles.tableActions}>
                      <button className={styles.tableActionBtn}>View</button>
                      <button className={styles.tableActionBtn}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tablePagination}>
          <span className={styles.paginationInfo}>Showing 1–8 of — orders</span>
          <div className={styles.paginationBtns}>
            <button className={styles.paginationBtn}>← Prev</button>
            <button className={`${styles.paginationBtn} ${styles.paginationBtnActive}`}>1</button>
            <button className={styles.paginationBtn}>2</button>
            <button className={styles.paginationBtn}>3</button>
            <button className={styles.paginationBtn}>Next →</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Section: Products
   ============================================================ */
function ProductsSection() {
  const PRODUCT_STATS = [
    { label: 'Total Products', value: '—',  sub: 'In catalogue' },
    { label: 'Active',         value: '—',  sub: 'Live listings' },
    { label: 'Out of Stock',   value: '—',  sub: 'Need restocking' },
    { label: 'Categories',     value: '6',  sub: 'Product types' },
  ];

  return (
    <>
      <SectionHeader
        eyebrow="// PRODUCTS"
        title="Products"
        actions={
          <>
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
              Add Product
            </button>
          </>
        }
      />

      <div className={styles.miniStatsRow}>
        {PRODUCT_STATS.map((s, i) => (
          <div key={i} className={styles.miniStatCard}>
            <p className={styles.miniStatValue}>{s.value}</p>
            <p className={styles.miniStatLabel}>{s.label}</p>
            <p className={styles.miniStatSub}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className={styles.filterRow}>
        <SearchBar placeholder="Search products…" />
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect}>
            <option>All Categories</option>
            <option>Circuit Boards</option>
            <option>Microchips & Processors</option>
            <option>Sensors & Components</option>
            <option>Development Kits</option>
            <option>Custom Solutions</option>
            <option>Bulk Orders</option>
          </select>
          <select className={styles.filterSelect}>
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      <div className={styles.fullPanel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>All Products</span>
          <span className={styles.panelMeta}>— products total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['ID','Name','Category','SKU','Price','Stock','Status','Actions'].map(h => (
                  <th key={h} className={styles.tableTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS_DATA.map((p, i) => (
                <tr key={i} className={styles.tableTr}>
                  <td className={styles.tableTd}><span className={styles.tableOrderId}>{p.id}</span></td>
                  <td className={styles.tableTd}><span className={styles.tableCustomer}>{p.name}</span></td>
                  <td className={styles.tableTd}>{p.category}</td>
                  <td className={styles.tableTd}><span className={styles.tableOrderId}>{p.sku}</span></td>
                  <td className={styles.tableTd}><span className={styles.tableAmount}>{p.price}</span></td>
                  <td className={styles.tableTd}>{p.stock}</td>
                  <td className={styles.tableTd}><StatusBadge status={p.status} /></td>
                  <td className={styles.tableTd}>
                    <div className={styles.tableActions}>
                      <button className={styles.tableActionBtn}>Edit</button>
                      <button className={`${styles.tableActionBtn} ${styles.tableActionBtnDanger}`}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tablePagination}>
          <span className={styles.paginationInfo}>Showing 1–8 of — products</span>
          <div className={styles.paginationBtns}>
            <button className={styles.paginationBtn}>← Prev</button>
            <button className={`${styles.paginationBtn} ${styles.paginationBtnActive}`}>1</button>
            <button className={styles.paginationBtn}>2</button>
            <button className={styles.paginationBtn}>Next →</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Section: Customers
   ============================================================ */
function CustomersSection() {
  const CUSTOMER_STATS = [
    { label: 'Total Customers', value: '—', sub: 'Registered accounts' },
    { label: 'Active',          value: '—', sub: 'Last 30 days' },
    { label: 'New This Month',  value: '—', sub: 'Recent signups' },
    { label: 'Avg. Order Value',value: '$—', sub: 'Per customer' },
  ];

  return (
    <>
      <SectionHeader
        eyebrow="// CUSTOMERS"
        title="Customers"
        actions={
          <>
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
              Add Customer
            </button>
          </>
        }
      />

      <div className={styles.miniStatsRow}>
        {CUSTOMER_STATS.map((s, i) => (
          <div key={i} className={styles.miniStatCard}>
            <p className={styles.miniStatValue}>{s.value}</p>
            <p className={styles.miniStatLabel}>{s.label}</p>
            <p className={styles.miniStatSub}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className={styles.filterRow}>
        <SearchBar placeholder="Search customers…" />
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect}>
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select className={styles.filterSelect}>
            <option>Sort by: Newest</option>
            <option>Sort by: Most Orders</option>
            <option>Sort by: Highest Spend</option>
          </select>
        </div>
      </div>

      <div className={styles.fullPanel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>All Customers</span>
          <span className={styles.panelMeta}>— customers total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['ID','Name','Email','Orders','Total Spent','Joined','Status','Actions'].map(h => (
                  <th key={h} className={styles.tableTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS_DATA.map((c, i) => (
                <tr key={i} className={styles.tableTr}>
                  <td className={styles.tableTd}><span className={styles.tableOrderId}>{c.id}</span></td>
                  <td className={styles.tableTd}><span className={styles.tableCustomer}>{c.name}</span></td>
                  <td className={styles.tableTd}>{c.email}</td>
                  <td className={styles.tableTd}>{c.orders}</td>
                  <td className={styles.tableTd}><span className={styles.tableAmount}>{c.spent}</span></td>
                  <td className={styles.tableTd}>{c.joined}</td>
                  <td className={styles.tableTd}><StatusBadge status={c.status} /></td>
                  <td className={styles.tableTd}>
                    <div className={styles.tableActions}>
                      <button className={styles.tableActionBtn}>View</button>
                      <button className={`${styles.tableActionBtn} ${styles.tableActionBtnDanger}`}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tablePagination}>
          <span className={styles.paginationInfo}>Showing 1–6 of — customers</span>
          <div className={styles.paginationBtns}>
            <button className={styles.paginationBtn}>← Prev</button>
            <button className={`${styles.paginationBtn} ${styles.paginationBtnActive}`}>1</button>
            <button className={styles.paginationBtn}>2</button>
            <button className={styles.paginationBtn}>Next →</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Section: Inventory
   ============================================================ */
function InventorySection() {
  const INVENTORY_CATEGORIES = [
    'Circuit Boards',
    'Microchips & Processors',
    'Sensors & Components',
    'Development Kits',
    'Custom Solutions',
    'Bulk Orders',
  ];

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INVENTORY);
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list');
  const [editSku, setEditSku] = useState<string | null>(null);
  const [form, setForm] = useState<InventoryForm>({
    name: '', category: 'Circuit Boards', sku: '', stock: '0', max: '100', reorder: '20',
    location: 'Main warehouse', notes: '',
  });
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const totalUnits = inventoryItems.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = inventoryItems.filter(item => item.stock > 0 && item.stock <= item.reorder).length;
  const outOfStockCount = inventoryItems.filter(item => item.stock === 0).length;

  const getStockStatus = (stock: number, reorder: number) => {
    if (stock === 0) return { label: 'Out of stock', badge: 'cancelled' };
    if (stock <= reorder) return { label: 'Low stock', badge: 'pending' };
    return { label: 'In stock', badge: 'active' };
  };

  const openNew = () => {
    setForm({
      name: '', category: 'Circuit Boards', sku: '', stock: '0', max: '100', reorder: '20',
      location: 'Main warehouse', notes: '',
    });
    setEditSku(null);
    setView('new');
    setFeedback('');
    setIsDirty(false);
    setShowPreview(true);
  };

  const openEdit = (item: InventoryItem) => {
    setForm({
      name: item.name,
      category: item.category,
      sku: item.sku,
      stock: String(item.stock),
      max: String(item.max),
      reorder: String(item.reorder),
      location: item.location,
      notes: item.notes,
    });
    setEditSku(item.sku);
    setView('edit');
    setFeedback('');
    setIsDirty(false);
    setShowPreview(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const stock = Number(form.stock);
    const max = Number(form.max);
    const reorder = Number(form.reorder);

    if (!form.name.trim()) { setFeedback('Item name is required.'); return; }
    if (!form.sku.trim()) { setFeedback('SKU is required.'); return; }
    if (Number.isNaN(stock) || stock < 0) { setFeedback('Stock must be a positive number.'); return; }
    if (Number.isNaN(max) || max < 0) { setFeedback('Maximum quantity must be a positive number.'); return; }
    if (Number.isNaN(reorder) || reorder < 0) { setFeedback('Reorder point must be a positive number.'); return; }
    if (inventoryItems.some(item => item.sku === form.sku.trim() && item.sku !== editSku)) {
      setFeedback('That SKU already exists.');
      return;
    }

    setSaving(true);
    const item: InventoryItem = {
      name: form.name.trim(),
      category: form.category,
      sku: form.sku.trim(),
      stock,
      max,
      reorder,
      location: form.location.trim(),
      notes: form.notes.trim(),
    };

    setInventoryItems(prev => {
      if (editSku) {
        return prev.map(entry => (entry.sku === editSku ? item : entry));
      }
      return [item, ...prev];
    });

    setSaving(false);
    setIsDirty(false);
    setLastSaved(new Date());
    setFeedback('✓ Inventory item saved.');
    setView('list');
  };

  const handleSaveDraft = () => {
    if (!form.name.trim() || !form.sku.trim()) {
      setFeedback('Name and SKU are required to save a draft.');
      return;
    }
    setSaving(true);
    setFeedback('✓ Draft saved locally.');
    setLastSaved(new Date());
    setIsDirty(false);
    setSaving(false);
  };

  const handleBack = () => {
    if (isDirty && !confirm('You have unsaved changes. Leave without saving?')) return;
    setView('list');
    setFeedback('');
    setIsDirty(false);
  };

  const handleDelete = (sku: string) => {
    if (!confirm('Delete this inventory item?')) return;
    setInventoryItems(prev => prev.filter(item => item.sku !== sku));
    if (editSku === sku) {
      setView('list');
      setEditSku(null);
      setForm({
        name: '', category: 'Circuit Boards', sku: '', stock: '0', max: '100', reorder: '20',
        location: 'Main warehouse', notes: '',
      });
      setFeedback('');
      setIsDirty(false);
    }
  };

  if (view === 'list') {
    return (
      <>
        <SectionHeader
          eyebrow="// INVENTORY"
          title="Inventory"
          actions={
            <>
              <button className={styles.btnSecondary}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button className={styles.btnPrimary} onClick={openNew}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </>
          }
        />

        <div className={styles.miniStatsRow}>
          {[
            { label: 'Total SKUs',    value: String(inventoryItems.length), sub: 'Tracked items' },
            { label: 'Low Stock',     value: String(lowStockCount),         sub: 'Below reorder point' },
            { label: 'Out of Stock',  value: String(outOfStockCount),        sub: 'Needs restocking' },
            { label: 'Total Units',   value: String(totalUnits),            sub: 'Across all products' },
          ].map((s, i) => (
            <div key={i} className={styles.miniStatCard}>
              <p className={styles.miniStatValue}>{s.value}</p>
              <p className={styles.miniStatLabel}>{s.label}</p>
              <p className={styles.miniStatSub}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className={styles.filterRow}>
          <SearchBar placeholder="Search inventory…" />
          <div className={styles.filterGroup}>
            <select className={styles.filterSelect}>
              <option>All Categories</option>
              {INVENTORY_CATEGORIES.map(category => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <select className={styles.filterSelect}>
              <option>All Stock Levels</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>

        <div className={styles.fullPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Stock Levels</span>
            <span className={styles.panelMeta}>{inventoryItems.length} SKUs tracked</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Product', 'Category', 'SKU', 'Stock Level', 'Reorder Point', 'Location', 'Status', 'Actions'].map(h => (
                    <th key={h} className={styles.tableTh}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item, i) => {
                  const pct = item.max > 0 ? (item.stock / item.max) * 100 : 0;
                  const fillClass = item.stock === 0 ? styles.inventoryFillLow : pct < 20 ? styles.inventoryFillMid : styles.inventoryFill;
                  const status = getStockStatus(item.stock, item.reorder);
                  return (
                    <tr key={item.sku} className={styles.tableTr}>
                      <td className={styles.tableTd}><span className={styles.tableCustomer}>{item.name}</span></td>
                      <td className={styles.tableTd}>{item.category}</td>
                      <td className={styles.tableTd}><span className={styles.tableOrderId}>{item.sku}</span></td>
                      <td className={styles.tableTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className={styles.inventoryBar}>
                            <div className={fillClass} style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: '2rem' }}>
                            {item.stock}/{item.max}
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableTd}>{item.reorder} units</td>
                      <td className={styles.tableTd}>{item.location}</td>
                      <td className={styles.tableTd}><StatusBadge status={status.badge} /></td>
                      <td className={styles.tableTd}>
                        <div className={styles.tableActions}>
                          <button className={styles.tableActionBtn} onClick={() => openEdit(item)}>Restock</button>
                          <button className={`${styles.tableActionBtn} ${styles.tableActionBtnDanger}`} onClick={() => handleDelete(item.sku)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  const previewStatus = getStockStatus(Number(form.stock), Number(form.reorder));

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <p className={styles.pageEyebrow}>// INVENTORY</p>
          <h1 className={styles.pageTitle}>{view === 'new' ? 'New Inventory Item' : 'Edit Inventory Item'}</h1>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.btnSecondary} onClick={() => setShowPreview(p => !p)}>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button className={styles.btnSecondary} onClick={handleBack}>← Back</button>
          <button className={styles.btnDraft} onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : view === 'new' ? 'Save Item' : 'Save Changes'}
          </button>
        </div>
      </div>

      {feedback && (
        <p className={styles.feedback} style={{ color: feedback.startsWith('✓') ? 'var(--color-accent)' : '#ef4444' }}>
          {feedback}
        </p>
      )}

      <div className={styles.settingsGrid}>
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 7h18M3 11h18M3 15h18M3 19h18" />
            </svg>
            <h2 className={styles.settingsPanelTitle}>Item Details</h2>
          </div>
          <div className={styles.settingsFields}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Product Name *</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                className={styles.settingsInput} placeholder="Inventory item name" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={styles.settingsInput}>
                {INVENTORY_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>SKU *</label>
              <input name="sku" type="text" value={form.sku} onChange={handleChange}
                className={styles.settingsInput} placeholder="SKU-007" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Location</label>
              <input name="location" type="text" value={form.location} onChange={handleChange}
                className={styles.settingsInput} placeholder="Warehouse or shelf" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                className={styles.settingsTextarea} rows={3}
                placeholder="Optional inventory notes or supplier details" />
            </div>
          </div>
        </div>

        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M21 12H3M12 3v18" />
            </svg>
            <h2 className={styles.settingsPanelTitle}>Stock Controls</h2>
          </div>
          <div className={styles.settingsFields}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Current Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                className={styles.settingsInput} />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Maximum Quantity</label>
              <input name="max" type="number" min="0" value={form.max} onChange={handleChange}
                className={styles.settingsInput} />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Reorder Point</label>
              <input name="reorder" type="number" min="0" value={form.reorder} onChange={handleChange}
                className={styles.settingsInput} />
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className={styles.fullPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Inventory Preview</span>
          </div>
          <div className={styles.settingsGrid}>
            <div className={styles.settingsPanel}>
              <div className={styles.settingsFields}>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>Product</p>
                  <p>{form.name || 'Product name will appear here'}</p>
                </div>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>SKU</p>
                  <p>{form.sku || 'SKU not set'}</p>
                </div>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>Category</p>
                  <p>{form.category}</p>
                </div>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>Location</p>
                  <p>{form.location}</p>
                </div>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>Notes</p>
                  <p style={{ color: 'var(--color-text-muted)' }}>{form.notes || 'No inventory notes added.'}</p>
                </div>
              </div>
            </div>

            <div className={styles.settingsPanel}>
              <div className={styles.settingsFields}>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>Status</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge status={previewStatus.badge} />
                    <span>{previewStatus.label}</span>
                  </div>
                </div>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>Stock level</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={styles.inventoryBar} style={{ flex: 1, minWidth: 0 }}>
                      <div className={previewStatus.badge === 'cancelled' ? styles.inventoryFillLow : previewStatus.badge === 'pending' ? styles.inventoryFillMid : styles.inventoryFill}
                        style={{ width: `${Math.min(100, (Number(form.stock) / Math.max(1, Number(form.max))) * 100)}%` }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {form.stock}/{form.max}
                    </span>
                  </div>
                </div>
                <div className={styles.settingsField}>
                  <p className={styles.settingsLabel}>Reorder point</p>
                  <p>{form.reorder} units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   Section: Settings
   ============================================================ */
function SettingsSection() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <SectionHeader eyebrow="// SETTINGS" title="Settings" />

      <div className={styles.settingsGrid}>

        {/* Store Info */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <h2 className={styles.settingsPanelTitle}>Store Information</h2>
          </div>
          <div className={styles.settingsFields}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Store Name</label>
              <input type="text" className={styles.settingsInput} placeholder="Your Store Name" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Store Email</label>
              <input type="email" className={styles.settingsInput} placeholder="store@example.com" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Store Phone</label>
              <input type="text" className={styles.settingsInput} placeholder="+1 (000) 000-0000" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Store Address</label>
              <textarea className={styles.settingsTextarea} placeholder="123 Street, City, Country" rows={3} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <h2 className={styles.settingsPanelTitle}>Notifications</h2>
          </div>
          <div className={styles.settingsFields}>
            {[
              { label: 'New order placed',         desc: 'Get notified when a new order comes in' },
              { label: 'Low stock alert',          desc: 'Alert when stock falls below reorder point' },
              { label: 'Customer registration',    desc: 'Notify on new account signups' },
              { label: 'Order status updates',     desc: 'Updates on shipped / cancelled orders' },
              { label: 'Payment confirmations',    desc: 'Notify when payments are received' },
            ].map((n, i) => (
              <div key={i} className={styles.settingsToggleRow}>
                <div>
                  <p className={styles.settingsToggleLabel}>{n.label}</p>
                  <p className={styles.settingsToggleDesc}>{n.desc}</p>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" defaultChecked={i < 3} />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
            </svg>
            <h2 className={styles.settingsPanelTitle}>Shipping & Delivery</h2>
          </div>
          <div className={styles.settingsFields}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Default Shipping Rate</label>
              <input type="text" className={styles.settingsInput} placeholder="$0.00" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Free Shipping Threshold</label>
              <input type="text" className={styles.settingsInput} placeholder="$0.00" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Estimated Delivery Time</label>
              <input type="text" className={styles.settingsInput} placeholder="3–5 business days" />
            </div>
            <div className={styles.settingsToggleRow}>
              <div>
                <p className={styles.settingsToggleLabel}>International Shipping</p>
                <p className={styles.settingsToggleDesc}>Enable worldwide delivery</p>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" defaultChecked />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <h2 className={styles.settingsPanelTitle}>Security</h2>
          </div>
          <div className={styles.settingsFields}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Current Password</label>
              <input type="password" className={styles.settingsInput} placeholder="••••••••" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>New Password</label>
              <input type="password" className={styles.settingsInput} placeholder="••••••••" />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Confirm New Password</label>
              <input type="password" className={styles.settingsInput} placeholder="••••••••" />
            </div>
            <div className={styles.settingsToggleRow}>
              <div>
                <p className={styles.settingsToggleLabel}>Two-Factor Authentication</p>
                <p className={styles.settingsToggleDesc}>Add an extra layer of security</p>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* Save button */}
      <div className={styles.settingsSaveRow}>
        <button className={styles.btnPrimary} onClick={handleSave}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
        <button className={styles.btnSecondary}>Cancel</button>
      </div>
    </>
  );
}

/**
 * DROP-IN REPLACEMENT for ProfileSection in app/admin/page.tsx
 * ─────────────────────────────────────────────────────────────
 *
 * STEP 1: Add this import at the top of page.tsx alongside other imports:
 *
 *   import { useEffect } from 'react';
 *
 * (If you already import useState from 'react', just add useEffect to it:)
 *   import React, { useState, useEffect } from 'react';
 *
 *
 * STEP 2: Replace your entire ProfileSection function with the one below.
 *
 *
 * STEP 3: The createClient import is already at the top of your file:
 *   import { createClient } from '@/lib/supabase/client';
 *   — no change needed there.
 */

/**
 * DROP-IN REPLACEMENT for ProfileSection in app/admin/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Replace your entire existing ProfileSection function with this one.
 * All other imports in page.tsx remain the same.
 */

function ProfileSection() {
  const supabase = createClient();

  const [profile, setProfile] = useState({
    email:      '',
    full_name:  '',
    role:       'Administrator',
    avatar_url: '' as string | null,
  });

  const [inviteEmail, setInviteEmail]       = useState('');
  const [inviteName, setInviteName]         = useState('');
  const [saving, setSaving]                 = useState(false);
  const [inviting, setInviting]             = useState(false);
  const [uploading, setUploading]           = useState(false);
  const [profileMsg, setProfileMsg]         = useState('');
  const [inviteMsg, setInviteMsg]           = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userId, setUserId]                 = useState('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Load real data from Supabase ──
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      setProfile({
        email:      user.email ?? '',
        full_name:  adminRow?.full_name  ?? '',
        role:       'Administrator',
        avatar_url: adminRow?.avatar_url ?? null,
      });
      setLoadingProfile(false);
    };
    load();
  }, []);

  // ── Upload avatar to Supabase Storage ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type & size (max 2 MB)
    if (!file.type.startsWith('image/')) {
      setProfileMsg('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg('Image must be under 2 MB.');
      return;
    }

    setUploading(true);
    setProfileMsg('');

    const ext      = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${ext}`;

    // Upload to Supabase Storage bucket "avatars"
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setProfileMsg('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Save URL to admin_users row
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      setProfileMsg('Saved image but failed to update profile: ' + updateError.message);
    } else {
      setProfile(p => ({ ...p, avatar_url: publicUrl }));
      setProfileMsg('✓ Avatar updated successfully.');
    }

    setUploading(false);
  };

  // ── Remove avatar ──
  const handleRemoveAvatar = async () => {
    if (!userId) return;
    setUploading(true);
    setProfileMsg('');

    await supabase
      .from('admin_users')
      .update({ avatar_url: null })
      .eq('id', userId);

    setProfile(p => ({ ...p, avatar_url: null }));
    setProfileMsg('✓ Avatar removed.');
    setUploading(false);
  };

  // ── Save profile changes ──
  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileMsg('');

    const { error } = await supabase
      .from('admin_users')
      .update({ full_name: profile.full_name.trim() })
      .eq('id', userId);

    setProfileMsg(error ? 'Error saving: ' + error.message : '✓ Profile updated successfully.');
    setSaving(false);
  };

  // ── Invite a new admin ──
  const handleInvite = async () => {
    if (!inviteEmail.trim()) { setInviteMsg('Email is required.'); return; }
    setInviting(true);
    setInviteMsg('');

    const res  = await fetch('/api/admin/invite', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: inviteEmail.trim(), full_name: inviteName.trim() || null }),
    });
    const json = await res.json();

    if (!res.ok) {
      setInviteMsg('Error: ' + (json.error ?? 'Something went wrong.'));
    } else {
      setInviteMsg('✓ Invitation sent to ' + inviteEmail.trim());
      setInviteEmail('');
      setInviteName('');
    }
    setInviting(false);
  };

  if (loadingProfile) {
    return (
      <>
        <SectionHeader eyebrow="// ACCOUNT" title="Profile" />
        <p style={{ padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Loading profile…
        </p>
      </>
    );
  }

  return (
    <>
      <SectionHeader eyebrow="// ACCOUNT" title="Profile" />

      <div className={styles.settingsGrid}>

        {/* ── Account Details + Avatar ── */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <h2 className={styles.settingsPanelTitle}>Account Details</h2>
          </div>

          {/* Avatar upload area */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile avatar"
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              )}
              {/* Overlay on hover */}
              <button
                className={styles.avatarOverlay}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Change avatar"
              >
                {uploading ? (
                  <span className={styles.avatarSpinner} />
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                )}
              </button>
            </div>

            <div className={styles.avatarMeta}>
              <p className={styles.avatarName}>{profile.full_name || 'Admin'}</p>
              <p className={styles.avatarRole}>{profile.role}</p>
              <div className={styles.avatarActions}>
                <button
                  className={styles.avatarUploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Change Photo'}
                </button>
                {profile.avatar_url && (
                  <button
                    className={styles.avatarRemoveBtn}
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className={styles.avatarHint}>JPG, PNG or GIF · Max 2 MB</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div className={styles.settingsFields}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Display Name</label>
              <input
                type="text"
                className={styles.settingsInput}
                placeholder="Your Name"
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Email Address</label>
              <input
                type="email"
                className={styles.settingsInput}
                value={profile.email}
                disabled
                title="Email cannot be changed here"
              />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Role</label>
              <input
                type="text"
                className={styles.settingsInput}
                value={profile.role}
                disabled
              />
            </div>
          </div>

          {profileMsg && (
            <p style={{
              marginTop: '1rem',
              fontSize: '0.8rem',
              color: profileMsg.startsWith('✓') ? 'var(--color-accent)' : '#ef4444',
            }}>
              {profileMsg}
            </p>
          )}
        </div>

        {/* ── Invite Admin ── */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            <h2 className={styles.settingsPanelTitle}>Invite New Admin</h2>
          </div>
          <div className={styles.settingsFields}>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Their Email</label>
              <input
                type="email"
                className={styles.settingsInput}
                placeholder="newadmin@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div className={styles.settingsField}>
              <label className={styles.settingsLabel}>Their Name (optional)</label>
              <input
                type="text"
                className={styles.settingsInput}
                placeholder="Jane Smith"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              They will receive an email with a link to set their password and access the admin panel.
            </p>
          </div>
          {inviteMsg && (
            <p style={{
              marginTop: '1rem',
              fontSize: '0.8rem',
              color: inviteMsg.startsWith('✓') ? 'var(--color-accent)' : '#ef4444',
            }}>
              {inviteMsg}
            </p>
          )}
        </div>

      </div>

      {/* ── Action buttons ── */}
      <div className={styles.settingsSaveRow}>
        <button className={styles.btnPrimary} onClick={handleSaveProfile} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        <button className={styles.btnSecondary} onClick={handleInvite} disabled={inviting}>
          {inviting ? 'Sending…' : 'Send Invite →'}
        </button>
      </div>
    </>
  );
}

/* ============================================================
   Section: Dashboard (original)
   ============================================================ */
function DashboardSection() {
  const dotClass: Record<string, string> = {
    green:  styles.activityDotGreen,
    yellow: styles.activityDotYellow,
    red:    styles.activityDotRed,
    blue:   styles.activityDotBlue,
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <p className={styles.pageEyebrow}>// ADMIN</p>
          <h1 className={styles.pageTitle}>Dashboard</h1>
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

      <div className={styles.contentRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Revenue Overview</span>
            <button className={styles.panelAction}>This Year ▾</button>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.chartWrap}>
              {CHART_DATA.map((val, i) => (
                <div key={i} className={styles.chartBar} style={{ height: `${(val / CHART_MAX) * 100}%` }}>
                  <span className={styles.chartTooltip}>${val}k</span>
                </div>
              ))}
            </div>
            <div className={styles.chartLabels}>
              {MONTHS.map(m => <span key={m} className={styles.chartLabel}>{m}</span>)}
            </div>
          </div>
        </div>

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
              {ORDERS.slice(0, 5).map((o, i) => (
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
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: '2rem' }}>{item.stock}</span>
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
    </>
  );
}

/* ============================================================
   Main Admin Page
   ============================================================ */
const AdminPage: React.FC = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/admin/login');
        return;
      }

      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!adminRow) {
        router.replace('/');
        return;
      }

      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) return null;

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
    {
      id: 'blog', label: 'Blog',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
      </svg>,
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection />;
      case 'orders':    return <OrdersSection />;
      case 'products':  return <ProductSection />;
      case 'customers': return <CustomersSection />;
      case 'inventory': return <InventorySection />;
      case 'settings':  return <SettingsSection />;
      case 'blog':      return <BlogSection />;
      case 'profile': return <ProfileSection />;
    }
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
                <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.sidebarDivider} />

          <p className={styles.sidebarLabel}>Account</p>
          <div className={styles.sidebarSection}>
            <button className={styles.sidebarBtn} onClick={() => setActiveSection('profile')}>
              <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              Profile
            </button>
            <SignOutButton className={styles.sidebarBtn} />
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className={styles.main}>
          {renderSection()}
        </main>

      </div>
    </div>
  );
};

export default AdminPage;