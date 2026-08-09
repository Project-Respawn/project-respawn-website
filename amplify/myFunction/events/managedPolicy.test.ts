import assert from 'node:assert/strict'
import { BRAND_USER_EDITABLE_EVENT_FIELDS, assertBrandEventFieldsAreAllowed } from './managedPolicy'

assert.deepEqual(BRAND_USER_EDITABLE_EVENT_FIELDS, [
  'title', 'shortDescription', 'description', 'longDescription', 'categories', 'locationType', 'tagIds',
  'hostUserId', 'host', 'hostDisplayName', 'startAt', 'endAt', 'featured', 'status', 'ticketMode', 'ticketTiers',
])
assert.doesNotThrow(() => assertBrandEventFieldsAreAllowed({ title: 'Updated', status: 'live' }))
assert.throws(() => assertBrandEventFieldsAreAllowed({ recurrenceFrequency: 'weekly' }), /cannot edit Event field/i)
console.log('managed Event policy tests passed')
