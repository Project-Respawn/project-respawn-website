import type { APIGatewayProxyHandlerV2, APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { assertPublicationOwner, assertWorkspaceBrandOwner, createConnectionRecord, createPublicationRecord, fanOutOverlayEvent, hashOverlayCredential, issueOverlayCredential, publicationIsActive, rotatePublicationCredential, validateOverlayEvent, validateSceneSnapshot } from './domain';
import { randomUUID } from 'node:crypto';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const env = (name: string) => { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; };
const json = (statusCode: number, body: unknown) => ({ statusCode, headers: { 'content-type': 'application/json', 'access-control-allow-origin': process.env.FRONTEND_ORIGIN || 'https://www.projectrespawn.com' }, body: JSON.stringify(body) });
const body = (event: any) => { try { return event.body ? JSON.parse(event.body) : {}; } catch { throw new Error('Request body is invalid'); } };
const userId = (event: any) => String(event.requestContext?.authorizer?.jwt?.claims?.sub || '');

async function getPublication(publicationId: string) { return (await db.send(new GetCommand({ TableName: env('PUBLICATION_TABLE'), Key: { publicationId } }))).Item; }
async function publicationForCredential(credential: string) {
  if (!credential) return null;
  const result = await db.send(new QueryCommand({ TableName: env('PUBLICATION_TABLE'), IndexName: 'credentialHash-index', KeyConditionExpression: 'credentialHash = :hash', ExpressionAttributeValues: { ':hash': hashOverlayCredential(credential) }, Limit: 1 }));
  return result.Items?.[0] || null;
}
async function authorizeBindings(input: any, sub: string) {
  if (!sub) throw new Error('Authentication is required');
  const [workspace, brand] = await Promise.all([
    db.send(new GetCommand({ TableName: env('WORKSPACE_TABLE'), Key: { id: String(input.workspaceId || '') } })),
    db.send(new GetCommand({ TableName: env('BRAND_TABLE'), Key: { id: String(input.brandId || '') } })),
  ]);
  assertWorkspaceBrandOwner(workspace.Item, brand.Item, sub, String(input.workspaceId || ''), String(input.brandId || ''));
}

async function createPublication(event: any) {
  const input = body(event), sub = userId(event); await authorizeBindings(input, sub);
  const issued = issueOverlayCredential();
  const publication = createPublicationRecord(input, sub, issued.credentialHash, new Date(), randomUUID());
  await db.send(new PutCommand({ TableName: env('PUBLICATION_TABLE'), Item: publication, ConditionExpression: 'attribute_not_exists(publicationId)' }));
  return json(201, { publicationId: publication.publicationId, revision: 1, status: 'TEST', credential: issued.credential, browserSourceUrl: `${env('FRONTEND_ORIGIN')}/overlay-source/${encodeURIComponent(issued.credential)}`, expiresAt: publication.expiresAt });
}

async function updatePublication(event: any, publicationId: string) {
  const input = body(event), sub = userId(event), publication = await getPublication(publicationId); assertPublicationOwner(publication, sub);
  await authorizeBindings(publication, sub); const sceneSnapshot = validateSceneSnapshot(input.sceneSnapshot); const now = new Date().toISOString();
  const result = await db.send(new UpdateCommand({ TableName: env('PUBLICATION_TABLE'), Key: { publicationId }, UpdateExpression: 'SET sceneSnapshot = :snapshot, revision = revision + :one, updatedAt = :now', ConditionExpression: 'ownerUserId = :owner AND attribute_not_exists(revokedAt)', ExpressionAttributeValues: { ':snapshot': sceneSnapshot, ':one': 1, ':now': now, ':owner': sub }, ReturnValues: 'ALL_NEW' }));
  return json(200, { publicationId, revision: result.Attributes?.revision, status: result.Attributes?.status, expiresAt: result.Attributes?.expiresAt });
}

async function revokePublication(event: any, publicationId: string) {
  const sub = userId(event), publication = await getPublication(publicationId); assertPublicationOwner(publication, sub); await authorizeBindings(publication, sub); const now = new Date().toISOString();
  await db.send(new UpdateCommand({ TableName: env('PUBLICATION_TABLE'), Key: { publicationId }, UpdateExpression: 'SET #status = :revoked, revokedAt = :now, updatedAt = :now', ConditionExpression: 'ownerUserId = :owner', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':revoked': 'REVOKED', ':now': now, ':owner': sub } }));
  return json(200, { publicationId, status: 'REVOKED' });
}

