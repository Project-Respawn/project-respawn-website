import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCurrentUtcOffset, KNOWN_TIMEZONE_IDS } from './timezones.js';

test('curated timezone values are canonical IANA identifiers', () => {
  assert.equal(KNOWN_TIMEZONE_IDS.has('Europe/London'), true);
  assert.equal(KNOWN_TIMEZONE_IDS.has('America/New_York'), true);
  assert.equal(KNOWN_TIMEZONE_IDS.has('GMT+1'), false);
});

test('current offsets are calculated for a supplied date instead of stored', () => {
  const summer = new Date('2026-08-15T12:00:00Z');
  assert.equal(formatCurrentUtcOffset('Europe/London', summer), 'GMT+1');
  assert.equal(formatCurrentUtcOffset('America/New_York', summer), 'GMT-4');
  assert.equal(formatCurrentUtcOffset('Asia/Kolkata', summer), 'GMT+5:30');
});
