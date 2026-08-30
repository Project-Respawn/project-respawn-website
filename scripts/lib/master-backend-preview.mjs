import { createHash } from 'node:crypto';

export const MASTER = Object.freeze({
  appId: 'd2cux232bpa951', branch: 'master', account: '058264289478', region: 'eu-north-1',
  root: 'amplify-d2cux232bpa951-master-branch-53ef67772a',
  forbiddenRoot: 'amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e',
  httpUrl: 'https://w0xfyjn6v7.execute-api.eu-north-1.amazonaws.com/',
  websocketUrl: 'wss://ztevn4upnk.execute-api.eu-north-1.amazonaws.com/live',
  forbiddenIds: ['qhoqgtqy81', '36v41ynbj3'],
});

export const PROTECTED_TYPES = new Set([
  'AWS::Cognito::UserPool', 'AWS::Cognito::UserPoolClient', 'AWS::DynamoDB::Table',
  'AWS::AppSync::GraphQLApi', 'AWS::ApiGatewayV2::Api', 'AWS::ApiGatewayV2::Stage',
  'AWS::S3::Bucket', 'AWS::KMS::Key', 'AWS::IAM::Role', 'AWS::IAM::Policy',
]);

const REPLACEMENT_PROPERTIES = Object.freeze({
  'AWS::DynamoDB::Table': new Set(['TableName', 'KeySchema', 'AttributeDefinitions', 'LocalSecondaryIndexes']),
  'AWS::AppSync::GraphQLApi': new Set(['Name']),
  'AWS::ApiGatewayV2::Api': new Set(['ProtocolType']),
  'AWS::ApiGatewayV2::Stage': new Set(['ApiId', 'StageName']),
  'AWS::S3::Bucket': new Set(['BucketName']),
  'AWS::IAM::Role': new Set(['RoleName', 'Path']),
  'AWS::IAM::Policy': new Set(['PolicyName']),
  'AWS::Cognito::UserPoolClient': new Set(['ClientName', 'UserPoolId']),
});

const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
};

export const stableJson = (value) => JSON.stringify(stable(value));
export const digest = (value) => createHash('sha256').update(stableJson(value)).digest('hex');

export function normalizeResource(resource) {
  if (!resource) return resource;
  const normalized = structuredClone(resource);
  delete normalized.Metadata;
  if (normalized.Type === 'AWS::CloudFormation::Stack' && normalized.Properties) {
    if ('TemplateURL' in normalized.Properties) normalized.Properties.TemplateURL = '<nested-template-compared-separately>';
  }
  return stable(normalized);
}

function walk(oldValue, newValue, path = []) {
  if (stableJson(oldValue) === stableJson(newValue)) return [];
  if (!oldValue || !newValue || typeof oldValue !== 'object' || typeof newValue !== 'object' || Array.isArray(oldValue) || Array.isArray(newValue)) {
    return [{ property: path.join('.') || '<resource>', oldValue, newValue }];
  }
  const keys = [...new Set([...Object.keys(oldValue), ...Object.keys(newValue)])].sort();
  return keys.flatMap((key) => walk(oldValue[key], newValue[key], [...path, key]));
}

function replacementRisk(type, property, logicalId) {
  if (property === '<resource>') return true;
  const top = property.replace(/^Properties\./, '').split('.')[0];
  if (REPLACEMENT_PROPERTIES[type]?.has(top)) return true;
  if (type === 'AWS::IAM::Policy' && logicalId === PHASE2.runtimePolicy && top === 'PolicyDocument') return false;
  return PROTECTED_TYPES.has(type) ? 'UNKNOWN' : false;
}

