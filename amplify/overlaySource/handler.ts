import type { APIGatewayProxyHandlerV2, APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { activePublicationLockId, assertPublicationOwner, assertWorkspaceBrandOwner, createActivePublicationLock, createConnectionRecord, createPublicationRecord, DEFAULT_TWITCH_OVERLAY_CONFIG, editableOverlayProjectId, fanOutOverlayEvent, hashOverlayCredential, issueOverlayCredential, publicationIsActive, rotatePublicationCredential, twitchOverlayConfigId, validateEditableOverlayProject, validateOverlayEvent, validateSceneSnapshot, validateTwitchOverlayConfig } from './domain';
import { randomUUID } from 'node:crypto';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const env = (name: string) => { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; };
const json = (statusCode: number, body: unknown) => ({ statusCode, headers: { 'content-type': 'application/json', 'access-control-allow-origin': process.env.FRONTEND_ORIGIN || 'https://www.projectrespawn.com' }, body: JSON.stringify(body) });
const body = (event: any) => { try { return event.body ? JSON.parse(event.body) : {}; } catch { throw new Error('Request body is invalid'); } };
const userId = (event: any) => String(event.requestContext?.authorizer?.jwt?.claims?.sub || '');

async function getPublication(publicationId: string) { return (await db.send(new GetCommand({ TableName: env('PUBLICATION_TABLE'), Key: { publicationId } }))).Item; }
async function getTwitchConfigRecord(brandId: string) { return (await db.send(new GetCommand({ TableName: env('PUBLICATION_TABLE'), Key: { publicationId: twitchOverlayConfigId(brandId) }, ConsistentRead: true }))).Item; }
async function assertCurrentEditorRevision(brandId: string, sourceEditorRevision: unknown) {
  if (!Number.isInteger(sourceEditorRevision) || Number(sourceEditorRevision) < 1) throw new Error('Source editor revision is required');
  const editor = (await db.send(new GetCommand({ TableName: env('PUBLICATION_TABLE'), Key: { publicationId: editableOverlayProjectId(brandId) }, ConsistentRead: true }))).Item;
  if (!editor || Number(editor.revision) !== Number(sourceEditorRevision)) throw new Error('Save the current overlay draft before updating Live');
}
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
  await assertCurrentEditorRevision(String(input.brandId), input.sourceEditorRevision);
  const issued = issueOverlayCredential();
  const publication = createPublicationRecord(input, sub, issued.credentialHash, new Date(), randomUUID());
  const lock = createActivePublicationLock(publication), tableName = env('PUBLICATION_TABLE');
  try {
    await db.send(new TransactWriteCommand({ TransactItems: [
      { Put: { TableName: tableName, Item: publication, ConditionExpression: 'attribute_not_exists(publicationId)' } },
      { Put: { TableName: tableName, Item: lock, ConditionExpression: 'attribute_not_exists(publicationId)' } },
    ] }));
    return json(201, publicationResponse(publication, { credential: issued.credential, created: true }));
  } catch (error: any) {
    if (error?.name !== 'TransactionCanceledException') throw error;
    const existing = await getActivePublication(input.brandId);
    assertPublicationOwner(existing, sub); await authorizeBindings(existing, sub);
    return json(200, publicationResponse(existing, { created: false }));
  }
}

function publicationResponse(publication: any, extra: Record<string, unknown> = {}) {
  const credential = extra.credential as string | undefined;
  return {
    publicationId: publication.publicationId, workspaceId: publication.workspaceId, brandId: publication.brandId,
    sceneId: publication.sceneId, sceneName: publication.sceneSnapshot?.name || '', revision: publication.revision,
    status: publication.status, updatedAt: publication.updatedAt,
    ...(Number.isInteger(publication.sourceEditorRevision) ? { sourceEditorRevision: publication.sourceEditorRevision } : {}), ...extra,
    ...(credential ? { browserSourceUrl: `${env('FRONTEND_ORIGIN')}/overlay-source/${encodeURIComponent(credential)}` } : {}),
  };
}

async function getActivePublication(brandId: string) {
  const tableName = env('PUBLICATION_TABLE');
  const lock = (await db.send(new GetCommand({ TableName: tableName, Key: { publicationId: activePublicationLockId(String(brandId || '')) }, ConsistentRead: true }))).Item;
  if (!lock?.activePublicationId) return null;
  return (await db.send(new GetCommand({ TableName: tableName, Key: { publicationId: lock.activePublicationId }, ConsistentRead: true }))).Item || null;
}

