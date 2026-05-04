import https from 'node:https';
import type { Handler } from 'aws-lambda';

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY;
const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

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
        Authorization: authHeader || '',
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
            body: JSON.parse(data),
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

export const handler: Handler = async (event: any) => {
  const path = event.path || event.rawPath;
  const method = event.httpMethod || event.requestContext?.http?.method;
  const body = event.body ? JSON.parse(event.body) : null;

  try {
    if (path.includes('/revolut/checkout') && method === 'POST') {
      const { amount, currency = 'GBP', description, customerId } = body;

      const orderData = {
        amount: Math.round(amount * 100),
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

      return {
        statusCode: result.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result.body),
      };
    }

    if (path.includes('/revolut/orders/') && method === 'GET') {
      const orderId = path.split('/').pop();

      const result = await makeRequest(
        'api.revolut.com',
        'GET',
        `/v1/orders/${orderId}`,
        null,
        `Bearer ${REVOLUT_API_KEY}`
      );

      return {
        statusCode: result.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result.body),
      };
    }

    if (path.includes('/printful/products') && method === 'GET') {
      const result = await makeRequest(
        'api.printful.com',
        'GET',
        '/v2/catalog/products',
        null,
        `Bearer ${PRINTFUL_API_KEY}`
      );

      return {
        statusCode: result.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result.body),
      };
    }

    if (path.includes('/printful/orders') && method === 'POST') {
      const orderData = {
        external_id: body.orderId,
        shipping: body.shippingMethod || 'STANDARD',
        items: body.items,
        recipient: {
          name: body.customerName,
          address1: body.address,
          city: body.city,
          state_code: body.state,
          postcode: body.postcode,
          country_code: body.country || 'GB',
          email: body.email,
        },
      };

      const result = await makeRequest(
        'api.printful.com',
        'POST',
        '/v2/orders',
        orderData,
        `Bearer ${PRINTFUL_API_KEY}`
      );

      return {
        statusCode: result.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result.body),
      };
    }

    if (path.includes('/printful/orders/') && method === 'GET') {
      const orderId = path.split('/').pop();

      const result = await makeRequest(
        'api.printful.com',
        'GET',
        `/v2/orders/${orderId}`,
        null,
        `Bearer ${PRINTFUL_API_KEY}`
      );

      return {
        statusCode: result.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result.body),
      };
    }

    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  } catch (error: any) {
    console.error('API Error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Request failed',
        message: error.message,
      }),
    };
  }
};