export function compareTemplates({ stack, desired, deployed, physicalByLogical = {}, allowlist }) {
  const desiredResources = desired?.Resources || {}, deployedResources = deployed?.Resources || {};
  const logicalIds = [...new Set([...Object.keys(desiredResources), ...Object.keys(deployedResources)])].sort();
  const changes = [];
  for (const logicalId of logicalIds) {
    if (logicalId === 'CDKMetadata') continue;
    const before = deployedResources[logicalId], after = desiredResources[logicalId];
    const type = after?.Type || before?.Type || 'UNKNOWN';
    const base = { stack, logicalId, resourceType: type, physicalId: physicalByLogical[logicalId] || null };
    if (!before) {
      const normalized = normalizeResource(after);
      const approved = allowlist?.({ stack, logicalId, type, property: '<resource>', before, after: normalized }) === true;
      changes.push({ ...base, changeType: 'ADD', property: '<resource>', oldValue: undefined, newValue: normalized, replacementRisk: false, classification: approved ? 'APPROVED' : 'DANGEROUS' }); continue;
    }
    if (!after) { changes.push({ ...base, changeType: 'REMOVE', property: '<resource>', oldValue: normalizeResource(before), newValue: undefined, replacementRisk: true, classification: 'DANGEROUS' }); continue; }
    const rawSame = stableJson(before) === stableJson(after);
    const semanticBefore = normalizeResource(before), semanticAfter = normalizeResource(after);
    if (stableJson(semanticBefore) === stableJson(semanticAfter)) {
      if (!rawSame) changes.push({ ...base, changeType: 'METADATA-ONLY', property: 'Metadata/TemplateURL', oldValue: '<generated>', newValue: '<generated>', replacementRisk: false, classification: 'APPROVED' });
      continue;
    }
    for (const difference of walk(semanticBefore, semanticAfter)) {
      const isLambdaCode = type === 'AWS::Lambda::Function' && difference.property.startsWith('Properties.Code');
      const approved = allowlist?.({ stack, logicalId, type, property: difference.property, oldValue: difference.oldValue, newValue: difference.newValue, before: semanticBefore, after: semanticAfter }) === true;
      const risk = replacementRisk(type, difference.property, logicalId);
      changes.push({ ...base, ...difference,
        changeType: risk === true || risk === 'UNKNOWN' ? 'REPLACE-RISK' : isLambdaCode ? 'ASSET-UPDATE' : 'MODIFY',
        contentAssessment: isLambdaCode ? 'CONTENT HASH DIFFERENT' : undefined,
        replacementRisk: risk,
        classification: approved && risk !== true && risk !== 'UNKNOWN' ? 'APPROVED' : risk === true ? 'DANGEROUS' : approved ? 'APPROVED' : PROTECTED_TYPES.has(type) ? 'DANGEROUS' : 'UNRELATED',
      });
    }
  }
  return changes;
}

export function phase1Allowlist({ stack, logicalId, type, property }) {
  return stack.includes('overlaysourcestackF7F134D8') && logicalId === 'OverlaySourceOverlaySourceFunctionC8484D26' && type === 'AWS::Lambda::Function' && property.startsWith('Properties.Code');
}

export const PHASE2 = Object.freeze({
  runtimeLambda: 'myFunctionrebuildlambdaFBFF6F05',
  runtimePolicy: 'myFunctionrebuildlambdaServiceRoleDefaultPolicy67EF0A34',
  overlayLambda: 'OverlaySourceOverlaySourceFunctionC8484D26',
  dedupeTable: 'OverlaySourceTwitchEventDeliveryDedupe8C2A76A7',
  websocketArn: 'arn:aws:execute-api:eu-north-1:058264289478:ztevn4upnk/live/POST/@connections/*',
  environment: ['OVERLAY_CONNECTION_TABLE', 'OVERLAY_PUBLICATION_TABLE', 'OVERLAY_WEBSOCKET_MANAGEMENT_URL', 'TWITCH_EVENT_DEDUPE_TABLE'],
  runtimeClientIdentity: Object.freeze({ old: 'respawn-twitch-bot', new: 'respawn-twitch-bot-production' }),
  references: ['OverlayPublication1B877843Arn', 'OverlayPublication1B877843Ref', 'OverlaySourceConnectionD663E654Arn', 'OverlaySourceConnectionD663E654Ref', 'OverlaySourceWebSocketApi6EB9FD5BRef', 'TwitchEventDeliveryDedupeB1DA3E46Arn', 'TwitchEventDeliveryDedupeB1DA3E46Ref'],
});

