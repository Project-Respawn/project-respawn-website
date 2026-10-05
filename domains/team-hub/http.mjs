import { operations, DomainError, VERSION, fail } from './contracts.mjs';
import { TeamService } from './service.mjs';
export function createHandler(runtime, dependencies) {
  const service = dependencies ? new TeamService(dependencies) : undefined;
  return async event => {
    const requestId = event?.requestContext?.requestId ?? 'unavailable';
    const headers = { 'content-type': 'application/json', 'cache-control': 'no-store' };
    try {
      // Fail closed until a separately reviewed persistent adapter and Core transport exist.
      if (!service) fail('OFFLINE_SKELETON');
      const operation = Object.keys(operations).find(op => `${operations[op].method} ${operations[op].path}` === event.routeKey && operations[op].runtime === runtime);
      if (!operation) fail('NOT_FOUND');
      if (event.isBase64Encoded || Buffer.byteLength(event.body ?? '') > 16384) fail('INVALID_INPUT');
      let body = {};
      try { body = event.body ? JSON.parse(event.body) : {}; } catch { fail('INVALID_INPUT'); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) fail('INVALID_INPUT');
      const path = event.pathParameters ?? {};
      const query = { ...(event.queryStringParameters ?? {}) };
      if ('limit' in query && /^\d+$/.test(query.limit)) query.limit = Number(query.limit);
      // Exactly one source for path/query/body fields. Never silently overwrite a supplied value.
      if (Object.keys(path).some(k => k in body || k in query) || Object.keys(query).some(k => k in body)) fail('INVALID_INPUT');
      const data = await service.execute(operation, { ...body, ...query, ...path }, event.requestContext?.authorizer?.jwt?.claims, requestId);
      return { statusCode: 200, headers, body: JSON.stringify({ contractVersion: VERSION, requestId, data }) };
    } catch (error) {
      return { statusCode: error instanceof DomainError ? error.status : 500, headers, body: JSON.stringify({ contractVersion: VERSION, requestId, error: { code: error instanceof DomainError ? error.code : 'INTERNAL_ERROR' } }) };
    }
  };
}
