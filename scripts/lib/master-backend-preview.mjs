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

function replacementRisk(type, property) {
  if (property === '<resource>') return true;
  const top = property.replace(/^Properties\./, '').split('.')[0];
  if (REPLACEMENT_PROPERTIES[type]?.has(top)) return true;
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
    if (!before) { changes.push({ ...base, changeType: 'ADD', property: '<resource>', oldValue: undefined, newValue: normalizeResource(after), replacementRisk: false, classification: 'DANGEROUS' }); continue; }
    if (!after) { changes.push({ ...base, changeType: 'REMOVE', property: '<resource>', oldValue: normalizeResource(before), newValue: undefined, replacementRisk: true, classification: 'DANGEROUS' }); continue; }
    const rawSame = stableJson(before) === stableJson(after);
    const semanticBefore = normalizeResource(before), semanticAfter = normalizeResource(after);
    if (stableJson(semanticBefore) === stableJson(semanticAfter)) {
      if (!rawSame) changes.push({ ...base, changeType: 'METADATA-ONLY', property: 'Metadata/TemplateURL', oldValue: '<generated>', newValue: '<generated>', replacementRisk: false, classification: 'APPROVED' });
      continue;
    }
    for (const difference of walk(semanticBefore, semanticAfter)) {
      const isLambdaCode = type === 'AWS::Lambda::Function' && difference.property.startsWith('Properties.Code');
      const approved = allowlist?.({ stack, logicalId, type, property: difference.property }) === true;
      const risk = replacementRisk(type, difference.property);
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
