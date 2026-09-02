import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MASTER, PHASE2, compareTemplates, normalizeResource, phase1Allowlist, phase2Allowlist, validatePhase2ChangeSet, isExactPhase2DedupeTable, isExactPhase2IamChange, isExactTwitchRuntimeTemplate, verdict, isExpectedApiKeyExpiry, compareLambdaArtifactContent } from './lib/master-backend-preview.mjs';

const lambda = (code = 'old.zip', environment = 'master') => ({ Type: 'AWS::Lambda::Function', Properties: { Code: { S3Key: code }, Environment: { Variables: { ENV: environment } }, Runtime: 'nodejs22.x' }, Metadata: { generated: Date.now() } });

test('normalization ignores metadata but preserves meaningful asset and environment changes', () => {
  assert.equal(normalizeResource(lambda('a.zip')).Metadata, undefined);
  assert.notDeepEqual(normalizeResource(lambda('a.zip')), normalizeResource(lambda('b.zip')));
  assert.notDeepEqual(normalizeResource(lambda('a.zip', 'master')), normalizeResource(lambda('a.zip', 'sandbox')));
});

test('Phase 1 allowlist approves only MASTER overlay Lambda Code', () => {
  const approved = phase1Allowlist({ stack: `${MASTER.root}/overlaysourcestackF7F134D8`, logicalId: 'OverlaySourceOverlaySourceFunctionC8484D26', type: 'AWS::Lambda::Function', property: 'Properties.Code.S3Key' });
  assert.equal(approved, true);
  assert.equal(phase1Allowlist({ stack: MASTER.root, logicalId: 'Other', type: 'AWS::Lambda::Function', property: 'Properties.Code.S3Key' }), false);
  assert.equal(phase1Allowlist({ stack: `${MASTER.root}/overlaysourcestackF7F134D8`, logicalId: 'OverlaySourceOverlaySourceFunctionC8484D26', type: 'AWS::Lambda::Function', property: 'Properties.Environment' }), false);
});

test('only the allowlisted code asset produces a safe verdict', () => {
  const changes = compareTemplates({ stack: `${MASTER.root}/overlaysourcestackF7F134D8`, deployed: { Resources: { OverlaySourceOverlaySourceFunctionC8484D26: lambda('old.zip') } }, desired: { Resources: { OverlaySourceOverlaySourceFunctionC8484D26: lambda('new.zip') } }, allowlist: phase1Allowlist });
  assert.equal(changes.filter((change) => change.changeType !== 'METADATA-ONLY').length, 1);
  assert.equal(changes[0].changeType, 'ASSET-UPDATE');
  assert.equal(changes[0].contentAssessment, 'CONTENT HASH DIFFERENT');
  assert.equal(verdict(changes), 'SAFE TO DEPLOY');
});

test('environment, IAM, persistent-resource uncertainty, additions and removals block', () => {
  const environment = compareTemplates({ stack: 'overlay', deployed: { Resources: { Fn: lambda() } }, desired: { Resources: { Fn: lambda('old.zip', 'sandbox') } }, allowlist: phase1Allowlist });
  assert.equal(verdict(environment), 'BLOCKED');
  const table = { Type: 'AWS::DynamoDB::Table', Properties: { BillingMode: 'PAY_PER_REQUEST' } };
  const changedTable = { Type: 'AWS::DynamoDB::Table', Properties: { BillingMode: 'PROVISIONED' } };
  assert.equal(verdict(compareTemplates({ stack: 'root', deployed: { Resources: { Table: table } }, desired: { Resources: { Table: changedTable } } })), 'BLOCKED');
  assert.equal(verdict(compareTemplates({ stack: 'root', deployed: { Resources: { Table: table } }, desired: { Resources: {} } })), 'BLOCKED');
  assert.equal(verdict(compareTemplates({ stack: 'root', deployed: { Resources: {} }, desired: { Resources: { Table: table } } })), 'BLOCKED');
});

test('no material change fails closed', () => assert.equal(verdict([]), 'BLOCKED'));

