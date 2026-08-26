import assert from 'node:assert/strict'
import test from 'node:test'
import { decodeAwsJson, encodeAwsJson } from './awsJson'

test('Twitch AWSJSON writes serialize objects exactly once', () => {
  assert.equal(encodeAwsJson({}), '{}')
  assert.equal(encodeAwsJson({ eventSub: true }), '{"eventSub":true}')
  assert.equal(encodeAwsJson('{"eventSub":true}'), '{"eventSub":true}')
})

test('Twitch AWSJSON reads safely normalize deployed and test representations', () => {
  assert.deepEqual(decodeAwsJson('{"eventSub":true}', {}), { eventSub: true })
  assert.deepEqual(decodeAwsJson({ eventSub: true }, {}), { eventSub: true })
  assert.deepEqual(decodeAwsJson(null, {}), {})
  assert.deepEqual(decodeAwsJson(undefined, {}), {})
  assert.deepEqual(decodeAwsJson('not-json', {}), {})
})
