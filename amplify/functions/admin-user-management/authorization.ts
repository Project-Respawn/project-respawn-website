import { requireEffectivePermission } from '../../myFunction/shared/requirePermission'
import { getRoleManager } from './rolePolicy'

function getCallerGroups(event: any): string[] {
  const groups = event?.identity?.claims?.['cognito:groups'] || []
  if (Array.isArray(groups)) return groups.filter((group): group is string => typeof group === 'string' && group.trim().length > 0)
  return typeof groups === 'string' && groups.trim() ? [groups] : []
}

export async function authorizeAdminUserOperation(event: any, dataClient: any, permissionKey: 'users.view' | 'users.manage') {
  const manager = getRoleManager(getCallerGroups(event))
  if (!manager) throw new Error('You are not authorized to manage user roles')
  await requireEffectivePermission(event, dataClient, permissionKey)
  return manager
}
