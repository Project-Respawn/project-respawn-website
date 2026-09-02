import { defineBackend } from '@aws-amplify/backend';
import { Aspects, CfnResource, IAspect, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnPermission, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { composeOverlaySourceStack } from './overlaySource/composition';
import { assertRuntimeLambdaMutationTarget } from './overlaySource/runtimeLambdaMutationTarget';

import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFunction } from './myFunction/resource';
import { adminUserManagement } from './functions/admin-user-management/resource';
import { postConfirmation } from './auth/post-confirmation/resource';
import { twitchRuntime } from './functions/twitch-runtime/resource';

// =============================================================================
// Core backend resources
// =============================================================================

const backend = defineBackend({
  auth,
  data,
  storage,
  myFunction,
  adminUserManagement,
  postConfirmation,
  twitchRuntime,
});

// Explicitly pin Identity Pool role attachments so branch environments
// cannot drift into an invalid role mapping state.
backend.auth.resources.cfnResources.cfnIdentityPoolRoleAttachment.roles = {
  authenticated: backend.auth.resources.authenticatedUserIamRole.roleArn,
  unauthenticated: backend.auth.resources.unauthenticatedUserIamRole.roleArn,
};

// =============================================================================
// IAM permissions
// =============================================================================

// Admin user management permissions
backend.adminUserManagement.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'cognito-idp:ListUsers',
      'cognito-idp:AdminListGroupsForUser',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminRemoveUserFromGroup',
    ],
    resources: ['*'],
  })
);

// Investor documents are never public. Only the authorising Lambda can read
// this prefix and issue five-minute signed URLs after checking InvestorAccess.
backend.storage.resources.bucket.grantRead(backend.myFunction.resources.lambda, 'investor-data-room/*');
(backend.myFunction.resources.lambda as LambdaFunction).addEnvironment('INVESTOR_DOCUMENT_BUCKET', backend.storage.resources.bucket.bucketName);

// Add more permissions for myFunction here later if needed.
// Example:
// backend.myFunction.resources.lambda.addToRolePolicy(
//   new PolicyStatement({
//     effect: Effect.ALLOW,
//     actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
//     resources: ['*'],
//   })
// );

// =============================================================================
// API stack
// =============================================================================

const apiStack = backend.createStack('api-stack');

// Additive Phase 1A resource. Token payloads are encrypted by this key before
// being stored in the backend-only TwitchTokenVault model.
const resolveTwitchKmsEnvironment = () => {
  if (process.env.AWS_BRANCH === 'master') return 'production';
  if (process.env.AWS_BRANCH) {
    const branch = process.env.AWS_BRANCH.replace(/[^A-Za-z0-9_-]/g, '-');
    if (!branch) throw new Error('Unable to derive a safe Twitch KMS environment name from AWS_BRANCH.');
    return branch === 'staging' ? 'staging' : branch;
  }

  // Amplify embeds the explicit `ampx sandbox --identifier` value in the
  // deterministic root stack name. Fail closed instead of falling back to the
  // operating-system username or another sandbox's generated state.
  const sandboxMatch = backend.stack.stackName.match(/-([A-Za-z0-9-]{1,15})-sandbox-[a-f0-9]{10}$/);
  if (!sandboxMatch) throw new Error(`Unable to resolve the explicit sandbox identifier from ${backend.stack.stackName}.`);
  return sandboxMatch[1];
};

