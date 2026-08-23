import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMerchCartItem, normaliseCartItem } from '../../../commerce/cartItem.js'
import {
  decodeManagedMediaLibrary,
  decodeProductControlArray,
  normalizeProductControlProduct,
} from './ProductControl.data.js'

test('Product Control accepts normal arrays and AWSJSON array strings', () => {
  assert.deepEqual(decodeProductControlArray([{ id: 'one' }], 'records'), [{ id: 'one' }])
  assert.deepEqual(decodeProductControlArray('[{"id":"one"}]', 'records'), [{ id: 'one' }])
})

test('Product Control treats null, undefined, and empty AWSJSON values as empty arrays', () => {
  for (const value of [null, undefined, '', '   ']) assert.deepEqual(decodeProductControlArray(value, 'records'), [])
})

test('Product Control reports malformed JSON and unexpected objects as controlled errors', () => {
  assert.throws(() => decodeProductControlArray('[broken', 'records'), /malformed JSON for records/)
  assert.throws(() => decodeProductControlArray('{"id":"one"}', 'records'), /decode to an array/)
  assert.throws(() => decodeProductControlArray({ id: 'one' }, 'records'), /expected records to be an array/)
})

test('managed media AWSJSON fields decode before Product Control uses array operations', () => {
  const decoded = decodeManagedMediaLibrary({
    mediaItems: '[{"id":"media-1","tags":["shirt"]}]',
    collections: '[{"id":"collection-1"}]',
  })
  assert.equal(decoded.mediaItems[0].id, 'media-1')
  assert.deepEqual(decoded.mediaItems[0].tags, ['shirt'])
  assert.equal(decoded.collections[0].id, 'collection-1')
})

test('nested product arrays and variants normalize without flattening records', () => {
  const product = normalizeProductControlProduct(
    { id: 'product-1', colors: '["Blue"]', sizes: ['L'], images: null },
    '[{"id":"variant-1","externalVariantId":"sync-1"}]',
  )
  assert.deepEqual(product.colors, ['Blue'])
  assert.deepEqual(product.sizes, ['L'])
  assert.deepEqual(product.images, [])
  assert.equal(product.variants[0].externalVariantId, 'sync-1')
})

test('known-good Printful fulfilment identifiers survive Product Control and checkout round-trip', () => {
  const baseline = {
    productId: '86f2fc08-6552-4bd2-b47e-494085653bb7',
    variantId: 'd63cf866-70a5-4d34-9fee-e67d1d445f32',
    externalVariantId: '5352643000',
    fulfillmentProvider: 'printful',
    fulfillmentVariantId: '5352643000',
    printfulSyncStoreVariantId: '5352643000',
    color: 'True Royal',
    size: 'L',
    price: 20,
  }
  const product = normalizeProductControlProduct(
    { id: baseline.productId, title: 'Project Respawn Confidence T-Shirt', sourceType: baseline.fulfillmentProvider },
    JSON.stringify([{ id: baseline.variantId, productId: baseline.productId, externalVariantId: baseline.externalVariantId, fulfillmentProvider: baseline.fulfillmentProvider, fulfillmentVariantId: baseline.fulfillmentVariantId, color: baseline.color, size: baseline.size, retailPrice: baseline.price }]),
  )
  const variant = product.variants[0]
  const cart = buildMerchCartItem({ product, variant, quantity: 1, price: variant.retailPrice })
  const checkout = normaliseCartItem(cart, 0)

  assert.deepEqual({
    productId: checkout.productId,
    variantId: checkout.variantId,
    externalVariantId: checkout.externalVariantId,
    fulfillmentProvider: checkout.fulfillmentProvider,
    fulfillmentVariantId: checkout.fulfillmentVariantId,
    printfulSyncStoreVariantId: checkout.fulfillmentVariantId,
    color: checkout.color,
    size: checkout.size,
    price: checkout.price,
  }, baseline)
})