async function activePublication(event: any) {
  const sub = userId(event), input = event.queryStringParameters || {};
  await authorizeBindings(input, sub);
  const publication = await getActivePublication(input.brandId);
  if (!publication) return json(200, { publication: null });
  assertPublicationOwner(publication, sub); await authorizeBindings(publication, sub);
  return json(200, { publication: publicationResponse(publication) });
}

async function authorizeActivePublication(publication: any, sub: string) {
  assertPublicationOwner(publication, sub); await authorizeBindings(publication, sub);
  const active = await getActivePublication(publication?.brandId);
  if (!active || active.publicationId !== publication.publicationId) throw new Error('Overlay publication is not active');
}

async function updatePublication(event: any, publicationId: string) {
  const input = body(event), sub = userId(event), publication = await getPublication(publicationId);
  if (!publication) throw new Error('Overlay publication access is denied');
  await authorizeActivePublication(publication, sub); const sceneSnapshot = validateSceneSnapshot(input.sceneSnapshot); const now = new Date().toISOString();
  const sceneId = String(input.sceneId || sceneSnapshot.id || '');
  await assertCurrentEditorRevision(String(publication.brandId), input.sourceEditorRevision);
  const sourceEditorRevision = Number(input.sourceEditorRevision);
  const result = await db.send(new UpdateCommand({ TableName: env('PUBLICATION_TABLE'), Key: { publicationId }, UpdateExpression: 'SET sceneId = :sceneId, sceneSnapshot = :snapshot, sourceEditorRevision = :sourceEditorRevision, revision = revision + :one, updatedAt = :now', ConditionExpression: 'ownerUserId = :owner AND attribute_not_exists(revokedAt)', ExpressionAttributeValues: { ':sceneId': sceneId, ':snapshot': sceneSnapshot, ':sourceEditorRevision': sourceEditorRevision, ':one': 1, ':now': now, ':owner': sub }, ReturnValues: 'ALL_NEW' }));
  return json(200, publicationResponse(result.Attributes));
}

async function revokePublication(event: any, publicationId: string) {
  const sub = userId(event), publication = await getPublication(publicationId); await authorizeActivePublication(publication, sub); const now = new Date().toISOString();
  if (!publication) throw new Error('Overlay publication access is denied');
  await db.send(new TransactWriteCommand({ TransactItems: [
    { Update: { TableName: env('PUBLICATION_TABLE'), Key: { publicationId }, UpdateExpression: 'SET #status = :revoked, revokedAt = :now, updatedAt = :now', ConditionExpression: 'ownerUserId = :owner AND attribute_not_exists(revokedAt)', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':revoked': 'REVOKED', ':now': now, ':owner': sub } } },
    { Delete: { TableName: env('PUBLICATION_TABLE'), Key: { publicationId: activePublicationLockId(publication.brandId) }, ConditionExpression: 'activePublicationId = :publicationId AND ownerUserId = :owner', ExpressionAttributeValues: { ':publicationId': publicationId, ':owner': sub } } },
  ] }));
  return json(200, { publicationId, status: 'REVOKED' });
}

async function rotateCredential(event: any, publicationId: string) {
  const sub = userId(event), publication = await getPublication(publicationId);
  await authorizeActivePublication(publication, sub);
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
  const configRecord = await getTwitchConfigRecord(publication.brandId);
  return json(200, { revision: publication.revision, status: publication.status, scene: publication.sceneSnapshot, twitchConfig: configRecord?.config || DEFAULT_TWITCH_OVERLAY_CONFIG, twitchConfigRevision: Number(configRecord?.revision || 1), websocketUrl: env('WEBSOCKET_URL') });
}

