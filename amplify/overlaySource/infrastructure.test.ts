import test from 'node:test';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { OverlaySourceInfrastructure } from './infrastructure';

function template() {
  const app = new App(), stack = new Stack(app, 'OverlaySourceTest', { env: { account: '123456789012', region: 'eu-north-1' } });
  new OverlaySourceInfrastructure(stack, 'OverlaySource', {
    workspaceTable: Table.fromTableName(stack, 'Workspace', 'CreatorWorkspace'),
    brandTable: Table.fromTableName(stack, 'Brand', 'Brand'),
    userPoolId: 'eu-north-1_pool', userPoolClientId: 'client-id', frontendOrigin: 'https://www.projectrespawn.com',
  });
  return Template.fromStack(stack);
}

test('dedicated stack synthesizes two isolated on-demand tables with required indexes and TTL', () => {
  const value = template(); value.resourceCountIs('AWS::DynamoDB::Table', 2);
  value.hasResourceProperties('AWS::DynamoDB::Table', { BillingMode: 'PAY_PER_REQUEST', GlobalSecondaryIndexes: Match.arrayWith([Match.objectLike({ IndexName: 'credentialHash-index' })]) });
  value.hasResourceProperties('AWS::DynamoDB::Table', { BillingMode: 'PAY_PER_REQUEST', TimeToLiveSpecification: { AttributeName: 'expiresAtEpoch', Enabled: true }, GlobalSecondaryIndexes: Match.arrayWith([Match.objectLike({ IndexName: 'publicationId-index' })]) });
});

test('Creator endpoints are JWT authorized while opaque source configuration is credential authorized', () => {
  const value = template(); value.resourceCountIs('AWS::ApiGatewayV2::Authorizer', 1);
  value.hasResourceProperties('AWS::ApiGatewayV2::Route', { RouteKey: 'GET /overlay/source/{credential}', AuthorizationType: 'NONE' });
  for (const routeKey of ['POST /overlay/publications', 'GET /overlay/publications/active', 'GET /overlay/twitch-config', 'PUT /overlay/twitch-config', 'PUT /overlay/publications/{publicationId}', 'DELETE /overlay/publications/{publicationId}', 'POST /overlay/publications/{publicationId}/events', 'POST /overlay/publications/{publicationId}/rotate']) value.hasResourceProperties('AWS::ApiGatewayV2::Route', { RouteKey: routeKey, AuthorizationType: 'JWT' });
});

test('publication IAM includes transactional writes needed for the race-safe Brand lock', () => {
  template().hasResourceProperties('AWS::IAM::Policy', { PolicyDocument: { Statement: Match.arrayWith([Match.objectLike({ Action: 'dynamodb:TransactWriteItems', Effect: 'Allow' })]) } });
});

test('one managed WebSocket API owns connect, disconnect and default routes', () => {
  const value = template();
  value.hasResourceProperties('AWS::ApiGatewayV2::Api', { ProtocolType: 'WEBSOCKET' });
  for (const routeKey of ['$connect', '$disconnect', '$default']) value.hasResourceProperties('AWS::ApiGatewayV2::Route', { RouteKey: routeKey });
  value.hasResourceProperties('AWS::IAM::Policy', { PolicyDocument: { Statement: Match.arrayWith([Match.objectLike({ Action: 'execute-api:ManageConnections', Effect: 'Allow' })]) } });
});
