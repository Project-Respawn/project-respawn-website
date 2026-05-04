import type { Handler } from 'aws-lambda';
import https from 'https';

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY;
const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

type RequestResult = {
  statusCode?: number;
  body: unknown;
};

function makeRequest(
  hostname: string,
  method: string,
  path: string,
  body: unknown = null,
  authHeader?: string
): Promise<RequestResult> {
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
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
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

      const result = 
