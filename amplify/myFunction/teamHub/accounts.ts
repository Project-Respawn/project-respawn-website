import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'

export const ACCOUNT_NOT_FOUND = 'No Project Respawn account was found for that email. Ask them to create and verify an account first.'
export const ACCOUNT_UNAVAILABLE = 'That account could not be assigned. Check the email and try again.'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Cognito subjects are opaque UUID-shaped identifiers; Cognito owns their
// version and variant nibbles, so do not apply RFC UUID restrictions here.
const COGNITO_SUB = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SEARCH_LIMIT = 10

export function normalizeAssignmentEmail(value: unknown) {
  if (typeof value !== 'string') throw new Error(ACCOUNT_UNAVAILABLE)
  const email = value.trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL.test(email)) throw new Error(ACCOUNT_UNAVAILABLE)
  return email
}

const attribute = (user: any, name: string) => String(user.Attributes?.find((item: any) => item.Name === name)?.Value || '')

const directoryClient = (injected?: { listUsers(input: any): Promise<any> }) => injected || {
  listUsers: (input: any) => new CognitoIdentityProviderClient({}).send(new ListUsersCommand(input)),
}

export function normalizeAccountSearch(value: unknown) {
  if (typeof value !== 'string') throw new Error('Invalid account search')
  const query = value.trim()
  if (query.length < 2 || query.length > 100) throw new Error('Invalid account search')
  return query
}

export async function searchAssignableAccounts(
  value: unknown,
  injected?: { listUsers(input: any): Promise<any> },
  environment: NodeJS.ProcessEnv = process.env,
) {
  const query = normalizeAccountSearch(value)
  const userPoolId = environment.TEAM_HUB_USER_POOL_ID
  if (!userPoolId) throw new Error(ACCOUNT_UNAVAILABLE)
  const safe = query.replace(/[\\"]/g, '')
  if (safe.length < 2) throw new Error('Invalid account search')
  const filters = [
    `email ^= "${safe.toLowerCase()}"`,
    `username ^= "${safe}"`,
    `preferred_username ^= "${safe}"`,
  ]
  try {
    const directory = directoryClient(injected)
    const responses = await Promise.all(filters.map((Filter) => directory.listUsers({ UserPoolId: userPoolId, Filter, Limit: SEARCH_LIMIT })))
    const unique = new Map<string, any>()
    for (const user of responses.flatMap((response) => response.Users || [])) {
      const username = String(user.Username || '').trim(), email = attribute(user, 'email').trim().toLowerCase()
      if (!username || !email || unique.has(username)) continue
      const displayName = (attribute(user, 'name') || attribute(user, 'preferred_username') || username).trim().slice(0, 100)
      unique.set(username, { username, displayName, email, enabled: user.Enabled === true, confirmed: user.UserStatus === 'CONFIRMED', eligible: user.Enabled === true && user.UserStatus === 'CONFIRMED' })
      if (unique.size >= SEARCH_LIMIT) break
    }
    return { items: [...unique.values()] }
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid account search') throw error
    console.error('Team Hub account search failed', { category: 'directory_failure' })
    throw new Error('Account search is temporarily unavailable')
  }
}

export async function resolveAssignmentAccount(
  value: unknown,
  injected?: { listUsers(input: any): Promise<any> },
  environment: NodeJS.ProcessEnv = process.env,
) {
  const email = normalizeAssignmentEmail(value)
  const userPoolId = environment.TEAM_HUB_USER_POOL_ID
  if (!userPoolId) throw new Error(ACCOUNT_UNAVAILABLE)
  try {
    const directory = directoryClient(injected)
    const response = await directory.listUsers({ UserPoolId: userPoolId, Filter: `email = "${email.replace(/[\\"]/g, '')}"`, Limit: 2 })
    const exact = (response.Users || []).filter((user: any) => attribute(user, 'email').trim().toLowerCase() === email)
    if (exact.length === 0) throw new Error(ACCOUNT_NOT_FOUND)
    if (exact.length !== 1) throw new Error(ACCOUNT_UNAVAILABLE)
    const user = exact[0]
    const userId = attribute(user, 'sub')
    if (user.Enabled !== true || user.UserStatus !== 'CONFIRMED' || !COGNITO_SUB.test(userId)) throw new Error(ACCOUNT_UNAVAILABLE)
    const displayName = attribute(user, 'name') || attribute(user, 'preferred_username') || 'Project Respawn member'
    return { userId, displayName: displayName.trim().slice(0, 100) || 'Project Respawn member' }
  } catch (error) {
    if (error instanceof Error && [ACCOUNT_NOT_FOUND, ACCOUNT_UNAVAILABLE].includes(error.message)) throw error
    console.error('Team Hub account resolution failed', { category: 'directory_failure' })
    throw new Error(ACCOUNT_UNAVAILABLE)
  }
}
