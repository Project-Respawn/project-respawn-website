import assert from 'node:assert/strict'
import { writePermissionAudit } from './audit'

const writes: any[] = []
await writePermissionAudit(
  { models: { PermissionAuditEvent: { create: async (input: any) => { writes.push(input); return { data: input } } } } },
  'admin-user', 'brand.create', 'Brand', 'brand-1', undefined,
  { id: 'brand-1', ownerUserId: null, omitted: undefined },
)

assert.equal(writes[0].before, null)
assert.deepEqual(writes[0].after, { id: 'brand-1', ownerUserId: null })
console.log('permission audit JSON tests passed')
