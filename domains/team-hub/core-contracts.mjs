import { schemas } from './contracts.mjs';
const string = maxLength => ({ type: 'string', minLength: 1, maxLength });
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const subject = schemas.subject;
const identity = object({ issuer: string(256), subject });
const summary = object({ subject, displayName: string(100) });
const integer = { type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER };
export const coreSchemas = Object.freeze({
  'environment.v1': {
    owner: 'Core', implemented: 'Existing non-secret repository environment descriptor',
    consumed: object({ environment: { const: 'Ntgre' }, account: { const: '058264289478' }, region: { const: 'eu-north-1' }, poolId: string(128), clientId: string(128), issuer: string(256) }),
  },
  'directory.assignment.v1': {
    owner: 'Core', implemented: 'Synthetic only', auth: 'Authenticated Team service + verified delegated actor + Team assignment decision; no email or raw Cognito response in search results',
    searchRequest: object({ actor: identity, teamId: schemas.teamId, query: { type: 'string', minLength: 2, maxLength: 100 }, limit: { type: 'integer', minimum: 1, maximum: 10 } }),
    searchResponse: object({ items: { type: 'array', maxItems: 10, items: summary } }),
    resolveRequest: object({ actor: identity, teamId: schemas.teamId, account: string(254) }),
    resolveResponse: summary,
  },
  'authorization.decision.v1': {
    owner: 'Core', implemented: 'Synthetic only', auth: 'Authenticated Team service + verified delegated actor; fresh decision per request/commit; unavailable fails closed',
    request: object({ actor: identity, capability: { type: 'string', enum: ['teams.admin', 'teams.branding.manage'] }, environment: { const: 'Ntgre' } }),
    response: object({ allowed: { type: 'boolean' }, decisionVersion: integer, evaluatedAt: integer, expiresAt: integer }),
  },
  'profile.summary.v1': {
    owner: 'Core', implemented: 'Synthetic only', auth: 'Authenticated Team service; only subjects in authorized Team/directory scope; no profile writes',
    request: object({ actor: identity, subject }), response: summary,
  },
});
