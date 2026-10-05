import { operations, validateRequest, validateResponse, VERSION } from '../../../../domains/team-hub/contracts.mjs';
/** Construct on domain entry. The caller owns environment validation and token refresh. */
export function createTeamHubClient({ endpoint, tokenProvider, transport = globalThis.fetch }) {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('HTTPS origin required');
  if (typeof tokenProvider !== 'function' || typeof transport !== 'function') throw new Error('Token provider and transport required');
  return Object.freeze({
    async call(operation, request) {
      validateRequest(operation, request);
      const spec = operations[operation];
      const remaining = { ...request };
      const path = spec.path.replace(/\{([^}]+)\}/g, (_, key) => { const value = remaining[key]; delete remaining[key]; return encodeURIComponent(value); });
      const target = new URL(path, url);
      const token = await tokenProvider();
      if (typeof token !== 'string' || !token.trim()) throw new Error('UNAUTHENTICATED');
      const init = { method: spec.method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, credentials: 'omit', cache: 'no-store', redirect: 'error' };
      if (spec.method === 'GET') for (const [key, value] of Object.entries(remaining)) target.searchParams.set(key, String(value));
      else init.body = JSON.stringify(remaining);
      const response = await transport(target.toString(), init);
      const envelope = await response.json();
      if (envelope.contractVersion !== VERSION) throw new Error('Unsupported Team Hub contract');
      if (!response.ok) throw new Error(envelope.error?.code ?? 'DEPENDENCY_UNAVAILABLE');
      return validateResponse(operation, envelope.data);
    },
  });
}
