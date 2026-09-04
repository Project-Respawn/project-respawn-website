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
  if (type === 'AWS::IAM::Policy' && top === 'PolicyDocument') return false;
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

export const TEAM_HUB = Object.freeze({
  nestedStacks: Object.freeze({
    amplifyDataPlayerChampionPoolEntryNestedStackPlayerChampionPoolEntryNestedStackResource808D3522: 'PlayerChampionPoolEntry',
    amplifyDataTeamMembershipNestedStackTeamMembershipNestedStackResource7B5D8A56: 'TeamMembership',
    amplifyDataTeamNestedStackTeamNestedStackResource39C028EF: 'Team',
    amplifyDataTeamRosterSlotNestedStackTeamRosterSlotNestedStackResourceAD18E533: 'TeamRosterSlot',
  }),
  operations: Object.freeze(['readTeamHub', 'mutateTeamHub']),
  environment: Object.freeze({
    TEAM_HUB_MEMBERSHIP_TABLE: 'teammembership',
    TEAM_HUB_ROSTER_TABLE: 'teamrosterslot',
    TEAM_HUB_TEAM_TABLE: 'team',
    TEAM_HUB_USER_POOL_ID: 'userpool',
    TEAM_HUB_LOGO_BUCKET: 'storage',
  }),
});

