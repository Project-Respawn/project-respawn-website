import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { handleListPublicMerchProducts } from './handlers'

const products = [
  { id: 'visible', title: 'Visible', isVisible: true },
  { id: 'hidden', title: 'Hidden', isVisible: false },
  { id: 'unset', title: 'Unset' },
]
const result = await handleListPublicMerchProducts({}, {
  models: { MerchProduct: { list: async () => ({ data: products }) } },
})
assert.deepEqual(result.map((product: any) => product.id), ['visible'])

const schema = readFileSync(new URL('../../data/resource.ts', import.meta.url), 'utf8')
const model = schema.slice(schema.indexOf('MerchProduct: a.model'), schema.indexOf('MerchProductVariant: a.model'))
assert.doesNotMatch(model, /allow\.publicApiKey\(\)/, 'raw MerchProduct model reads must not be public')
const query = schema.slice(schema.indexOf('listPublicMerchProducts: a.query'), schema.indexOf('createManagedMerchProduct: a.mutation'))
assert.match(query, /allow\.publicApiKey\(\)/, 'the visibility-filtered query remains public')

console.log('public visible-product boundary tests passed')
