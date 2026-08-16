import { BOT_CHAT_SCOPES, OPTIONAL_PHASE1_SCOPES, REQUIRED_BROADCASTER_SCOPES, normalizeScopes } from './integrationTypes'

export function deriveTwitchCapabilities(scopes: unknown, botScopes: unknown = []) {
  const granted = new Set(normalizeScopes(scopes))
  const botGranted = new Set(normalizeScopes(botScopes))
  const missingPermissions = REQUIRED_BROADCASTER_SCOPES.filter((scope) => !granted.has(scope))
  return {
    capabilities: {
      eventSub: missingPermissions.length === 0,
      chatRead: BOT_CHAT_SCOPES.filter((scope) => scope !== 'user:write:chat').every((scope) => botGranted.has(scope)),
      chatWrite: ['user:bot', 'user:write:chat'].every((scope) => botGranted.has(scope)),
      redemptionsRead: granted.has('channel:read:redemptions'),
      subscriptionsRead: granted.has('channel:read:subscriptions'),
      followsRead: granted.has('moderator:read:followers'),
      bitsRead: granted.has('bits:read'),
      hypeTrainRead: OPTIONAL_PHASE1_SCOPES.every((scope) => granted.has(scope)),
    },
    requiredScopesPresent: missingPermissions.length === 0,
    missingPermissions,
  }
}
