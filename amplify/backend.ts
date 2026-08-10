import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFunction } from './myFunction/resource';
import { adminUserManagement } from './functions/admin-user-management/resource';
import { applyHostedStagingAuthRetention } from './auth/retention';
import { postConfirmation } from './auth/post-confirmation/resource';

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

// Main shared Lambda integration
const httpLambdaIntegration = new HttpLambdaIntegration(
  'MyFunctionIntegration',
  backend.myFunction.resources.lambda
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

// Phase 1 of the hosted staging auth recovery. Keep this after all backend
// customization so lazily-created auth IAM policies are present before the
// retention pass. This does not change auth ownership or references. Master
// and local sandboxes do not enter this branch.
if (process.env.AWS_BRANCH === 'staging') {
  // Phase 1 of the hosted staging auth recovery must change only resource
  // retention attributes. Keep the two currently deployed auth Lambda assets
  // pinned so synthesizing this preparatory change cannot update their code.
  // Remove these overrides as part of the explicitly approved Phase 2 migration.
  backend.adminUserManagement.resources.cfnResources.cfnFunction.addOverride(
    'Properties.Code.S3Key',
    '3bf13eac681b811f84150a8b61b490f8b8b5ec920f64293ce3f312d6ddbe0a12.zip',
  );
  backend.postConfirmation.resources.cfnResources.cfnFunction.addOverride(
    'Properties.Code.S3Key',
    '2bf4a91142c500bc843ff1bd7e63aea096a72a6e6d32dec4546678f4a8a9b395.zip',
  );

  const backendNamespace = backend.stack.node.tryGetContext('amplify-backend-namespace');
  const stackNamePrefix = `amplify-${backendNamespace}-`;

  if (typeof backendNamespace !== 'string' || !backend.stack.stackName.startsWith(stackNamePrefix)) {
    throw new Error('Unable to resolve the staging auth SSM namespace for retention preparation.');
  }

  const backendName = backend.stack.stackName.slice(stackNamePrefix.length);
  const authUserPoolIdParameterName =
    `/amplify/resource_reference/${backendNamespace}/${backendName}/AMPLIFY_AUTH_USERPOOL_ID`;

  // Amplify also grants this access through its generated function environment
  // binding. Declaring the same grant here materializes the IAM policy before
  // the retention pass; CDK de-duplicates the identical statement.
  backend.postConfirmation.resources.lambda.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ssm:GetParameters'],
      resources: [backend.stack.formatArn({
        service: 'ssm',
        resource: `parameter${authUserPoolIdParameterName}`,
      })],
    }),
  );
}

applyHostedStagingAuthRetention(backend.auth.stack);
