import test from 'node:test';
import assert from 'node:assert/strict';
import { MASTER, compareTemplates, normalizeResource, phase1Allowlist, verdict, isExpectedApiKeyExpiry, compareLambdaArtifactContent } from './lib/master-backend-preview.mjs';

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
