const API_BASE = (() => {
  if (import.meta.env.DEV) {
    return '/api';
  }

  const productionBase = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!productionBase) {
    throw new Error('Missing VITE_API_BASE_URL for production merch API requests.');
  }

  return productionBase.replace(/\/+$/, '');
})();

function buildUrl(path) {
  const safePath = String(path || '').replace(/^\/+/, '');
  return `${API_BASE}/${safePath}`;
}

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function summarizeBody(body) {
  if (body == null) return '';
  if (typeof body === 'string') return body.slice(0, 300);

  try {
    return JSON.stringify(body).slice(0, 300);
  } catch {
    return String(body).slice(0, 300);
  }
}

async function handleResponse(response, errorMessage) {
  const contentType = response.headers.get('content-type') || '';
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      `${errorMessage}: ${response.status} ${response.statusText} - ${summarizeBody(body)}`
    );
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `${errorMessage}: Expected JSON but received ${
        contentType || 'unknown content type'
      } - ${summarizeBody(body)}`
    );
  }

  if (body == null || typeof body !== 'object') {
    throw new Error(`${errorMessage}: Response JSON was empty or invalid.`);
  }

  return body;
}

export async function fetchProducts() {
  const response = await fetch(buildUrl('/printful/products'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse(response, 'Failed to load products');
}

export async function fetchProductById(id) {
  if (!id) {
    throw new Error('Failed to load product: missing product id.');
  }

  const response = await fetch(buildUrl(`/printful/products/${encodeURIComponent(id)}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse(response, `Failed to load product ${id}`);
}