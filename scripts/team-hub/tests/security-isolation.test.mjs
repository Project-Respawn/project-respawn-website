import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { isolationPlugin } from '../build-isolation.mjs';
import { runtimePolicy, deploymentPolicy, callerPolicy, operationalArn, journalArn, target } from '../../../infrastructure/domains/team-hub/security.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const list = value => Array.isArray(value) ? value : [value];
const matches = (pattern, value) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*').replaceAll('?', '.')}$`, 'i').test(value);
function evaluate(policy, action, resource, context = {}) {
  let allow = false;
  for (const s of policy.Statement) {
    if (!list(s.Action).some(p => matches(p, action))) continue;
    if (s.Resource && !list(s.Resource).some(p => matches(p, resource))) continue;
    if (s.NotResource && list(s.NotResource).some(p => matches(p, resource))) continue;
    let condition = true;
    for (const [operator, pairs] of Object.entries(s.Condition ?? {})) for (const [key, expected] of Object.entries(pairs)) {
      const values = context[key] === undefined ? [] : list(context[key]);
      if (operator === 'ForAnyValue:StringEquals') condition &&= values.some(v => list(expected).includes(v));
      else if (operator === 'ForAllValues:StringNotEquals') condition &&= values.every(v => !list(expected).includes(v));
      else if (operator === 'StringEquals') condition &&= values.some(v => list(expected).includes(v));
      else throw new Error(`Unsupported policy condition ${operator}`);
    }
    if (!condition) continue;
    if (s.Effect === 'Deny') return 'explicitDeny';
    allow = true;
  }
  return allow ? 'allowed' : 'implicitDeny';
}
for (const kind of ['read', 'command']) {
  const policy = runtimePolicy(kind);
  test(`${kind} own reads/logs positive; strict transaction privilege separation`, () => {
    assert.equal(evaluate(policy, 'dynamodb:GetItem', operationalArn), 'allowed');
    assert.equal(evaluate(policy, 'dynamodb:Query', `${operationalArn}/index/BySubject`), 'allowed');
    assert.equal(evaluate(policy, 'logs:PutLogEvents', `arn:aws:logs:${target.region}:${target.account}:log-group:/project-respawn/Ntgre/team-hub/${kind}:log-stream:example`), 'allowed');
    assert.notEqual(evaluate(policy, 'dynamodb:PutItem', operationalArn), 'allowed');
    assert.equal(evaluate(policy, 'dynamodb:PutItem', operationalArn, { 'dynamodb:EnclosingOperation': ['TransactWriteItems'] }), kind === 'command' ? 'allowed' : 'explicitDeny');
    assert.notEqual(evaluate(policy, 'dynamodb:DeleteItem', journalArn, { 'dynamodb:EnclosingOperation': ['TransactWriteItems'] }), 'allowed');
    assert.equal(evaluate(policy, 'dynamodb:Scan', operationalArn), 'explicitDeny');
  });
  for (const [action, resource] of [
    ['dynamodb:GetItem', 'arn:aws:dynamodb:eu-north-1:058264289478:table/Legacy-Team'],
    ['dynamodb:PutItem', 'arn:aws:dynamodb:eu-north-1:058264289478:table/Commerce'],
    ['s3:GetObject', 'arn:aws:s3:::creator-bucket/private'], ['s3:PutObject', 'arn:aws:s3:::foreign-bucket/object'],
    ['cognito-idp:ListUsers', '*'], ['cognito-idp:AdminGetUser', '*'], ['cognito-idp:AdminUpdateUserAttributes', '*'],
    ['iam:PassRole', '*'], ['cloudformation:UpdateStack', '*'], ['kms:Decrypt', 'arn:aws:kms:eu-north-1:058264289478:key/business-key'],
    ['lambda:InvokeFunction', 'arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Tournaments-Ntgre'], ['secretsmanager:GetSecretValue', '*'], ['appsync:GraphQL', '*'], ['sts:AssumeRole', '*'],
  ]) test(`${kind} cross-domain deny ${action} ${resource}`, () => assert.equal(evaluate(policy, action, resource, { 'dynamodb:EnclosingOperation': ['TransactWriteItems'] }), 'explicitDeny'));
}
test('deployment permissions are separate from runtime; caller has no execute or foreign stack authority', () => {
  assert.equal(evaluate(deploymentPolicy, 'apigateway:POST', 'arn:aws:apigateway:eu-north-1::/apis'), 'allowed');
  assert.notEqual(evaluate(runtimePolicy('command'), 'apigateway:POST', 'arn:aws:apigateway:eu-north-1::/apis'), 'allowed');
  const own = `arn:aws:cloudformation:${target.region}:${target.account}:stack/${target.stack}/uuid`;
  assert.equal(evaluate(callerPolicy, 'cloudformation:CreateChangeSet', own), 'allowed');
  assert.equal(evaluate(callerPolicy, 'cloudformation:ExecuteChangeSet', own), 'implicitDeny');
  for (const stack of ['LegacyPlatform', 'ProjectRespawn-Tournaments-Ntgre', 'Production']) assert.equal(evaluate(callerPolicy, 'cloudformation:CreateChangeSet', own.replace(target.stack, stack)), 'explicitDeny');
});
test('synth receipt counts every root/resource including security and closes over only Team source + isolated libraries', () => {
  const { receipt } = read('infrastructure/domains/team-hub/.build/latest.json'); const evidence = read(receipt);
  assert.equal(evidence.total, 46); assert.ok(evidence.total <= 75); assert.equal(evidence.templates.length, 2);
  assert.equal(evidence.templates.find(t => t.name === target.stack).count, 43);
  assert.equal(evidence.templates.find(t => t.name.endsWith('-Security')).count, 3);
  assert.equal(evidence.counts['AWS::DynamoDB::Table'], 2); assert.equal(evidence.counts['AWS::ApiGatewayV2::Route'], 18); assert.equal(evidence.counts['AWS::Lambda::Function'], 2); assert.equal(evidence.counts['AWS::S3::Bucket'] ?? 0, 0);
  for (const unit of evidence.closure) for (const input of unit.inputs) {
    assert.match(input, /^(domains\/team-hub|infrastructure\/domains\/team-hub|src\/features\/team-hub)\//);
    assert.doesNotMatch(input, /amplify|myFunction|tournaments|creator-tools|commerce/);
  }
  for (const dependency of evidence.loadedLibraries) assert.ok(dependency.path.startsWith('infrastructure/domains/team-hub/node_modules/'));
  assert.equal(evidence.networkGuard, true); assert.equal(evidence.awsCalls, 0);
  assert.ok(evidence.closure.find(c => c.name === 'routes').outputs.length >= 7, 'major pages emitted as lazy chunks');
  for (const input of evidence.inputs) assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, input.path))).digest('hex'), input.sha256, `stale synthesis input ${input.path}`);
  const product = read(evidence.templates.find(t => t.name === target.stack).path);
  assert.equal(product.Metadata.Status, 'OFFLINE_SKELETON'); assert.equal(product.Outputs, undefined);
  for (const [id, resource] of Object.entries(product.Resources)) {
    if (resource.Type === 'AWS::DynamoDB::Table') { assert.equal(resource.DeletionPolicy, 'Retain'); assert.equal(resource.UpdateReplacePolicy, 'Retain'); assert.equal(resource.Properties.DeletionProtectionEnabled, true); }
    if (resource.Type === 'AWS::ApiGatewayV2::Route') assert.equal(resource.Properties.AuthorizationType, 'JWT');
    if (resource.Type === 'AWS::IAM::Role') {
      assert.ok(resource.Properties.PermissionsBoundary.Ref.endsWith('Boundary'));
      assert.deepEqual(resource.Properties.Policies[0].PolicyDocument, runtimePolicy(id.startsWith('read') ? 'read' : 'command'));
    }
  }
});
test('actual bundler rejects foreign source, SDK, infrastructure in runtime and Node in browser', async () => {
  const require = createRequire(path.join(root, 'infrastructure/domains/team-hub/package.json')); const { build } = require('esbuild');
  for (const [unit, source] of [['read', 'import "../../amplify/backend.ts"'], ['read', 'import "@aws-sdk/client-dynamodb"'], ['read', 'import "aws-cdk-lib"'], ['client', 'import "node:crypto"'], ['read', 'import "../tournaments/handler.ts"']]) await assert.rejects(build({ stdin: { contents: source, resolveDir: path.join(root, 'domains/team-hub') }, bundle: true, write: false, logLevel: 'silent', plugins: [isolationPlugin(root, unit)] }));
});
test('offline runner rejects deployment/wrong environment before building; network guard refuses sockets', () => {
  for (const args of [['--env', 'production', '--offline'], ['--env', 'Ntgre', '--deploy']]) {
    const result = spawnSync(process.execPath, ['scripts/team-hub/plan.mjs', ...args], { cwd: root, encoding: 'utf8' }); assert.notEqual(result.status, 0); assert.match(result.stderr, /Only --env Ntgre --offline/);
  }
  const trace = path.join(root, 'infrastructure/domains/team-hub/.build/negative-network-trace.json');
  const result = spawnSync(process.execPath, ['--require', './scripts/team-hub/offline-guard.cjs', '-e', 'require("node:net").connect(443,"example.invalid")'], { cwd: root, env: { ...process.env, TEAM_HUB_TRACE: trace }, encoding: 'utf8' });
  assert.notEqual(result.status, 0); assert.match(result.stderr, /Network\/subprocess prohibited/);
});
test('protected Legacy business/live-client hashes unchanged; authorized hosted selector is guarded', () => {
  const inventory = read('docs/architecture/team-hub-extraction-evidence-2026-10-04/current-source-inventory.json');
  for (const { path: p, sha256 } of inventory.sourceHashes) {
    if (p === 'amplify.yml') {
      const current = fs.readFileSync(path.join(root, p), 'utf8').replaceAll('\r\n', '\n');
      const original = spawnSync('git', ['show', 'HEAD:amplify.yml'], { cwd: root, encoding: 'utf8' });
      assert.equal(original.status, 0);
      assert.equal(current.split('frontend:')[1], original.stdout.replaceAll('\r\n', '\n').split('frontend:')[1]);
      assert.match(current.split('frontend:')[0], /node scripts\/deployment\/hosted.mjs check/);
      assert.doesNotMatch(current.split('frontend:')[0], /ampx pipeline-deploy/);
      continue;
    }
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex'), sha256, p);
  }
  const manifest = read('config/domains/team-hub/domain-endpoints.Ntgre.json');
  assert.equal(manifest.stackName, 'ProjectRespawn-TeamHub-Ntgre');
  assert.equal(manifest.apiId, 't54b88casf');
  assert.equal(manifest.status, 'DEPLOYED');
  assert.equal(manifest.provenance.frontendCutover, false);
});
