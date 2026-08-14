export const HEALTH_STALE_AFTER_MS = 2 * 60_000

export function buildTwitchHealth(integration: any, runtime: any, now = Date.now()) {
  const heartbeat = Date.parse(runtime?.lastBotHeartbeatAt || '')
  const stale = !Number.isFinite(heartbeat) || now - heartbeat > HEALTH_STALE_AFTER_MS
  const warnings = [...(Array.isArray(runtime?.warnings) ? runtime.warnings : [])]
  if (stale) warnings.push('BOT_HEARTBEAT_STALE')
  const currentVersion = Number(integration?.configurationVersion || 1)
  const appliedVersion = Number(runtime?.appliedConfigurationVersion || 0)
  if (appliedVersion < currentVersion) warnings.push('CONFIGURATION_OUT_OF_SYNC')
  return {
    integrationId: integration.id,
    brandId: integration.brandId,
    twitchConnected: integration.connectionStatus === 'CONNECTED',
    broadcasterTokenValid: integration.connectionStatus === 'CONNECTED' && Boolean(integration.tokenExpiresAt),
    botAuthenticated: stale ? null : Boolean(runtime?.botAuthenticated),
    botConnected: stale ? null : Boolean(runtime?.botConnected),
    eventSubConnected: stale ? null : Boolean(runtime?.eventSubConnected),
    chatReadAvailable: stale ? null : Boolean(runtime?.chatReadAvailable),
    chatWriteAvailable: stale ? null : Boolean(runtime?.chatWriteAvailable),
    lastEventReceivedAt: runtime?.lastEventReceivedAt || null,
    lastBotHeartbeatAt: runtime?.lastBotHeartbeatAt || null,
    lastConfigurationSyncAt: runtime?.lastConfigurationSyncAt || null,
    configurationVersion: currentVersion,
    appliedConfigurationVersion: appliedVersion,
    stale,
    warnings: [...new Set(warnings)],
    errors: Array.isArray(runtime?.errors) ? runtime.errors : [],
  }
}
