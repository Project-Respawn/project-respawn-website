import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { activePublicationLockId, twitchOverlayConfigId } from './domain';
import type { CanonicalPublisherDependencies } from './canonicalPublisher';

export function createAwsCanonicalPublisherDependencies(environment: NodeJS.ProcessEnv = process.env): CanonicalPublisherDependencies {
  const required = (name: string) => { const value = environment[name]; if (!value) throw new Error(`Missing ${name}`); return value; };
  const publicationTable = environment.OVERLAY_PUBLICATION_TABLE || required('PUBLICATION_TABLE');
  const connectionTable = environment.OVERLAY_CONNECTION_TABLE || required('CONNECTION_TABLE');
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const gateway = new ApiGatewayManagementApiClient({ endpoint: environment.OVERLAY_WEBSOCKET_MANAGEMENT_URL || required('WEBSOCKET_MANAGEMENT_URL') });
  return {
    async getActivePublication(brandId) { const lock = (await db.send(new GetCommand({ TableName: publicationTable, Key: { publicationId: activePublicationLockId(brandId) }, ConsistentRead: true }))).Item; if (!lock?.activePublicationId) return null; return (await db.send(new GetCommand({ TableName: publicationTable, Key: { publicationId: lock.activePublicationId }, ConsistentRead: true }))).Item || null; },
    async getConfigRevision(brandId) { const item = (await db.send(new GetCommand({ TableName: publicationTable, Key: { publicationId: twitchOverlayConfigId(brandId) }, ConsistentRead: true }))).Item; return Number(item?.revision || 1); },
    async listConnections(publicationId) { return (await db.send(new QueryCommand({ TableName: connectionTable, IndexName: 'publicationId-index', KeyConditionExpression: 'publicationId = :publicationId', ExpressionAttributeValues: { ':publicationId': publicationId } }))).Items || []; },
    async send(connectionId, event) { await gateway.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: Buffer.from(JSON.stringify(event)) })); },
    async remove(connectionId) { await db.send(new DeleteCommand({ TableName: connectionTable, Key: { connectionId } })); },
    log(entry) { console.error(JSON.stringify(entry)); },
  };
}
