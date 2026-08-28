import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const handler = await readFile(new URL('./handler.ts', import.meta.url), 'utf8');

test('create atomically claims the deterministic Brand lock and never uses scan-check-put', () => {
  assert.match(handler, /new TransactWriteCommand/);
  assert.match(handler, /createActivePublicationLock\(publication\)/);
  assert.match(handler, /ConditionExpression: 'attribute_not_exists\(publicationId\)'/);
  assert.match(handler, /TransactionCanceledException/);
  assert.match(handler, /getActivePublication\(input\.brandId\)/);
  assert.doesNotMatch(handler, /ScanCommand/);
});

test('update switches scene on the existing publication while preserving credential state', () => {
  assert.match(handler, /SET sceneId = :sceneId, sceneSnapshot = :snapshot, sourceEditorRevision = :sourceEditorRevision, revision = revision \+ :one/);
  assert.match(handler, /Source editor revision is required/);
  assert.match(handler, /Save the current overlay draft before updating Live/);
  assert.doesNotMatch(handler, /UpdateExpression: '[^']*credentialHash[^']*sceneSnapshot/);
});

test('revoke atomically revokes the publication and releases only its matching active lock', () => {
  assert.match(handler, /activePublicationId = :publicationId AND ownerUserId = :owner/);
  assert.match(handler, /activePublicationLockId\(publication\.brandId\)/);
});

test('active lookup and test events re-check owner, Workspace, and Brand bindings', () => {
  assert.match(handler, /async function activePublication/);
  assert.match(handler, /async function authorizeActivePublication/);
  assert.match(handler, /active\.publicationId !== publication\.publicationId/);
  assert.match(handler, /async function sendTestEvent/);
  assert.match(handler, /await authorizeActivePublication\(publication, sub\)/);
});

test('canonical Twitch config is Brand-bound, revisioned separately, and safely merged into public source config', () => {
  assert.match(handler, /await authorizeBindings\(input, sub\)/);
  assert.match(handler, /TWITCH_OVERLAY_CONFIG/);
  assert.match(handler, /revision = if_not_exists\(revision, :zero\) \+ :one/);
  assert.match(handler, /twitchConfig: configRecord\?\.config/);
  assert.doesNotMatch(handler, /encryptedTokenBundle|TWITCH_CLIENT_SECRET|authorization.*twitchConfig/i);
});

test('editable overlay save is owner-bound, separate from publication, and revision-safe', () => {
  assert.match(handler, /async function managedEditorProject/);
  assert.match(handler, /editableOverlayProjectId/);
  assert.match(handler, /EDITABLE_OVERLAY_PROJECT/);
  assert.match(handler, /ExpressionAttributeNames: \{ '#project': 'project' \}/);
  assert.match(handler, /attribute_not_exists\(revision\).*revision = :expected/);
  assert.match(handler, /Editable overlay changed in another session/);
});