export const TWITCH_RUNTIME = Object.freeze({
  stack: 'function1351588B',
  lambda: 'twitchruntimelambdaE27C0484',
  role: 'twitchruntimelambdaServiceRole1AA84597',
  policy: 'twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50',
  integration: 'HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegration35B744C4',
  permissions: Object.freeze(['HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegrationPermissionB89EA49B', 'HttpApiPOSTtwitchruntimeproxyTwitchRuntimeIntegrationPermissionC9FB5F6E']),
  routes: Object.freeze(['HttpApiGETtwitchruntimeproxy8430636B', 'HttpApiPOSTtwitchruntimeproxy03A28C45']),
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

function addedPolicyStatements(before, after) {
  if (stableJson(before?.Properties?.PolicyName) !== stableJson(after?.Properties?.PolicyName)
    || stableJson(before?.Properties?.Roles) !== stableJson(after?.Properties?.Roles)) return null;
  const remaining = [...(after?.Properties?.PolicyDocument?.Statement || [])];
  for (const statement of before?.Properties?.PolicyDocument?.Statement || []) {
    const index = remaining.findIndex((candidate) => stableJson(candidate) === stableJson(statement));
    if (index < 0) return null;
    remaining.splice(index, 1);
  }
  return remaining;
}

export function isExactCombinedRuntimeIamChange(before, after) {
  const added = addedPolicyStatements(before, after);
  if (!added || added.length !== 7) return false;
  const phase2After = structuredClone(after);
  phase2After.Properties.PolicyDocument.Statement = [
    ...(before?.Properties?.PolicyDocument?.Statement || []),
    ...added.filter((statement) => !exactActions(statement, ['dynamodb:TransactWriteItems']) && !exactActions(statement, ['cognito-idp:ListUsers'])),
  ];
  if (!isExactPhase2IamChange(before, phase2After)) return false;
  const transaction = added.find((statement) => exactActions(statement, ['dynamodb:TransactWriteItems']));
  const listUsers = added.find((statement) => exactActions(statement, ['cognito-idp:ListUsers']));
  const transactionText = resourceText(transaction?.Resource).toLowerCase();
  const userPoolText = resourceText(listUsers?.Resource).toLowerCase();
  return Array.isArray(transaction?.Resource) && transaction.Resource.length === 3
    && ['teamnestedstack', 'teammembershipnestedstack', 'teamrosterslotnestedstack'].every((token) => transactionText.includes(token))
    && userPoolText.includes('userpool')
    && !resourceText([transaction, listUsers]).toLowerCase().match(/ntgrestage8|staging|"resource":"\*"/);
}

export function isExactTeamHubIamChange(before, after) {
  const added = addedPolicyStatements(before, after);
  if (!added || added.length !== 2) return false;
  const transaction = added.find((statement) => exactActions(statement, ['dynamodb:TransactWriteItems']));
  const listUsers = added.find((statement) => exactActions(statement, ['cognito-idp:ListUsers']));
  const transactionText = resourceText(transaction?.Resource).toLowerCase();
  return Array.isArray(transaction?.Resource) && transaction.Resource.length === 3
    && ['teamnestedstack', 'teammembershipnestedstack', 'teamrosterslotnestedstack'].every((token) => transactionText.includes(token))
    && resourceText(listUsers?.Resource).toLowerCase().includes('userpool')
    && !resourceText(added).toLowerCase().match(/ntgrestage8|staging|"resource":"\*"/);
}

export function isExactTeamHubTransactionIamChange(before, after) {
  if (stableJson(before?.Properties?.PolicyName) !== stableJson(after?.Properties?.PolicyName)
    || stableJson(before?.Properties?.Roles) !== stableJson(after?.Properties?.Roles)) return false;
  const oldStatements = before?.Properties?.PolicyDocument?.Statement || [];
  const newStatements = after?.Properties?.PolicyDocument?.Statement || [];
  if (oldStatements.length !== newStatements.length) return false;
  const oldIndex = oldStatements.findIndex((statement) => exactActions(statement, ['dynamodb:TransactWriteItems']));
  const newIndex = newStatements.findIndex((statement) => exactActions(statement, ['dynamodb:PutItem', 'dynamodb:UpdateItem']));
  if (oldIndex < 0 || newIndex < 0 || oldIndex !== newIndex) return false;
  const oldTransaction = oldStatements[oldIndex];
  const newTransaction = newStatements[newIndex];
  const resourceTextValue = resourceText(newTransaction.Resource).toLowerCase();
  if (oldTransaction.Effect !== 'Allow' || newTransaction.Effect !== 'Allow'
    || stableJson(oldTransaction.Resource) !== stableJson(newTransaction.Resource)
    || !Array.isArray(newTransaction.Resource) || newTransaction.Resource.length !== 3
    || !['teamnestedstack', 'teammembershipnestedstack', 'teamrosterslotnestedstack'].every((token) => resourceTextValue.includes(token))
    || resourceTextValue.match(/ntgrestage8|staging|"resource":"\*"/)) return false;
  const restored = structuredClone(after);
  restored.Properties.PolicyDocument.Statement[newIndex] = oldTransaction;
  return stableJson(before) === stableJson(restored);
}

export function isExactTeamLogoIamChange(before, after) {
  const added = addedPolicyStatements(before, after);
  if (!added || added.length !== 1) return false;
  const statement = added[0];
  const resource = resourceText(statement.Resource).toLowerCase();
  return exactActions(statement, ['s3:DeleteObject', 's3:GetObject', 's3:PutObject'])
    && resource.includes('storage') && resource.includes('/team-logos/*')
    && statement.Resource !== '*' && !resource.match(/ntgrestage8|staging/);
}

export function isExactSeparatedDataIamChange(before, after) {
  const normalized = structuredClone(before);
  let removed = 0;
  for (const statement of normalized?.Properties?.PolicyDocument?.Statement || []) {
    if (!exactActions(statement, ['ssm:GetParameters']) || !Array.isArray(statement.Resource)) continue;
    statement.Resource = statement.Resource.filter((resource) => {
      const isRuntimeSecret = resourceText(resource).includes('TWITCH_RUNTIME_AUTH_SECRET');
      if (isRuntimeSecret) removed += 1;
      return !isRuntimeSecret;
    });
  }
  return removed === 2 && isExactTeamHubIamChange(normalized, after);
}

export function isExactTwitchRuntimeTemplate(template) {
  const resources = template?.Resources || {};
  const material = Object.entries(resources).filter(([, resource]) => resource.Type !== 'AWS::CDK::Metadata');
  if (material.length !== 3 || ![TWITCH_RUNTIME.lambda, TWITCH_RUNTIME.role, TWITCH_RUNTIME.policy].every((id) => resources[id])) return false;
  const lambda = resources[TWITCH_RUNTIME.lambda];
  const statements = resources[TWITCH_RUNTIME.policy]?.Properties?.PolicyDocument?.Statement || [];
  const env = lambda?.Properties?.Environment?.Variables || {};
  const body = resourceText(template).toLowerCase();
  const requiredActions = ['kms:Decrypt', 'appsync:GraphQL', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:DeleteItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'execute-api:ManageConnections', 'ssm:GetParameters', 's3:GetObject'];
  const actions = statements.flatMap((statement) => actionList(statement.Action));
  return lambda?.Type === 'AWS::Lambda::Function' && resources[TWITCH_RUNTIME.role].Type === 'AWS::IAM::Role'
    && resources[TWITCH_RUNTIME.policy].Type === 'AWS::IAM::Policy'
    && requiredActions.every((action) => actions.includes(action)) && actions.every((action) => requiredActions.includes(action))
    && !statements.some((statement) => statement.Resource === '*' || actionList(statement.Action).some((action) => action.endsWith(':*')))
    && ['OVERLAY_PUBLICATION_TABLE', 'OVERLAY_CONNECTION_TABLE', 'TWITCH_EVENT_DEDUPE_TABLE', 'OVERLAY_WEBSOCKET_MANAGEMENT_URL', 'TWITCH_RUNTIME_CLIENT_ID', 'TWITCH_RUNTIME_AUTH_SECRET', 'TWITCH_TOKEN_KMS_KEY_ID', 'AMPLIFY_DATA_DEFAULT_NAME', 'AMPLIFY_DATA_GRAPHQL_ENDPOINT', 'AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_BUCKET_NAME', 'AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_KEY'].every((key) => key in env)
    && statements.some((statement) => exactActions(statement, ['s3:GetObject']) && resourceText(statement.Resource).includes('modelIntrospectionSchema.json'))
    && body.includes('/types/query/fields/gettwitchintegration') && body.includes('/types/mutation/fields/updatetwitchintegration')
    && !body.match(/ntgrestage8|staging/);
}

function isExactRuntimeDataBindingIamChange(before, after) {
  const normalized = structuredClone(after);
  const statements = normalized?.Properties?.PolicyDocument?.Statement || [];
  const index = statements.findIndex((statement) => exactActions(statement, ['s3:GetObject'])
    && resourceText(statement.Resource).includes('modelIntrospectionSchema.json')
    && statement.Resource !== '*');
  if (index < 0) return false;
  statements.splice(index, 1);
  return stableJson(normalizeResource(before)) === stableJson(normalizeResource(normalized));
}

export function isExactTeamHubModelTemplate(template, model) {
  const resources = Object.values(template?.Resources || {}).filter((resource) => resource.Type !== 'AWS::CDK::Metadata');
  const counts = resources.reduce((result, resource) => ({ ...result, [resource.Type]: (result[resource.Type] || 0) + 1 }), {});
  const expected = {
    'Custom::AmplifyDynamoDBTable': 1,
    'AWS::IAM::Role': 1,
    'AWS::AppSync::DataSource': 1,
    'AWS::AppSync::FunctionConfiguration': 32,
    'AWS::AppSync::Resolver': 10,
  };
  const body = resourceText(template).toLowerCase();
  return resources.length === 45 && stableJson(counts) === stableJson(expected)
    && body.includes(model.toLowerCase()) && !body.match(/ntgrestage8|staging/);
}

function isExactTeamHubFunctionResource(logicalId, type, resource) {
  const body = `${logicalId} ${resourceText(resource)}`.toLowerCase();
  const operations = TEAM_HUB.operations.filter((operation) => body.includes(operation.toLowerCase()));
  if (operations.length !== 1) return false;
  if (!['AWS::AppSync::DataSource', 'AWS::IAM::Role', 'AWS::IAM::Policy', 'AWS::AppSync::FunctionConfiguration', 'AWS::AppSync::Resolver'].includes(type)) return false;
  if (type === 'AWS::AppSync::Resolver') return TEAM_HUB.operations.includes(resource?.Properties?.FieldName);
  return !body.toLowerCase().match(/ntgrestage8|staging/);
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

function validTeamHubEnvironmentValue(key, value) {
  const text = resourceText(value).toLowerCase();
  return Boolean(TEAM_HUB.environment[key]) && text.includes(TEAM_HUB.environment[key])
    && !text.match(/ntgrestage8|staging/);
}

export function phase2Allowlist({ stack, logicalId, type, property, oldValue, newValue, before, after }) {
  if (logicalId === TWITCH_RUNTIME.stack && type === 'AWS::CloudFormation::Stack' && property === '<resource>') return true;
  if (logicalId === TWITCH_RUNTIME.stack && type === 'AWS::CloudFormation::Stack' && property.startsWith('Properties.Parameters.')) {
    const name = property.split('.').at(-1) || '';
    return ['GraphQLUrl', 'modelIntrospectionSchemaBucket296BD63AArn', 'modelIntrospectionSchemaBucket296BD63ARef'].some((suffix) => name.endsWith(suffix))
      && Array.isArray(newValue?.['Fn::GetAtt']) && newValue['Fn::GetAtt'][0] === 'data7552DF31';
  }
  if (logicalId === 'apistack7B433BC7' && type === 'AWS::CloudFormation::Stack' && property.startsWith('Properties.Parameters.')
    && property.toLowerCase().includes('twitchruntime') && resourceText(newValue).includes(TWITCH_RUNTIME.stack)) return true;
  if (TWITCH_RUNTIME.routes.includes(logicalId) && type === 'AWS::ApiGatewayV2::Route' && property === 'Properties.Target.Fn::Join') return resourceText(newValue).includes(TWITCH_RUNTIME.integration);
  if (logicalId === TWITCH_RUNTIME.integration && type === 'AWS::ApiGatewayV2::Integration' && property === '<resource>') return resourceText(after).toLowerCase().includes('twitchruntime');
  if (TWITCH_RUNTIME.permissions.includes(logicalId) && type === 'AWS::Lambda::Permission' && property === '<resource>') return resourceText(after).toLowerCase().includes('twitchruntime') && resourceText(after).includes('lambda:InvokeFunction');
  if (logicalId === 'amplifyDataGraphQLAPITransformerSchemaFF50A789' && type === 'AWS::AppSync::GraphQLSchema' && property === 'Properties.DefinitionS3Location.Fn::Sub') return true;
  if (['amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsDeploymentCustomResource1536MiB21775929', 'modelIntrospectionSchemaBucketDeploymentCustomResource1536MiB104B97EC'].includes(logicalId)
    && type === 'Custom::CDKBucketDeployment' && property === 'Properties.SourceObjectKeys') return true;
  if (property === '<resource>' && logicalId in TEAM_HUB.nestedStacks && type === 'AWS::CloudFormation::Stack') return true;
  if (property === '<resource>' && stack.toLowerCase().includes('functiondirectivestack') && isExactTeamHubFunctionResource(logicalId, type, after)) return true;
  if (logicalId === PHASE2.dedupeTable && property === '<resource>') return isExactPhase2DedupeTable(after);
  if (logicalId === PHASE2.overlayLambda && type === 'AWS::Lambda::Function') return stack.includes('overlaysourcestackF7F134D8') && property === 'Properties.Code.S3Key';
  if (logicalId === TWITCH_RUNTIME.lambda && type === 'AWS::Lambda::Function') {
    const prefix = 'Properties.Environment.Variables.';
    if (!property.startsWith(prefix) || oldValue !== undefined) return false;
    const key = property.slice(prefix.length);
    const runtimeDataBindings = {
      AMPLIFY_DATA_DEFAULT_NAME: (value) => value === 'amplifyData',
      AMPLIFY_DATA_GRAPHQL_ENDPOINT: (value) => resourceText(value).includes('GraphQLUrl'),
      AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_BUCKET_NAME: (value) => resourceText(value).includes('modelIntrospectionSchemaBucket296BD63ARef'),
      AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_KEY: (value) => value === 'modelIntrospectionSchema.json',
    };
    return key in runtimeDataBindings && runtimeDataBindings[key](newValue);
  }
  if (logicalId === PHASE2.runtimeLambda && type === 'AWS::Lambda::Function') {
    if (property === 'Properties.Code.S3Key') return true;
    const prefix = 'Properties.Environment.Variables.';
    if (property.startsWith(prefix)) {
      const key = property.slice(prefix.length);
      const separatedDataLambda = 'TEAM_HUB_TEAM_TABLE' in (after?.Properties?.Environment?.Variables || {});
      if (key === 'TWITCH_RUNTIME_AUTH_SECRET') return separatedDataLambda && oldValue === '<value will be resolved during runtime>' && newValue === undefined;
      if (key === 'AMPLIFY_SSM_ENV_CONFIG') {
        try {
          const oldConfig = JSON.parse(oldValue), newConfig = JSON.parse(newValue);
          const removed = oldConfig.TWITCH_RUNTIME_AUTH_SECRET;
          delete oldConfig.TWITCH_RUNTIME_AUTH_SECRET;
          return separatedDataLambda && Boolean(removed) && stableJson(oldConfig) === stableJson(newConfig);
        } catch { return false; }
      }
      if (key === 'TWITCH_RUNTIME_CLIENT_ID' && newValue === undefined) return separatedDataLambda && oldValue === PHASE2.runtimeClientIdentity.old;
      if (key === 'TWITCH_RUNTIME_CLIENT_ID') return oldValue === PHASE2.runtimeClientIdentity.old && newValue === PHASE2.runtimeClientIdentity.new;
      if (key in TEAM_HUB.environment) return oldValue === undefined && validTeamHubEnvironmentValue(key, newValue);
      return PHASE2.environment.includes(key) && validEnvironmentValue(key, newValue);
    }
    return false;
  }
  if (logicalId === TWITCH_RUNTIME.policy && type === 'AWS::IAM::Policy' && property === 'Properties.PolicyDocument.Statement') return isExactRuntimeDataBindingIamChange(before, after);
  if (logicalId === PHASE2.runtimePolicy && type === 'AWS::IAM::Policy' && property === 'Properties.PolicyDocument.Statement') return isExactPhase2IamChange(before, after) || isExactCombinedRuntimeIamChange(before, after) || isExactTeamHubIamChange(before, after) || isExactSeparatedDataIamChange(before, after) || isExactTeamHubTransactionIamChange(before, after) || isExactTeamLogoIamChange(before, after);
  if (type === 'AWS::CloudFormation::Stack' && logicalId === 'data7552DF31' && property.startsWith('Properties.Parameters.')) {
    const suffix = PHASE2.references.find((candidate) => property.toLowerCase().includes(candidate.toLowerCase()));
    const getAtt = newValue?.['Fn::GetAtt'];
    if (!suffix) return property.toLowerCase().includes('userpool') && resourceText(newValue).toLowerCase().includes('auth')
      && resourceText(newValue).toLowerCase().includes('userpool') && !resourceText(newValue).toLowerCase().match(/ntgrestage8|staging/);
    return Array.isArray(getAtt) && getAtt.length === 2 && getAtt[0] === 'overlaysourcestackF7F134D8'
      && typeof getAtt[1] === 'string' && getAtt[1].startsWith('Outputs.') && getAtt[1].endsWith(suffix)
      && !resourceText(newValue).toLowerCase().match(/ntgrestage8|staging/);
  }
  return false;
}

export function validatePhase2ChangeSet(changes) {
  const material = changes.filter((c) => c.changeType !== 'METADATA-ONLY');
  const accepted = new Set(['APPROVED', 'EXPECTED GENERATED CHURN', 'EXPECTED OPERATIONAL REFRESH']);
  if (material.length && material.every((change) => accepted.has(change.classification))
    && !material.some((change) => ['ADD', 'REMOVE'].includes(change.changeType) || change.replacementRisk === true || change.replacementRisk === 'UNKNOWN')) return [];
  const bindingKeys = material.filter((c) => c.logicalId === TWITCH_RUNTIME.lambda && c.property.startsWith('Properties.Environment.Variables.AMPLIFY_DATA_'));
  if (bindingKeys.length === 4 && material.every((change) => ['APPROVED', 'EXPECTED GENERATED CHURN', 'EXPECTED OPERATIONAL REFRESH'].includes(change.classification))) return [];
  const errors = [];
  const added = material.filter((c) => c.changeType === 'ADD');
  const separated = added.some((change) => change.logicalId === TWITCH_RUNTIME.stack && change.classification === 'APPROVED');
  const nonFunctionAdds = added.filter((change) => !String(change.stack || '').toLowerCase().includes('functiondirectivestack'));
  if (!nonFunctionAdds.some((change) => change.logicalId === PHASE2.dedupeTable && change.classification === 'APPROVED')) errors.push('Phase 2A requires the reviewed dedupe table addition');
  if (nonFunctionAdds.some((change) => change.classification !== 'APPROVED')) errors.push('Only reviewed Phase 2A, Team Hub, and separated runtime resources may be added');
  const env = material.filter((c) => c.logicalId === PHASE2.runtimeLambda && c.property.startsWith('Properties.Environment.Variables.'));
  const additions = env.filter((c) => c.oldValue === undefined && PHASE2.environment.includes(c.property.split('.').at(-1)));
  const additionKeys = additions.map((c) => c.property.split('.').at(-1)).sort();
  const identity = env.filter((c) => c.property.endsWith('.TWITCH_RUNTIME_CLIENT_ID'));
  if (!separated && stableJson(additionKeys) !== stableJson(PHASE2.environment)) errors.push('Phase 2A requires exactly four new reviewed runtime environment values');
  if (!separated && (identity.length !== 1 || identity[0].oldValue !== PHASE2.runtimeClientIdentity.old || identity[0].newValue !== PHASE2.runtimeClientIdentity.new || identity[0].classification !== 'APPROVED')) errors.push('Phase 2A requires exactly the reviewed production runtime client identity change');
  const permittedEnvironment = new Set([...PHASE2.environment, ...Object.keys(TEAM_HUB.environment), 'TWITCH_RUNTIME_CLIENT_ID', 'TWITCH_RUNTIME_AUTH_SECRET', 'AMPLIFY_SSM_ENV_CONFIG']);
  if (env.some((change) => !permittedEnvironment.has(change.property.split('.').at(-1)))) errors.push('No unreviewed runtime environment changes are permitted');
  const refs = material.filter((c) => c.resourceType === 'AWS::CloudFormation::Stack' && c.logicalId === 'data7552DF31' && c.property.startsWith('Properties.Parameters.'));
  if (!separated && (![7, 8].includes(refs.length) || !PHASE2.references.every((suffix) => refs.some((c) => c.property.toLowerCase().includes(suffix.toLowerCase()))))) errors.push('Phase 2A requires its seven reviewed cross-stack references and at most the Team Hub user-pool reference');
  const requiredChanges = separated ? [PHASE2.runtimeLambda, PHASE2.runtimePolicy, PHASE2.overlayLambda, TWITCH_RUNTIME.stack] : [PHASE2.runtimeLambda, PHASE2.runtimePolicy, PHASE2.overlayLambda];
  for (const required of requiredChanges) if (!material.some((c) => c.logicalId === required && c.classification === 'APPROVED')) errors.push(`Missing reviewed Phase 2A change for ${required}`);
  return errors;
}

export function validateTeamHubChangeSet(changes) {
  const material = changes.filter((change) => change.changeType !== 'METADATA-ONLY');
  if (!material.some((change) => change.changeType === 'ADD' && (change.logicalId in TEAM_HUB.nestedStacks || change.stack.toLowerCase().includes('functiondirectivestack')))) return [];
  const errors = [];
  const nested = material.filter((change) => change.changeType === 'ADD' && change.logicalId in TEAM_HUB.nestedStacks);
  if (nested.length !== 4 || nested.some((change) => change.classification !== 'APPROVED')) errors.push('Team Hub requires exactly four reviewed model nested-stack additions');
  const functions = material.filter((change) => change.changeType === 'ADD' && change.stack.toLowerCase().includes('functiondirectivestack'));
  const typeCounts = functions.reduce((result, change) => ({ ...result, [change.resourceType]: (result[change.resourceType] || 0) + 1 }), {});
  const expectedCounts = { 'AWS::AppSync::DataSource': 2, 'AWS::IAM::Role': 2, 'AWS::IAM::Policy': 2, 'AWS::AppSync::FunctionConfiguration': 4, 'AWS::AppSync::Resolver': 2 };
  if (functions.length !== 12 || stableJson(typeCounts) !== stableJson(expectedCounts) || functions.some((change) => change.classification !== 'APPROVED')) errors.push('Team Hub requires exactly the two reviewed gateway operation resource sets');
  const env = material.filter((change) => change.logicalId === PHASE2.runtimeLambda && change.property.startsWith('Properties.Environment.Variables.') && change.oldValue === undefined);
  for (const key of Object.keys(TEAM_HUB.environment)) if (!env.some((change) => change.property.endsWith(`.${key}`) && change.classification === 'APPROVED')) errors.push(`Missing reviewed Team Hub environment value ${key}`);
  if (material.some((change) => change.changeType === 'REMOVE' || change.replacementRisk === true || change.replacementRisk === 'UNKNOWN')) errors.push('Team Hub deployment may not remove or replace resources');
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
