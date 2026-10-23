import { RemovalPolicy, Stack } from 'aws-cdk-lib'
import { CfnTable } from 'aws-cdk-lib/aws-dynamodb'
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda'
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'

/** Local review candidate, within existing roots. No schema/provider or identity moves. */
export function composeCommerce(input: { runtime: LambdaFunction; api: HttpApi; poolId: string; clientId: string }) {
  // Table lives beside the runtime: avoid introducing an API-stack/runtime-stack cycle.
  const stack = Stack.of(input.runtime)
  const table = new CfnTable(stack, 'CommerceOrderLedgerV2', {
    billingMode: 'PAY_PER_REQUEST', attributeDefinitions: [{ attributeName: 'pk', attributeType: 'S' }],
    keySchema: [{ attributeName: 'pk', keyType: 'HASH' }], deletionProtectionEnabled: true,
    pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
  })
  table.applyRemovalPolicy(RemovalPolicy.RETAIN)
  const policy = new Policy(stack, 'CommerceLedgerRuntimePolicy', { statements: [new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:PutItem'], resources: [table.attrArn],
  })] })
  if (!input.runtime.role) throw new Error('Commerce runtime must have an existing role')
  policy.attachToRole(input.runtime.role)
  input.runtime.addEnvironment('COMMERCE_LEDGER_TABLE', table.ref)
  input.runtime.addEnvironment('COMMERCE_USER_POOL_ID', input.poolId)
  input.runtime.addEnvironment('COMMERCE_CLIENT_ID', input.clientId)
  const integration = new HttpLambdaIntegration('CommerceV2Integration', input.runtime)
  input.api.addRoutes({ path: '/commerce/quotes', methods: [HttpMethod.POST], integration })
  input.api.addRoutes({ path: '/commerce/orders/{orderId}', methods: [HttpMethod.GET], integration })
  input.api.addRoutes({ path: '/commerce/orders/{orderId}/{operation}', methods: [HttpMethod.POST], integration })
  return table
}
