export const REQUIRED_BROADCASTER_SCOPES = [
  'channel:bot',
  'channel:read:redemptions',
  'channel:read:subscriptions',
  'moderator:read:followers',
  'bits:read',
] as const

export const OPTIONAL_PHASE1_SCOPES = ['channel:read:hype_train'] as const
export const BOT_CHAT_SCOPES = ['user:bot', 'user:read:chat', 'user:write:chat'] as const

export type TwitchConnectionStatus =
  | 'CONNECTED'
  | 'RECONNECT_REQUIRED'
  | 'MISSING_PERMISSIONS'
  | 'DISCONNECTED'
  | 'ERROR'

export interface SafeTwitchIntegration {
  id: string
  brandId: string
  ownerUserId: string
  twitchBroadcasterId?: string | null
  twitchLogin?: string | null
  twitchDisplayName?: string | null
  connectionStatus: TwitchConnectionStatus
  grantedScopes: string[]
  capabilities: Record<string, boolean>
  tokenExpiresAt?: string | null
  configurationVersion: number
  createdAt?: string | null
  updatedAt?: string | null
}

export function normalizeScopes(scopes: unknown): string[] {
  if (!Array.isArray(scopes)) return []
  return [...new Set(scopes.map(String).map((scope) => scope.trim()).filter(Boolean))].sort()
}
