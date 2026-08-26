import assert from 'node:assert/strict';
import test from 'node:test';
import { consumeTwitchReturnTarget, getTwitchConnectionStatus, parseTwitchOAuthReturn, startTwitchConnection, twitchReturnPath } from './twitchConnection.js';

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
