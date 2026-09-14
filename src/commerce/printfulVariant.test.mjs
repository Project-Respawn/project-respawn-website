import assert from 'node:assert/strict'
import test from 'node:test'
import { findExistingPrintfulVariant, printfulSyncVariantId, printfulVariantSelectionKey } from './printfulVariant.js'

test('Printful sync variant ID is preserved independently from internal IDs', () => {
  assert.equal(printfulSyncVariantId({ id: 5352643000, fulfillmentVariantId: 5352643000 }), '5352643000')
  assert.equal(printfulVariantSelectionKey({ color: ' True Royal ', size: 'l' }), 'true royal|L')
})

test('sync repairs legacy variants by exact colour and size instead of duplicating them', () => {
  const legacy = { id: 'internal-variant', externalVariantId: '', color: 'True Royal', size: 'L' }
  const matched = findExistingPrintfulVariant([legacy], { id: 5352643000, color: 'true royal', size: 'l' })
  assert.equal(matched, legacy)
  assert.equal(findExistingPrintfulVariant([legacy], { id: 1, color: 'True Royal', size: 'XL' }), null)
})
