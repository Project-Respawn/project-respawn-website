import type { AppSyncResolverHandler } from 'aws-lambda'
import {
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { ListUsersCommandOutput } from '@aws-sdk/client-cognito-identity-provider'
import { getDataClient } from './dataClient'
import {
  assertRoleChangeAllowed,
  getRoleManager,
  isManagedGroup,
  type ManagedGroup,
} from './rolePolicy'

const client = new CognitoIdentityProviderClient({})
const USER_POOL_ID = process.env.AMPLIFY_AUTH_USERPOOL_ID

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function getCallerGroups(event: any): string[] {
  const groups = event?.identity?.claims?.['cognito:groups'] || []
  if (Array.isArray(groups)) return groups.filter(isNonEmptyString)
  return isNonEmptyString(groups) ? [groups] : []
}

function getCallerUserId(event: any): string {
  return String(
    event?.identity?.username ||
    event?.identity?.claims?.['cognito:username'] ||
    event?.identity?.claims?.username ||
    event?.identity?.sub ||
    '',
  )
}

function assertRoleManagementAccess(event: any) {
  const manager = getRoleManager(getCallerGroups(event))
  if (!manager) throw new Error('You are not authorized to manage user roles')
  return manager
}

function getAttribute(user: any, name: string): string {
  return user.Attributes?.find((attribute: any) => attribute.Name === name)?.Value ?? ''
}

function formatDate(value?: Date): string {
  return value ? new Date(value).toLocaleDateString('en-GB') : ''
}

function getFieldName(event: any): string {
  return event?.info?.fieldName || event?.fieldName || ''
}

function getArguments(event: any) {
  return event?.arguments || event?.args || {}
}

function normalizeDesiredRoles(roles: unknown): ManagedGroup[] {
  if (!Array.isArray(roles) || roles.some((role) => !isManagedGroup(role))) {
    throw new Error('roles must contain only supported Cognito groups')
  }

  const desiredRoles = [...new Set(roles)]
  if (!desiredRoles.includes('Member')) desiredRoles.push('Member')
  return desiredRoles
}

async function getExistingRoles(username: string): Promise<ManagedGroup[]> {
  if (!USER_POOL_ID) throw new Error('Missing AMPLIFY_AUTH_USERPOOL_ID')

  const response = await client.send(new AdminListGroupsForUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
  }))
  return (response.Groups ?? []).map((group) => group.GroupName).filter(isManagedGroup)
}

async function listAllUsers() {
  if (!USER_POOL_ID) throw new Error('Missing AMPLIFY_AUTH_USERPOOL_ID')

  const allUsers: any[] = []
  let paginationToken: string | undefined
  do {
    const input: { UserPoolId: string; Limit: number; PaginationToken?: string } = {
      UserPoolId: USER_POOL_ID,
      Limit: 60,
    }
    if (paginationToken) input.PaginationToken = paginationToken
    const response: ListUsersCommandOutput = await client.send(new ListUsersCommand(input))
    allUsers.push(...(response.Users ?? []))
    paginationToken = response.PaginationToken
  } while (paginationToken)

  return Promise.all(allUsers.map(async (user) => {
    const username = user.Username ?? ''
    const email = getAttribute(user, 'email')
    const name =
      getAttribute(user, 'name') ||
      getAttribute(user, 'preferred_username') ||
      [getAttribute(user, 'given_name'), getAttribute(user, 'family_name')].filter(isNonEmptyString).join(' ') ||
      email ||
      username
    const roles = await getExistingRoles(username)

    return {
      id: username,
      username,
      email,
      name,
      joined: formatDate(user.UserCreateDate),
      online: false,
      status: user.UserStatus ?? 'UNKNOWN',
      enabled: user.Enabled ?? true,
      roles: roles.length ? roles : ['Member'],
    }
  }))
}

async function writeRoleChangeAudit(
  actorUserId: string,
  username: string,
  before: ManagedGroup[],
  after: ManagedGroup[],
) {
  const dataClient = await getDataClient()
  const result = await dataClient.models.PermissionAuditEvent.create({
    actorUserId,
    action: 'user.roles.update',
    targetType: 'CognitoUser',
    targetId: username,
    before: JSON.stringify(before),
    after: JSON.stringify(after),
    occurredAt: new Date().toISOString(),
  })

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || 'Role changes were applied but the audit record could not be written')
  }
}

async function updateUserRoles(event: any, username: unknown, roles: unknown) {
  if (!USER_POOL_ID) throw new Error('Missing AMPLIFY_AUTH_USERPOOL_ID')
  if (!isNonEmptyString(username)) throw new Error('Username is required')

  const manager = assertRoleManagementAccess(event)
  const actorUserId = getCallerUserId(event)
  if (!actorUserId) throw new Error('Authenticated user identity is required')

  const desiredRoles = normalizeDesiredRoles(roles)
  const existingRoles = await getExistingRoles(username)
  const { rolesToAdd, rolesToRemove } = assertRoleChangeAllowed(manager, existingRoles, desiredRoles)

  await Promise.all([
    ...rolesToAdd.map((role) => client.send(new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      GroupName: role,
    }))),
    ...rolesToRemove.map((role) => client.send(new AdminRemoveUserFromGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      GroupName: role,
    }))),
  ])

  if (rolesToAdd.length || rolesToRemove.length) {
    await writeRoleChangeAudit(actorUserId, username, existingRoles, desiredRoles)
  }

  return { success: true, username, roles: desiredRoles }
}

export const handler: AppSyncResolverHandler<any, any> = async (event) => {
  const fieldName = getFieldName(event)
  const args = getArguments(event)

  assertRoleManagementAccess(event)

  switch (fieldName) {
    case 'listAdminUsers':
      return listAllUsers()
    case 'updateUserRoles':
      return updateUserRoles(event, args.username, args.roles)
    default:
      throw new Error(`Unknown field: ${fieldName || 'undefined'}`)
  }
}
