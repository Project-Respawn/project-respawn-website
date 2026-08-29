import { joinApiUrl } from '@/config/apiBaseUrl.js';
import { parseOverlayEvent, toWidgetEvent } from '../overlays/overlayEventContract.js';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';

function overlayApiBaseUrl() {
  const url = outputs.custom?.overlaySource?.httpUrl;
  if (!url) throw new Error('Canonical Overlay Source API is unavailable in this build. Regenerate Amplify outputs from the intended backend before using Twitch Alerts.');
  return url;
}

async function authenticatedRequest(path, options = {}, fetchImpl = fetch) {
  const session = await fetchAuthSession(); const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error('Sign in before managing an Overlay Browser Source');
  const response = await fetchImpl(joinApiUrl(overlayApiBaseUrl(), path), {
    ...options,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Overlay Source request failed');
  return result;
}

export async function fetchOverlaySource(credential, fetchImpl = fetch) {
  if (!credential) throw new Error('Overlay source credential is required');
  const response = await fetchImpl(joinApiUrl(overlayApiBaseUrl(), `overlay/source/${encodeURIComponent(credential)}`), { cache: 'no-store' });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Overlay source credential is invalid or expired' : 'Overlay source could not be loaded');
  const result = await response.json();
  if (!result?.scene || !result?.websocketUrl || !result?.revision) throw new Error('Overlay source response is incomplete');
  return result;
}

export function createOverlayPublication(input, fetchImpl = fetch) {
  return authenticatedRequest('overlay/publications', { method: 'POST', body: JSON.stringify(input) }, fetchImpl);
}

export function getActiveOverlayPublication(workspaceId, brandId, fetchImpl = fetch) {
  const query = new URLSearchParams({ workspaceId, brandId });
  return authenticatedRequest(`overlay/publications/active?${query}`, { method: 'GET' }, fetchImpl);
}

export function updateOverlayPublication(publicationId, sceneId, sceneSnapshot, sourceEditorRevisionOrFetch, fetchImpl = fetch) {
  const legacyCall = typeof sourceEditorRevisionOrFetch === 'function';
  const sourceEditorRevision = legacyCall ? undefined : sourceEditorRevisionOrFetch;
  const effectiveFetch = legacyCall ? sourceEditorRevisionOrFetch : fetchImpl;
  return authenticatedRequest(`overlay/publications/${encodeURIComponent(publicationId)}`, { method: 'PUT', body: JSON.stringify({ sceneId, sceneSnapshot, sourceEditorRevision }) }, effectiveFetch);
}

export function revokeOverlayPublication(publicationId, fetchImpl = fetch) {
  return authenticatedRequest(`overlay/publications/${encodeURIComponent(publicationId)}`, { method: 'DELETE' }, fetchImpl);
}

export function rotateOverlayPublicationCredential(publicationId, fetchImpl = fetch) {
  return authenticatedRequest(`overlay/publications/${encodeURIComponent(publicationId)}/rotate`, { method: 'POST' }, fetchImpl);
}

export function sendOverlayTestEvent(publicationId, event, fetchImpl = fetch) {
  return authenticatedRequest(`overlay/publications/${encodeURIComponent(publicationId)}/events`, { method: 'POST', body: JSON.stringify({ event }) }, fetchImpl);
}

export function getTwitchOverlayConfig(workspaceId, brandId, fetchImpl = fetch) {
  const query = new URLSearchParams({ workspaceId, brandId });
  return authenticatedRequest(`overlay/twitch-config?${query}`, { method: 'GET' }, fetchImpl);
}

export function updateTwitchOverlayConfig(workspaceId, brandId, config, fetchImpl = fetch) {
  return authenticatedRequest('overlay/twitch-config', { method: 'PUT', body: JSON.stringify({ workspaceId, brandId, config }) }, fetchImpl);
}

export function getEditableOverlayProject(workspaceId, brandId, fetchImpl = fetch) {
  const query = new URLSearchParams({ workspaceId, brandId });
  return authenticatedRequest(`overlay/editor-project?${query}`, { method: 'GET' }, fetchImpl);
}

export function updateEditableOverlayProject(workspaceId, brandId, project, revision, fetchImpl = fetch) {
  return authenticatedRequest('overlay/editor-project', { method: 'PUT', body: JSON.stringify({ workspaceId, brandId, project, revision }) }, fetchImpl);
}

export function createOverlaySourceConnection({ websocketUrl, credential, WebSocketImpl = WebSocket, onEvent, onReconnect = () => {} }) {
  let socket = null; let stopped = false; let reconnectTimer = null; let attempts = 0;
  const connect = () => {
    if (stopped) return;
    const url = new URL(websocketUrl); url.searchParams.set('credential', credential);
    socket = new WebSocketImpl(url);
    socket.addEventListener('open', () => { attempts = 0; });
    socket.addEventListener('message', async (message) => {
      let raw; try { raw = JSON.parse(message.data); } catch { return; }
      const event = parseOverlayEvent(raw); if (event) await onEvent(toWidgetEvent(event));
    });
    socket.addEventListener('close', () => {
      if (stopped) return;
      const delay = Math.min(1000 * (2 ** attempts), 15000); attempts += 1;
      reconnectTimer = setTimeout(async () => { await onReconnect(); connect(); }, delay);
    });
  };
  connect();
  return { close() { stopped = true; clearTimeout(reconnectTimer); socket?.close(); } };
}
