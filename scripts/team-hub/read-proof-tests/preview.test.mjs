import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { generateKeyPairSync, sign, verify } from 'node:crypto';
import { createPreviewHandler, previewResponse } from '../../../domains/team-hub/preview.mjs';
import { environment, claims, now } from '../tests/fixtures.mjs';
const event = claim => ({ routeKey: 'GET /v1/team-hub/preview', requestContext: { requestId: 'synthetic-preview-test', authorizer: { jwt: { claims: claim } } } });
for (const [name, patch] of [['wrong issuer', { iss: 'https://other.example.invalid' }], ['wrong client', { client_id: 'wrong-client' }], ['ID token', { token_use: 'id' }], ['expired', { exp: now }], ['invalid subject', { sub: 'not-a-subject' }]]) test(`${name}: 401`, async () => {
  const handler = createPreviewHandler(environment, () => now, () => {});
  assert.equal((await handler(event({ ...claims('player'), ...patch }))).statusCode, 401);
});
test('missing/unverified token cannot create authorizer context', async () => {
  const handler = createPreviewHandler(environment, () => now, () => {});
  for (const value of [{}, { headers: { authorization: 'Bearer invalid' } }, { body: JSON.stringify({ claims: claims('admin') }) }]) assert.equal((await handler(value)).statusCode, 401);
});
test('accepted same-environment claim context returns explicitly synthetic, non-business DTO and safe logs', async () => {
  const logs = []; const handler = createPreviewHandler(environment, () => now, entry => logs.push(entry));
  const response = await handler(event(claims('player'))); assert.equal(response.statusCode, 200); assert.deepEqual(JSON.parse(response.body), previewResponse);
  assert.equal(response.headers['cache-control'], 'no-store'); assert.equal(logs.length, 1);
  assert.doesNotMatch(JSON.stringify(logs), /Authorization|Bearer|00000000|client_id|iss|sub|@/);
  assert.equal((await handler({ ...event(claims('player')), routeKey: 'POST /v1/teams' })).statusCode, 404);
});
test('offline signed-token authorizer model rejects forged signature and wrong issuer/client, then handler enforces purpose', async () => {
  // Synthetic keys/tokens exist only in memory. This models the configured AWS authorizer,
  // not a live Cognito/API Gateway acceptance test or production custom JWT verifier.
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const make = payload => { const data = `${Buffer.from('{"alg":"RS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`; return `${data}.${sign('RSA-SHA256', Buffer.from(data), privateKey).toString('base64url')}`; };
  const handler = createPreviewHandler(environment, () => now, () => {});
  const gateway = async token => {
    try {
      const [header, body, signature, extra] = token.split('.'); if (extra || !verify('RSA-SHA256', Buffer.from(`${header}.${body}`), publicKey, Buffer.from(signature, 'base64url'))) throw new Error('Invalid signature');
      const value = JSON.parse(Buffer.from(body, 'base64url').toString());
      if (value.iss !== environment.issuer || value.client_id !== environment.clientId || value.exp <= now) throw new Error('Invalid claims');
      return (await handler(event(value))).statusCode;
    } catch { return 401; }
  };
  assert.equal(await gateway('invalid'), 401);
  const token = make(claims('player')); assert.equal(await gateway(token), 200);
  const parts = token.split('.'); parts[2] = Buffer.alloc(256).toString('base64url'); assert.equal(await gateway(parts.join('.')), 401);
  for (const patch of [{ iss: 'wrong' }, { client_id: 'wrong' }, { token_use: 'id' }]) assert.equal(await gateway(make({ ...claims('player'), ...patch })), 401);
});
test('actual synthesized Lambda artifact exports handler and runs with pinned environment', async () => {
  const latest = JSON.parse(fs.readFileSync('infrastructure/domains/team-hub/.build/latest-read-proof.json', 'utf8'));
  const receipt = JSON.parse(fs.readFileSync(latest.receipt, 'utf8'));
  const runtime = receipt.closure.find(c => c.name === 'read').outputs[0].path;
  const variables = { DOMAIN_ENV: environment.environment, DOMAIN_ACCOUNT: environment.account, DOMAIN_REGION: environment.region, EXPECTED_ISSUER: environment.issuer, EXPECTED_POOL_ID: environment.poolId, EXPECTED_CLIENT_ID: environment.clientId };
  const previous = Object.fromEntries(Object.keys(variables).map(k => [k, process.env[k]])); Object.assign(process.env, variables);
  const require = createRequire(import.meta.url); const artifact = require(`${process.cwd()}/${runtime}`);
  try {
    const response = await artifact.handler(event({ ...claims('player'), exp: Math.floor(Date.now() / 1000) + 300 }));
    assert.equal(response.statusCode, 200); assert.equal(JSON.parse(response.body).dataAuthority, 'SYNTHETIC');
  } finally { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete process.env[key]; else process.env[key] = value; }
});
