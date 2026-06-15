'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from '@/app/admin/AdminPage.module.css';
import blogStyles from './AdminBlogSection.module.css';

type Product = {
  id: string;
  dbId?: number | null;
  name: string;
  category: string;
  sku: string;
  price: string;
  stock: number;
  status: 'active' | 'inactive' | 'out of stock';
  description: string;
  tags: string;
  imageUrl: string | null;
};

type ProductForm = {
  name: string;
  urlSlug: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
  status: 'active' | 'inactive' | 'out of stock';
  description: string;
  tags: string;
  imageUrl: string | null;
};

const CATEGORIES = [
  'Circuit Boards',
  'Microchips & Processors',
  'Sensors & Components',
  'Development Kits',
  'Custom Solutions',
  'Bulk Orders',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Circuit Boards':          '🔌',
  'Microchips & Processors': '💻',
  'Sensors & Components':    '📡',
  'Development Kits':        '🛠️',
  'Custom Solutions':        '⚙️',
  'Bulk Orders':             '📦',
};

const PRODUCT_STATUS = ['active', 'inactive', 'out of stock'] as const;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function emptyForm(): ProductForm {
  return { name: '', urlSlug: '', sku: '', category: '', price: '', stock: '0', status: 'active', description: '', tags: '', imageUrl: null };
}

function Counter({ text }: { text: string }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return <span className={blogStyles.counter}>{words}w · {text.length}ch</span>;
}

/* ============================================================
   Category Picker — card-style grid dropdown
   ============================================================ */
function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (cat: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Native select — always visible, accessible fallback */}
      <select
        name="category"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width:        '100%',
          padding:      '0.75rem 1rem',
          background:   '#111',
          border:       `1px solid ${value ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '0.5rem',
          color:        value ? '#e5e7eb' : '#6b7280',
          fontSize:     '0.88rem',
          fontFamily:   'inherit',
          outline:      'none',
          cursor:       'pointer',
          transition:   'border-color 0.2s',
        }}
      >
        <option value="" disabled>Select a category…</option>
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
        ))}
      </select>

      {/* Visual card grid — clicking a card also sets the value */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap:                 '0.6rem',
      }}>
        {CATEGORIES.map(cat => {
          const selected = value === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                gap:           '0.4rem',
                padding:       '0.85rem 0.5rem',
                background:    selected ? 'rgba(74,222,128,0.08)' : '#0d0d0d',
                border:        `1px solid ${selected ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius:  '0.5rem',
                cursor:        'pointer',
                transition:    'background 0.2s, border-color 0.2s, transform 0.15s',
                transform:     selected ? 'scale(1.03)' : 'scale(1)',
                outline:       selected ? '2px solid rgba(74,222,128,0.3)' : 'none',
                outlineOffset: '2px',
              }}
            >
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{CATEGORY_ICONS[cat]}</span>
              <span style={{
                fontSize:    '0.7rem',
                fontWeight:  selected ? 700 : 400,
                color:       selected ? '#4ade80' : '#9ca3af',
                textAlign:   'center',
                lineHeight:  1.3,
                letterSpacing: '0.03em',
              }}>
                {cat}
              </span>
              {selected && (
                <span style={{
                  fontSize:    '0.6rem',
                  color:       '#22c55e',
                  fontWeight:  700,
                  letterSpacing: '0.08em',
                }}>
                  ✓ Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      {value && (
        <p style={{ fontSize: '0.75rem', color: '#4ade80', margin: 0 }}>
          This product will be listed under <strong>{value}</strong>.
        </p>
      )}
    </div>
  );
}

/* ============================================================
   Image Upload
   ============================================================ */