test('dedicated Twitch runtime template is exact and rejects wildcard IAM', () => {
  const template = JSON.parse(readFileSync('.amplify/master-preview/cdk.out/amplifyd2cux232bpa951masterbranch53ef67772afunction92C3F819.nested.template.json', 'utf8'));
  assert.equal(isExactTwitchRuntimeTemplate(template), true);
  const unsafe = structuredClone(template);
  unsafe.Resources.twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50.Properties.PolicyDocument.Statement[0].Resource = '*';
  assert.equal(isExactTwitchRuntimeTemplate(unsafe), false);
});

test('only a bounded AppSync API key expiry extension is expected operational refresh', () => {
  const now = 2_000_000_000;
  const change = { resourceType: 'AWS::AppSync::ApiKey', property: 'Properties.Expires', changeType: 'MODIFY', oldValue: now + 10 * 86400, newValue: now + 30 * 86400 };
  assert.equal(isExpectedApiKeyExpiry(change, now), true);
  assert.equal(isExpectedApiKeyExpiry({ ...change, property: 'Properties.ApiId' }, now), false);
  assert.equal(isExpectedApiKeyExpiry({ ...change, newValue: now + 40 * 86400 }, now), false);
  assert.equal(isExpectedApiKeyExpiry({ ...change, newValue: change.oldValue - 1 }, now), false);
});

test('proven expected categories may pass but unrelated semantic changes still block', () => {
  const expected = [{ changeType: 'ASSET-UPDATE', classification: 'EXPECTED GENERATED CHURN' }, { changeType: 'MODIFY', classification: 'EXPECTED OPERATIONAL REFRESH' }];
  assert.equal(verdict(expected), 'SAFE TO DEPLOY');
  assert.equal(verdict([...expected, { changeType: 'ASSET-UPDATE', classification: 'UNRELATED' }]), 'BLOCKED');
});

test('Lambda artifact proof ignores only embedded source EOLs', () => {
  const deployed = { 'index.mjs': 'executable', 'index.mjs.map': JSON.stringify({ sources: ['handler.ts'], sourcesContent: ['line1\nline2\n'], mappings: 'AAAA' }) };
  const windows = { 'index.mjs': 'executable', 'index.mjs.map': JSON.stringify({ mappings: 'AAAA', sourcesContent: ['line1\r\nline2\r\n'], sources: ['handler.ts'] }) };
  assert.equal(compareLambdaArtifactContent(deployed, windows).equivalent, true);
  assert.equal(compareLambdaArtifactContent(deployed, { ...windows, 'index.mjs': 'changed executable' }).equivalent, false);
  assert.equal(compareLambdaArtifactContent(deployed, { ...windows, 'index.mjs.map': JSON.stringify({ sources: ['dependency.js'], sourcesContent: ['changed dependency'], mappings: 'AAAA' }) }).equivalent, false);
  assert.equal(compareLambdaArtifactContent(deployed, { ...windows, 'extra.js': 'unexpected' }).equivalent, false);
});

test('AppSync schema changes and API key removal remain blocked', () => {
  const schema = compareTemplates({ stack: 'data', deployed: { Resources: { Schema: { Type: 'AWS::AppSync::GraphQLSchema', Properties: { Definition: 'old' } } } }, desired: { Resources: { Schema: { Type: 'AWS::AppSync::GraphQLSchema', Properties: { Definition: 'new' } } } } });
  const keyRemoval = compareTemplates({ stack: 'data', deployed: { Resources: { Key: { Type: 'AWS::AppSync::ApiKey', Properties: { ApiId: 'api', Expires: 1 } } } }, desired: { Resources: {} } });
  assert.equal(verdict(schema), 'BLOCKED');
  assert.equal(verdict(keyRemoval), 'BLOCKED');
});

