import test from 'node:test';
import assert from 'node:assert/strict';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
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

function runtimeTemplate() {
  const app = new App(), stack = new Stack(app, 'OverlayRuntimeIamTest', { env: { account: '123456789012', region: 'eu-north-1' } });
  const runtime = new LambdaFunction(stack, 'Runtime', { runtime: Runtime.NODEJS_22_X, handler: 'index.handler', code: Code.fromInline('exports.handler=async()=>{}') });
  new OverlaySourceInfrastructure(stack, 'OverlaySource', {
    workspaceTable: Table.fromTableName(stack, 'Workspace', 'CreatorWorkspace'), brandTable: Table.fromTableName(stack, 'Brand', 'Brand'),
    userPoolId: 'eu-north-1_pool', userPoolClientId: 'client-id', frontendOrigin: 'https://www.projectrespawn.com', runtimeHandler: runtime,
  });
  return Template.fromStack(stack).toJSON();
}

test('dedicated stack synthesizes three isolated on-demand tables with required indexes and TTL', () => {
  const value = template(); value.resourceCountIs('AWS::DynamoDB::Table', 3);
  value.hasResourceProperties('AWS::DynamoDB::Table', { BillingMode: 'PAY_PER_REQUEST', GlobalSecondaryIndexes: Match.arrayWith([Match.objectLike({ IndexName: 'credentialHash-index' })]) });
  value.hasResourceProperties('AWS::DynamoDB::Table', { BillingMode: 'PAY_PER_REQUEST', TimeToLiveSpecification: { AttributeName: 'expiresAtEpoch', Enabled: true }, GlobalSecondaryIndexes: Match.arrayWith([Match.objectLike({ IndexName: 'publicationId-index' })]) });
  value.hasResourceProperties('AWS::DynamoDB::Table', { BillingMode: 'PAY_PER_REQUEST', TimeToLiveSpecification: { AttributeName: 'expiresAt', Enabled: true } });
});

test('Creator endpoints are JWT authorized while opaque source configuration is credential authorized', () => {
  const value = template(); value.resourceCountIs('AWS::ApiGatewayV2::Authorizer', 1);
  value.hasResourceProperties('AWS::ApiGatewayV2::Route', { RouteKey: 'GET /overlay/source/{credential}', AuthorizationType: 'NONE' });
  for (const routeKey of ['POST /overlay/publications', 'GET /overlay/publications/active', 'GET /overlay/twitch-config', 'PUT /overlay/twitch-config', 'GET /overlay/editor-project', 'PUT /overlay/editor-project', 'PUT /overlay/publications/{publicationId}', 'DELETE /overlay/publications/{publicationId}', 'POST /overlay/publications/{publicationId}/events', 'POST /overlay/publications/{publicationId}/rotate']) value.hasResourceProperties('AWS::ApiGatewayV2::Route', { RouteKey: routeKey, AuthorizationType: 'JWT' });
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

test('runtime Phase 2A IAM and environment are explicit least privilege', () => {
  const value: any = runtimeTemplate();
  const runtime = Object.values(value.Resources).find((resource: any) => resource.Type === 'AWS::Lambda::Function' && resource.Properties.Handler === 'index.handler') as any;
  const roleRef = runtime.Properties.Role['Fn::GetAtt'][0];
  const policy = Object.values(value.Resources).find((resource: any) => resource.Type === 'AWS::IAM::Policy' && resource.Properties.Roles?.some((role: any) => role.Ref === roleRef)) as any;
  const statements = policy.Properties.PolicyDocument.Statement;
  const actions = statements.flatMap((statement: any) => Array.isArray(statement.Action) ? statement.Action : [statement.Action]);
  const resources = statements.map((statement: any) => JSON.stringify(statement.Resource));
  assert.deepEqual(actions.sort(), ['dynamodb:DeleteItem', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query', 'dynamodb:UpdateItem', 'execute-api:ManageConnections'].sort());
  for (const forbidden of ['dynamodb:*', 'dynamodb:Scan', 'dynamodb:BatchGetItem', 'dynamodb:BatchWriteItem', 'dynamodb:GetRecords', 'dynamodb:GetShardIterator', 'dynamodb:DescribeTable', 'dynamodb:ConditionCheckItem']) assert.equal(actions.includes(forbidden), false);
  assert.equal(resources.some((resource: string) => resource === '"*"' || resource.includes('/index/*')), false);
  assert.equal(statements.filter((statement: any) => statement.Action === 'dynamodb:GetItem').length, 1);
  assert.equal(statements.filter((statement: any) => statement.Action === 'dynamodb:Query').length, 1);
  assert.match(JSON.stringify(statements.find((statement: any) => statement.Action === 'dynamodb:Query').Resource), /publicationId-index/);
  assert.deepEqual(statements.find((statement: any) => Array.isArray(statement.Action) && statement.Action.includes('dynamodb:PutItem')).Action, ['dynamodb:PutItem', 'dynamodb:UpdateItem']);
  assert.match(JSON.stringify(statements.find((statement: any) => statement.Action === 'execute-api:ManageConnections').Resource), /live\/POST\/@connections\/\*/);
  const environment = runtime.Properties.Environment.Variables;
  for (const name of ['OVERLAY_PUBLICATION_TABLE', 'OVERLAY_CONNECTION_TABLE', 'TWITCH_EVENT_DEDUPE_TABLE', 'OVERLAY_WEBSOCKET_MANAGEMENT_URL']) assert.ok(environment[name]);
  assert.equal(environment.OVERLAY_WORKSPACE_TABLE, undefined); assert.equal(environment.OVERLAY_BRAND_TABLE, undefined);
});
