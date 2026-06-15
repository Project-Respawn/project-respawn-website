const https = require('https');

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function makeRequest(hostname, method, path, body = null, authHeader) {
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
        } catch (e) {
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

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  try {
    const path =
      event.path ||
      event.rawPath ||
      (event.requestContext &&
        event.requestContext.http &&
        event.requestContext.http.path) ||
      '';

    const method =
      event.httpMethod ||
      (event.requestContext &&
        event.requestContext.http &&
        event.requestContext.http.method) ||
      '';

    const body =
      typeof event.body === 'string'
        ? JSON.parse(event.body)
        : event.body || null;

    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: defaultHeaders,
        body: '',
      };
    }

    // ===== REVOLUT =====

    if (path.endsWith('/revolut/checkout') && method === 'POST') {
      if (!REVOLUT_API_KEY) {
        return jsonResponse(500, { error: 'Missing REVOLUT_API_KEY' });
      }

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
      if (!REVOLUT_API_KEY) {
        return jsonResponse(500, { error: 'Missing REVOLUT_API_KEY' });
      }

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
      if (!PRINTFUL_API_KEY) {
        return jsonResponse(500, { error: 'Missing PRINTFUL_API_KEY' });
      }

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
      if (!PRINTFUL_API_KEY) {
        return jsonResponse(500, { error: 'Missing PRINTFUL_API_KEY' });
      }

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
      if (!PRINTFUL_API_KEY) {
        return jsonResponse(500, { error: 'Missing PRINTFUL_API_KEY' });
      }

      const orderData = {
        external_id: body && body.orderId,
        shipping: (body && body.shippingMethod) || 'STANDARD',
        items: (body && body.items) || [],
        recipient: {
          name: body && body.customerName,
          address1: body && body.address,
          city: body && body.city,
          state_code: body && body.state,
          postcode: body && body.postcode,
          country_code: (body && body.country) || 'GB',
          email: body && body.email,
          phone: body && body.phone,
        },
      };

      if (
        !orderData.external_id ||
        !orderData.recipient.name ||
        !orderData.items.length
      ) {
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
      if (!PRINTFUL_API_KEY) {
        return jsonResponse(500, { error: 'Missing PRINTFUL_API_KEY' });
      }

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
  } catch (error) {
    console.error('API Error:', error);

    return jsonResponse(500, {
      error: 'Request failed',
      message: error && error.message ? error.message : 'Unknown error',
    });
  }
};