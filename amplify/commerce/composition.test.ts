import assert from 'node:assert/strict'
import test from 'node:test'
import { App, Stack } from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda'
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2'
import { composeCommerce } from './composition'

test('offline composition resource delta, retained ledger, exact runtime permissions and no identity resources', () => {
  // Explicit tokens and inline fixture code: no lookups, assets or credential resolution.
  function build(enabled: boolean) {
    const app = new App({ context: { '@aws-cdk/core:checkSecretUsage': true } })
    const stack = new Stack(app, 'ExistingRuntimeAndApi')
    const runtime = new Function(stack, 'ExistingRuntime', { runtime: Runtime.NODEJS_22_X, handler: 'index.handler', code: Code.fromInline('exports.handler=async()=>({statusCode:200})') })
    const api = new HttpApi(stack, 'ExistingApi')
    if (enabled) composeCommerce({ runtime, api, poolId: 'eu-north-1_fixture', clientId: 'fixture-client' })
    return Template.fromStack(stack).toJSON()
  }
  const before = build(false).Resources, after = build(true).Resources
  const additions = Object.entries(after).filter(([id]) => !before[id]) as [string, any][]
  const types: Record<string, number> = {}
  for (const [, resource] of additions) types[resource.Type] = (types[resource.Type] || 0) + 1
  console.log('Commerce isolated composition resource delta:', JSON.stringify(types))
  assert.deepEqual(types, { 'AWS::DynamoDB::Table': 1, 'AWS::IAM::Policy': 1, 'AWS::ApiGatewayV2::Integration': 1,
    'AWS::Lambda::Permission': 3, 'AWS::ApiGatewayV2::Route': 3 })
  const table = additions.find(([, r]) => r.Type === 'AWS::DynamoDB::Table')![1]
  assert.equal(table.DeletionPolicy, 'Retain'); assert.equal(table.UpdateReplacePolicy, 'Retain')
  assert.equal(table.Properties.DeletionProtectionEnabled, true)
  assert.equal(table.Properties.PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled, true)
  const policy = additions.find(([, r]) => r.Type === 'AWS::IAM::Policy')![1].Properties.PolicyDocument.Statement[0]
  assert.deepEqual(policy.Action, ['dynamodb:GetItem', 'dynamodb:PutItem'])
  assert.notEqual(policy.Resource, '*')
  assert.ok(!additions.some(([, r]) => /Cognito|AppSync|KMS|CloudFormation::Stack/.test(r.Type)))
})
