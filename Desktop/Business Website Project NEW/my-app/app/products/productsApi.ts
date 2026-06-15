export type CatalogProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  badge?: 'NEW' | 'SALE' | 'HOT' | 'LOW STOCK';
  inStock: boolean;
  description: string;
  sku?: string;
  tags?: string;
  imageUrl?: string | null;
};

function normalizeProduct(row: any): CatalogProduct {
  return {
    id: Number(row?.id ?? 0),
    name: String(row?.name ?? ''),
    category: String(row?.category ?? ''),
    price: Number(row?.price ?? row?.original_price ?? 0),
    originalPrice: Number(row?.original_price ?? row?.price ?? 0),
    rating: Number(row?.rating ?? 0),
    reviewCount: Number(row?.review_count ?? 0),
    badge: row?.badge ?? undefined,
    inStock: Boolean(row?.in_stock),
    description: String(row?.description ?? ''),
    sku: row?.sku ? String(row.sku) : undefined,
    tags: row?.tags ? String(row.tags) : undefined,
    imageUrl: row?.image_url ?? null,
  };
}

export async function fetchCatalogProducts() {
  const res = await fetch('/api/admin/products', { cache: 'no-store' });
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch { body = await res.text().catch(() => null); }
    console.error('fetchCatalogProducts: API error', { status: res.status, statusText: res.statusText, body });
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
  }
  let data: any = null;
  try { data = await res.json(); } catch (e) {
    const text = await res.text().catch(() => null);
    console.error('fetchCatalogProducts: failed to parse JSON', { err: e, text });
    return [];
  }
  if (!Array.isArray(data)) {
    console.error('fetchCatalogProducts: unexpected payload', data);
    return [];
  }
  return data.map(normalizeProduct);
}

export function mergeProductsWithFallback(fallback: CatalogProduct[], products: CatalogProduct[]) {
  const merged = [...fallback];
  products.forEach(product => {
    if (!merged.some(item => item.id === product.id)) merged.push(product);
  });
  return merged;
}
