import assert from 'node:assert/strict';
import test from 'node:test';
import { consumeTwitchReturnTarget, decodeTwitchJson, getTwitchConnectionStatus, parseTwitchOAuthReturn, startTwitchConnection, twitchReturnPath } from './twitchConnection.js';

const storage = () => { const values = new Map(); return { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }; };
const client = (response) => ({ mutations: { startTwitchIntegrationOAuth: async () => response } });

test('canonical action invokes OAuth mutation and navigates to Twitch', async () => {
  let destination = '';
  const store = storage();
  await startTwitchConnection({ client: client({ data: { authorizeUrl: 'https://id.twitch.tv/oauth2/authorize?client_id=safe' } }), brandId: 'brand-1', workspaceId: 'workspace-1', returnTarget: 'setup', storage: store, navigate: (url) => { destination = url; } });
  assert.match(destination, /^https:\/\/id\.twitch\.tv\//);
  assert.equal(consumeTwitchReturnTarget(store), 'setup');
});

test('missing Workspace and Brand produce visible-action errors', async () => {
  await assert.rejects(() => startTwitchConnection({ client: client({}), brandId: 'brand-1', workspaceId: '', navigate() {} }), /Creator Workspace is required/);
  await assert.rejects(() => startTwitchConnection({ client: client({}), brandId: '', workspaceId: 'workspace-1', navigate() {} }), /Select or create a Brand/);
});

test('backend OAuth errors and missing authorization URLs are surfaced', async () => {
  await assert.rejects(() => startTwitchConnection({ client: client({ errors: [{ message: 'Denied safely' }] }), brandId: 'brand-1', workspaceId: 'workspace-1', navigate() {}, logger: { error() {} } }), /Denied safely/);
  await assert.rejects(() => startTwitchConnection({ client: client({ data: {} }), brandId: 'brand-1', workspaceId: 'workspace-1', navigate() {}, logger: { error() {} } }), /could not be started/);
});

test('OAuth return accepts only fixed internal targets', () => {
  const result = parseTwitchOAuthReturn({ search: '?twitch=connected' });
  assert.deepEqual(result, { isReturn: true, connected: true, error: '' });
  assert.equal(twitchReturnPath('setup', result), '/creator-tools/setup?twitch=connected');
  assert.equal(twitchReturnPath('https://evil.example', result), '/creator-tools/integrations?twitch=connected');
});

test('CONNECTED integration remains connected when runtime health is null', async () => {
  const status = await getTwitchConnectionStatus({ queries: { getMyTwitchIntegration: async () => ({ data: {
    integration: JSON.stringify({ id: 'integration-1', connectionStatus: 'CONNECTED', twitchLogin: 'creator_login', twitchDisplayName: 'Creator Display' }),
    health: null,
  } }) } }, 'brand-1');
  assert.equal(status.connected, true);
  assert.equal(status.accountName, 'Creator Display');
  assert.equal(status.health, null);
});

test('status mapping safely accepts already-decoded integration and health', async () => {
  const integration = { id: 'integration-1', connectionStatus: 'CONNECTED', twitchLogin: 'creator_login' };
  const status = await getTwitchConnectionStatus({ queries: { getMyTwitchIntegration: async () => ({ data: { integration, health: { botConnected: null } } }) } }, 'brand-1');
  assert.equal(status.integration, integration);
  assert.equal(status.connected, true);
  assert.deepEqual(status.health, { botConnected: null });
});

test('AWSJSON decoder accepts object, serialized, and production double-encoded representations', () => {
  const integration = { connectionStatus: 'CONNECTED', twitchLogin: 'ravens_gamer', workspaceId: 'workspace-1' };
  assert.equal(decodeTwitchJson(integration), integration);
  assert.deepEqual(decodeTwitchJson(JSON.stringify(integration)), integration);
  assert.deepEqual(decodeTwitchJson(JSON.stringify(JSON.stringify(integration))), integration);
  assert.equal(decodeTwitchJson(null), null);
  assert.equal(decodeTwitchJson(undefined), null);
  assert.equal(decodeTwitchJson('{malformed'), null);
  assert.equal(decodeTwitchJson(JSON.stringify(JSON.stringify(JSON.stringify(integration)))), null, 'decoding is bounded to two passes');
});

test('production double-encoded integration and health retain connected application state', async () => {
  const integration = { connectionStatus: 'CONNECTED', twitchLogin: 'ravens_gamer', workspaceId: 'workspace-1' };
  const health = { stale: true, botConnected: null };
  const status = await getTwitchConnectionStatus({ queries: { getMyTwitchIntegration: async () => ({ data: {
    integration: JSON.stringify(JSON.stringify(integration)),
    health: JSON.stringify(JSON.stringify(health)),
  } }) } }, 'brand-1');
  assert.equal(status.connected, true);
  assert.equal(status.accountName, 'ravens_gamer');
  assert.equal(status.integration.connectionStatus, 'CONNECTED');
  assert.equal(status.integration.twitchLogin, 'ravens_gamer');
  assert.equal(status.integration.workspaceId, 'workspace-1');
  assert.equal(status.health.stale, true);
});
