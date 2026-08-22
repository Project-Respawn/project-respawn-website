import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const action = process.argv[2];
if (!['diff', 'deploy'].includes(action)) throw new Error('Usage: node scripts/deploy-twitch-runtime-staging-iac.mjs <diff|deploy>');

function aws(args) {
  return JSON.parse(execFileSync('aws', [...args, '--region', 'eu-north-1', '--output', 'json'], { encoding: 'utf8' }));
}

const identity = aws(['sts', 'get-caller-identity']);
if (identity.Account !== '058264289478') throw new Error(`Refusing non-staging account ${identity.Account}`);

const outputs = JSON.parse(readFileSync('amplify_outputs.json', 'utf8'));
const graphqlUrl = outputs?.data?.url;
const apis = aws(['appsync', 'list-graphql-apis']).graphqlApis.filter((api) => api.uris?.GRAPHQL === graphqlUrl);
if (apis.length !== 1) throw new Error(`Expected the validated Ntgrestage8 AppSync endpoint to resolve once, found ${apis.length}`);
const expectedTable = `TwitchRuntimeHealth-${apis[0].apiId}-NONE`;
const tables = aws(['dynamodb', 'list-tables']).TableNames.filter((name) => name === expectedTable);
if (tables.length !== 1) throw new Error(`Ntgrestage8 heartbeat table ${expectedTable} was not found`);

const args = [
  'node_modules/aws-cdk/bin/cdk', action, 'ProjectRespawnTwitchRuntimeStaging',
  '--app', 'npx tsx infrastructure/twitch-runtime/app.ts',
];
if (action === 'deploy') {
  args.push('--parameters', `HeartbeatTableName=${tables[0]}`);
  args.push('--parameters', 'ManageRuntimeResources=false');
  args.push('--require-approval', 'never');
}
execFileSync(process.execPath, args, { stdio: 'inherit' });