const actionList = (action) => (Array.isArray(action) ? action : [action]).slice().sort();
const resourceText = (resource) => stableJson(resource);
const exactActions = (statement, expected) => stableJson(actionList(statement.Action)) === stableJson(expected.slice().sort()) && statement.Effect === 'Allow';
const containsOne = (value, token) => resourceText(value).includes(token);
function isExactWebsocketResource(resource) {
  if (resource === PHASE2.websocketArn) return true;
  const parts = resource?.['Fn::Join'];
  if (!Array.isArray(parts) || parts[0] !== '' || !Array.isArray(parts[1])) return false;
  const text = stableJson(parts[1]);
  return text.includes('"Ref":"AWS::Partition"') && text.includes('"Ref":"AWS::Region"')
    && text.includes('"Ref":"AWS::AccountId"') && text.includes('OverlaySourceWebSocketApi6EB9FD5BRef')
    && text.includes('/live/POST/@connections/*') && !text.toLowerCase().match(/ntgrestage8|staging/);
}

export function isExactPhase2DedupeTable(resource) {
  const p = resource?.Properties || {};
  return resource?.Type === 'AWS::DynamoDB::Table'
    && stableJson(Object.keys(resource).sort()) === stableJson(['DeletionPolicy', 'Properties', 'Type', 'UpdateReplacePolicy'])
    && stableJson(Object.keys(p).sort()) === stableJson(['AttributeDefinitions', 'BillingMode', 'KeySchema', 'PointInTimeRecoverySpecification', 'Tags', 'TimeToLiveSpecification'])
    && resource.DeletionPolicy === 'Retain' && resource.UpdateReplacePolicy === 'Retain'
    && stableJson(p.AttributeDefinitions) === stableJson([{ AttributeName: 'dedupeKey', AttributeType: 'S' }])
    && stableJson(p.KeySchema) === stableJson([{ AttributeName: 'dedupeKey', KeyType: 'HASH' }])
    && p.BillingMode === 'PAY_PER_REQUEST'
    && stableJson(p.TimeToLiveSpecification) === stableJson({ AttributeName: 'expiresAt', Enabled: true })
    && p.PointInTimeRecoverySpecification?.PointInTimeRecoveryEnabled === true
    && stableJson(p.Tags) === stableJson([
      { Key: 'amplify:app-id', Value: MASTER.appId }, { Key: 'amplify:branch-name', Value: MASTER.branch },
      { Key: 'amplify:deployment-type', Value: 'branch' }, { Key: 'created-by', Value: 'amplify' },
    ])
    && !('TableName' in p) && !('GlobalSecondaryIndexes' in p) && !('LocalSecondaryIndexes' in p)
    && !('StreamSpecification' in p) && !('ResourcePolicy' in p);
}

export function isExactPhase2IamChange(before, after) {
  if (stableJson(before?.Properties?.PolicyName) !== stableJson(after?.Properties?.PolicyName)
    || stableJson(before?.Properties?.Roles) !== stableJson(after?.Properties?.Roles)) return false;
  const oldStatements = before?.Properties?.PolicyDocument?.Statement || [];
  const desiredStatements = after?.Properties?.PolicyDocument?.Statement || [];
  const remaining = desiredStatements.slice();
  for (const statement of oldStatements) {
    const index = remaining.findIndex((candidate) => stableJson(candidate) === stableJson(statement));
    if (index < 0) return false;
    remaining.splice(index, 1);
  }
  if (remaining.length !== 5) return false;
  const capabilities = [
    remaining.some((s) => exactActions(s, ['dynamodb:GetItem']) && containsOne(s.Resource, 'OverlayPublication1B877843Arn')),
    remaining.some((s) => exactActions(s, ['dynamodb:Query']) && containsOne(s.Resource, 'OverlaySourceConnectionD663E654Arn') && containsOne(s.Resource, '/index/publicationId-index')),
    remaining.some((s) => exactActions(s, ['dynamodb:DeleteItem']) && containsOne(s.Resource, 'OverlaySourceConnectionD663E654Arn') && !containsOne(s.Resource, '/index/')),
    remaining.some((s) => exactActions(s, ['dynamodb:PutItem', 'dynamodb:UpdateItem']) && containsOne(s.Resource, 'TwitchEventDeliveryDedupeB1DA3E46Arn')),
    remaining.some((s) => exactActions(s, ['execute-api:ManageConnections']) && isExactWebsocketResource(s.Resource)),
  ];
  const forbidden = resourceText(remaining).toLowerCase();
  return capabilities.every(Boolean) && !forbidden.includes('ntgrestage8') && !forbidden.includes('staging')
    && !remaining.some((s) => actionList(s.Action).some((a) => ['dynamodb:*', 'execute-api:*', 'dynamodb:Scan', 'dynamodb:BatchGetItem', 'dynamodb:BatchWriteItem', 'dynamodb:GetRecords', 'dynamodb:GetShardIterator', 'dynamodb:DescribeTable', 'dynamodb:ConditionCheckItem'].includes(a)) || s.Resource === '*')
    && !forbidden.includes('/index/*') && !forbidden.includes('creatorworkspacerecord') && !forbidden.includes('amplifydatabrand');
}

