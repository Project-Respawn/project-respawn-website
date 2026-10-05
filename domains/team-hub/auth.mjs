import { fail, schemas, valid } from './contracts.mjs';
// Only trusted API Gateway JWT-authorizer claims. This is not a JWT signature decoder/verifier.
export function authenticate(claims, environment, now) {
  const timestamp = value => (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) && Number.isSafeInteger(Number(value));
  if (!claims || environment.environment !== 'Ntgre' || environment.account !== '058264289478' || environment.region !== 'eu-north-1' || environment.issuer !== `https://cognito-idp.eu-north-1.amazonaws.com/${environment.poolId}` || claims.iss !== environment.issuer || claims.client_id !== environment.clientId || claims.token_use !== 'access' || !valid(schemas.subject, claims.sub) || !timestamp(claims.exp) || Number(claims.exp) <= now || (claims.nbf !== undefined && (!timestamp(claims.nbf) || Number(claims.nbf) > now))) fail('UNAUTHENTICATED');
  return Object.freeze({ issuer: claims.iss, subject: claims.sub });
}
