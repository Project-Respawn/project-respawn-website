import { authenticate } from './auth.mjs';
import { DomainError } from './contracts.mjs';
export const previewPath = '/v1/team-hub/preview';
export const previewResponse = Object.freeze({ contractVersion: 'team-hub.v1', environment: 'Ntgre', preview: true, nonProduction: true, dataAuthority: 'SYNTHETIC', team: { id: 'synthetic-team-example', name: 'Synthetic Team Hub Example', realBusinessRecord: false } });
export function createPreviewHandler(environment, clock = () => Math.floor(Date.now() / 1000), log = value => console.info(JSON.stringify(value))) {
  return async event => {
    const requestId = String(event?.requestContext?.requestId ?? 'unavailable').slice(0, 128);
    const headers = { 'content-type': 'application/json', 'cache-control': 'no-store' };
    try {
      authenticate(event?.requestContext?.authorizer?.jwt?.claims, environment, clock());
      if (event.routeKey !== `GET ${previewPath}`) return { statusCode: 404, headers, body: JSON.stringify({ error: { code: 'NOT_FOUND' } }) };
      log({ domain: 'TeamHub', mode: 'READ_PROOF', requestId, status: 200, dataAuthority: 'SYNTHETIC' });
      return { statusCode: 200, headers, body: JSON.stringify(previewResponse) };
    } catch (error) {
      const statusCode = error instanceof DomainError ? error.status : 500;
      log({ domain: 'TeamHub', mode: 'READ_PROOF', requestId, status: statusCode });
      return { statusCode, headers, body: JSON.stringify({ error: { code: statusCode === 401 ? 'UNAUTHENTICATED' : 'INTERNAL_ERROR' } }) };
    }
  };
}
export const handler = createPreviewHandler({ environment: process.env.DOMAIN_ENV, account: process.env.DOMAIN_ACCOUNT, region: process.env.DOMAIN_REGION, issuer: process.env.EXPECTED_ISSUER, poolId: process.env.EXPECTED_POOL_ID, clientId: process.env.EXPECTED_CLIENT_ID });
