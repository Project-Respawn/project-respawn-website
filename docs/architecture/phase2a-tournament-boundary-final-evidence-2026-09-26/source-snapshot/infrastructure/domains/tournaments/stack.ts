import {Stack, CfnOutput, aws_apigatewayv2 as api, aws_lambda as lambda, aws_iam as iam, aws_logs as logs, aws_cloudwatch as cloudwatch, aws_s3_assets as assets} from 'aws-cdk-lib';
import {Construct} from 'constructs';
export interface CoreIdentity {environment: string; account: string; region: string; issuer: string; poolId: string; clientId: string}
export class TournamentStack extends Stack {
  constructor(scope: Construct, id: string, core: CoreIdentity, assetPath: string, revision: string, coreSha: string) {
    if (id !== 'ProjectRespawn-Tournaments-Ntgre' || core.account !== '058264289478' || core.region !== 'eu-north-1' || core.environment !== 'Ntgre' || core.issuer !== `https://cognito-idp.eu-north-1.amazonaws.com/${core.poolId}`) throw new Error('Ntgre Tournament target required');
    super(scope, id, {stackName: id, env: {account: core.account, region: core.region}, description: 'Independent Ntgre Tournament fixture proof; no business state'});
    const functionLogs = new logs.CfnLogGroup(this, 'PreviewLogs', {logGroupName: '/project-respawn/Ntgre/tournaments/preview', retentionInDays: 14});
    const role = new iam.CfnRole(this, 'PreviewRole', {
      permissionsBoundary: 'arn:aws:iam::058264289478:policy/ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary',
      assumeRolePolicyDocument: {Version: '2012-10-17', Statement: [{Effect: 'Allow', Principal: {Service: 'lambda.amazonaws.com'}, Action: 'sts:AssumeRole'}]},
      policies: [{policyName: 'PreviewLogsOnly', policyDocument: {Version: '2012-10-17', Statement: [{Effect: 'Allow', Action: ['logs:CreateLogStream', 'logs:PutLogEvents'], Resource: functionLogs.attrArn}]}}]
    });
    const http = new api.CfnApi(this, 'HttpApi', {name: id, protocolType: 'HTTP', tags: {Project: 'ProjectRespawn', Domain: 'Tournaments', Environment: 'Ntgre'}, corsConfiguration: {allowOrigins: ['http://localhost:5174'], allowMethods: ['GET'], allowHeaders: ['authorization'], maxAge: 300}});
    const asset = new assets.Asset(this, 'PreviewAsset', {path: assetPath});
    const fn = new lambda.CfnFunction(this, 'PreviewFunction', {runtime: 'nodejs22.x', handler: 'index.handler', architectures: ['arm64'], memorySize: 128, timeout: 5, role: role.attrArn, code: {s3Bucket: asset.s3BucketName, s3Key: asset.s3ObjectKey}, loggingConfig: {logGroup: functionLogs.ref, logFormat: 'JSON'}, environment: {variables: {DOMAIN_ENV: core.environment, EXPECTED_ISSUER: core.issuer, EXPECTED_CLIENT_ID: core.clientId, EXPECTED_API_ID: http.ref, BUILD_REVISION: revision}}});
    const authorizer = new api.CfnAuthorizer(this, 'JwtAuthorizer', {apiId: http.ref, name: 'ExistingNtgreIdentity', authorizerType: 'JWT', identitySource: ['$request.header.Authorization'], jwtConfiguration: {issuer: core.issuer, audience: [core.clientId]}});
    const integration = new api.CfnIntegration(this, 'PreviewIntegration', {apiId: http.ref, integrationType: 'AWS_PROXY', integrationUri: fn.attrArn, payloadFormatVersion: '2.0', timeoutInMillis: 6000});
    const route = new api.CfnRoute(this, 'PreviewRoute', {apiId: http.ref, routeKey: 'GET /v1/tournaments/preview', authorizationType: 'JWT', authorizerId: authorizer.ref, target: `integrations/${integration.ref}`});
    const permission = new lambda.CfnPermission(this, 'HttpInvoke', {functionName: fn.attrArn, action: 'lambda:InvokeFunction', principal: 'apigateway.amazonaws.com', sourceAccount: core.account, sourceArn: `arn:aws:execute-api:${core.region}:${core.account}:${http.ref}/*/GET/v1/tournaments/preview`});
    // Phase 2A proves deployment isolation. API access logging is deferred to a
    // separately reviewed Security/Observability capability; runtime logs remain.
    const stage = new api.CfnStage(this, 'DefaultStage', {apiId: http.ref, stageName: '$default', autoDeploy: true, defaultRouteSettings: {throttlingBurstLimit: 20, throttlingRateLimit: 10}});
    stage.addDependency(route); stage.addDependency(permission);
    new cloudwatch.CfnAlarm(this, 'PreviewErrors', {namespace: 'AWS/Lambda', metricName: 'Errors', dimensions: [{name: 'FunctionName', value: fn.ref}], statistic: 'Sum', period: 60, evaluationPeriods: 1, threshold: 1, comparisonOperator: 'GreaterThanOrEqualToThreshold', treatMissingData: 'notBreaching'});
    new cloudwatch.CfnAlarm(this, 'HttpErrors', {namespace: 'AWS/ApiGateway', metricName: '5xx', dimensions: [{name: 'ApiId', value: http.ref}], statistic: 'Sum', period: 60, evaluationPeriods: 1, threshold: 1, comparisonOperator: 'GreaterThanOrEqualToThreshold', treatMissingData: 'notBreaching'});
    for (const [name, value] of Object.entries({DomainOwner: 'Tournaments', Environment: core.environment, Account: core.account, Region: core.region, Endpoint: http.attrApiEndpoint, ApiId: http.ref, ContractVersion: 'tournament-preview.v1', DeploymentRevision: revision, CoreIdentitySha256: coreSha})) new CfnOutput(this, name, {value});
  }
}
