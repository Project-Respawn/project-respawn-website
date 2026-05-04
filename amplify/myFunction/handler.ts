declare const process: any;

import type { Handler } from 'aws-lambda';

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY;
const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

async function makeRequest(
  url: string,
  method: string,
  body: any = null,
  authHeader?: string
): Promise<{ statusCode: number; body: any }> {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader || '',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  try {
    return {
      statusCode: response.status,
      body: JSON.parse(text),
    };
  } catch {
    return {
      statusCode: response.status,
      body: text,
    };
  }
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
        'https://api.revolut.com/v1/orders',
        'POST',
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
        `https://api.revolut.com/v1/orders/${orderId}`,
        'GET',
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

    if (path.includes('/printful/products/') && method === 'GET') {
      const productId = path.split('/').pop();

      const result = await makeRequest(
        `https://api.printful.com/sync/products/${productId}`,
        'GET',
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

    if (path.includes('/printful/products') && method === 'GET') {
      const result = await makeRequest(
        'https://api.printful.com/sync/products',
        'GET',
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
        'https://api.printful.com/v2/orders',
        'POST',
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
        `https://api.printful.com/v2/orders/${orderId}`,
        'GET',
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
