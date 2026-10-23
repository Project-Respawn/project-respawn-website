// Recreate test scratch from an immutable tracked artifact, never another worktree.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export function prepareAuthorityTestFixture() {
  const root = new URL('../../', import.meta.url);
  const expected = 'cd58cc3553867f268af79bc9c710fe35e1bab07882d39b423e05b39626a7eedd';
  const archive = fs.readFileSync(new URL(`docs/architecture/team-hub-accepted-recovery-artifacts/${expected}-rollback.read.runtime.zip`, root));
  assert.equal(createHash('sha256').update(archive).digest('hex'), expected);
  assert.equal(archive.readUInt32LE(0), 0x04034b50);
  assert.equal(archive.readUInt16LE(8), 0, 'Expected the accepted stored ZIP entry');
  const nameLength = archive.readUInt16LE(26);
  assert.equal(archive.subarray(30, 30 + nameLength).toString(), 'index.js');
  const start = 30 + nameLength + archive.readUInt16LE(28);
  const output = fileURLToPath(new URL('.tmp/team-hub-authority-status/', root));
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(new URL('index.js', new URL('.tmp/team-hub-authority-status/', root)), archive.subarray(start, start + archive.readUInt32LE(18)));
}
