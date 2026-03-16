'use client';

import React, { useState } from 'react';
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
  { id: 'PRD-001', name: 'Circuit Board Alpha',      category: 'Circuit Boards',          sku: 'SKU-001', price: '$49.99',  stock: 0,  status: 'active'   },
  { id: 'PRD-002', name: 'Microchip X-Series',       category: 'Microchips & Processors', sku: 'SKU-002', price: '$89.99',  stock: 0,  status: 'active'   },
  { id: 'PRD-003', name: 'Sensor Array Kit',         category: 'Sensors & Components',    sku: 'SKU-003', price: '$34.99',  stock: 0,  status: 'active'   },
  { id: 'PRD-004', name: 'Dev Kit Pro',              category: 'Development Kits',        sku: 'SKU-004', price: '$129.99', stock: 0,  status: 'active'   },
  { id: 'PRD-005', name: 'Bulk Resistor Pack',       category: 'Bulk Orders',             sku: 'SKU-005', price: '$19.99',  stock: 0,  status: 'active'   },
  { id: 'PRD-006', name: 'Custom PCB Module',        category: 'Custom Solutions',        sku: 'SKU-006', price: '$249.99', stock: 0,  status: 'inactive' },
  { id: 'PRD-007', name: 'GPIO Expander Chip',       category: 'Microchips & Processors', sku: 'SKU-007', price: '$12.99',  stock: 0,  status: 'active'   },
  { id: 'PRD-008', name: 'Temperature Sensor TH-1', category: 'Sensors & Components',    sku: 'SKU-008', price: '$8.99',   stock: 0,  status: 'active'   },
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
  { name: 'Product Name', category: 'Circuit Boards',          sku: 'SKU-001', stock: 0, max: 100, reorder: 20 },
  { name: 'Product Name', category: 'Microchips & Processors', sku: 'SKU-002', stock: 0, max: 100, reorder: 20 },
  { name: 'Product Name', category: 'Sensors & Components',    sku: 'SKU-003', stock: 0, max: 100, reorder: 20 },
  { name: 'Product Name', category: 'Development Kits',        sku: 'SKU-004', stock: 0, max: 100, reorder: 20 },
  { name: 'Product Name', category: 'Custom Solutions',        sku: 'SKU-005', stock: 0, max: 100, reorder: 20 },
  { name: 'Product Name', category: 'Bulk Orders',             sku: 'SKU-006', stock: 0, max: 100, reorder: 20 },
];

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

type Section = 'dashboard' | 'orders' | 'products' | 'customers' | 'inventory' | 'settings';

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
  const INV_STATS = [
    { label: 'Total SKUs',    value: '—',  sub: 'Tracked items' },
    { label: 'Low Stock',     value: '—',  sub: 'Below reorder point' },
    { label: 'Out of Stock',  value: '—',  sub: 'Needs restocking' },
    { label: 'Total Units',   value: '—',  sub: 'Across all products' },
  ];

  return (
    <>
      <SectionHeader
        eyebrow="// INVENTORY"
        title="Inventory"
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
              Update Stock
            </button>
          </>
        }
      />

      <div className={styles.miniStatsRow}>
        {INV_STATS.map((s, i) => (
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
            <option>Circuit Boards</option>
            <option>Microchips & Processors</option>
            <option>Sensors & Components</option>
            <option>Development Kits</option>
            <option>Custom Solutions</option>
            <option>Bulk Orders</option>
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
          <span className={styles.panelMeta}>— SKUs tracked</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Product','Category','SKU','Stock Level','Reorder Point','Status','Actions'].map(h => (
                  <th key={h} className={styles.tableTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map((item, i) => {
                const pct = item.max > 0 ? (item.stock / item.max) * 100 : 0;
                const fillClass = pct === 0 ? styles.inventoryFillLow : pct < 20 ? styles.inventoryFillMid : styles.inventoryFill;
                const stockStatus = pct === 0 ? 'cancelled' : pct < 20 ? 'pending' : 'paid';
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
                          {item.stock}/{item.max}
                        </span>
                      </div>
                    </td>
                    <td className={styles.tableTd}>{item.reorder} units</td>
                    <td className={styles.tableTd}><StatusBadge status={stockStatus} /></td>
                    <td className={styles.tableTd}>
                      <div className={styles.tableActions}>
                        <button className={styles.tableActionBtn}>Restock</button>
                        <button className={styles.tableActionBtn}>Edit</button>
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

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection />;
      case 'orders':    return <OrdersSection />;
      case 'products':  return <ProductsSection />;
      case 'customers': return <CustomersSection />;
      case 'inventory': return <InventorySection />;
      case 'settings':  return <SettingsSection />;
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
            <button className={styles.sidebarBtn} onClick={() => setActiveSection('settings')}>
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
          {renderSection()}
        </main>

      </div>
    </div>
  );
};

export default AdminPage;