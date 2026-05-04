import https from 'node:https';

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function makeRequest(
  hostname: string,
  method: string,
  path: string,
  body: any = null,
  authHeader?: string
): Promise<{ statusCode?: number; body: any }> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method,
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : {},
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(body),
  };
}

export const handler = async (event: any) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  const body = event.body ? JSON.parse(event.body) : null;

  try {
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          ...defaultHeaders,
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: '',
      };
    }

    // ===== REVOLUT =====

    if (path.endsWith('/revolut/checkout') && method === 'POST') {
      const { amount, currency = 'GBP', description, customerId } = body || {};

      if (!amount || Number(amount) <= 0) {
        return jsonResponse(400, { error: 'Invalid amount' });
      }

      const orderData = {
        amount: Math.round(Number(amount) * 100),
        currency,
        description: description || 'Project Respawn Merch Order',
        customer_id: customerId,
      };

      const result = await makeRequest(
        'api.revolut.com',
        'POST',
        '/v1/orders',
        orderData,
        `Bearer ${REVOLUT_API_KEY}`
      );

      return jsonResponse(result.statusCode || 500, result.body);
    }

    if (/\/revolut\/orders\/[^/]+$/.test(path) && method === 'GET') {
      const orderId = path.split('/').pop();

      if (!orderId) {
        return jsonResponse(400, { error: 'Missing orderId' });
      }

      const result = await makeRequest(
        'api.revolut.com',
        'GET',
        `/v1/orders/${orderId}`,
        null,
        `Bearer ${REVOLUT_API_KEY}`
      );

      return jsonResponse(result.statusCode || 500, result.body);
    }

    // ===== PRINTFUL PRODUCTS =====

    if (path.endsWith('/printful/products') && method === 'GET') {
      const result = await makeRequest(
        'api.printful.com',
        'GET',
        '/store/products',
        null,
        `Bearer ${PRINTFUL_API_KEY}`
      );

      return jsonResponse(result.statusCode || 500, result.body);
    }

    if (/\/printful\/products\/[^/]+$/.test(path) && method === 'GET') {
      const productId = path.split('/').pop();

      if (!productId) {
        return jsonResponse(400, { error: 'Missing productId' });
      }

      const result = await makeRequest(
        'api.printful.com',
        'GET',
        `/store/products/${productId}`,
        null,
        `Bearer ${PRINTFUL_API_KEY}`
      );

      return jsonResponse(result.statusCode || 500, result.body);
    }

    // ===== PRINTFUL ORDERS =====

    if (path.endsWith('/printful/orders') && method === 'POST') {
      const orderData = {
        external_id: body?.orderId,
        shipping: body?.shippingMethod || 'STANDARD',
        items: body?.items || [],
        recipient: {
          name: body?.customerName,
          address1: body?.address,
          city: body?.city,
          state_code: body?.state,
          postcode: body?.postcode,
          country_code: body?.country || 'GB',
          email: body?.email,
          phone: body?.phone,
        },
      };

      if (!orderData.external_id || !orderData.recipient.name || !orderData.items.length) {
        return jsonResponse(400, { error: 'Missing required order fields' });
      }

      const result = await makeRequest(
        'api.printful.com',
        'POST',
        '/orders',
        orderData,
        `Bearer ${PRINTFUL_API_KEY}`
      );

      return jsonResponse(result.statusCode || 500, result.body);
    }

    if (/\/printful\/orders\/[^/]+$/.test(path) && method === 'GET') {
      const orderId = path.split('/').pop();

      if (!orderId) {
        return jsonResponse(400, { error: 'Missing orderId' });
      }

      const result = await makeRequest(
        'api.printful.com',
        'GET',
        `/orders/${orderId}`,
        null,
        `Bearer ${PRINTFUL_API_KEY}`
      );

      return jsonResponse(result.statusCode || 500, result.body);
    }

    return jsonResponse(400, { error: 'Invalid request' });
  } catch (error: any) {
    console.error('API Error:', error);

    return jsonResponse(500, {
      error: 'Request failed',
      message: error.message || 'Unknown error',
    });
  }
};