function validEnvironmentValue(key, value) {
  const text = resourceText(value).toLowerCase();
  if (text.includes('ntgrestage8') || text.includes('staging')) return false;
  const token = key === 'OVERLAY_PUBLICATION_TABLE' ? 'overlaypublication1b877843ref'
    : key === 'OVERLAY_CONNECTION_TABLE' ? 'overlaysourceconnectiond663e654ref'
      : key === 'TWITCH_EVENT_DEDUPE_TABLE' ? 'twitcheventdeliverydedupeb1da3e46ref'
        : 'overlaysourcewebsocketapi6eb9fd5bref';
  return text.includes(token) && (key !== 'OVERLAY_WEBSOCKET_MANAGEMENT_URL' || text.includes('https://'));
}

export function phase2Allowlist({ stack, logicalId, type, property, oldValue, newValue, before, after }) {
  if (logicalId === PHASE2.dedupeTable && property === '<resource>') return isExactPhase2DedupeTable(after);
  if (logicalId === PHASE2.overlayLambda && type === 'AWS::Lambda::Function') return stack.includes('overlaysourcestackF7F134D8') && property === 'Properties.Code.S3Key';
  if (logicalId === PHASE2.runtimeLambda && type === 'AWS::Lambda::Function') {
    if (property === 'Properties.Code.S3Key') return true;
    const prefix = 'Properties.Environment.Variables.';
    if (property.startsWith(prefix)) {
      const key = property.slice(prefix.length);
      if (key === 'TWITCH_RUNTIME_CLIENT_ID') return oldValue === PHASE2.runtimeClientIdentity.old && newValue === PHASE2.runtimeClientIdentity.new;
      return PHASE2.environment.includes(key) && validEnvironmentValue(key, newValue);
    }
    return false;
  }
  if (logicalId === PHASE2.runtimePolicy && type === 'AWS::IAM::Policy' && property === 'Properties.PolicyDocument.Statement') return isExactPhase2IamChange(before, after);
  if (type === 'AWS::CloudFormation::Stack' && logicalId === 'data7552DF31' && property.startsWith('Properties.Parameters.')) {
    const suffix = PHASE2.references.find((candidate) => property.toLowerCase().includes(candidate.toLowerCase()));
    const getAtt = newValue?.['Fn::GetAtt'];
    return Boolean(suffix) && Array.isArray(getAtt) && getAtt.length === 2 && getAtt[0] === 'overlaysourcestackF7F134D8'
      && typeof getAtt[1] === 'string' && getAtt[1].startsWith('Outputs.') && getAtt[1].endsWith(suffix)
      && !resourceText(newValue).toLowerCase().match(/ntgrestage8|staging/);
  }
  return false;
}

