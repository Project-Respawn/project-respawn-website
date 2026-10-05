import { Stack, RemovalPolicy, aws_apigatewayv2 as api, aws_lambda as lambda, aws_iam as iam, aws_logs as logs, aws_cloudwatch as cloudwatch, aws_dynamodb as dynamodb, aws_s3_assets as assets } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { operations } from '../../../domains/team-hub/contracts.mjs';
import { target, runtimePolicy, deploymentPolicy, callerPolicy } from './security.mjs';
export interface Environment { environment: string; account: string; region: string; issuer: string; poolId: string; clientId: string }
export class TeamHubStack extends Stack {
  constructor(scope: Construct, core: Environment, assetPaths: Record<string, string>) {
    if (core.environment !== target.environment || core.account !== target.account || core.region !== target.region || core.issuer !== `https://cognito-idp.eu-north-1.amazonaws.com/${core.poolId}`) throw new Error('Ntgre Team Hub only');
    super(scope, target.stack, { stackName: target.stack, env: { account: core.account, region: core.region }, description: 'OFFLINE Phase 2B1 Team Hub skeleton - NOT deployment ready' });
    this.templateOptions.metadata = { Status: 'OFFLINE_SKELETON', Contract: 'team-hub.v1', LiveEndpoint: false, Migration: false };
    for (const name of ['Operational', 'Journal']) {
      const attributes = ['PK', 'SK', ...(name === 'Operational' ? ['SubjectPK', 'SubjectSK', 'StatusPK', 'StatusSK'] : [])];
      const table = new dynamodb.CfnTable(this, name, { tableName: `${target.stack}-${name}`, billingMode: 'PAY_PER_REQUEST', attributeDefinitions: attributes.map(attributeName => ({ attributeName, attributeType: 'S' })), keySchema: [{ attributeName: 'PK', keyType: 'HASH' }, { attributeName: 'SK', keyType: 'RANGE' }], globalSecondaryIndexes: name === 'Operational' ? ['Subject', 'Status'].map(key => ({ indexName: `By${key}`, keySchema: [{ attributeName: `${key}PK`, keyType: 'HASH' }, { attributeName: `${key}SK`, keyType: 'RANGE' }], projection: { projectionType: 'KEYS_ONLY' } })) : undefined, timeToLiveSpecification: name === 'Journal' ? { attributeName: 'expiresAt', enabled: true } : undefined, pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, deletionProtectionEnabled: true, sseSpecification: { sseEnabled: true } });
      table.applyRemovalPolicy(RemovalPolicy.RETAIN);
    }
    const http = new api.CfnApi(this, 'HttpApi', { name: target.stack, protocolType: 'HTTP', corsConfiguration: { allowOrigins: ['http://localhost:5174'], allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowHeaders: ['authorization', 'content-type'] } });
    const authorizer = new api.CfnAuthorizer(this, 'JwtAuthorizer', { apiId: http.ref, name: 'ExistingNtgreIdentity', authorizerType: 'JWT', identitySource: ['$request.header.Authorization'], jwtConfiguration: { issuer: core.issuer, audience: [core.clientId] } });
    const apiLogs = new logs.CfnLogGroup(this, 'AccessLogs', { logGroupName: '/project-respawn/Ntgre/team-hub/http', retentionInDays: 14 });
    new logs.CfnResourcePolicy(this, 'AccessLogDelivery', { policyName: `${target.stack}-AccessLogs`, policyDocument: JSON.stringify({ Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'delivery.logs.amazonaws.com' }, Action: ['logs:CreateLogStream', 'logs:PutLogEvents'], Resource: `arn:aws:logs:${core.region}:${core.account}:log-group:/project-respawn/Ntgre/team-hub/http:*`, Condition: { StringEquals: { 'aws:SourceAccount': core.account }, ArnLike: { 'aws:SourceArn': `arn:aws:logs:${core.region}:${core.account}:*` } } }] }) });
    const integrations: Record<string, api.CfnIntegration> = {};
    for (const kind of ['read', 'command']) {
      const log = new logs.CfnLogGroup(this, `${kind}Logs`, { logGroupName: `/project-respawn/Ntgre/team-hub/${kind}`, retentionInDays: 14 });
      const boundary = new iam.CfnManagedPolicy(this, `${kind}Boundary`, { managedPolicyName: `${target.stack}-${kind}-Boundary`, policyDocument: runtimePolicy(kind) });
      const role = new iam.CfnRole(this, `${kind}Role`, { roleName: `${target.stack}-${kind}`, permissionsBoundary: boundary.ref, assumeRolePolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'lambda.amazonaws.com' }, Action: 'sts:AssumeRole' }] }, policies: [{ policyName: 'TeamOnly', policyDocument: runtimePolicy(kind) }] });
      const asset = new assets.Asset(this, `${kind}Asset`, { path: assetPaths[kind]! });
      const fn = new lambda.CfnFunction(this, `${kind}Function`, { functionName: `${target.stack}-${kind}`, runtime: 'nodejs22.x', handler: 'index.handler', architectures: ['arm64'], timeout: 10, memorySize: 256, role: role.attrArn, code: { s3Bucket: asset.s3BucketName, s3Key: asset.s3ObjectKey }, loggingConfig: { logGroup: log.ref, logFormat: 'JSON' }, environment: { variables: { MODE: 'OFFLINE_SKELETON', DOMAIN_ENV: core.environment, EXPECTED_ISSUER: core.issuer, EXPECTED_CLIENT_ID: core.clientId } } });
      integrations[kind] = new api.CfnIntegration(this, `${kind}Integration`, { apiId: http.ref, integrationType: 'AWS_PROXY', integrationUri: fn.attrArn, payloadFormatVersion: '2.0' });
      new lambda.CfnPermission(this, `${kind}Invoke`, { action: 'lambda:InvokeFunction', functionName: fn.ref, principal: 'apigateway.amazonaws.com', sourceAccount: core.account, sourceArn: `arn:aws:execute-api:${core.region}:${core.account}:${http.ref}/*/*/v1/*` });
      for (const metric of ['Errors', 'Throttles']) new cloudwatch.CfnAlarm(this, `${kind}${metric}`, { alarmName: `${target.stack}-${kind}-${metric}`, namespace: 'AWS/Lambda', metricName: metric, dimensions: [{ name: 'FunctionName', value: fn.ref }], statistic: 'Sum', period: 60, evaluationPeriods: 1, threshold: 1, comparisonOperator: 'GreaterThanOrEqualToThreshold', treatMissingData: 'notBreaching' });
    }
    for (const [operation, spec] of Object.entries(operations)) new api.CfnRoute(this, operation, { apiId: http.ref, routeKey: `${spec.method} ${spec.path}`, authorizationType: 'JWT', authorizerId: authorizer.ref, target: `integrations/${integrations[spec.runtime]!.ref}` });
    new api.CfnStage(this, 'Stage', { apiId: http.ref, stageName: '$default', autoDeploy: true, defaultRouteSettings: { throttlingBurstLimit: 20, throttlingRateLimit: 10 }, accessLogSettings: { destinationArn: apiLogs.attrArn, format: JSON.stringify({ requestId: '$context.requestId', status: '$context.status', routeKey: '$context.routeKey', responseLatency: '$context.responseLatency' }) } });
    for (const [metric, threshold] of [['5xx', 1], ['Latency', 2000]] as const) new cloudwatch.CfnAlarm(this, `Http${metric}`, { alarmName: `${target.stack}-HTTP-${metric}`, namespace: 'AWS/ApiGateway', metricName: metric, dimensions: [{ name: 'ApiId', value: http.ref }], statistic: metric === '5xx' ? 'Sum' : 'Average', period: 60, evaluationPeriods: 1, threshold, comparisonOperator: 'GreaterThanOrEqualToThreshold', treatMissingData: 'notBreaching' });
  }
}
/** Local security root is separately counted, not an uncounted shared prerequisite. */
export class TeamHubSecurityStack extends Stack {
  constructor(scope: Construct, core: Environment) {
    super(scope, `${target.stack}-Security`, { env: { account: core.account, region: core.region }, description: 'OFFLINE security definitions; separate bootstrap review required' });
    const boundary = new iam.CfnManagedPolicy(this, 'ExecutionBoundary', { managedPolicyName: `${target.stack}-ExecutionBoundary`, policyDocument: deploymentPolicy });
    new iam.CfnRole(this, 'ExecutionRole', { roleName: `${target.stack}-Execution`, permissionsBoundary: boundary.ref, assumeRolePolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'cloudformation.amazonaws.com' }, Action: 'sts:AssumeRole', Condition: { StringEquals: { 'aws:SourceAccount': core.account } } }] }, policies: [{ policyName: 'TeamDeployment', policyDocument: deploymentPolicy }] });
    new iam.CfnManagedPolicy(this, 'PreparationCallerPolicy', { managedPolicyName: `${target.stack}-PreparationCaller`, policyDocument: callerPolicy });
  }
}