async function managedTwitchConfig(event: any, method: string) {
  const input = method === 'GET' ? (event.queryStringParameters || {}) : body(event), sub = userId(event);
  await authorizeBindings(input, sub); const existing = await getTwitchConfigRecord(String(input.brandId));
  if (method === 'GET') return json(200, { config: existing?.config || DEFAULT_TWITCH_OVERLAY_CONFIG, revision: Number(existing?.revision || 1) });
  const config = validateTwitchOverlayConfig(input.config), now = new Date().toISOString(), tableName = env('PUBLICATION_TABLE');
  const result = await db.send(new UpdateCommand({
    TableName: tableName, Key: { publicationId: twitchOverlayConfigId(String(input.brandId)) },
    UpdateExpression: 'SET entityType = :type, workspaceId = :workspaceId, brandId = :brandId, ownerUserId = :owner, config = :config, revision = if_not_exists(revision, :zero) + :one, updatedAt = :now, createdAt = if_not_exists(createdAt, :now)',
    ExpressionAttributeValues: { ':type': 'TWITCH_OVERLAY_CONFIG', ':workspaceId': String(input.workspaceId), ':brandId': String(input.brandId), ':owner': sub, ':config': config, ':zero': 0, ':one': 1, ':now': now }, ReturnValues: 'ALL_NEW',
  }));
  return json(200, { config: result.Attributes?.config, revision: Number(result.Attributes?.revision || 1) });
}

async function managedEditorProject(event: any, method: string) {
  const input = method === 'GET' ? (event.queryStringParameters || {}) : body(event), sub = userId(event);
  await authorizeBindings(input, sub); const tableName = env('PUBLICATION_TABLE'), key = { publicationId: editableOverlayProjectId(String(input.brandId)) };
  if (method === 'GET') {
    const existing = (await db.send(new GetCommand({ TableName: tableName, Key: key, ConsistentRead: true }))).Item;
    return json(200, { project: existing?.project || null, revision: Number(existing?.revision || 0) });
  }
  const project = validateEditableOverlayProject(input.project), expectedRevision = Number(input.revision || 0), now = new Date().toISOString();
  try {
    const result = await db.send(new UpdateCommand({
      TableName: tableName, Key: key,
      UpdateExpression: 'SET entityType = :type, workspaceId = :workspaceId, brandId = :brandId, ownerUserId = :owner, #project = :project, revision = if_not_exists(revision, :zero) + :one, updatedAt = :now, createdAt = if_not_exists(createdAt, :now)',
      ConditionExpression: '(attribute_not_exists(revision) AND :expected = :zero) OR revision = :expected',
      ExpressionAttributeNames: { '#project': 'project' },
      ExpressionAttributeValues: { ':type': 'EDITABLE_OVERLAY_PROJECT', ':workspaceId': String(input.workspaceId), ':brandId': String(input.brandId), ':owner': sub, ':project': project, ':zero': 0, ':one': 1, ':expected': expectedRevision, ':now': now }, ReturnValues: 'ALL_NEW',
    }));
    return json(200, { project: result.Attributes?.project, revision: Number(result.Attributes?.revision || 1) });
  } catch (error: any) {
    if (error?.name === 'ConditionalCheckFailedException') throw new Error('Editable overlay changed in another session; reload before saving');
    throw error;
  }
}

async function sendTestEvent(event: any, publicationId: string) {
  const sub = userId(event), publication = await getPublication(publicationId); await authorizeActivePublication(publication, sub);
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
    if (path === '/overlay/twitch-config' && (method === 'GET' || method === 'PUT')) return await managedTwitchConfig(event, method);
    if (path === '/overlay/editor-project' && (method === 'GET' || method === 'PUT')) return await managedEditorProject(event, method);
    if (method === 'GET' && path === '/overlay/publications/active') return await activePublication(event);
    if (method === 'POST' && path === '/overlay/publications') return await createPublication(event);
    const match = path.match(/^\/overlay\/publications\/([^/]+)(?:\/(events|rotate))?$/); if (!match) return json(404, { error: 'Route not found' });
    if (method === 'PUT' && !match[2]) return await updatePublication(event, match[1]);
    if (method === 'DELETE' && !match[2]) return await revokePublication(event, match[1]);
    if (method === 'POST' && match[2] === 'rotate') return await rotateCredential(event, match[1]);
    if (method === 'POST' && match[2] === 'events') return await sendTestEvent(event, match[1]);
    return json(405, { error: 'Method not allowed' });
  } catch (error: any) { return json(/access|Authentication/.test(error?.message || '') ? 403 : 400, { error: error?.message || 'Overlay source request failed' }); }
};
