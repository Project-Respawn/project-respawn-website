import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const schema = readFileSync(new URL('./resource.ts', import.meta.url), 'utf8')
const storage = readFileSync(new URL('../storage/resource.ts', import.meta.url), 'utf8')
const storefront = readFileSync(new URL('../../src/views/Merch/Merch.logic.js', import.meta.url), 'utf8')
const mediaStart = schema.indexOf('\nMediaItem: a\n  .model')
const mediaEnd = schema.indexOf('\n    MerchProductImage: a', mediaStart)
const mediaAuth = schema.slice(mediaStart, mediaEnd)
assert.doesNotMatch(mediaAuth, /allow\.publicApiKey|allow\.authenticated/, 'MediaItem catalog must not be public or generic-authenticated')
assert.doesNotMatch(mediaAuth, /'Staff'/, 'Staff MediaItem discovery must use the effective-permission backend query')
assert.match(mediaAuth, /allow\.groups\(\['SuperAdmin', 'Admin'\]\)\.to\(\['read'\]\)/, 'fixed platform administrators may retain direct read because Media control is platform-enforced')
assert.match(schema, /allow\.resource\(myFunction\)\.to\(\['query', 'mutate'\]\)/, 'protected backend handlers must retain schema-level data access')
assert.match(schema, /listPublicMerchProductImages[\s\S]*allow\.publicApiKey/, 'product-scoped public imagery query must be public')
assert.match(storage, /allow\.guest\.to\(\['read'\]\)/, 'public media must remain anonymously readable')
assert.doesNotMatch(storage, /allow\.authenticated\.to\(\['read', 'write', 'delete'\]\)/, 'ordinary authenticated users must not write public media')
assert.match(storefront, /queries\.listPublicMerchProductImages/, 'storefront must use product-scoped imagery')
assert.doesNotMatch(storefront, /models\.MediaItem\.list/, 'storefront must not browse the MediaItem catalog')
console.log('Media and Storage boundary tests passed')
