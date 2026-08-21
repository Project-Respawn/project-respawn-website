import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getCanonicalUserId,
  getIdentityUsername,
  requireCanonicalUserId,
} from './auth'

const canonicalSub = '123e4567-e89b-42d3-a456-426614174000'

test('canonical user ID comes from the immutable Cognito sub', () => {
  assert.equal(getCanonicalUserId({ sub: canonicalSub }), canonicalSub)
})

test('canonical user ID remains sub when username differs', () => {
  const identity = {
    username: 'legacy-owner-name',
    sub: canonicalSub,
    claims: { 'cognito:username': 'claim-owner-name' },
  }

  assert.equal(getCanonicalUserId(identity), canonicalSub)
  assert.equal(getIdentityUsername(identity), 'legacy-owner-name')
})

test('canonical user ID supports the signed sub claim identity shape', () => {
  assert.equal(getCanonicalUserId({ claims: { sub: canonicalSub } }), canonicalSub)
})

test('canonical user ID accepts Cognito UUID subjects without assuming version or variant bits', () => {
  const opaqueCognitoSub = '0198d688-95c7-7def-0123-0123456789ab'
  assert.equal(getCanonicalUserId({ sub: opaqueCognitoSub }), opaqueCognitoSub)
})

test('missing and invalid Cognito subjects are rejected', () => {
  for (const identity of [
    undefined,
    {},
    { sub: '' },
    { sub: 'username-not-a-sub' },
    { claims: { sub: 123 } },
    { sub: canonicalSub, claims: { sub: '6ba7b810-9dad-41d1-80b4-00c04fd430c8' } },
  ]) {
    assert.equal(getCanonicalUserId(identity as any), '')
    assert.throws(() => requireCanonicalUserId(identity as any), /Authenticated Cognito sub is required/)
  }
})

test('legacy username behavior remains compatible for existing Brand authorization', () => {
  assert.equal(getIdentityUsername({ username: 'brand-owner', sub: canonicalSub }), 'brand-owner')
  assert.equal(getIdentityUsername({ claims: { 'cognito:username': 'brand-owner' }, sub: canonicalSub }), 'brand-owner')
  assert.equal(getIdentityUsername({ claims: { username: 'brand-owner' }, sub: canonicalSub }), 'brand-owner')
  assert.equal(getIdentityUsername({ sub: canonicalSub }), canonicalSub)
})