const twitchKmsEnvironment = resolveTwitchKmsEnvironment();
const twitchTokenKey = new Key(Stack.of(backend.myFunction.resources.lambda), 'TwitchTokenEncryptionKey', {
  alias: `project-respawn-twitch-token-vault-${twitchKmsEnvironment}`,
  enableKeyRotation: true,
  removalPolicy: RemovalPolicy.RETAIN,
});
const twitchTokenCfnKey = twitchTokenKey.node.defaultChild as CfnResource;
// Amplify sandbox stacks install a destroy-policy aspect. This later, narrowly
// scoped aspect restores retention only for the token-vault encryption key.
class RetainTwitchTokenKeyAspect implements IAspect {
  visit(node: IConstruct): void {
    if (node === twitchTokenCfnKey) twitchTokenCfnKey.applyRemovalPolicy(RemovalPolicy.RETAIN);
  }
}
Aspects.of(Stack.of(twitchTokenKey)).add(new RetainTwitchTokenKeyAspect());
twitchTokenKey.grantEncryptDecrypt(backend.myFunction.resources.lambda);
twitchTokenKey.grantDecrypt(backend.twitchRuntime.resources.lambda);
(backend.myFunction.resources.lambda as LambdaFunction).addEnvironment('TWITCH_TOKEN_KMS_KEY_ID', twitchTokenKey.keyArn);
(backend.twitchRuntime.resources.lambda as LambdaFunction).addEnvironment('TWITCH_TOKEN_KMS_KEY_ID', twitchTokenKey.keyArn);

// Main shared Lambda integration
const httpLambdaIntegration = new HttpLambdaIntegration(
  'MyFunctionIntegration',
  backend.myFunction.resources.lambda
);
const twitchRuntimeIntegration = new HttpLambdaIntegration(
  'TwitchRuntimeIntegration',
  backend.twitchRuntime.resources.lambda
);

// Shared HTTP API
const httpApi = new HttpApi(apiStack, 'HttpApi', {
  apiName: 'projectRespawnApi',
  corsPreflight: {
    allowMethods: [
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
      CorsHttpMethod.PUT,
      CorsHttpMethod.DELETE,
      CorsHttpMethod.OPTIONS,
    ],
    allowOrigins: ['*'],
    allowHeaders: ['*'],
  },
  createDefaultStage: true,
});

// =============================================================================
// Printful routes
// =============================================================================

httpApi.addRoutes({
  path: '/printful/products',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/printful/products/{proxy+}',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/printful/orders',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/printful/orders/{proxy+}',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/twitch/oauth/callback',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/twitch/runtime/{proxy+}',
  methods: [HttpMethod.GET, HttpMethod.POST],
  integration: twitchRuntimeIntegration,
});
const retainedRuntimeSourceArn = Stack.of(httpApi).formatArn({
  service: 'execute-api',
  resource: httpApi.apiId,
  resourceName: '*/*/twitch/runtime/{proxy+}',
});
for (const [id, logicalId] of [
  ['RetainedGetRuntimePermission', 'HttpApiGETtwitchruntimeproxyMyFunctionIntegrationPermission2D5F0CC6'],
  ['RetainedPostRuntimePermission', 'HttpApiPOSTtwitchruntimeproxyMyFunctionIntegrationPermission05736304'],
] as const) {
  const permission = new CfnPermission(apiStack, id, {
    action: 'lambda:InvokeFunction',
    functionName: backend.myFunction.resources.lambda.functionArn,
    principal: 'apigateway.amazonaws.com',
    sourceArn: retainedRuntimeSourceArn,
  });
  permission.overrideLogicalId(logicalId);
}

const teamHubTables = backend.data.resources.tables;
const teamHubLambda = backend.myFunction.resources.lambda;
(teamHubLambda as LambdaFunction).addEnvironment('TEAM_HUB_TEAM_TABLE', teamHubTables.Team.tableName);
(teamHubLambda as LambdaFunction).addEnvironment('TEAM_HUB_MEMBERSHIP_TABLE', teamHubTables.TeamMembership.tableName);
(teamHubLambda as LambdaFunction).addEnvironment('TEAM_HUB_ROSTER_TABLE', teamHubTables.TeamRosterSlot.tableName);
(teamHubLambda as LambdaFunction).addEnvironment('TEAM_HUB_USER_POOL_ID', backend.auth.resources.userPool.userPoolId);
teamHubLambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['dynamodb:TransactWriteItems'],
  resources: [
    teamHubTables.Team.tableArn,
    teamHubTables.TeamMembership.tableArn,
    teamHubTables.TeamRosterSlot.tableArn,
  ],
}));

