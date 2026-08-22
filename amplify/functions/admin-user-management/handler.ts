import type { AppSyncResolverHandler } from 'aws-lambda'
import {
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { ListUsersCommandOutput } from '@aws-sdk/client-cognito-identity-provider'
import { canManageInvestorAccess } from '../../myFunction/investors/policy'
import { applyInvestorRequestDecision } from './investorRequestWorkflow'
import { getDataClient } from './dataClient'
import { authorizeAdminUserOperation } from './authorization'
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

const INVESTOR_LEVELS = ['PRE_NDA', 'NDA', 'DILIGENCE'] as const
const NDA_STATUSES = ['NOT_REQUIRED', 'NOT_SIGNED', 'SIGNED'] as const
const INVESTOR_RANK: Record<string, number> = { PRE_NDA: 1, NDA: 2, DILIGENCE: 3 }

function assertInvestorAdmin(event: any) {
  const groups = getCallerGroups(event)
  if (!canManageInvestorAccess(groups)) throw new Error('Platform administrator access is required')
}

function investorSummary(record: any) {
  return { ...record, cognitoSub: record.cognitoSub || record.userId, updatedAt: record.updatedAt || record.grantedAt }
}

async function writeInvestorAudit(dataClient: any, actor: string, targetUserId: string, action: string, before: unknown, after: unknown) {
  const result = await dataClient.models.InvestorAccessAuditEvent.create({
    targetUserId, action, previousValue: JSON.stringify(before ?? null), newValue: JSON.stringify(after ?? null),
    adminUserId: actor, occurredAt: new Date().toISOString(),
  })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Investor access audit could not be written')
}

async function findCognitoUserByEmail(emailValue: unknown) {
  if (!USER_POOL_ID) throw new Error('Missing AMPLIFY_AUTH_USERPOOL_ID')
  const email = String(emailValue || '').trim().toLowerCase()
  if (!email || !email.includes('@')) throw new Error('A valid account email is required')
  const response = await client.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID, Filter: `email = \"${email.replace(/[\\\"]/g, '')}\"`, Limit: 2 }))
  const matches = response.Users || []
  if (matches.length !== 1) return null
  const user = matches[0]
  const cognitoSub = getAttribute(user, 'sub')
  if (!cognitoSub) throw new Error('The Cognito account has no immutable subject')
  const accountEmail = getAttribute(user, 'email')
  const name = getAttribute(user, 'name') || getAttribute(user, 'preferred_username') || accountEmail
  return { cognitoSub, email: accountEmail, name }
}

async function listInvestorAccess(dataClient: any) {
  const result = await dataClient.models.InvestorAccess.list({ limit: 1000 })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Investor access could not be loaded')
  return (result.data || []).map(investorSummary)
}

async function grantInvestorAccess(event: any, dataClient: any, args: any) {
  const actor = String(event?.identity?.sub || event?.identity?.claims?.sub || getCallerUserId(event))
  const account = await findCognitoUserByEmail(args.email)
  if (!account || account.cognitoSub !== String(args.cognitoSub || '')) throw new Error('The selected Cognito account could not be verified')
  if (!INVESTOR_LEVELS.includes(args.accessLevel)) throw new Error('Invalid investor access level')
  if (!NDA_STATUSES.includes(args.ndaStatus)) throw new Error('Invalid NDA status')
  const existing = await dataClient.models.InvestorAccess.listInvestorAccessByUserId({ userId: account.cognitoSub }, { limit: 1 })
  if (existing.data?.length) throw new Error('This account already has an InvestorAccess record')
  const now = new Date().toISOString()
  const result = await dataClient.models.InvestorAccess.create({
    userId: account.cognitoSub, cognitoSub: account.cognitoSub, email: account.email, name: String(args.name || account.name),
    organisation: String(args.organisation || ''), accessLevel: args.accessLevel, ndaStatus: args.ndaStatus,
    isActive: true, grantedAt: now, expiresAt: args.expiresAt || null, grantedBy: actor,
  })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Investor access could not be granted')
  await writeInvestorAudit(dataClient, actor, account.cognitoSub, 'investor.access.granted', null, result.data)
  return investorSummary(result.data)
}

