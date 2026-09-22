import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAuthMode } from './mode';

test('existing deployments keep managed auth unless explicitly enabled', () => {
  for (const AWS_BRANCH of [undefined, 'master', 'staging', 'Demo', 'feature/example']) {
    assert.equal(resolveAuthMode({ AWS_BRANCH }), 'managed');
  }
});

test('hosted consumer branches can reference shared auth', () => {
  for (const AWS_BRANCH of ['staging', 'Demo', 'feature/example']) {
    assert.equal(resolveAuthMode({ AWS_BRANCH, RESPAWN_AUTH_MODE: 'shared' }), 'shared');
  }
});

test('shared mode cannot silently detach the owner or switch localhost', () => {
  for (const AWS_BRANCH of [undefined, '', 'master']) {
    assert.throws(() => resolveAuthMode({ AWS_BRANCH, RESPAWN_AUTH_MODE: 'shared' }));
  }
  assert.throws(() => resolveAuthMode({ AWS_BRANCH: 'staging', RESPAWN_AUTH_MODE: 'typo' }));
});
