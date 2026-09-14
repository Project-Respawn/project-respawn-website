import assert from 'node:assert/strict';
import test from 'node:test';
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { PRODUCTION_RUNTIME, TwitchRuntimeProductionStack } from './twitch-runtime-production-stack.js';

function synthesized() {
  const app = new App();
  const stack = new TwitchRuntimeProductionStack(app, PRODUCTION_RUNTIME.stack, { env: { account: PRODUCTION_RUNTIME.account, region: PRODUCTION_RUNTIME.region } });
  return Template.fromStack(stack);
}

test('production runtime is one stop-before-start Fargate task on an immutable digest', () => {
  const template = synthesized();
  template.hasParameter('ImageUri', { AllowedPattern: Match.stringLikeRegexp('sha256') });
  template.hasResourceProperties('AWS::ECS::TaskDefinition', { Cpu: '256', Memory: '512', RequiresCompatibilities: ['FARGATE'], RuntimePlatform: { CpuArchitecture: 'X86_64', OperatingSystemFamily: 'LINUX' } });
  template.hasResourceProperties('AWS::ECS::Service', { DesiredCount: 1, DeploymentConfiguration: { MinimumHealthyPercent: 0, MaximumPercent: 100, DeploymentCircuitBreaker: { Enable: true, Rollback: true } } });
  const json = JSON.stringify(template.toJSON().Resources);
  assert.doesNotMatch(json, /Ntgrestage8|staging|alpha|localhost/i);
  const task = Object.values(template.findResources('AWS::ECS::TaskDefinition'))[0];
  assert.deepEqual(task.Properties.ContainerDefinitions[0].Image, { Ref: 'ImageUri' });
  assert.match(json, /healthz/);
  assert.doesNotMatch(json, /AWS::ElasticLoadBalancing|LoadBalancer/);
});

test('production task uses only MASTER configuration and starts canonical delivery disabled', () => {
  const template = synthesized();
  const tasks = template.findResources('AWS::ECS::TaskDefinition');
  const container = Object.values(tasks)[0].Properties.ContainerDefinitions[0];
  const env = Object.fromEntries(container.Environment.map((entry: { Name: string; Value: unknown }) => [entry.Name, entry.Value]));
  assert.equal(env.RESPAWN_RUNTIME_API_BASE, PRODUCTION_RUNTIME.apiBase);
  assert.equal(env.RESPAWN_CANONICAL_ALERT_DELIVERY_ENABLED, 'false');
  assert.equal(env.RESPAWN_SECURE_RUNTIME_ENABLED, 'true');
  assert.ok(env.RESPAWN_TWITCH_INTEGRATION_ID.Ref);
  assert.deepEqual(container.PortMappings, []);
});

test('application role is empty and execution role reads exactly the production secret', () => {
  const template = synthesized();
  const roles = template.findResources('AWS::IAM::Role');
  const taskRole = Object.values(roles).find((role: any) => role.Properties.RoleName === `${PRODUCTION_RUNTIME.cluster}-task`) as any;
  const executionRole = Object.values(roles).find((role: any) => role.Properties.RoleName === `${PRODUCTION_RUNTIME.cluster}-execution`) as any;
  assert.equal(taskRole.Properties.Policies, undefined);
  assert.equal(taskRole.Properties.ManagedPolicyArns, undefined);
  const statements = executionRole.Properties.Policies[0].PolicyDocument.Statement;
  assert.deepEqual(statements.map((s: any) => s.Action), ['secretsmanager:GetSecretValue']);
  assert.deepEqual(statements[0].Resource, { Ref: 'RuntimeSecretArn' });
  const serializedTaskRole = JSON.stringify(taskRole);
  assert.doesNotMatch(serializedTaskRole, /dynamodb|execute-api|appsync|secretsmanager/i);
});

test('runtime secret, outbound-only networking, production logs and monitoring are explicit', () => {
  const template = synthesized();
  template.hasParameter('RuntimeSecretArn', { AllowedPattern: Match.stringLikeRegexp('projectrespawn/production/twitchruntime') });
  template.hasResourceProperties('AWS::EC2::SecurityGroup', { SecurityGroupIngress: [], SecurityGroupEgress: [{ IpProtocol: '-1', CidrIp: '0.0.0.0/0' }] });
  template.hasResourceProperties('AWS::Logs::LogGroup', { LogGroupName: PRODUCTION_RUNTIME.logGroup, RetentionInDays: 30 });
  assert.equal(Object.keys(template.findResources('AWS::CloudWatch::Alarm')).length, 3);
  assert.equal(Object.keys(template.findResources('AWS::Events::Rule')).length, 2);
});
