import assert from 'node:assert/strict'
import fs from 'node:fs'

const schema = fs.readFileSync(new URL('./resource.ts', import.meta.url), 'utf8')
const source = fs.readFileSync(new URL('../../src/views/Admin/AdminMerchCategories/AdminMerchCategories.js', import.meta.url), 'utf8')
const events = fs.readFileSync(new URL('../../src/views/Admin/Adminevents/AdminEvents.js', import.meta.url), 'utf8')
const orders = fs.readFileSync(new URL('../../src/views/Admin/AdminOrders/AdminOrders.js', import.meta.url), 'utf8')
const restRouter = fs.readFileSync(new URL('../myFunction/router/restRouter.ts', import.meta.url), 'utf8')

assert.match(schema, /MerchCategory:[\s\S]*?allow\.publicApiKey\(\)\.to\(\['read'\]\)/)
assert.match(schema, /UserProfile:[\s\S]*?allow\.owner\(\)/)
assert.match(schema, /EventSuggestion:[\s\S]*?allow\.authenticated\(\)\.to\(\['create'\]\)/)
assert.doesNotMatch(source, /models\.MerchCategory\.(create|update|delete)/)
assert.doesNotMatch(events, /models\.(EventTag|EventSuggestion)\.(create|update|delete)/)
assert.doesNotMatch(orders, /models\.FulfillmentOrder\.(list|create|update|delete)/)
assert.doesNotMatch(restRouter, /orders\/(recover-fulfillment|import-existing-revolut)/)
const stage9Result = schema.slice(schema.indexOf('Stage9MutationResult: a.customType'), schema.indexOf('ManagedOrderListResult: a.customType'))
assert.match(stage9Result, /resourceId: a\.id\(\)/)
assert.doesNotMatch(stage9Result, /resourceId: a\.id\(\)\.required\(\)/)
