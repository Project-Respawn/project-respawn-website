import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { createTwitchEventDedupeStore, LEGACY_DISPOSITIONS } from './twitchEventDedupe';

const source = readFileSync(new URL('./twitchEventDedupe.ts', import.meta.url), 'utf8');

test('dedupe store permits only conditional claim and existing-record terminal updates', () => {
  assert.match(source, /new PutCommand/);
  assert.match(source, /attribute_not_exists\(dedupeKey\)/);
  assert.match(source, /ReturnValuesOnConditionCheckFailure: 'ALL_OLD'/);
  assert.match(source, /new UpdateCommand/);
  assert.match(source, /ConditionExpression: 'attribute_exists\(dedupeKey\)'/);
  assert.doesNotMatch(source, /GetCommand|DeleteCommand|ScanCommand|QueryCommand|Batch/);
});

test('conditional claim recovers the prior record without a dedupe GetItem', async () => {
  let observedCommand: unknown;
  const prior = { dedupeKey: 'key-1', state: 'DELIVERED', outcome: 'DELIVERED', legacyDisposition: LEGACY_DISPOSITIONS.suppress };
  const store = createTwitchEventDedupeStore({ TWITCH_EVENT_DEDUPE_TABLE: 'dedupe-table' }, async (command) => {
    observedCommand = command;
    throw Object.assign(new Error('already exists'), { name: 'ConditionalCheckFailedException', Item: prior });
  });
  const result = await store.claim({ dedupeKey: 'key-1' });
  assert.deepEqual(result, { status: 'DUPLICATE', record: prior });
  assert.ok(observedCommand instanceof PutCommand);
  assert.equal(observedCommand.input.ReturnValuesOnConditionCheckFailure, 'ALL_OLD');
});