async function updateInvestorAccess(event: any, dataClient: any, args: any) {
  const actor = String(event?.identity?.sub || event?.identity?.claims?.sub || getCallerUserId(event))
  const found = await dataClient.models.InvestorAccess.get({ id: String(args.investorAccessId || '') })
  if (!found.data) throw new Error('Investor access record was not found')
  const before: any = found.data
  const changes: any = {}
  if (args.accessLevel != null) {
    if (!INVESTOR_LEVELS.includes(args.accessLevel)) throw new Error('Invalid investor access level')
    changes.accessLevel = args.accessLevel
  }
  if (args.ndaStatus != null) {
    if (!NDA_STATUSES.includes(args.ndaStatus)) throw new Error('Invalid NDA status')
    changes.ndaStatus = args.ndaStatus
  }
  if (typeof args.isActive === 'boolean') changes.isActive = args.isActive
  if (args.clearExpiry === true) changes.expiresAt = null
  else if (args.expiresAt != null) changes.expiresAt = args.expiresAt
  const updated = await dataClient.models.InvestorAccess.update({ id: before.id, ...changes })
  if (updated.errors?.length || !updated.data) throw new Error(updated.errors?.[0]?.message || 'Investor access could not be updated')
  let action = 'investor.access.updated'
  if (before.isActive !== updated.data.isActive) action = updated.data.isActive ? 'investor.access.reactivated' : 'investor.access.revoked'
  else if (before.accessLevel !== updated.data.accessLevel) action = INVESTOR_RANK[updated.data.accessLevel] > INVESTOR_RANK[before.accessLevel] ? 'investor.access.upgraded' : 'investor.access.downgraded'
  else if (before.ndaStatus !== updated.data.ndaStatus) action = 'investor.nda.changed'
  await writeInvestorAudit(dataClient, actor, before.userId, action, before, updated.data)
  return investorSummary(updated.data)
}

function decodeJson(value: any, fallback: any) {
  if (typeof value !== 'string') return value ?? fallback
  try { return JSON.parse(value) } catch { return fallback }
}

export async function listInvestorAccessRequests(dataClient: any) {
  const result = await dataClient.models.InvestorAccessRequest.list({ limit: 1000 })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Investor requests could not be loaded')
  return (result.data || []).map((item: any) => ({ ...item, auditHistory: decodeJson(item.auditHistory, []) }))
    .sort((a: any, b: any) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
}

export async function reviewInvestorAccessRequest(event: any, dataClient: any, args: any, injected: any = {}) {
  const actor = String(event?.identity?.sub || event?.identity?.claims?.sub || getCallerUserId(event))
  const found = await dataClient.models.InvestorAccessRequest.get({ id: String(args.requestId || '') })
  if (!found.data) throw new Error('Investor request was not found')
  const request: any = found.data
  return applyInvestorRequestDecision(request, args, actor, {
    findAccount: injected.findAccount || findCognitoUserByEmail,
    grantOrUpdate: async (account: any, accessArgs: any) => {
      const existing = await dataClient.models.InvestorAccess.listInvestorAccessByUserId({ userId: account.cognitoSub }, { limit: 1 })
      return existing.data?.[0]
        ? (injected.updateAccess || updateInvestorAccess)(event, dataClient, { investorAccessId: existing.data[0].id, ...accessArgs, isActive: true })
        : (injected.grantAccess || grantInvestorAccess)(event, dataClient, { ...accessArgs, cognitoSub: account.cognitoSub, email: account.email, name: request.name, organisation: request.organisation })
    },
    save: async (value: any) => { const updated = await dataClient.models.InvestorAccessRequest.update(value); if (updated.errors?.length || !updated.data) throw new Error(updated.errors?.[0]?.message || 'Investor request decision could not be saved'); return updated.data },
  })
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
      cognitoSub: getAttribute(user, 'sub'),
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

  const dataClient = await getDataClient()

  switch (fieldName) {
    case 'listInvestorAccess':
      assertInvestorAdmin(event)
      return listInvestorAccess(dataClient)
    case 'findInvestorAccountByEmail':
      assertInvestorAdmin(event)
      return findCognitoUserByEmail(args.email)
    case 'grantInvestorAccess':
      assertInvestorAdmin(event)
      return grantInvestorAccess(event, dataClient, args)
    case 'manageInvestorAccess':
      assertInvestorAdmin(event)
      return updateInvestorAccess(event, dataClient, args)
    case 'listManagedInvestorAccessRequests':
      assertInvestorAdmin(event)
      return listInvestorAccessRequests(dataClient)
    case 'reviewInvestorAccessRequest':
      assertInvestorAdmin(event)
      return reviewInvestorAccessRequest(event, dataClient, args)
    case 'listAdminUsers':
      await authorizeAdminUserOperation(event, dataClient, 'users.view')
      return listAllUsers()
    case 'updateUserRoles':
      await authorizeAdminUserOperation(event, dataClient, 'users.manage')
      return updateUserRoles(event, args.username, args.roles)
    default:
      throw new Error(`Unknown field: ${fieldName || 'undefined'}`)
  }
}
