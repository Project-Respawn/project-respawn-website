import outputs from '../../../amplify_outputs.json';

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  source: 'printful' | 'manual';
  price: number;
  variants?: {
    id: string | number;
    name?: string;
    color?: string;
    size?: string;
    price?: number;
    image?: string;
  }[];
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
  throw new Error('Missing projectRespawnApi endpoint in amplify_outputs.json');
}

// ===== PRODUCT FETCHING =====
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/printful/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const products = data.result || data;

    if (!Array.isArray(products)) {
      throw new Error('Invalid products response format');
    }

    return products.map((product: any) => ({
      id: product.id.toString(),
      title: product.name || 'Untitled Product',              // ← CHANGED: name not title
      description: product.description || '',
      image: product.thumbnail_url || '',                      // ← CHANGED: thumbnail_url first
      images: [],                                              // ← CHANGED: Catalog doesn't return image array
      source: 'printful',
      price: 0,                                                // ← CHANGED: Catalog doesn't return price
      variants: [],                                            // ← CHANGED: Catalog just returns coun
    }));
  } catch (error) {
    console.error('Fetch products error:', error);
    throw error;
  }
}

// ===== REVOLUT CHECKOUT =====
export async function createRevolutOrder(orderData: {
  amount: number;
  currency?: string;
  description?: string;
  customerId?: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/revolut/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create checkout order: ${response.status} ${errorText}`);
    }

    return await response.json();
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
  try {
    const response = await fetch(`${API_BASE}/printful/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create print order: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Printful order error:', error);
    throw error;
  }
}

// ===== GET ORDER STATUS =====
export async function getRevolutOrderStatus(orderId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/revolut/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch order status: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get order status error:', error);
    throw error;
  }
}

export async function getPrintfulOrderStatus(orderId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/printful/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch print order status: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get printful order status error:', error);
    throw error;
  }
}
