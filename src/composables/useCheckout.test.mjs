import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { buildMerchCartItem, isSameCartVariant, normaliseCartItem } from '../commerce/cartItem.js'

test('checkout retains the exact selected Printful variant attributes', () => {
  const item = normaliseCartItem({
    id: 'product-1', productId: 'product-1', name: 'Project Respawn Shirt',
    variantId: 'internal-variant-id', fulfillmentVariantId: 'printful-sync-variant-id',
    fulfillmentProvider: 'printful', color: 'Black', size: 'XL', quantity: 1, price: 24.99,
  }, 0)

  assert.deepEqual(item, {
    id: 'product-1', productId: 'product-1', name: 'Project Respawn Shirt',
    variant: 'XL', color: 'Black', size: 'XL', price: 24.99, quantity: 1, image: '',
    variantId: 'internal-variant-id', externalVariantId: 'printful-sync-variant-id',
    fulfillmentProvider: 'printful', fulfillmentVariantId: 'printful-sync-variant-id',
  })
})

test('merch uses the Printful external ID for fulfillment and keeps the internal variant ID separate', () => {
  const item = buildMerchCartItem({
    product: { id: 'product-1', title: 'Project Respawn Shirt', sourceType: 'printful' },
    variant: { id: 'amplify-variant-id', externalVariantId: 'printful-sync-variant-id', color: 'Black', size: 'XL', name: 'Black / XL' },
    quantity: 1, price: 24.99,
  })
  assert.equal(item.variantId, 'amplify-variant-id')
  assert.equal(item.externalVariantId, 'printful-sync-variant-id')
  assert.equal(item.fulfillmentVariantId, 'printful-sync-variant-id')
  assert.notEqual(item.fulfillmentVariantId, item.variantId)
  assert.equal(item.color, 'Black')
  assert.equal(item.size, 'XL')
})

test('same-product colour and size variants remain separate cart entries', () => {
  const base = { productId: 'product-1' }
  assert.equal(isSameCartVariant({ ...base, variantId: 'black-xl', color: 'Black', size: 'XL' }, { ...base, variantId: 'white-xl', color: 'White', size: 'XL' }), false)
  assert.equal(isSameCartVariant({ ...base, variantId: 'black-xl', color: 'Black', size: 'XL' }, { ...base, variantId: 'black-l', color: 'Black', size: 'L' }), false)
  assert.equal(isSameCartVariant({ ...base, variantId: 'black-xl', color: 'Black', size: 'XL' }, { ...base, variantId: 'black-xl', color: 'Black', size: 'XL' }), true)
})

test('checkout conditionally displays colour, size, quantity, and price', () => {
  const template = readFileSync(new URL('../views/Checkout/Checkout.vue', import.meta.url), 'utf8')
  assert.match(template, /v-if="item\.color">Colour: \{\{ item\.color \}\}/)
  assert.match(template, /v-if="item\.size">Size: \{\{ item\.size \}\}/)
  assert.match(template, /Quantity: \{\{ item\.quantity \}\}/)
  assert.match(template, /item\.price \* item\.quantity/)
})
