import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFunction } from './myFunction/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  myFunction,
});

const apiStack = backend.createStack('api-stack');

const httpLambdaIntegration = new HttpLambdaIntegration(
  'MyFunctionIntegration',
  backend.myFunction.resources.lambda
);

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

httpApi.addRoutes({
  path: '/printful/products',
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
  path: '/revolut/checkout',
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
});

httpApi.addRoutes({
  path: '/revolut/orders/{proxy+}',
  methods: [HttpMethod.GET],
  integration: httpLambdaIntegration,
});

backend.addOutput({
  custom: {
    API: {
      projectRespawnApi: {
        endpoint: httpApi.url,
        region: Stack.of(httpApi).region,
        apiName: 'projectRespawnApi',
      },
    },
  },
});
