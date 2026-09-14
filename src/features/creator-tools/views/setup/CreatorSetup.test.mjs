import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Setup derives completed Workspace, Brand and Twitch steps from canonical state', async () => {
  const setup = await readFile(new URL('./CreatorSetup.vue', import.meta.url), 'utf8');
  assert.match(setup, /refreshAccessContext\(\{ force: true \}\)/);
  assert.match(setup, /this\.workspaces = Array\.isArray/);
  assert.match(setup, /this\.brands = Array\.isArray/);
  assert.match(setup, /getTwitchConnectionStatus\(client, this\.selectedBrandId\)/);
  assert.match(setup, /v-if="twitchConnected"[\s\S]*Twitch account connected/);
  assert.match(setup, /v-else[\s\S]*@click="connectTwitch"/);
});

test('Setup and Integrations use the same canonical Twitch action', async () => {
  const [setup, integrations] = await Promise.all([
    readFile(new URL('./CreatorSetup.vue', import.meta.url), 'utf8'),
    readFile(new URL('../integrations/Integrations.vue', import.meta.url), 'utf8'),
  ]);
  assert.match(setup, /startTwitchConnection\(\{/);
  assert.match(integrations, /startTwitchConnection\(\{/);
  assert.doesNotMatch(setup, /mutations\.startTwitchIntegrationOAuth/);
  assert.doesNotMatch(integrations, /mutations\.startTwitchIntegrationOAuth/);
  assert.match(integrations, /oauthError/);
  assert.match(integrations, /connectingTwitch/);
  assert.match(setup, /this\.twitchConnected = status\.connected/);
  assert.match(integrations, /this\.twitchConnected = status\.connected/);
  assert.match(integrations, /this\.twitchHealth = status\.health/);
});