backend.data.resources.graphqlApi.grantQuery(backend.twitchRuntime.resources.lambda,
  'getTwitchIntegration', 'listTwitchCommands', 'getTwitchTokenVault', 'getTwitchRuntimeHealth',
  'getCreatorWorkspaceRecord', 'getBrand', 'listRewardRedemptionEvents', 'getRewardRedemptionEvent',
  'getRewardRedemptionEventClaim');
backend.data.resources.graphqlApi.grantMutation(backend.twitchRuntime.resources.lambda,
  'updateTwitchIntegration', 'updateTwitchTokenVault', 'createTwitchTokenVault',
  'updateTwitchRuntimeHealth', 'createTwitchRuntimeHealth', 'createRewardRedemptionEventClaim',
  'updateRewardRedemptionEvent');
const modelIntrospectionSchemaBucket = backend.data.stack.node.tryFindChild('modelIntrospectionSchemaBucket');
if (!(modelIntrospectionSchemaBucket instanceof Bucket)) {
  throw new Error('Amplify Data model introspection schema bucket was not found');
}
const twitchRuntimeLambda = backend.twitchRuntime.resources.lambda as LambdaFunction;
twitchRuntimeLambda.addEnvironment('AMPLIFY_DATA_DEFAULT_NAME', 'amplifyData');
twitchRuntimeLambda.addEnvironment('AMPLIFY_DATA_GRAPHQL_ENDPOINT', backend.data.resources.cfnResources.cfnGraphqlApi.attrGraphQlUrl);
twitchRuntimeLambda.addEnvironment('AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_BUCKET_NAME', modelIntrospectionSchemaBucket.bucketName);
twitchRuntimeLambda.addEnvironment('AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_KEY', 'modelIntrospectionSchema.json');
twitchRuntimeLambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['s3:GetObject'],
  resources: [`${modelIntrospectionSchemaBucket.bucketArn}/modelIntrospectionSchema.json`],
}));
teamHubLambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['cognito-idp:ListUsers'],
  resources: [backend.auth.resources.userPool.userPoolArn],
}));


httpApi.addRoutes({
  path: '/integrations/alpha/reward-events',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

// Generic provider-aware fulfillment routes.
httpApi.addRoutes({
  path: '/orders/fulfill',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/orders/recover-fulfillment',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/orders/import-existing-revolut',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

// =============================================================================
// Revolut routes
// =============================================================================

httpApi.addRoutes({
  path: '/revolut/checkout',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/revolut/orders/{proxy+}',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/webhooks/revolut',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

// =============================================================================
// Twitch Bot routes
// =============================================================================

httpApi.addRoutes({
  path: '/twitch/commands',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/twitch/commands/me',
  methods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE],
  integration: httpLambdaIntegration,
});

// Optional future Twitch routes
httpApi.addRoutes({
  path: '/twitch/status',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/twitch/connect',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

// =============================================================================
// API outputs
// =============================================================================

backend.addOutput({
  custom: {
    API: {
      projectRespawnApi: {
        endpoint: httpApi.url,
        region: Stack.of(httpApi).region,
        apiName: httpApi.httpApiName,
      },
    },
  },
});

// =============================================================================
// Dedicated Overlay Browser Source stack
// =============================================================================

const overlaySourceStack = backend.createStack('overlay-source-stack');
const userPool = backend.auth.resources.userPool;
const userPoolClient = backend.auth.resources.userPoolClient;
const runtimeHandler = backend.twitchRuntime.resources.lambda;
assertRuntimeLambdaMutationTarget(runtimeHandler);
composeOverlaySourceStack({ stack: overlaySourceStack, tables: backend.data.resources.tables, userPoolId: userPool.userPoolId, userPoolClientId: userPoolClient.userPoolClientId, frontendOrigin: process.env.AWS_BRANCH === 'master' ? 'https://www.projectrespawn.com' : 'http://localhost:5174', runtimeHandler, addOutput: (output) => backend.addOutput(output as any) });
