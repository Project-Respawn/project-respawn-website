import fixture from './fixture.json' with {type: 'json'};
import {assertPreview} from './contract.js';
type Event = {version?: string; rawPath?: string; rawQueryString?: string; body?: unknown; queryStringParameters?: Record<string, unknown>; requestContext?: {apiId?: string; http?: {method?: string}; authorizer?: {jwt?: {claims?: Record<string, unknown>}}}};
const reply = (statusCode: number, value: unknown) => ({statusCode, headers: {'content-type': 'application/json', 'cache-control': 'no-store'}, body: JSON.stringify(value)});
// API Gateway verifies the JWT signature; only its trusted authorizer context is used here.
export async function handler(event: Event) {
  const {EXPECTED_ISSUER: issuer, EXPECTED_CLIENT_ID: client, DOMAIN_ENV: environment, BUILD_REVISION: revision, EXPECTED_API_ID: apiId} = process.env;
  if (!issuer || !client || environment !== 'Ntgre' || !revision || !apiId) return reply(500, {error: 'Configuration unavailable'});
  if (event.version !== '2.0' || event.rawPath !== '/v1/tournaments/preview') return reply(404, {error: 'Not found'});
  if (event.requestContext?.http?.method !== 'GET') return reply(405, {error: 'Method not allowed'});
  const c = event.requestContext.authorizer?.jwt?.claims;
  const now = Math.floor(Date.now() / 1000);
  if (event.requestContext.apiId !== apiId || !c || c.iss !== issuer || c.client_id !== client || c.token_use !== 'access' || typeof c.sub !== 'string' || !/^[a-f0-9-]{36}$/i.test(c.sub) || !Number.isFinite(Number(c.exp)) || Number(c.exp) <= now || (c.nbf !== undefined && Number(c.nbf) > now)) return reply(401, {error: 'Unauthorized'});
  if (event.body !== undefined && event.body !== null && event.body !== '' || event.rawQueryString || Object.keys(event.queryStringParameters ?? {}).length) return reply(400, {error: 'This preview accepts no payload or query parameters'});
  const preview = {...fixture, revision};
  assertPreview(preview);
  return reply(200, preview);
}