const dedupeTable = () => ({ Type: 'AWS::DynamoDB::Table', DeletionPolicy: 'Retain', UpdateReplacePolicy: 'Retain', Properties: {
  AttributeDefinitions: [{ AttributeName: 'dedupeKey', AttributeType: 'S' }], KeySchema: [{ AttributeName: 'dedupeKey', KeyType: 'HASH' }],
  BillingMode: 'PAY_PER_REQUEST', TimeToLiveSpecification: { AttributeName: 'expiresAt', Enabled: true }, PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
  Tags: [{ Key: 'amplify:app-id', Value: MASTER.appId }, { Key: 'amplify:branch-name', Value: MASTER.branch }, { Key: 'amplify:deployment-type', Value: 'branch' }, { Key: 'created-by', Value: 'amplify' }],
} });
const basePolicy = () => ({ Type: 'AWS::IAM::Policy', Properties: { PolicyName: 'runtime-default', Roles: [{ Ref: 'RuntimeRole' }], PolicyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Action: 'logs:CreateLogGroup', Resource: 'existing' }] } } });
const phase2Policy = () => {
  const policy = structuredClone(basePolicy());
  policy.Properties.PolicyDocument.Statement.push(
    { Effect: 'Allow', Action: 'dynamodb:GetItem', Resource: { Ref: 'OverlayPublication1B877843Arn' } },
    { Effect: 'Allow', Action: 'dynamodb:Query', Resource: { 'Fn::Join': ['', [{ Ref: 'OverlaySourceConnectionD663E654Arn' }, '/index/publicationId-index']] } },
    { Effect: 'Allow', Action: 'dynamodb:DeleteItem', Resource: { Ref: 'OverlaySourceConnectionD663E654Arn' } },
    { Effect: 'Allow', Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem'], Resource: { Ref: 'TwitchEventDeliveryDedupeB1DA3E46Arn' } },
    { Effect: 'Allow', Action: 'execute-api:ManageConnections', Resource: { 'Fn::Join': ['', ['arn:', { Ref: 'AWS::Partition' }, ':execute-api:', { Ref: 'AWS::Region' }, ':', { Ref: 'AWS::AccountId' }, ':', { Ref: 'OverlaySourceWebSocketApi6EB9FD5BRef' }, '/live/POST/@connections/*']] } },
  );
  return policy;
};
const runtime = (desired = false) => ({ Type: 'AWS::Lambda::Function', Properties: { Code: { S3Key: desired ? 'new.zip' : 'old.zip' }, Runtime: 'nodejs22.x', Handler: 'index.handler', Role: { Ref: 'RuntimeRole' }, Environment: { Variables: desired ? {
  OVERLAY_PUBLICATION_TABLE: { Ref: 'OverlayPublication1B877843Ref' }, OVERLAY_CONNECTION_TABLE: { Ref: 'OverlaySourceConnectionD663E654Ref' },
  TWITCH_EVENT_DEDUPE_TABLE: { Ref: 'TwitchEventDeliveryDedupeB1DA3E46Ref' }, OVERLAY_WEBSOCKET_MANAGEMENT_URL: { 'Fn::Join': ['', ['https://', { Ref: 'OverlaySourceWebSocketApi6EB9FD5BRef' }, '.execute-api.eu-north-1.amazonaws.com/live']] },
  TWITCH_RUNTIME_CLIENT_ID: PHASE2.runtimeClientIdentity.new,
} : { TWITCH_RUNTIME_CLIENT_ID: PHASE2.runtimeClientIdentity.old } } } });
const referenceName = (suffix) => `referenceto${suffix}`;

function reviewedPhase2Changes() {
  const overlayStack = `${MASTER.root}/overlaysourcestackF7F134D8`;
  const changes = [
    ...compareTemplates({ stack: overlayStack, deployed: { Resources: { [PHASE2.overlayLambda]: lambda('old.zip') } }, desired: { Resources: { [PHASE2.overlayLambda]: lambda('new.zip'), [PHASE2.dedupeTable]: dedupeTable() } }, allowlist: phase2Allowlist }),
    ...compareTemplates({ stack: `${MASTER.root}/data7552DF31`, deployed: { Resources: { [PHASE2.runtimeLambda]: runtime(), [PHASE2.runtimePolicy]: basePolicy() } }, desired: { Resources: { [PHASE2.runtimeLambda]: runtime(true), [PHASE2.runtimePolicy]: phase2Policy() } }, allowlist: phase2Allowlist }),
    ...compareTemplates({ stack: MASTER.root, deployed: { Resources: { data7552DF31: { Type: 'AWS::CloudFormation::Stack', Properties: { Parameters: {} } } } }, desired: { Resources: { data7552DF31: { Type: 'AWS::CloudFormation::Stack', Properties: { Parameters: Object.fromEntries(PHASE2.references.map((suffix) => [referenceName(suffix), { 'Fn::GetAtt': ['overlaysourcestackF7F134D8', `Outputs.${suffix}`] }])) } } } }, allowlist: phase2Allowlist }),
  ];
  return changes;
}

test('exact reviewed Phase 2A resource set is accepted and has no replacement risk', () => {
  const changes = reviewedPhase2Changes();
  assert.deepEqual(validatePhase2ChangeSet(changes), []);
  assert.equal(verdict(changes), 'SAFE TO DEPLOY');
  assert.equal(changes.filter((c) => c.replacementRisk === true || c.replacementRisk === 'UNKNOWN').length, 0);
});

test('dedupe addition validator requires the exact retained minimal table', () => {
  assert.equal(isExactPhase2DedupeTable(dedupeTable()), true);
  for (const mutate of [
    (r) => r.Properties.KeySchema.push({ AttributeName: 'sort', KeyType: 'RANGE' }),
    (r) => { r.DeletionPolicy = 'Delete'; }, (r) => { r.Properties.GlobalSecondaryIndexes = []; },
    (r) => { r.Properties.StreamSpecification = { StreamViewType: 'NEW_IMAGE' }; }, (r) => { r.Properties.TableName = 'explicit'; },
  ]) { const candidate = dedupeTable(); mutate(candidate); assert.equal(isExactPhase2DedupeTable(candidate), false); }
  const second = reviewedPhase2Changes().concat({ changeType: 'ADD', logicalId: 'OtherTable', resourceType: 'AWS::DynamoDB::Table', classification: 'DANGEROUS' });
  assert.equal(verdict(second, validatePhase2ChangeSet(second)), 'BLOCKED');
});

test('runtime IAM accepts only the five reviewed statements and unchanged attachment identity', () => {
  assert.equal(isExactPhase2IamChange(basePolicy(), phase2Policy()), true);
  const mutations = [
    (p) => { p.Properties.PolicyDocument.Statement[1].Action = 'dynamodb:*'; },
    (p) => { p.Properties.PolicyDocument.Statement[1].Resource = '*'; },
    (p) => { p.Properties.PolicyDocument.Statement[1].Action = 'dynamodb:Scan'; },
    (p) => { p.Properties.PolicyDocument.Statement[2].Resource = { 'Fn::Join': ['', [{ Ref: 'OverlaySourceConnectionD663E654Arn' }, '/index/*']] }; },
    (p) => { const parts = p.Properties.PolicyDocument.Statement[5].Resource['Fn::Join'][1]; parts[parts.length - 1] = '/test/POST/@connections/*'; },
    (p) => p.Properties.PolicyDocument.Statement.push({ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }),
    (p) => { p.Properties.Roles = [{ Ref: 'OtherRole' }]; },
  ];
  for (const mutate of mutations) { const candidate = phase2Policy(); mutate(candidate); assert.equal(isExactPhase2IamChange(basePolicy(), candidate), false); }
});

test('environment and cross-stack wiring must be exactly the reviewed sets', () => {
  const fifth = reviewedPhase2Changes().concat({ logicalId: PHASE2.runtimeLambda, resourceType: 'AWS::Lambda::Function', property: 'Properties.Environment.Variables.EXTRA', changeType: 'MODIFY', classification: 'DANGEROUS' });
  assert.notDeepEqual(validatePhase2ChangeSet(fifth), []);
  for (const forbidden of ['OVERLAY_WORKSPACE_TABLE', 'OVERLAY_BRAND_TABLE']) {
    const changes = compareTemplates({ stack: 'data', deployed: { Resources: { [PHASE2.runtimeLambda]: runtime() } }, desired: { Resources: { [PHASE2.runtimeLambda]: { ...runtime(true), Properties: { ...runtime(true).Properties, Environment: { Variables: { ...runtime(true).Properties.Environment.Variables, [forbidden]: { Ref: 'Forbidden' } } } } } } }, allowlist: phase2Allowlist });
    assert.equal(verdict(changes), 'BLOCKED');
  }
  const missingReference = reviewedPhase2Changes().filter((c) => !c.property.includes(PHASE2.references[0]));
  assert.notDeepEqual(validatePhase2ChangeSet(missingReference), []);
});

test('runtime client identity guard accepts only the exact reviewed MASTER transition', () => {
  const exact = compareTemplates({ stack: `${MASTER.root}/data7552DF31`, deployed: { Resources: { [PHASE2.runtimeLambda]: runtime() } }, desired: { Resources: { [PHASE2.runtimeLambda]: runtime(true) } }, allowlist: phase2Allowlist });
  const identity = exact.find((change) => change.property.endsWith('.TWITCH_RUNTIME_CLIENT_ID'));
  assert.equal(identity?.classification, 'APPROVED');
  for (const [logicalId, oldValue, newValue] of [
    [PHASE2.runtimeLambda, 'respawn-twitch-bot', 'anything-else'],
    [PHASE2.runtimeLambda, 'respawn-twitch-bot-production', 'respawn-twitch-bot'],
    [PHASE2.runtimeLambda, 'respawn-twitch-bot', undefined],
    ['OtherLambda', 'respawn-twitch-bot', 'respawn-twitch-bot-production'],
    [PHASE2.runtimeLambda, 'respawn-twitch-bot', 'Ntgrestage8'],
    [PHASE2.runtimeLambda, 'respawn-twitch-bot', 'staging-runtime'],
  ]) {
    const before = lambda(); before.Properties.Environment.Variables.TWITCH_RUNTIME_CLIENT_ID = oldValue;
    const after = lambda();
    if (newValue !== undefined) after.Properties.Environment.Variables.TWITCH_RUNTIME_CLIENT_ID = newValue;
    const changes = compareTemplates({ stack: `${MASTER.root}/data7552DF31`, deployed: { Resources: { [logicalId]: before } }, desired: { Resources: { [logicalId]: after } }, allowlist: phase2Allowlist });
    assert.equal(verdict(changes), 'BLOCKED');
  }
  const extra = reviewedPhase2Changes().concat({ logicalId: PHASE2.runtimeLambda, resourceType: 'AWS::Lambda::Function', property: 'Properties.Environment.Variables.EXTRA', oldValue: 'old', newValue: 'new', changeType: 'MODIFY', classification: 'UNRELATED' });
  assert.notDeepEqual(validatePhase2ChangeSet(extra), []);
  assert.equal(verdict(extra, validatePhase2ChangeSet(extra)), 'BLOCKED');
});

test('role, deletion, replacement, unrelated Lambda and API changes remain blocked', () => {
  const oldRole = { Type: 'AWS::IAM::Role', Properties: { AssumeRolePolicyDocument: { old: true } } };
  const newRole = { Type: 'AWS::IAM::Role', Properties: { AssumeRolePolicyDocument: { new: true } } };
  const oldApi = { Type: 'AWS::ApiGatewayV2::Api', Properties: { ProtocolType: 'WEBSOCKET' } };
  const newApi = { Type: 'AWS::ApiGatewayV2::Api', Properties: { ProtocolType: 'HTTP' } };
  const cases = [
    compareTemplates({ stack: 'data', deployed: { Resources: { Role: oldRole } }, desired: { Resources: { Role: newRole } } }),
    compareTemplates({ stack: 'data', deployed: { Resources: { Table: dedupeTable() } }, desired: { Resources: {} }, allowlist: phase2Allowlist }),
    compareTemplates({ stack: 'data', deployed: { Resources: { Other: lambda('old.zip') } }, desired: { Resources: { Other: lambda('new.zip') } }, allowlist: phase2Allowlist }),
    compareTemplates({ stack: 'api', deployed: { Resources: { Api: oldApi } }, desired: { Resources: { Api: newApi } }, allowlist: phase2Allowlist }),
  ];
  for (const changes of cases) assert.equal(verdict(changes), 'BLOCKED');
});
