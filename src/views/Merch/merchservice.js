const API_BASE = '/api';

async function handleResponse(response, errorMessage) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${errorMessage}: ${response.status} ${text}`);
  }

  return await response.json();
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/printful/products`);
  return handleResponse(response, 'Failed to load products');
}

export async function fetchProductById(id) {
  const response = await fetch(`${API_BASE}/printful/products/${id}`);
  return handleResponse(response, `Failed to load product ${id}`);
}