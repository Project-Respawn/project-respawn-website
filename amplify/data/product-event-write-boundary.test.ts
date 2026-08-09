import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const schema = readFileSync(new URL('./resource.ts', import.meta.url), 'utf8')

for (const modelName of ['Event', 'MerchProduct', 'MerchProductVariant', 'MerchProductBrand', 'MerchProductCategory', 'MerchProductImage']) {
  const modelStart = schema.indexOf(`    ${modelName}: a`)
  assert.notEqual(modelStart, -1, `${modelName} must exist`)
  const authorizationStart = schema.indexOf('.authorization((allow) => [', modelStart)
  const authorizationEnd = schema.indexOf('      ]),', authorizationStart)
  const authorization = schema.slice(authorizationStart, authorizationEnd)
  assert.doesNotMatch(authorization, /'create'|'update'|'delete'/, `${modelName} must not expose direct writes`)
}

console.log('Product and Event direct-write schema boundary tests passed')
