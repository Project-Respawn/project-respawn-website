import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { previewBoundary, previewIdentity, previewLogArn, proofExecutionPolicy, proofCallerPolicy } from '../../../infrastructure/domains/team-hub/read-proof-security.mjs';
const list = v => Array.isArray(v) ? v : [v];
const match = (p, v) => new RegExp(`^${p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*').replaceAll('?', '.')}$`, 'i').test(v);
function evaluate(policy, action, resource, context = {}) {
  let allowed = false;
  for (const statement of policy.Statement) {
    if (statement.Action && !list(statement.Action).some(p => match(p, action))) continue;
    if (statement.NotAction && list(statement.NotAction).some(p => match(p, action))) continue;
    if (statement.Resource && !list(statement.Resource).some(p => match(p, resource))) continue;
    if (statement.NotResource && list(statement.NotResource).some(p => match(p, resource))) continue;
    let condition = true;
    for (const [operator, pairs] of Object.entries(statement.Condition ?? {})) for (const [key, expected] of Object.entries(pairs)) {
      const values = context[key] === undefined ? [] : list(context[key]);
      if (['ForAnyValue:StringEquals', 'StringEquals', 'ArnEquals'].includes(operator)) condition &&= values.some(v => list(expected).includes(v));
      else if (['ForAllValues:StringNotEquals', 'StringNotEquals'].includes(operator)) condition &&= values.every(v => !list(expected).includes(v));
      else throw new Error(`Unsupported condition ${operator}`);
    }
    if (!condition) continue;
    if (statement.Effect === 'Deny') return 'explicitDeny';
    allowed = true;
  }
  return allowed ? 'allowed' : 'implicitDeny';
}
for (const action of ['dynamodb:GetItem', 'dynamodb:PutItem', 's3:GetObject', 's3:PutObject', 'cognito-idp:ListUsers', 'cognito-idp:AdminGetUser', 'appsync:GraphQL', 'lambda:InvokeFunction', 'execute-api:Invoke', 'iam:PassRole', 'cloudformation:CreateStack', 'secretsmanager:GetSecretValue', 'sts:AssumeRole', 'kms:GenerateDataKey']) test(`preview boundary explicitly denies ${action}`, () => {
  assert.equal(evaluate(previewBoundary, action, '*'), 'explicitDeny');
  assert.equal(evaluate(previewIdentity, action, '*'), 'implicitDeny');
});
test('only own log stream allowed in identity and boundary', () => {
  for (const p of [previewIdentity, previewBoundary]) assert.equal(evaluate(p, 'logs:PutLogEvents', previewLogArn.replace('*', 'log-stream:fixture')), 'allowed');
  assert.equal(evaluate(previewBoundary, 'logs:PutLogEvents', previewLogArn.replace('team-hub', 'tournaments')), 'explicitDeny');
});
test('AWS-managed Lambda key has no blanket deny; business/unknown/foreign keys remain denied', () => {
  const key = 'arn:aws:kms:eu-north-1:058264289478:key/synthetic-key-id';
  assert.equal(evaluate(previewBoundary, 'kms:Decrypt', key, { 'kms:ResourceAliases': ['alias/aws/lambda'] }), 'allowed');
  assert.equal(evaluate(previewIdentity, 'kms:Decrypt', key), 'implicitDeny', 'identity has no broad decrypt grant');
  for (const aliases of [undefined, [], ['alias/business'], ['alias/aws/s3']]) assert.equal(evaluate(previewBoundary, 'kms:Decrypt', key, { 'kms:ResourceAliases': aliases }), 'explicitDeny');
  assert.equal(evaluate(previewBoundary, 'kms:Decrypt', key.replace('058264289478', '111111111111'), { 'kms:ResourceAliases': ['alias/aws/lambda'] }), 'explicitDeny');
  assert.doesNotMatch(JSON.stringify(previewBoundary), /13ae83f9|tournaments/i);
});
test('deployment policy uses practical regional API service access, exact assets and no business data', () => {
  const p = proofExecutionPolicy(`${'a'.repeat(64)}.zip`); const context = { 'aws:RequestedRegion': 'eu-north-1' };
  assert.equal(evaluate(p, 'apigateway:POST', '*', context), 'allowed');
  assert.equal(evaluate(p, 'apigateway:POST', '*', { 'aws:RequestedRegion': 'eu-west-1' }), 'explicitDeny');
  assert.equal(evaluate(p, 'apigateway:DELETE', 'arn:aws:apigateway:eu-north-1::/apis/msipnwy39j/routes/fixture', context), 'explicitDeny');
  for (const action of ['dynamodb:GetItem', 'cognito-idp:CreateUserPool', 'appsync:GraphQL', 'cloudformation:UpdateStack']) assert.equal(evaluate(p, action, '*', context), 'explicitDeny');
  assert.equal(evaluate(p, 's3:GetObject', 'arn:aws:s3:::business/private', context), 'explicitDeny');
  assert.equal(evaluate(p, 's3:GetObject', `arn:aws:s3:::cdk-hnb659fds-assets-058264289478-eu-north-1/${'a'.repeat(64)}.zip`, context), 'allowed');
  assert.equal(evaluate(p, 'iam:PassRole', 'arn:aws:iam::058264289478:role/Tournament'), 'explicitDeny');
});
test('caller cannot select foreign stack or execute reviewed change set yet', () => {
  const own = 'arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-TeamHub-Ntgre/fixture';
  assert.equal(evaluate(proofCallerPolicy, 'cloudformation:CreateChangeSet', own), 'allowed');
  assert.equal(evaluate(proofCallerPolicy, 'cloudformation:ExecuteChangeSet', own), 'implicitDeny');
  for (const name of ['ProjectRespawn-Tournaments-Ntgre', 'LegacyPlatform', 'production']) assert.equal(evaluate(proofCallerPolicy, 'cloudformation:CreateChangeSet', own.replace('ProjectRespawn-TeamHub-Ntgre', name)), 'explicitDeny');
});
test('READ_PROOF has exactly 11+4 resources; full design stays 43+3; actual closure excludes business runtimes', () => {
  const receipt = name => JSON.parse(fs.readFileSync(JSON.parse(fs.readFileSync(`infrastructure/domains/team-hub/.build/${name}`, 'utf8')).receipt, 'utf8'));
  const proof = receipt('latest-read-proof.json'); const full = receipt('latest.json');
  assert.equal(proof.mode, 'READ_PROOF'); assert.equal(full.mode, 'FULL_TARGET'); assert.equal(proof.total, 15); assert.equal(full.total, 46);
  assert.deepEqual(proof.templates.map(t => t.count).sort((a, b) => a - b), [4, 11]);
  assert.equal(proof.counts['AWS::DynamoDB::Table'] ?? 0, 0); assert.equal(proof.counts['AWS::S3::Bucket'] ?? 0, 0);
  assert.equal(proof.counts['AWS::Lambda::Function'], 1); assert.equal(proof.counts['AWS::ApiGatewayV2::Route'], 1);
  const inputs = proof.closure.flatMap(c => c.inputs);
  assert.doesNotMatch(inputs.join('\n'), /amplify\/|tournaments\/|creator|commerce|community|service\.mjs|repository\.mjs|storage-plan|command-entry|stack\.ts\n/);
  assert.deepEqual(proof.closure.find(c => c.name === 'read').inputs.sort(), ['domains/team-hub/auth.mjs', 'domains/team-hub/contracts.mjs', 'domains/team-hub/preview.mjs']);
  const amendment=JSON.parse(fs.readFileSync('docs/architecture/team-hub-ef-evidence-2026-10-08/frontend-amendment.json'));
  const expectedInputHash=input=>{const change=amendment.files.find(f=>f.path===input.path);if(!change)return input.sha256;assert.equal(input.sha256,change.previousSha256);assert.equal(amendment.liveActivation,false);return change.sha256;};
  for (const input of proof.inputs) assert.equal(createHash('sha256').update(fs.readFileSync(input.path)).digest('hex'), expectedInputHash(input), input.path);
  const template = JSON.parse(fs.readFileSync(proof.templates.find(t => t.count === 11).path, 'utf8'));
  const resources = Object.values(template.Resources);
  const auth = resources.find(r => r.Type === 'AWS::ApiGatewayV2::Authorizer').Properties;
  const core = JSON.parse(fs.readFileSync('config/environments/Ntgre.core.json', 'utf8'));
  assert.equal(auth.JwtConfiguration.Issuer, core.issuer); assert.deepEqual(auth.JwtConfiguration.Audience, [core.clientId]);
  const route = resources.find(r => r.Type === 'AWS::ApiGatewayV2::Route').Properties;
  assert.equal(route.RouteKey, 'GET /v1/team-hub/preview'); assert.equal(route.AuthorizationType, 'JWT');
  const lambda = resources.find(r => r.Type === 'AWS::Lambda::Function').Properties;
  assert.equal(lambda.KmsKeyArn, undefined); assert.equal(lambda.Environment.Variables.DOMAIN_ENV, 'Ntgre');
  assert.equal(resources.find(r => r.Type === 'AWS::IAM::Role').Properties.PermissionsBoundary, 'arn:aws:iam::058264289478:policy/ProjectRespawn-TeamHub-Ntgre-PreviewBoundary');
  assert.equal(proof.networkGuard, true); assert.equal(proof.awsCalls, 0);
});
test('actual read-proof app rejects changed or missing Core config before constructing any stack', () => {
  const latest = JSON.parse(fs.readFileSync('infrastructure/domains/team-hub/.build/latest-read-proof.json', 'utf8'));
  const build = path.dirname(latest.receipt);
  const invalid = path.join(build, 'invalid-core-test.json');
  fs.writeFileSync(invalid, JSON.stringify({ environment: 'Ntgre', account: '111111111111' }));
  for (const core of [invalid, path.join(build, 'missing-config.json')]) {
    const result = spawnSync(process.execPath, ['--require', './scripts/team-hub/offline-guard.cjs', path.join(build, 'app/app.cjs')], { encoding: 'utf8', env: { ...process.env, TEAM_HUB_OFFLINE: '1', TEAM_HUB_MODE: 'READ_PROOF', TEAM_HUB_CORE: core, TEAM_HUB_TRACE: path.join(build, 'invalid-config-trace.json') } });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Shared identity pin changed|ENOENT/);
  }
});
