const RETURN_TARGET_KEY = 'project-respawn.creator-tools.twitch-return-target';
const SAFE_RETURN_TARGETS = Object.freeze({
  setup: '/creator-tools/setup',
  integrations: '/creator-tools/integrations',
});

export class TwitchConnectionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'TwitchConnectionError';
    this.code = code;
  }
}

export function decodeTwitchJson(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

export function parseTwitchOAuthReturn(locationLike) {
  const params = new URLSearchParams(locationLike?.search || '');
  const twitch = String(params.get('twitch') || '').toLowerCase();
  return {
    isReturn: twitch === 'connected' || twitch === 'error',
    connected: twitch === 'connected',
    error: twitch === 'error' ? (params.get('reason') || 'Twitch authorization failed') : '',
  };
}

export function rememberTwitchReturnTarget(target, storage = globalThis.sessionStorage) {
  const safeTarget = SAFE_RETURN_TARGETS[target] ? target : 'integrations';
  storage?.setItem(RETURN_TARGET_KEY, safeTarget);
  return safeTarget;
}

export function consumeTwitchReturnTarget(storage = globalThis.sessionStorage) {
  const value = storage?.getItem(RETURN_TARGET_KEY) || 'integrations';
  storage?.removeItem(RETURN_TARGET_KEY);
  return SAFE_RETURN_TARGETS[value] ? value : 'integrations';
}

export function twitchReturnPath(target, result) {
  const base = SAFE_RETURN_TARGETS[target] || SAFE_RETURN_TARGETS.integrations;
  const params = result.connected
    ? 'twitch=connected'
    : `twitch=error&reason=${encodeURIComponent(result.error || 'Twitch authorization failed')}`;
  return `${base}?${params}`;
}

export async function startTwitchConnection({ client, brandId, workspaceId, returnTarget, navigate, storage, logger = console }) {
  if (!workspaceId) throw new TwitchConnectionError('MISSING_WORKSPACE', 'A Creator Workspace is required before connecting Twitch.');
  if (!brandId) throw new TwitchConnectionError('MISSING_BRAND', 'Select or create a Brand before connecting Twitch.');

  try {
    const response = await client.mutations.startTwitchIntegrationOAuth({ brandId });
    const backendError = response?.errors?.[0]?.message;
    if (backendError) throw new TwitchConnectionError('BACKEND_ERROR', backendError);
    const authorizeUrl = response?.data?.authorizeUrl;
    if (!authorizeUrl) throw new TwitchConnectionError('MISSING_AUTHORIZE_URL', 'Twitch authorization could not be started.');
    const parsed = new URL(authorizeUrl);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'id.twitch.tv') {
      throw new TwitchConnectionError('UNSAFE_AUTHORIZE_URL', 'Twitch returned an invalid authorization destination.');
    }
    rememberTwitchReturnTarget(returnTarget, storage);
    navigate(authorizeUrl);
    return authorizeUrl;
  } catch (error) {
    const safeError = error instanceof TwitchConnectionError
      ? error
      : new TwitchConnectionError('OAUTH_START_FAILED', error?.message || 'Could not start Twitch connection.');
    logger.error('Twitch OAuth initiation failed', {
      code: safeError.code,
      operation: 'startTwitchIntegrationOAuth',
      hasBrand: Boolean(brandId),
      hasWorkspace: Boolean(workspaceId),
    });
    throw safeError;
  }
}

export async function getTwitchConnectionStatus(client, brandId) {
  if (!brandId) return { connected: false, integration: null, health: null, accountName: '' };
  const response = await client.queries.getMyTwitchIntegration({ brandId });
  if (response?.errors?.length) throw new TwitchConnectionError('STATUS_FAILED', response.errors[0].message || 'Could not load Twitch connection status.');
  const integration = decodeTwitchJson(response?.data?.integration, null);
  const health = decodeTwitchJson(response?.data?.health, null);
  return {
    connected: integration?.connectionStatus === 'CONNECTED',
    integration,
    health,
    accountName: integration?.twitchDisplayName || integration?.twitchLogin || '',
  };
}
