import { Stack, aws_apigatewayv2 as api, aws_lambda as lambda, aws_iam as iam, aws_logs as logs, aws_cloudwatch as cloudwatch, aws_s3_assets as assets } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { proofTarget, previewBoundaryArn, previewBoundary, previewIdentity, proofExecutionPolicy, proofCallerPolicy } from './read-proof-security.mjs';
interface Core { account: string; region: string; environment: string; issuer: string; poolId: string; clientId: string }
export class ReadProofStack extends Stack {
  readonly assetKey: string;
  constructor(scope: Construct, core: Core, assetPath: string) {
    if (core.account !== proofTarget.account || core.region !== proofTarget.region || core.environment !== 'Ntgre') throw new Error('Ntgre read proof only');
    super(scope, proofTarget.stack, { env: { account: core.account, region: core.region }, description: 'Team Hub READ_PROOF: authenticated synthetic response; no business state' });
    this.templateOptions.metadata = { Mode: 'READ_PROOF', DataAuthority: 'SYNTHETIC', DeploymentAuthorized: false };
    const log = new logs.CfnLogGroup(this, 'ReadLogs', { logGroupName: '/project-respawn/Ntgre/team-hub/preview', retentionInDays: 14 });
    const role = new iam.CfnRole(this, 'ReadRole', { roleName: `${proofTarget.stack}-PreviewRead`, permissionsBoundary: previewBoundaryArn, assumeRolePolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'lambda.amazonaws.com' }, Action: 'sts:AssumeRole' }] }, policies: [{ policyName: 'OwnLogsOnly', policyDocument: previewIdentity }] });
    const asset = new assets.Asset(this, 'ReadAsset', { path: assetPath });
    this.assetKey = `${asset.assetHash}.zip`;
    const fn = new lambda.CfnFunction(this, 'ReadFunction', { functionName: `${proofTarget.stack}-PreviewRead`, runtime: 'nodejs22.x', handler: 'index.handler', architectures: ['arm64'], timeout: 5, memorySize: 128, role: role.attrArn, code: { s3Bucket: asset.s3BucketName, s3Key: asset.s3ObjectKey }, loggingConfig: { logGroup: log.ref, logFormat: 'JSON' }, environment: { variables: { DOMAIN_ENV: core.environment, DOMAIN_ACCOUNT: core.account, DOMAIN_REGION: core.region, EXPECTED_ISSUER: core.issuer, EXPECTED_POOL_ID: core.poolId, EXPECTED_CLIENT_ID: core.clientId } } });
    const http = new api.CfnApi(this, 'HttpApi', { name: proofTarget.stack, protocolType: 'HTTP', corsConfiguration: { allowOrigins: ['http://localhost:5174'], allowMethods: ['GET'], allowHeaders: ['authorization'] } });
    const auth = new api.CfnAuthorizer(this, 'JwtAuthorizer', { apiId: http.ref, name: 'ExistingNtgreIdentity', authorizerType: 'JWT', identitySource: ['$request.header.Authorization'], jwtConfiguration: { issuer: core.issuer, audience: [core.clientId] } });
    const integration = new api.CfnIntegration(this, 'ReadIntegration', { apiId: http.ref, integrationType: 'AWS_PROXY', integrationUri: fn.attrArn, payloadFormatVersion: '2.0', timeoutInMillis: 6000 });
    const route = new api.CfnRoute(this, 'PreviewRoute', { apiId: http.ref, routeKey: 'GET /v1/team-hub/preview', authorizationType: 'JWT', authorizerId: auth.ref, target: `integrations/${integration.ref}` });
    const permission = new lambda.CfnPermission(this, 'ApiInvoke', { action: 'lambda:InvokeFunction', functionName: fn.ref, principal: 'apigateway.amazonaws.com', sourceAccount: core.account, sourceArn: `arn:aws:execute-api:${core.region}:${core.account}:${http.ref}/*/GET/v1/team-hub/preview` });
    const stage = new api.CfnStage(this, 'Stage', { apiId: http.ref, stageName: '$default', autoDeploy: true, defaultRouteSettings: { throttlingBurstLimit: 20, throttlingRateLimit: 10 } });
    stage.addDependency(route); stage.addDependency(permission);
    for (const [name, namespace, metricName, dimension] of [['ReadErrors', 'AWS/Lambda', 'Errors', { name: 'FunctionName', value: fn.ref }], ['ApiErrors', 'AWS/ApiGateway', '5xx', { name: 'ApiId', value: http.ref }]] as const) new cloudwatch.CfnAlarm(this, name, { alarmName: `${proofTarget.stack}-ReadProof-${name}`, namespace, metricName, dimensions: [dimension], statistic: 'Sum', period: 60, evaluationPeriods: 1, threshold: 1, comparisonOperator: 'GreaterThanOrEqualToThreshold', treatMissingData: 'notBreaching' });
  }
}
export class ReadProofSecurityStack extends Stack {
  constructor(scope: Construct, core: Core, assetKey: string) {
    super(scope, `${proofTarget.stack}-ReadProofSecurity`, { env: { account: core.account, region: core.region }, description: 'Team Hub read-proof security proposal; bootstrap requires separate approval' });
    new iam.CfnManagedPolicy(this, 'PreviewBoundary', { managedPolicyName: `${proofTarget.stack}-PreviewBoundary`, policyDocument: previewBoundary });
    const execution = proofExecutionPolicy(assetKey);
    const boundary = new iam.CfnManagedPolicy(this, 'ExecutionBoundary', { managedPolicyName: `${proofTarget.stack}-ReadProofExecutionBoundary`, policyDocument: execution });
    new iam.CfnRole(this, 'ExecutionRole', { roleName: `${proofTarget.stack}-ReadProofExecution`, permissionsBoundary: boundary.ref, assumeRolePolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'cloudformation.amazonaws.com' }, Action: 'sts:AssumeRole' }] }, policies: [{ policyName: 'ReadProofLifecycle', policyDocument: execution }] });
    new iam.CfnManagedPolicy(this, 'PreparationCaller', { managedPolicyName: `${proofTarget.stack}-ReadProofPreparation`, policyDocument: proofCallerPolicy });
  }
}
