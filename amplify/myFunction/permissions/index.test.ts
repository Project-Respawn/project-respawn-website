import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { handleListPermissionCatalogWithClient } from './index'

const adminEvent = {
  identity: {
    username: 'admin-user',
    claims: { 'cognito:groups': ['Admin'] },
  },
}

async function verifyReadOnlyCatalogLoad() {
  const started: string[] = []
  const resolvers: Record<string, (value: any) => void> = {}
  const noWrite = async () => {
    throw new Error('The list command must not seed or write audit records')
  }
  const client = {
    models: {
      PermissionDefinition: {
        list: () => {
          started.push('PermissionDefinition')
          return new Promise((resolve) => { resolvers.PermissionDefinition = resolve })
        },
        create: noWrite,
      },
      GroupPermission: {
        list: () => {
          started.push('GroupPermission')
          return new Promise((resolve) => { resolvers.GroupPermission = resolve })
        },
        create: noWrite,
      },
      PermissionAuditEvent: { create: noWrite },
    },
  }

  const pending = handleListPermissionCatalogWithClient(adminEvent, client)
  await Promise.resolve()
  assert.deepEqual(started.sort(), ['GroupPermission', 'PermissionDefinition'])

  resolvers.PermissionDefinition({ data: [{ id: 'definition-1', key: 'forums.view', displayName: 'View forums', description: null, domain: 'Forums', module: 'forums', isActive: true, sortOrder: 1 }] })
  resolvers.GroupPermission({ data: [{ id: 'assignment-1', groupName: 'Member', permissionKey: 'forums.view', enabled: true }] })

  const result = await pending
  assert.equal(result.requiresBootstrap, true)
  assert.equal(result.definitions.length, 1)
  assert.equal(result.assignments.length, 1)
}

async function verifyPlatformAuthorization() {
  let listCalls = 0
  const client = {
    models: {
      PermissionDefinition: { list: async () => { listCalls += 1; return { data: [] } } },
      GroupPermission: { list: async () => { listCalls += 1; return { data: [] } } },
    },
  }

  await assert.rejects(
    handleListPermissionCatalogWithClient({ identity: { username: 'member-user', claims: { 'cognito:groups': ['Member'] } } }, client),
    /Platform administrator access is required/,
  )
  assert.equal(listCalls, 0)
}

await verifyReadOnlyCatalogLoad()
await verifyPlatformAuthorization()
const schema = readFileSync(new URL('../../data/resource.ts', import.meta.url), 'utf8')
const mutationResult = schema.slice(schema.indexOf('PermissionMutationResult: a.customType'), schema.indexOf('AccessibleBrandSummary: a.customType'))
assert.match(mutationResult, /changedCount:\s*a\.integer\(\),/, 'resolver failure results must not violate a non-null changedCount contract')
console.log('permission catalog handler tests passed')