async function rotateCredential(event: any, publicationId: string) {
  const sub = userId(event), publication = await getPublication(publicationId);
  assertPublicationOwner(publication, sub); await authorizeBindings(publication, sub);
  if (!publication) throw new Error('Overlay publication access is denied');
  const issued = issueOverlayCredential(), now = new Date();
  const rotated = rotatePublicationCredential(publication, issued.credentialHash, now);
  await db.send(new UpdateCommand({
    TableName: env('PUBLICATION_TABLE'), Key: { publicationId },
    UpdateExpression: 'SET credentialHash = :credentialHash, credentialRotatedAt = :now, updatedAt = :now',
    ConditionExpression: 'ownerUserId = :owner AND credentialHash = :previousHash',
    ExpressionAttributeValues: { ':credentialHash': rotated.credentialHash, ':now': now.toISOString(), ':owner': sub, ':previousHash': publication.credentialHash },
  }));
  return json(200, { publicationId, credential: issued.credential, browserSourceUrl: `${env('FRONTEND_ORIGIN')}/overlay-source/${encodeURIComponent(issued.credential)}` });
}

async function sourceConfig(credential: string) {
  const publication = await publicationForCredential(credential); if (!publication || !publicationIsActive(publication)) return json(403, { error: 'Overlay source credential is invalid or expired' });
  return json(200, { revision: publication.revision, status: publication.status, scene: publication.sceneSnapshot, websocketUrl: env('WEBSOCKET_URL') });
}

async function sendTestEvent(event: any, publicationId: string) {
  const sub = userId(event), publication = await getPublication(publicationId); assertPublicationOwner(publication, sub); await authorizeBindings(publication, sub);
  if (!publicationIsActive(publication)) throw new Error('Overlay publication is not active'); const envelope = validateOverlayEvent(body(event).event);
  const connections = await db.send(new QueryCommand({ TableName: env('CONNECTION_TABLE'), IndexName: 'publicationId-index', KeyConditionExpression: 'publicationId = :publicationId', ExpressionAttributeValues: { ':publicationId': publicationId } }));
  const gateway = new ApiGatewayManagementApiClient({ endpoint: env('WEBSOCKET_MANAGEMENT_URL') });
  const delivered = await fanOutOverlayEvent(connections.Items || [], envelope,
    async (connectionId, message) => { await gateway.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: Buffer.from(JSON.stringify(message)) })); },
    async (connectionId) => { await db.send(new DeleteCommand({ TableName: env('CONNECTION_TABLE'), Key: { connectionId } })); });
  return json(200, { publicationId, eventId: envelope.id, delivered });
}

async function websocket(event: any) {
  const routeKey = event.requestContext.routeKey, connectionId = event.requestContext.connectionId;
  if (routeKey === '$disconnect') { await db.send(new DeleteCommand({ TableName: env('CONNECTION_TABLE'), Key: { connectionId } })); return { statusCode: 200 }; }
  if (routeKey !== '$connect') return { statusCode: 400 };
  const publication = await publicationForCredential(String(event.queryStringParameters?.credential || ''));
  if (!publication || !publicationIsActive(publication)) return { statusCode: 401 };
  await db.send(new PutCommand({ TableName: env('CONNECTION_TABLE'), Item: createConnectionRecord(connectionId, publication.publicationId) }));
  return { statusCode: 200 };
}

export const handler: APIGatewayProxyHandlerV2 & APIGatewayProxyWebsocketHandlerV2 = async (event: any) => {
  try {
    if (event.requestContext?.connectionId) return await websocket(event);
    const method = event.requestContext?.http?.method, path = String(event.rawPath || '');
    if (method === 'GET' && path.startsWith('/overlay/source/')) return await sourceConfig(decodeURIComponent(path.slice('/overlay/source/'.length)));
    if (method === 'POST' && path === '/overlay/publications') return await createPublication(event);
    const match = path.match(/^\/overlay\/publications\/([^/]+)(?:\/(events|rotate))?$/); if (!match) return json(404, { error: 'Route not found' });
    if (method === 'PUT' && !match[2]) return await updatePublication(event, match[1]);
    if (method === 'DELETE' && !match[2]) return await revokePublication(event, match[1]);
    if (method === 'POST' && match[2] === 'rotate') return await rotateCredential(event, match[1]);
    if (method === 'POST' && match[2] === 'events') return await sendTestEvent(event, match[1]);
    return json(405, { error: 'Method not allowed' });
  } catch (error: any) { return json(/access|Authentication/.test(error?.message || '') ? 403 : 400, { error: error?.message || 'Overlay source request failed' }); }
};
