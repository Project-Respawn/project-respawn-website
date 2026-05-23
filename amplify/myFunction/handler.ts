declare const process: any;

import type { Handler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/myFunction';
import type { Schema } from '../data/resource';

// =============================================================================
// Environment
// =============================================================================

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY;
const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

// =============================================================================
// Amplify Data client
// =============================================================================

let clientPromise: Promise<any> | null = null;

async function getDataClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { resourceConfig, libraryOptions } =
        await getAmplifyDataClientConfig(env);

      Amplify.configure(resourceConfig, libraryOptions);

      return generateClient<Schema>();
    })();
  }

  return clientPromise;
}

// =============================================================================
// Shared response helpers
// =============================================================================

function jsonResponse(statusCode: number, payload: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(payload),
  };
}

function getRequestPath(event: any) {
  return event?.rawPath || event?.path || '';
}

function getRequestMethod(event: any) {
  return event?.requestContext?.http?.method || event?.httpMethod || '';
}

function getRequestBody(event: any) {
  if (!event?.body) return null;

  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return null;
  }
}

function getQueryParams(event: any) {
  return event?.queryStringParameters || {};
}

// =============================================================================
// Shared outbound request helper
// =============================================================================

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

// =============================================================================
// Revolut helpers
// =============================================================================

function buildRevolutAuthHeader() {
  return `Bearer ${REVOLUT_API_KEY}`;
}

function buildRevolutOrderPayload(body: any) {
  return {
    amount: Math.round(Number(body.amount) * 100),
    currency: body.currency || 'GBP',
    description: body.description || 'Project Respawn Merch Order',
    customer_id: body.customerId,
  };
}

// =============================================================================
// Revolut handlers
// =============================================================================

async function handleRevolutCheckout(body: any) {
  const { amount } = body || {};

  if (!amount) {
    return jsonResponse(400, { error: 'Missing amount' });
  }

  const orderData = buildRevolutOrderPayload(body);

  const result = await makeRequest(
    'https://api.revolut.com/v1/orders',
    'POST',
    orderData,
    buildRevolutAuthHeader()
  );

  return jsonResponse(result.statusCode, result.body);
}

async function handleRevolutOrderLookup(path: string) {
  const orderId = path.split('/').pop();

  if (!orderId) {
    return jsonResponse(400, { error: 'Missing orderId' });
  }

  const result = await makeRequest(
    `https://api.revolut.com/v1/orders/${orderId}`,
    'GET',
    null,
    buildRevolutAuthHeader()
  );

  return jsonResponse(result.statusCode, result.body);
}

// =============================================================================
// Printful helpers
// =============================================================================

function buildPrintfulAuthHeader() {
  return `Bearer ${PRINTFUL_API_KEY}`;
}

function buildPrintfulOrderPayload(body: any) {
  return {
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
}

// =============================================================================
// Printful handlers
// =============================================================================

async function handlePrintfulProducts() {
  const result = await makeRequest(
    'https://api.printful.com/sync/products',
    'GET',
    null,
    buildPrintfulAuthHeader()
  );

  return jsonResponse(result.statusCode, result.body);
}

async function handlePrintfulProductLookup(path: string) {
  const productId = path.split('/').pop();

  if (!productId) {
    return jsonResponse(400, { error: 'Missing productId' });
  }

  const result = await makeRequest(
    `https://api.printful.com/sync/products/${productId}`,
    'GET',
    null,
    buildPrintfulAuthHeader()
  );

  return jsonResponse(result.statusCode, result.body);
}

async function handlePrintfulCreateOrder(body: any) {
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return jsonResponse(400, { error: 'Missing order items' });
  }

  const orderData = buildPrintfulOrderPayload(body);

  const result = await makeRequest(
    'https://api.printful.com/v2/orders',
    'POST',
    orderData,
    buildPrintfulAuthHeader()
  );

  return jsonResponse(result.statusCode, result.body);
}