function ProductImageUpload({
  imageUrl, onUpload, onRemove, uploading,
}: {
  imageUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  if (imageUrl) {
    return (
      <div className={blogStyles.bannerPreviewWrap}>
        <img src={imageUrl} alt="Product image" className={blogStyles.bannerPreviewImg} />
        <div className={blogStyles.bannerPreviewOverlay}>
          <button type="button" className={blogStyles.bannerChangeBtn} onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '↑ Change Image'}
          </button>
          <button type="button" className={blogStyles.bannerRemoveBtn} onClick={onRemove} disabled={uploading}>
            ✕ Remove
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div className={blogStyles.bannerDropzone} onClick={() => inputRef.current?.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      {uploading ? (
        <div className={blogStyles.bannerUploading}>
          <span className={blogStyles.bannerSpinner} />
          <span>Uploading image…</span>
        </div>
      ) : (
        <>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28" style={{ color: 'var(--color-text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className={blogStyles.bannerDropzoneText}><strong>Click to upload</strong> or drag & drop a product image</p>
          <p className={blogStyles.bannerDropzoneHint}>JPG, PNG, WebP · Recommended 1200×630px · Max 5 MB</p>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
}

/* ============================================================
   Product Preview
   ============================================================ */
function ProductPreview({ form }: { form: ProductForm }) {
  const statusLabel = form.status === 'out of stock' ? 'Out of stock' : form.status === 'inactive' ? 'Inactive' : 'Active';
  return (
    <div className={blogStyles.preview}>
      {form.imageUrl && (
        <div className={blogStyles.previewBanner}>
          <img src={form.imageUrl} alt="Product" className={blogStyles.previewBannerImg} />
        </div>
      )}
      <div className={blogStyles.previewHeader}>
        <span className={blogStyles.previewCategory}>
          {form.category ? `${CATEGORY_ICONS[form.category] ?? ''} ${form.category}` : 'No category selected'}
        </span>
        <h1 className={blogStyles.previewTitle}>{form.name || 'Product Name'}</h1>
        {form.description && <p className={blogStyles.previewExcerpt}>{form.description}</p>}
        <div className={blogStyles.previewMeta}>
          <span>{form.sku ? `SKU: ${form.sku}` : 'SKU not set'}</span>
          <span className={blogStyles.previewMetaDot}>·</span>
          <span>{form.price ? `$${form.price}` : 'Price not set'}</span>
          <span className={blogStyles.previewMetaDot}>·</span>
          <span>{statusLabel}</span>
        </div>
      </div>
      <div className={blogStyles.previewDivider} />
      <div className={blogStyles.previewSection}>
        <p className={blogStyles.previewSectionBody}>
          {form.description || 'Write a short product summary to help buyers understand what makes this product stand out.'}
        </p>
      </div>
      {form.tags && (
        <div className={blogStyles.previewMeta} style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
          {form.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
            <span key={tag} className={blogStyles.tagChip}>{`#${tag}`}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Main Export
   ============================================================ */
export default function ProductSection() {
  const [products, setProducts]           = useState<Product[]>([]);
  const [view, setView]                   = useState<'list' | 'new' | 'edit'>('list');
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [form, setForm]                   = useState<ProductForm>(emptyForm());
  const [feedback, setFeedback]           = useState('');
  const [saving, setSaving]               = useState(false);
  const [showPreview, setShowPreview]     = useState(true);
  const [isDirty, setIsDirty]             = useState(false);
  const [lastSaved, setLastSaved]         = useState<Date | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl); };
  }, [imageObjectUrl]);

  // Load persisted catalog from Supabase first, with localStorage as fallback.
  useEffect(() => {
    let mounted = true;

    const loadCatalog = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const catalogProducts: Product[] = data.map((p: any) => ({
              id: p.id != null ? `PRD-${String(p.id).padStart(3, '0')}` : `TEMP-${Date.now()}`,
              dbId: typeof p.id === 'number' ? p.id : null,
              name: String(p.name || ''),
              category: String(p.category || ''),
              sku: String(p.sku || ''),
              price: Number(p.price || p.original_price || 0).toFixed(2),
              stock: typeof p.in_stock === 'boolean' ? (p.in_stock ? Number(p.stock ?? 1) : 0) : Number(p.stock ?? 0),
              status: p.in_stock ? 'active' : 'out of stock',
              description: String(p.description || ''),
              tags: String(p.tags || ''),
              imageUrl: p.image_url ?? null,
            }));

            if (mounted) {
              setProducts(catalogProducts);
            }

            try {
              localStorage.setItem('catalog_products', JSON.stringify(data.map((p: any) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: Number(p.price || p.original_price || 0),
                originalPrice: Number(p.original_price || p.price || 0),
                rating: p.rating || 0,
                reviewCount: p.review_count || 0,
                badge: p.badge || undefined,
                inStock: !!p.in_stock,
                description: p.description || '',
                sku: p.sku || '',
                tags: p.tags || '',
                imageUrl: p.image_url || null,
              }))));
            } catch (e) {
              // ignore localStorage write errors
            }
            return;
          }
        }
      } catch (err) {
        // ignore fetch failures and fallback to localStorage
      }

      try {
        const raw = localStorage.getItem('catalog_products');
        if (raw) {
          const parsed = JSON.parse(raw) as any[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const uniqueParsedMap = new Map<string, any>();
            for (const p of parsed) {
              const key = (typeof p.id !== 'undefined' && p.id !== null)
                ? String(p.id)
                : `${String(p.sku || '').trim()}|${String(p.name || '').trim()}`;
              if (!uniqueParsedMap.has(key)) {
                uniqueParsedMap.set(key, p);
              }
            }
            const adminFromCatalog: Product[] = Array.from(uniqueParsedMap.values()).map(p => ({
              id: p.id ? `PRD-${String(p.id).padStart(3, '0')}` : `TEMP-${Date.now()}`,
              dbId: typeof p.id === 'number' ? Number(p.id) : null,
              name: String(p.name || ''),
              category: String(p.category || ''),
              sku: String(p.sku || ''),
              price: String(p.price ?? p.originalPrice ?? '0'),
              stock: typeof p.stock !== 'undefined' ? Number(p.stock) : (p.inStock ? 1 : 0),
              status: p.inStock ? 'active' : 'out of stock',
              description: String(p.description || ''),
              tags: String(p.tags || ''),
              imageUrl: p.imageUrl ?? null,
            }));
            if (mounted) setProducts(adminFromCatalog);
          }
        }
      } catch (err) {
        // ignore parse errors
      }
    };

    loadCatalog();
    return () => { mounted = false; };
  }, []);

  const productStats = [
    { label: 'Total Products', value: String(products.length) },
    { label: 'Active',         value: String(products.filter(p => p.status === 'active').length) },
    { label: 'Out of Stock',   value: String(products.filter(p => p.status === 'out of stock').length) },
    { label: 'Categories',     value: String(new Set(products.map(p => p.category)).size) },
  ];

  const openNew = () => {
    setForm(emptyForm());
    setEditProductId(null);
    setView('new');
    setFeedback('');
    setIsDirty(false);
    setShowPreview(true);
  };

  const openEdit = (product: Product) => {
    setEditProductId(product.id);
    setForm({ name: product.name, urlSlug: slugify(product.name), sku: product.sku, category: product.category, price: product.price, stock: String(product.stock), status: product.status, description: product.description, tags: product.tags, imageUrl: product.imageUrl });
    setView('edit');
    setFeedback('');
    setIsDirty(false);
    setShowPreview(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'name' && view === 'new' ? { urlSlug: slugify(value) } : {}) }));
  };

  const handleCategoryChange = (cat: string) => {
    setIsDirty(true);
    setForm(prev => ({ ...prev, category: cat }));
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) { setFeedback('Please upload an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setFeedback('Image must be under 5 MB.');    return; }
    setImageUploading(true);
    setFeedback('');
    const objectUrl = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, imageUrl: objectUrl }));
    setImageObjectUrl(objectUrl);
    setIsDirty(true);
    setImageUploading(false);
  };

  const handleImageRemove = () => { setForm(prev => ({ ...prev, imageUrl: null })); setIsDirty(true); };

  const handleSave = () => {
    if (!form.name.trim())     { setFeedback('Product name is required.'); return; }
    if (!form.sku.trim())      { setFeedback('SKU is required.');           return; }
    if (!form.price.trim())    { setFeedback('Price is required.');         return; }
    if (!form.category)        { setFeedback('Please select a category.');  return; }
    if (Number.isNaN(Number(form.stock)) || Number(form.stock) < 0) { setFeedback('Stock must be a valid number.'); return; }

    setSaving(true);
    setFeedback('');

    const product: Product = {
      id:          editProductId ?? `SAMPLE-${String(Date.now())}`,
      name:        form.name.trim(),
      category:    form.category,
      sku:         form.sku.trim(),
      price:       Number(form.price).toFixed(2),
      stock:       Number(form.stock),
      status:      form.status,
      description: form.description.trim(),
      tags:        form.tags.trim(),
      imageUrl:    form.imageUrl,
    };

    // Update products state and persist to localStorage as catalog items
    const updated = editProductId ? products.map(item => item.id === editProductId ? product : item) : [product, ...products];
    setProducts(updated);
    try {
      const catalog = updated.map(p => ({
        id: (p.dbId != null) ? Number(p.dbId) : (() => { const m = String(p.id).match(/(\d+)/); return m ? Number(m[1]) : Date.now(); })(),
        name: p.name,
        category: p.category,
        price: Number(parseFloat(p.price) || 0),
        originalPrice: Number(parseFloat(p.price) || 0),
        rating: 0,
        reviewCount: 0,
        badge: p.status === 'out of stock' ? 'LOW STOCK' : undefined,
        inStock: p.status !== 'out of stock' && Number(p.stock) > 0,
        description: p.description,
        sku: p.sku,
        tags: p.tags,
        imageUrl: p.imageUrl,
      }));
      localStorage.setItem('catalog_products', JSON.stringify(catalog));
      try {
        // Notify other tabs immediately
        const bc = new BroadcastChannel('catalog-sync');
        bc.postMessage(catalog);
        bc.close();
      } catch (e) {
        // BroadcastChannel may not be available in all environments
      }
    } catch (err) {
      console.error('Failed to persist products', err);
    }

    // Persist to server API (which uses service role) to create/upsert products
    (async () => {
      try {
        const rows = updated.map(p => ({
          id: (() => { const m = String(p.id).match(/(\d+)/); return m ? Number(m[1]) : undefined; })(),
          name: p.name,
          slug: slugify(p.name),
          category: p.category,
          price: Number(parseFloat(p.price) || 0),
          original_price: Number(parseFloat(p.price) || 0),
          rating: 0,
          review_count: 0,
          badge: p.status === 'out of stock' ? 'LOW STOCK' : null,
          in_stock: p.status !== 'out of stock' && Number(p.stock) > 0,
          description: p.description,
          sku: p.sku,
          tags: p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          image_url: p.imageUrl,
        }));
        const singleRow = {
          id: product.dbId ?? undefined,
          name: product.name,
          slug: slugify(product.name),
          category: product.category,
          price: Number(parseFloat(product.price) || 0),
          original_price: Number(parseFloat(product.price) || 0),
          rating: 0,
          review_count: 0,
          badge: product.status === 'out of stock' ? 'LOW STOCK' : null,
          in_stock: product.status !== 'out of stock' && Number(product.stock) > 0,
          description: product.description,
          sku: product.sku,
          tags: product.tags ? product.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          image_url: product.imageUrl,
        };

        const method = product.dbId != null ? 'PUT' : 'POST';
        const body = JSON.stringify({
          ...singleRow,
          id: product.dbId != null ? product.dbId : undefined,
        });
        const res = await fetch('/api/admin/products', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body,
        });

        // Parse response body safely and log both request and response for debugging
        let parsedBody: any = null;
        const raw = await res.text().catch(() => null);
        try { parsedBody = raw ? JSON.parse(raw) : null; } catch { parsedBody = raw; }

        try {
          console.log('API upsert request', { method, requestBody: JSON.parse(body) });
        } catch {}
        console.log('API upsert response', { status: res.status, statusText: res.statusText, body: parsedBody });

        if (res.ok) {
          const returned = Array.isArray(parsedBody) ? parsedBody[0] : parsedBody;
          if (returned && typeof returned.id === 'number') {
            setProducts(prev => {
              const updatedProducts = prev.map(item => {
                if (item.id === product.id || item.sku === product.sku) {
                  return {
                    ...item,
                    dbId: returned.id,
                    id: `PRD-${String(returned.id).padStart(3, '0')}`,
                  };
                }
                return item;
              });
              try {
                localStorage.setItem('catalog_products', JSON.stringify(updatedProducts.map(p => ({
                  id: p.dbId ?? (() => { const m = String(p.id).match(/(\d+)/); return m ? Number(m[1]) : Date.now(); })(),
                  name: p.name,
                  category: p.category,
                  price: Number(parseFloat(p.price) || 0),
                  originalPrice: Number(parseFloat(p.price) || 0),
                  rating: 0,
                  reviewCount: 0,
                  badge: p.status === 'out of stock' ? 'LOW STOCK' : undefined,
                  inStock: p.status !== 'out of stock' && Number(p.stock) > 0,
                  description: p.description,
                  sku: p.sku,
                  tags: p.tags,
                  imageUrl: p.imageUrl,
                }))));
                try {
                  const bc = new BroadcastChannel('catalog-sync');
                  const catalog2 = updatedProducts.map(p => ({
                    id: p.dbId ?? (() => { const m = String(p.id).match(/(\d+)/); return m ? Number(m[1]) : Date.now(); })(),
                    name: p.name,
                    category: p.category,
                    price: Number(parseFloat(p.price) || 0),
                    originalPrice: Number(parseFloat(p.price) || 0),
                    rating: 0,
                    reviewCount: 0,
                    badge: p.status === 'out of stock' ? 'LOW STOCK' : undefined,
                    inStock: p.status !== 'out of stock' && Number(p.stock) > 0,
                    description: p.description,
                    sku: p.sku,
                    tags: p.tags,
                    imageUrl: p.imageUrl,
                  }));
                  bc.postMessage(catalog2);
                  bc.close();
                } catch (e) {}
              } catch (err) {
                console.error('Failed to persist products after API save', err);
              }
              return updatedProducts;
            });
          } else {
            console.warn('API upsert succeeded but returned unexpected payload', parsedBody);
          }
        } else {
          console.error('API upsert error', { status: res.status, statusText: res.statusText, body: parsedBody });
        }
      } catch (e) {
        console.error('API save failed', e);
      }
    })();

    setSaving(false);
    setIsDirty(false);
    setLastSaved(new Date());
    setFeedback('✓ Product saved successfully.');
    setView('list');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;

    const productToDelete = products.find(item => item.id === id);
    const remaining = products.filter(item => item.id !== id);

    const deleteFromSupabase = async (deleteId: number) => {
      try {
        const res = await fetch('/api/admin/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deleteId }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          console.error('API delete error', err);
          setFeedback('Failed to remove product from server.');
          return false;
        }
        return true;
      } catch (e) {
        console.error('API delete failed', e);
        setFeedback('Failed to remove product from server.');
        return false;
      }
    };

    try {
      if (productToDelete) {
        const deleteId = productToDelete.dbId ?? (() => {
          const match = String(productToDelete.id).match(/(\d+)/);
          return match ? Number(match[1]) : null;
        })();

        if (deleteId != null) {
          const success = await deleteFromSupabase(deleteId);
          if (!success) {
            return;
          }
        }
      }

      setProducts(remaining);
      try {
        const catalog = remaining.map(p => ({
          id: p.dbId != null ? p.dbId : (() => { const m = String(p.id).match(/(\d+)/); return m ? Number(m[1]) : Date.now(); })(),
          name: p.name,
          category: p.category,
          price: Number(parseFloat(p.price) || 0),
          originalPrice: Number(parseFloat(p.price) || 0),
          rating: 0,
          reviewCount: 0,
          badge: p.status === 'out of stock' ? 'LOW STOCK' : undefined,
          inStock: p.status !== 'out of stock' && Number(p.stock) > 0,
          description: p.description,
          sku: p.sku,
          tags: p.tags,
          imageUrl: p.imageUrl,
        }));
        localStorage.setItem('catalog_products', JSON.stringify(catalog));
      } catch (err) {
        console.error('Failed to persist products', err);
      }
    } catch (err) {
      console.error('Delete error', err);
    }

    if (editProductId === id) {
      setView('list');
      setEditProductId(null);
      setFeedback('');
      setIsDirty(false);
    }
  };

  const handleBack = () => {
    if (isDirty && !confirm('You have unsaved changes. Leave without saving?')) return;
    setView('list');
    setFeedback('');
    setIsDirty(false);
    setLastSaved(null);
  };

  const totalWords = form.description.trim().split(/\s+/).filter(Boolean).length;

  /* ── List view ── */
  if (view === 'list') {
    return (
      <>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <p className={styles.pageEyebrow}>// PRODUCTS</p>
            <h1 className={styles.pageTitle}>Products</h1>
          </div>
          <div className={styles.pageActions}>
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
              Add Product
            </button>
          </div>
        </div>

        <div className={styles.miniStatsRow}>
          {productStats.map((stat, i) => (
            <div key={i} className={styles.miniStatCard}>
              <p className={styles.miniStatValue}>{stat.value}</p>
              <p className={styles.miniStatLabel}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={styles.filterRow}>
          <div className={styles.searchBar}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input type="text" placeholder="Search products…" className={styles.searchInput} />
          </div>
          <div className={styles.filterGroup}>
            <select className={styles.filterSelect}>
              <option>All Categories</option>
              {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
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
            <span className={styles.panelMeta}>{products.length} total</span>
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
                {products.map(product => (
                  <tr key={product.dbId != null ? `db:${product.dbId}` : `id:${product.id}`} className={styles.tableTr}>
                    <td className={styles.tableTd}><span className={styles.tableOrderId}>{product.id}</span></td>
                    <td className={styles.tableTd}><span className={styles.tableCustomer}>{product.name}</span></td>
                    <td className={styles.tableTd}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {CATEGORY_ICONS[product.category]} {product.category}
                      </span>
                    </td>
                    <td className={styles.tableTd}><span className={styles.tableOrderId}>{product.sku}</span></td>
                    <td className={styles.tableTd}><span className={styles.tableAmount}>${product.price}</span></td>
                    <td className={styles.tableTd}>{product.stock}</td>
                    <td className={styles.tableTd}><span className={styles.statusBadge}>{product.status}</span></td>
                    <td className={styles.tableTd}>
                      <div className={styles.tableActions}>
                        <button className={styles.tableActionBtn} onClick={() => openEdit(product)}>Edit</button>
                        <button className={`${styles.tableActionBtn} ${styles.tableActionBtnDanger}`} onClick={() => handleDelete(product.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  /* ── New / Edit view ── */
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <p className={styles.pageEyebrow}>// PRODUCTS</p>
          <h1 className={styles.pageTitle}>{view === 'new' ? 'New Product' : 'Edit Product'}</h1>
        </div>
        <div className={styles.pageActions}>
          <button className={blogStyles.previewToggle} onClick={() => setShowPreview(p => !p)}>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button className={styles.btnSecondary} onClick={handleBack}>← Back</button>
          <button className={blogStyles.btnDraft} onClick={() => { setFeedback('Draft saved locally.'); setIsDirty(false); setLastSaved(new Date()); }} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : view === 'new' ? 'Publish Product' : 'Save Changes'}
          </button>
        </div>
      </div>

      {feedback && (
        <p className={blogStyles.feedback} style={{ color: feedback.startsWith('✓') ? 'var(--color-accent)' : '#ef4444' }}>
          {feedback}
        </p>
      )}

      <div className={blogStyles.saveStatus}>
        {isDirty ? (
          <span className={blogStyles.saveStatusUnsaved}>● Unsaved changes</span>
        ) : lastSaved ? (
          <span className={blogStyles.saveStatusSaved}>
            ✓ Last saved at {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : null}
      </div>

      <div className={blogStyles.wordCountBar}>
        <span className={blogStyles.wordCountText}>
          Description: <strong>{totalWords} words</strong>
        </span>
        <span className={blogStyles.wordCountSections}>
          {form.tags.split(',').filter(Boolean).length} tags
        </span>
      </div>

      <div className={blogStyles.formLayout}>
        <div className={blogStyles.formMain}>

          {/* 00 — Image */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>00</span>
              <span className={blogStyles.formBlockTitle}>Product Image</span>
              <span className={blogStyles.formBlockHint}>Displayed on the product listing and product detail page.</span>
            </div>
            <ProductImageUpload imageUrl={form.imageUrl} onUpload={handleImageUpload} onRemove={handleImageRemove} uploading={imageUploading} />
          </div>

          {/* 01 — Identity */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>01</span>
              <span className={blogStyles.formBlockTitle}>Product Identity</span>
            </div>
            <div className={styles.settingsFields}>
              <div className={styles.settingsField}>
                <div className={blogStyles.labelRow}>
                  <label className={styles.settingsLabel}>Product Name *</label>
                  <Counter text={form.name} />
                </div>
                <input name="name" type="text" value={form.name} onChange={handleChange}
                  className={styles.settingsInput} placeholder="Enter product name…" />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>URL Slug</label>
                <div className={blogStyles.slugWrap}>
                  <span className={blogStyles.slugPrefix}>/products/</span>
                  <input name="urlSlug" type="text" value={form.urlSlug} onChange={handleChange}
                    className={`${styles.settingsInput} ${blogStyles.slugInput}`} placeholder="product-slug-here" />
                </div>
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>SKU *</label>
                <input name="sku" type="text" value={form.sku} onChange={handleChange}
                  className={styles.settingsInput} placeholder="SKU-001" />
              </div>
            </div>
          </div>

          {/* 02 — Category (moved into main form) */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>02</span>
              <span className={blogStyles.formBlockTitle}>Category *</span>
              <span className={blogStyles.formBlockHint}>
                Choose the category this product will be listed under in the store.
              </span>
            </div>
            <CategoryPicker value={form.category} onChange={handleCategoryChange} />
          </div>

          {/* 03 — Description */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>03</span>
              <span className={blogStyles.formBlockTitle}>Description</span>
              <span className={blogStyles.formBlockHint}>Write a short summary that appears on the product page.</span>
            </div>
            <div className={styles.settingsField}>
              <div className={blogStyles.labelRow}>
                <label className={styles.settingsLabel}>Product Description</label>
                <Counter text={form.description} />
              </div>
              <textarea name="description" value={form.description} onChange={handleChange}
                className={styles.settingsTextarea} rows={5}
                placeholder="Describe the product, benefits, and use cases…" />
            </div>
          </div>

          {/* 04 — Pricing & Inventory */}
          <div className={blogStyles.formBlock}>
            <div className={blogStyles.formBlockHeader}>
              <span className={blogStyles.formBlockNum}>04</span>
              <span className={blogStyles.formBlockTitle}>Pricing & Inventory</span>
            </div>
            <div className={styles.settingsFields}>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Price (USD) *</label>
                <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange}
                  className={styles.settingsInput} placeholder="99.99" />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Stock Quantity</label>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                  className={styles.settingsInput} placeholder="0" />
              </div>
              <div className={styles.settingsField}>
                <label className={styles.settingsLabel}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={styles.settingsInput}>
                  {PRODUCT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className={blogStyles.formSidebar}>
          <div className={blogStyles.sidebarPanel}>
            <p className={blogStyles.sidebarPanelTitle}>Tags</p>
            <div className={styles.settingsField}>
              <input name="tags" type="text" value={form.tags} onChange={handleChange}
                className={styles.settingsInput} placeholder="electronics, shipping, custom" />
              <p className={blogStyles.fieldNote}>Comma-separated tags for filtering and search.</p>
            </div>
          </div>

          <div className={blogStyles.sidebarPanel}>
            <p className={blogStyles.sidebarPanelTitle}>Product Checklist</p>
            <ul className={blogStyles.checklist}>
              {[
                { label: 'Image added',        done: !!form.imageUrl },
                { label: 'Name entered',       done: !!form.name.trim() },
                { label: 'SKU provided',       done: !!form.sku.trim() },
                { label: 'Category selected',  done: !!form.category },
                { label: 'Price set',          done: !!form.price.trim() },
                { label: 'Description written',done: !!form.description.trim() },
              ].map((item, i) => (
                <li key={i} className={`${blogStyles.checklistItem} ${item.done ? blogStyles.checklistItemDone : ''}`}>
                  <span className={blogStyles.checklistDot}>{item.done ? '✓' : '○'}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className={blogStyles.previewWrapper}>
          <div className={blogStyles.previewLabel}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Product Preview
          </div>
          <ProductPreview form={form} />
        </div>
      )}
    </>
  );
}