export function validatePhase2ChangeSet(changes) {
  const material = changes.filter((c) => c.changeType !== 'METADATA-ONLY');
  const errors = [];
  const added = material.filter((c) => c.changeType === 'ADD');
  if (added.length !== 1 || added[0].logicalId !== PHASE2.dedupeTable || added[0].classification !== 'APPROVED') errors.push('Phase 2A requires exactly the reviewed dedupe table addition');
  const env = material.filter((c) => c.logicalId === PHASE2.runtimeLambda && c.property.startsWith('Properties.Environment.Variables.'));
  const additions = env.filter((c) => c.oldValue === undefined);
  const additionKeys = additions.map((c) => c.property.split('.').at(-1)).sort();
  const identity = env.filter((c) => c.property.endsWith('.TWITCH_RUNTIME_CLIENT_ID'));
  if (stableJson(additionKeys) !== stableJson(PHASE2.environment)) errors.push('Phase 2A requires exactly four new reviewed runtime environment values');
  if (identity.length !== 1 || identity[0].oldValue !== PHASE2.runtimeClientIdentity.old || identity[0].newValue !== PHASE2.runtimeClientIdentity.new || identity[0].classification !== 'APPROVED') errors.push('Phase 2A requires exactly the reviewed production runtime client identity change');
  if (env.length !== PHASE2.environment.length + 1) errors.push('Phase 2A permits no other runtime environment changes');
  const refs = material.filter((c) => c.resourceType === 'AWS::CloudFormation::Stack' && c.logicalId === 'data7552DF31' && c.property.startsWith('Properties.Parameters.'));
  if (refs.length !== 7 || !PHASE2.references.every((suffix) => refs.some((c) => c.property.toLowerCase().includes(suffix.toLowerCase())))) errors.push('Phase 2A requires exactly seven reviewed cross-stack references');
  for (const required of [PHASE2.runtimeLambda, PHASE2.runtimePolicy, PHASE2.overlayLambda]) if (!material.some((c) => c.logicalId === required && c.classification === 'APPROVED')) errors.push(`Missing reviewed Phase 2A change for ${required}`);
  return errors;
}

export function verdict(changes, errors = []) {
  const material = changes.filter((change) => change.changeType !== 'METADATA-ONLY');
  const accepted = new Set(['APPROVED', 'EXPECTED GENERATED CHURN', 'EXPECTED OPERATIONAL REFRESH']);
  return errors.length === 0 && material.length > 0 && material.every((change) => accepted.has(change.classification)) ? 'SAFE TO DEPLOY' : 'BLOCKED';
}

export function isExpectedApiKeyExpiry(change, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (change.resourceType !== 'AWS::AppSync::ApiKey' || change.property !== 'Properties.Expires' || change.changeType !== 'MODIFY') return false;
  if (!Number.isInteger(change.oldValue) || !Number.isInteger(change.newValue) || change.newValue <= change.oldValue) return false;
  const daysAhead = (change.newValue - nowSeconds) / 86400;
  return daysAhead >= 29 && daysAhead <= 31;
}

function normalizedArtifactContent(file, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  if (!file.endsWith('.map')) return bytes.toString('base64');
  try {
    const map = JSON.parse(bytes.toString('utf8'));
    if (Array.isArray(map.sourcesContent)) map.sourcesContent = map.sourcesContent.map((content) => typeof content === 'string' ? content.replaceAll('\r\n', '\n') : content);
    return stableJson(map);
  } catch { return bytes.toString('base64'); }
}

export function compareLambdaArtifactContent(deployedEntries, desiredEntries) {
  const deployedFiles = Object.keys(deployedEntries).sort(), desiredFiles = Object.keys(desiredEntries).sort();
  if (stableJson(deployedFiles) !== stableJson(desiredFiles)) return { equivalent: false, reason: 'archive file lists differ' };
  for (const file of desiredFiles) {
    if (normalizedArtifactContent(file, deployedEntries[file]) !== normalizedArtifactContent(file, desiredEntries[file])) return { equivalent: false, reason: `semantic artifact content differs: ${file}` };
  }
  return { equivalent: true, reason: 'identical executable files and source maps after embedded source EOL normalization' };
}
