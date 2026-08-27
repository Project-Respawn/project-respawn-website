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
  assert.match(handler, /SET sceneId = :sceneId, sceneSnapshot = :snapshot, revision = revision \+ :one/);
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