async function handlePrintfulOrderLookup(path: string) {
  const orderId = path.split('/').pop();

  if (!orderId) {
    return jsonResponse(400, { error: 'Missing orderId' });
  }

  const result = await makeRequest(
    `https://api.printful.com/v2/orders/${orderId}`,
    'GET',
    null,
    buildPrintfulAuthHeader()
  );

  return jsonResponse(result.statusCode, result.body);
}

// =============================================================================
// Twitch helpers
// =============================================================================

// Migration-safe fallback for legacy TwitchCommand records that may still be missing
// category or permissionLevel in storage.
function mapTwitchCommand(command: any) {
  return {
    id: command.id,
    streamerId: command.streamerId,
    name: command.name,
    reply: command.reply,
    enabled: command.enabled,
    cooldownSeconds: command.cooldownSeconds,
    isCustom: command.isCustom,
    category: command.category || 'Custom',
    permissionLevel: command.permissionLevel || 'everyone',
  };
}

// =============================================================================
// Twitch handlers
// =============================================================================

async function handleTwitchCommandsLookup(event: any) {
  const query = getQueryParams(event);
  const broadcasterId = String(query?.broadcasterId || '').trim();

  if (!broadcasterId) {
    return jsonResponse(400, { error: 'Missing broadcasterId' });
  }

  const client = await getDataClient();

  const result = await client.models.TwitchCommand.list({
    filter: {
      streamerId: { eq: broadcasterId },
    },
  });

  if (result.errors?.length) {
    console.error('TwitchCommand lookup errors:', result.errors);

    return jsonResponse(500, {
      error: 'Failed to load commands',
      details: result.errors,
    });
  }

  const commands = (result.data || []).map(mapTwitchCommand);

  return jsonResponse(200, {
    broadcasterId,
    commands,
  });
}

async function handleTwitchCommandsMe(event: any) {
  const method = getRequestMethod(event);

  if (method === 'GET') {
    return jsonResponse(200, {
      message: 'GET /twitch/commands/me not implemented yet',
      commands: [],
    });
  }

  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    return jsonResponse(200, {
      message: `${method} /twitch/commands/me not implemented yet`,
    });
  }

  return jsonResponse(405, { error: 'Method not allowed' });
}

// =============================================================================
// Route dispatch
// =============================================================================

async function handleRevolutRoutes(path: string, method: string, body: any) {
  if (path.includes('/revolut/checkout') && method === 'POST') {
    return handleRevolutCheckout(body);
  }

  if (path.includes('/revolut/orders/') && method === 'GET') {
    return handleRevolutOrderLookup(path);
  }

  return null;
}

async function handlePrintfulRoutes(path: string, method: string, body: any) {
  if (path.includes('/printful/products/') && method === 'GET') {
    return handlePrintfulProductLookup(path);
  }

  if (path.includes('/printful/products') && method === 'GET') {
    return handlePrintfulProducts();
  }

  if (path.includes('/printful/orders') && method === 'POST') {
    return handlePrintfulCreateOrder(body);
  }

  if (path.includes('/printful/orders/') && method === 'GET') {
    return handlePrintfulOrderLookup(path);
  }

  return null;
}

async function handleTwitchRoutes(path: string, method: string, event: any) {
  if (path.includes('/twitch/commands/me')) {
    return handleTwitchCommandsMe(event);
  }

  if (path.includes('/twitch/commands') && method === 'GET') {
    return handleTwitchCommandsLookup(event);
  }

  return null;
}

// =============================================================================
// Main handler
// =============================================================================

export const handler: Handler = async (event: any) => {
  const path = getRequestPath(event);
  const method = getRequestMethod(event);
  const body = getRequestBody(event);

  try {
    const revolutResponse = await handleRevolutRoutes(path, method, body);
    if (revolutResponse) return revolutResponse;

    const printfulResponse = await handlePrintfulRoutes(path, method, body);
    if (printfulResponse) return printfulResponse;

    const twitchResponse = await handleTwitchRoutes(path, method, event);
    if (twitchResponse) return twitchResponse;

    return jsonResponse(400, { error: 'Invalid request' });
  } catch (error: any) {
    console.error('API Error:', error);

    return jsonResponse(500, {
      error: 'Request failed',
      message: error.message,
    });
  }
};