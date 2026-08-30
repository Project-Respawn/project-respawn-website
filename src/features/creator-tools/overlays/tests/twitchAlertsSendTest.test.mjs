import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../../views/twitch/alerts/TwitchAlerts.vue', import.meta.url), 'utf8')

test('Send Test remains actionable so missing Brand or configuration context produces a visible reason', () => {
  assert.match(source, /class="secondary-btn"[^>]+:disabled="busy"[^>]+@click="sendTest"/)
  assert.doesNotMatch(source, /class="secondary-btn"[^>]+:disabled="!canManage \|\| busy"/)
  assert.match(source, /Select an accessible Creator Brand before sending a test alert/)
  assert.match(source, /Alert configuration is not loaded yet/)
})

test('Send Test visibly blocks disabled alert configuration and explains zero delivery', () => {
  assert.match(source, /selectedConfig\.value\.enabled===false/)
  assert.match(source, /Enable \$\{selectedDefinition\.value\.name\} before sending a test alert/)
  assert.match(source, /No browser source is currently connected\. Open the Browser Source in OBS or another tab, then try again\./)
})
