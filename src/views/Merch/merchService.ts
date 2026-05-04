import outputs from '../../../amplify_outputs.json';

export interface ProductVariant {
  id: string | number;
  name?: string;
  color?: string;
  size?: string;
  price?: number;
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  source: 'printful' | 'manual';
  price: number;
  variants?: ProductVariant[];
  checkoutUrl?: string;
  productUrl?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  variantId?: string | number;
  quantity: number;
  price: number;
  image: string;
}

const API_BASE =
  outputs.custom?.API?.projectRespawnApi?.endpoint?.replace(/\/$/, '');

if (!API_BASE) {
  console.warn('Missing projectRespawnApi endpoint in amplify_outputs.json. Merch functionality will not work until backend is deployed.');
}

function getJsonHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

async function parseResponse(response: Response, errorPrefix: string) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorPrefix}: ${response.status} ${errorText}`);
  }

  return response.json();
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeVariant(variant: any, fallbackImage = ''): ProductVariant {
  return {
    id: variant?.id ?? '',
    name: variant?.name || '',
    color: variant?.color || '',
    size: variant?.size || '',
    price: toNumber(variant?.retail_price, 0),
    image:
      variant?.files?.[0]?.preview_url ||
      variant?.product?.image ||
      fallbackImage ||
      '',
  };
}

function normalizeProductSummary(product: any): Product {
  const variants = Array.isArray(product?.sync_variants)
    ? product.sync_variants.map((variant: any) =>
        normalizeVariant(variant, product?.thumbnail_url || '')
      )
    : [];

  const firstVariantPrice =
    variants.find((variant) => typeof variant.price === 'number' && variant.price > 0)?.price ?? 0;

  return {
    id: String(product?.id ?? ''),
    title: product?.name || 'Untitled Product',
    description: product?.description || '',
    image: product?.thumbnail_url || '',
    images: product?.thumbnail_url ? [product.thumbnail_url] : [],
    source: 'printful',
    price: firstVariantPrice,
    variants,
  };
}

function normalizeProductDetails(result: any): Product {
  const syncProduct = result?.sync_product || result || {};
  const variants = Array.isArray(result?.sync_variants)
    ? result.sync_variants.map((variant: any) =>
        normalizeVariant(variant, syncProduct?.thumbnail_url || '')
      )
    : [];

  const firstVariantPrice =
    variants.find((variant) => typeof variant.price === 'number' && variant.price > 0)?.price ?? 0;

  return {
    id: String(syncProduct?.id ?? ''),
    title: syncProduct?.name || 'Untitled Product',
    description: syncProduct?.description || '',
    image: syncProduct?.thumbnail_url || '',
    images: syncProduct?.thumbnail_url ? [syncProduct.thumbnail_url] : [],
    source: 'printful',
    price: firstVariantPrice,
    variants,
  };
}

// ===== PRODUCT FETCHING =====
export async function fetchProducts(): Promise<Product[]> {
  if (!API_BASE) {
    console.warn('API_BASE not set, returning empty products');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/printful/products`, {
      method: 'GET',
      headers: getJsonHeaders(),
    });

    const data = await parseResponse(response, 'Failed to fetch products');
    const products = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];

    return products.map(normalizeProductSummary);
  } catch (error) {
    console.error('Fetch products error:', error);
    throw error;
  }
}

export async function fetchProductDetails(productId: string): Promise<Product> {
  if (!API_BASE) {
    throw new Error('API_BASE not set');
  }

  try {
    const response = await fetch(`${API_BASE}/printful/products/${productId}`, {
      method: 'GET',
      headers: getJsonHeaders(),
    });

    const data = await parseResponse(response, 'Failed to fetch product details');
    const result = data?.result || data;

    if (!result) {
      throw new Error('Invalid product details response format');
    }

    return normalizeProductDetails(result);
  } catch (error) {
    console.error('Fetch product details error:', error);
    throw error;
  }
}

export async function hydrateProducts(products: Product[]): Promise<Product[]> {
  const hydratedProducts = await Promise.all(
    products.map(async (product) => {
      if (product.source !== 'printful') {
        return product;
      }

      try {
        return await fetchProductDetails(product.id);
      } catch (error) {
        console.error(`Failed to hydrate product ${product.id}:`, error);
        return product;
      }
    })
  );

  return hydratedProducts;
}

// ===== REVOLUT CHECKOUT =====
export async function createRevolutOrder(orderData: {
  amount: number;
  currency?: string;
  description?: string;
  customerId?: string;
}): Promise<any> {
  if (!API_BASE) {
    throw new Error('API_BASE not set');
  }

  try {
    const response = await fetch(`${API_BASE}/revolut/checkout`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(orderData),
    });

    return await parseResponse(response, 'Failed to create checkout order');
  } catch (error) {
    console.error('Revolut checkout error:', error);
    throw error;
  }
}

// ===== PRINTFUL ORDER CREATION =====
export async function createPrintfulOrder(orderData: {
  orderId: string;
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  postcode: string;
  country?: string;
  shippingMethod?: string;
  items: Array<{
    variant_id: string | number;
    quantity: number;
  }>;
}): Promise<any> {
  if (!API_BASE) {
    throw new Error('API_BASE not set');
  }

  try {
    const response = await fetch(`${API_BASE}/printful/orders`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(orderData),
    });

    return await parseResponse(response, 'Failed to create print order');
  } catch (error) {
    console.error('Printful order error:', error);
    throw error;
  }
}

// ===== GET ORDER STATUS =====
export async function getRevolutOrderStatus(orderId: string): Promise<any> {
  if (!API_BASE) {
    throw new Error('API_BASE not set');
  }

  try {
    const response = await fetch(`${API_BASE}/revolut/orders/${orderId}`, {
      method: 'GET',
      headers: getJsonHeaders(),
    });

    return await parseResponse(response, 'Failed to fetch Revolut order status');
  } catch (error) {
    console.error('Get order status error:', error);
    throw error;
  }
}

export async function getPrintfulOrderStatus(orderId: string): Promise<any> {
  if (!API_BASE) {
    throw new Error('API_BASE not set');
  }

  try {
    const response = await fetch(`${API_BASE}/printful/orders/${orderId}`, {
      method: 'GET',
      headers: getJsonHeaders(),
    });

    return await parseResponse(response, 'Failed to fetch Printful order status');
  } catch (error) {
    console.error('Get printful order status error:', error);
    throw error;
  }
}
