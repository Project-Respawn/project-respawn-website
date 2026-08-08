import { getIdentityUsername, getResolverIdentity } from './auth'
import { resolveEffectivePermissionKeys } from './effectivePermissions'
import { PLATFORM_CONTROL_PERMISSION_KEYS } from '../permissions'

async function listAll(client: any, modelName: string) {
  const records: any[] = []
  let nextToken: string | null | undefined
  do {
    const result = await client.models[modelName].list({ limit: 1000, nextToken })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to load ${modelName}`)
    records.push(...(result.data || [])); nextToken = result.nextToken
  } while (nextToken)
  return records
}

export async function requireEffectivePermission(event: any, client: any, permissionKey: string) {
  const identity = getResolverIdentity(event)
  const actorUserId = getIdentityUsername(identity)
  if (!actorUserId) throw new Error('Authenticated identity is required')
  const [definitions, assignments] = await Promise.all([
    listAll(client, 'PermissionDefinition'), listAll(client, 'GroupPermission'),
  ])
  const effective = resolveEffectivePermissionKeys(identity, definitions, assignments, PLATFORM_CONTROL_PERMISSION_KEYS)
  if (!effective.has(permissionKey)) throw new Error(`Permission ${permissionKey} is required`)
  return { actorUserId, effective }
}
