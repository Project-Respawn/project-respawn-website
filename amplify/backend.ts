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

// =============================================================================
//  Core backend resources
// =============================================================================

const backend = defineBackend({
  auth,
  data,
  storage,
  myFunction,
  adminUserManagement,
});

// =============================================================================
//  IAM permissions
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
//  API stack
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
//  Printful routes
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

// =============================================================================
//  Revolut routes
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
//  Twitch Bot routes
// =============================================================================

// Bot/runtime lookup by broadcasterId
httpApi.addRoutes({
  path: '/twitch/commands',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

// Dashboard self-service routes for the signed-in Cognito user
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
//  API outputs
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