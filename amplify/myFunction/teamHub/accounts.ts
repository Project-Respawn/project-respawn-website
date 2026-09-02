import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider'

export const ACCOUNT_NOT_FOUND = 'No Project Respawn account was found for that email. Ask them to create and verify an account first.'
export const ACCOUNT_UNAVAILABLE = 'That account could not be assigned. Check the email and try again.'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeAssignmentEmail(value: unknown) {
  if (typeof value !== 'string') throw new Error(ACCOUNT_UNAVAILABLE)
  const email = value.trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL.test(email)) throw new Error(ACCOUNT_UNAVAILABLE)
  return email
}

const attribute = (user: any, name: string) => String(user.Attributes?.find((item: any) => item.Name === name)?.Value || '')

export async function resolveAssignmentAccount(
  value: unknown,
  injected?: { listUsers(input: any): Promise<any> },
  environment: NodeJS.ProcessEnv = process.env,
) {
  const email = normalizeAssignmentEmail(value)
  const userPoolId = environment.TEAM_HUB_USER_POOL_ID
  if (!userPoolId) throw new Error(ACCOUNT_UNAVAILABLE)
  try {
    const directory = injected || { listUsers: (input: any) => new CognitoIdentityProviderClient({}).send(new ListUsersCommand(input)) }
    const response = await directory.listUsers({ UserPoolId: userPoolId, Filter: `email = "${email.replace(/[\\"]/g, '')}"`, Limit: 2 })
    const exact = (response.Users || []).filter((user: any) => attribute(user, 'email').trim().toLowerCase() === email)
    if (exact.length === 0) throw new Error(ACCOUNT_NOT_FOUND)
    if (exact.length !== 1) throw new Error(ACCOUNT_UNAVAILABLE)
    const user = exact[0]
    const userId = attribute(user, 'sub')
    if (user.Enabled !== true || user.UserStatus !== 'CONFIRMED' || !UUID.test(userId)) throw new Error(ACCOUNT_UNAVAILABLE)
    const displayName = attribute(user, 'name') || attribute(user, 'preferred_username') || 'Project Respawn member'
    return { userId, displayName: displayName.trim().slice(0, 100) || 'Project Respawn member' }
  } catch (error) {
    if (error instanceof Error && [ACCOUNT_NOT_FOUND, ACCOUNT_UNAVAILABLE].includes(error.message)) throw error
    console.error('Team Hub account resolution failed', { category: 'directory_failure' })
    throw new Error(ACCOUNT_UNAVAILABLE)
  }
}
