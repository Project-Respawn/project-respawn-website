import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync, spawnSync} from 'node:child_process';
import {root, domainDir, buildDir, read, corePath, validateCore, target, checkClosure, isolatedRequire, isolationPlugin, verifyReceipt, stackName} from '../lib.mjs';
import {select} from '../select.mjs';
import {plannedManifest} from '../compose-config.mjs';
const require = createRequire(import.meta.url), isolated = isolatedRequire();
const core = read(corePath), receipt = verifyReceipt();
const template = read(path.join(buildDir, 'assembly', `${stackName}.template.json`));
const resources = Object.values(template.Resources), byType = type => resources.filter(r => r.Type === type);
const {handler} = require(path.join(buildDir, 'runtime/index.js'));
const revision = receipt.revision;
Object.assign(process.env, {EXPECTED_ISSUER: core.issuer, EXPECTED_CLIENT_ID: core.clientId, DOMAIN_ENV: 'Ntgre', EXPECTED_API_ID: 'fixtureapi', BUILD_REVISION: revision});
const event = () => ({version: '2.0', rawPath: '/v1/tournaments/preview', requestContext: {apiId: 'fixtureapi', http: {method: 'GET'}, authorizer: {jwt: {claims: {iss: core.issuer, client_id: core.clientId, token_use: 'access', sub: '11111111-2222-4333-8444-555555555555', exp: Math.floor(Date.now() / 1000) + 300}}}}});
test('1/2 preview contract is schema valid and explicitly non-production', async () => {
  const response = await handler(event()); assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body), Ajv = isolated('ajv'), ajv = new Ajv();
  assert.equal(ajv.validate(read(path.join(root, 'contracts/tournament-preview-v1.schema.json')), body), true, ajv.errorsText());
  assert.equal(body.preview, true); assert.equal(body.nonProduction, true); assert.equal(body.registrationEnabled, false);
  assert.equal(body.revision, revision); assert.equal(response.headers['cache-control'], 'no-store');
  assert.ok(!response.body.includes(event().requestContext.authorizer.jwt.claims.sub));
});
test('3 only the intended HTTP method/path exists', async () => {
  assert.deepEqual(byType('AWS::ApiGatewayV2::Route').map(r => r.Properties.RouteKey), ['GET /v1/tournaments/preview']);
  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {const e = event(); e.requestContext.http.method = method; assert.equal((await handler(e)).statusCode, 405);}
  for (const route of ['/v1/tournaments', '/v1/tournaments/preview/', '/v1/tournaments/register']) assert.equal((await handler({...event(), rawPath: route})).statusCode, 404);
});
test('4 JWT authorizer consumes the existing Ntgre issuer/client', () => {
  const jwt = byType('AWS::ApiGatewayV2::Authorizer')[0].Properties;
  assert.deepEqual(jwt.JwtConfiguration, {Audience: [core.clientId], Issuer: core.issuer});
  assert.equal(jwt.AuthorizerType, 'JWT'); assert.deepEqual(jwt.IdentitySource, ['$request.header.Authorization']);
  assert.equal(byType('AWS::ApiGatewayV2::Route')[0].Properties.AuthorizationType, 'JWT');
});
test('JWT context rejects missing/expired/wrong issuer/client/ID tokens', async () => {
  for (const claims of [undefined, {}, {...event().requestContext.authorizer.jwt.claims, exp: 1}, {...event().requestContext.authorizer.jwt.claims, iss: 'https://wrong'}, {...event().requestContext.authorizer.jwt.claims, client_id: 'wrong'}, {...event().requestContext.authorizer.jwt.claims, token_use: 'id'}]) {
    const e = event(); e.requestContext.authorizer.jwt.claims = claims; assert.equal((await handler(e)).statusCode, 401);
  }
  const e = event(); e.requestContext.apiId = 'anotherapi'; assert.equal((await handler(e)).statusCode, 401);
});
test('5 identity cannot be supplied or overridden in request payload', async () => {
  assert.equal((await handler({...event(), body: JSON.stringify({sub: 'admin', role: 'admin'})})).statusCode, 400);
  assert.equal((await handler({...event(), queryStringParameters: {sub: 'admin'}})).statusCode, 400);
  assert.equal((await handler({...event(), rawQueryString: 'sub=admin'})).statusCode, 400);
  const e = event(); delete e.requestContext.authorizer; e.body = JSON.stringify({jwt: event().requestContext.authorizer.jwt}); assert.equal((await handler(e)).statusCode, 401);
});
for (const [label, change] of [['6 wrong account', {account: '123456789012'}], ['7 wrong region', {region: 'us-east-1'}], ['8 wrong environment', {environment: 'staging'}], ['9 wrong Cognito issuer', {issuer: 'https://production'}], ['9 wrong Cognito pool', {poolId: 'eu-north-1_other'}], ['9 wrong Cognito client', {clientId: 'a'.repeat(26)}], ['9 wrong provenance', {provenance: {...core.provenance, source: 'production.json'}}], ['10 production forbidden', {environment: 'production'}]]) test(label, () => assert.throws(() => validateCore({...core, ...change})));
test('approved environment contract and exact source pin pass', () => assert.equal(validateCore(core), core));
test('11/12 dependency guard rejects LegacyPlatform/schema and unrelated domains', () => {
  for (const p of ['amplify/backend.ts', 'amplify/data/resource.ts', 'src/features/Team Hub/api.js', 'infrastructure/twitch-runtime/index.ts', 'domains/commerce/handler.ts', '../amplify/backend.ts']) assert.throws(() => checkClosure([p]));
  checkClosure(receipt.actualSourceClosure);
});
test('11/12 actual bundler rejects forbidden imports before loading LegacyPlatform/schema', async () => {
  const esbuild = isolated('esbuild');
  for (const dependency of ['./amplify/backend.ts', './amplify/data/resource.ts', '@aws-sdk/client-dynamodb']) {
    await assert.rejects(esbuild.build({absWorkingDir: root, tsconfigRaw: {}, stdin: {contents: `import ${JSON.stringify(dependency)}`, resolveDir: root}, bundle: true, platform: 'node', write: false, plugins: [isolationPlugin()], logLevel: 'silent'}), /Forbidden dependency|Undeclared package dependency/);
  }
});
test('13 runtime bundle has no external clients, stateful IAM or unrelated source', () => {
  const meta = read(path.join(buildDir, 'runtime-metafile.json'));
  assert.deepEqual(Object.keys(meta.inputs).sort(), ['domains/tournaments/preview/contract.ts', 'domains/tournaments/preview/fixture.json', 'domains/tournaments/preview/handler.ts']);
  assert.ok(Object.values(meta.outputs).every(v => v.imports.length === 0));
  const policy = byType('AWS::IAM::Role')[0].Properties;
  assert.equal(policy.ManagedPolicyArns, undefined);
  assert.equal(policy.PermissionsBoundary, 'arn:aws:iam::058264289478:policy/ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary');
  assert.deepEqual(byType('AWS::ApiGatewayV2::Api')[0].Properties.Tags, {Project: 'ProjectRespawn', Domain: 'Tournaments', Environment: 'Ntgre'});
  assert.deepEqual(policy.Policies[0].PolicyDocument.Statement[0].Action, ['logs:CreateLogStream', 'logs:PutLogEvents']);
  assert.deepEqual(policy.Policies[0].PolicyDocument.Statement[0].Resource, {'Fn::GetAtt': ['PreviewLogs', 'Arn']});
});
test('14/16 one independent Tournament root, no nested/Legacy/schema templates', () => {
  const manifest = read(path.join(buildDir, 'assembly/manifest.json'));
  assert.deepEqual(Object.entries(manifest.artifacts).filter(([, a]) => a.type === 'aws:cloudformation:stack').map(([id]) => id), [stackName]);
  assert.equal(receipt.total, 11); assert.equal(resources.length, 11);
  assert.ok(resources.every(r => !/CloudFormation::Stack|AppSync|DynamoDB|S3::|KMS::|Cognito|Custom::/.test(r.Type)));
  assert.ok(!JSON.stringify(template).includes('Fn::ImportValue'));
  assert.equal(manifest.missing?.length ?? 0, 0);
  assert.deepEqual(fs.readdirSync(path.join(buildDir, 'assembly')).filter(p => p.endsWith('.template.json')), [`${stackName}.template.json`]);
});
test('15 Tournament changes select only Tournament; shared contracts select compatibility tests', () => {
  assert.deepEqual(select(['domains/tournaments/preview/handler.ts']).deploy, ['tournaments']);
  assert.deepEqual(select(['contracts/environment-v1.schema.json']), {deploy: [], compatibilityTests: ['tournaments'], automaticDeployment: false});
  assert.deepEqual(select(['amplify/backend.ts', 'src/features/Team Hub/api.js']).deploy, []);
  assert.throws(() => select(['../amplify/backend.ts']));
});
test('17 exactly one local Lambda asset and no unrelated bundling', () => {
  assert.equal(byType('AWS::Lambda::Function').length, 1);
  const assets = read(path.join(buildDir, 'assembly', `${stackName}.assets.json`));
  // CDK publishes the runtime zip plus the root template, neither a legacy asset.
  assert.equal(Object.values(assets.files).filter(f => f.source.packaging === 'zip').length, 1);
  const zip = Object.values(assets.files).find(f => f.source.packaging === 'zip');
  assert.deepEqual(fs.readdirSync(path.join(buildDir, 'assembly', zip.source.path)).sort(), ['index.js', 'package.json']);
  assert.equal(receipt.unrelatedLambdasBundled, false);
});
test('18 deployment command rejects LegacyPlatform, prod, overrides and execution', () => {
  for (const args of [['legacy', '--env', 'Ntgre'], ['tournaments', '--env', 'production'], ['tournaments', '--env', 'Ntgre', '--stack', 'amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332'], ['tournaments', '--env', 'Ntgre', '--execute']]) {
    assert.throws(() => target(args));
    assert.notEqual(spawnSync(process.execPath, [path.join(root, 'scripts/domains/deploy.mjs'), ...args], {windowsHide: true}).status, 0);
  }
});
test('deployment evidence is local only with rollback required', () => {
  const review = JSON.parse(execFileSync(process.execPath, [path.join(root, 'scripts/domains/deploy.mjs'), 'tournaments', '--env', 'Ntgre'], {encoding: 'utf8', windowsHide: true}));
  assert.equal(review.awsWrites, 0); assert.equal(review.executionEnabled, false); assert.equal(review.rollbackEnabled, true);
});
test('manifest never invents an endpoint before deployment', () => {
  const config = plannedManifest(core, receipt); assert.equal(config.endpoint, null); assert.equal(config.stackArn, null); assert.equal(config.status, 'PLANNED_NOT_DEPLOYED'); assert.equal(config.provenance.liveVerified, false);
});
test('isolation receipt pins actual inputs, generated assets and package lock', () => {
  assert.ok(receipt.sourceInputs.some(p => p.path.endsWith('/package-lock.json')));
  assert.ok(receipt.loadedLibraries.length > 0);
  assert.ok(receipt.loadedLibraries.every(p => p.path.startsWith('infrastructure/domains/tournaments/')));
  assert.deepEqual(verifyReceipt().revision, receipt.revision);
});
test('future client is lazy, independent of Amplify, and rejects planned endpoints', async () => {
  const {createTournamentClient} = require(path.join(buildDir, 'client.cjs'));
  const config = {...plannedManifest(core, receipt), status: 'DEPLOYED', endpoint: 'https://fixtureapi.execute-api.eu-north-1.amazonaws.com'};
  let tokens = 0, calls = 0;
  const client = createTournamentClient(config, async () => {tokens++; return 'fixture-token';}, async (url, options) => {
    calls++; assert.equal(url, config.endpoint + '/v1/tournaments/preview'); assert.equal(options.headers.Authorization, 'Bearer fixture-token');
    return {ok: true, json: async () => JSON.parse((await handler(event())).body)};
  });
  assert.equal(tokens, 0); assert.equal(calls, 0); assert.equal((await client.preview()).preview, true); assert.equal(calls, 1);
  assert.throws(() => createTournamentClient(plannedManifest(core, receipt), async () => ''));
  assert.throws(() => createTournamentClient({...config, endpoint: 'https://untrusted.example'}, async () => ''));
  assert.throws(() => createTournamentClient({...config, environment: 'production'}, async () => ''));
});
test('own API invocation, runtime logging and alarms survive access-log deferral', () => {
  const permission = byType('AWS::Lambda::Permission')[0].Properties;
  assert.equal(permission.SourceAccount, core.account);
  assert.ok(JSON.stringify(permission.SourceArn).includes('/*/GET/v1/tournaments/preview'));
  const stage = byType('AWS::ApiGatewayV2::Stage')[0].Properties;
  assert.equal(stage.AccessLogSettings, undefined);
  assert.equal(template.Resources.AccessLogs, undefined);
  assert.ok(!/AWS::Logs::(?:ResourcePolicy|Delivery)/.test(JSON.stringify(template)));
  assert.equal(byType('AWS::Logs::LogGroup').length, 1);
  assert.equal(byType('AWS::Logs::LogGroup')[0].Properties.LogGroupName, '/project-respawn/Ntgre/tournaments/preview');
  assert.deepEqual(byType('AWS::Lambda::Function')[0].Properties.LoggingConfig, {LogFormat: 'JSON', LogGroup: {Ref: 'PreviewLogs'}});
  assert.deepEqual(byType('AWS::CloudWatch::Alarm').map(r => [r.Properties.Namespace, r.Properties.MetricName]).sort(), [['AWS/ApiGateway', '5xx'], ['AWS/Lambda', 'Errors']]);
  assert.ok(byType('AWS::Logs::LogGroup').every(r => r.Properties.RetentionInDays === 14));
  assert.equal(byType('AWS::CloudWatch::Alarm').length, 2);
});
