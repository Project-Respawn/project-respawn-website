import { execFileSync } from 'node:child_process';
const action = process.argv[2];
if (!['synth', 'diff', 'deploy'].includes(action)) throw new Error('Usage: node scripts/deploy-twitch-runtime-production-iac.mjs <synth|diff|deploy>');
const required = ['TWITCH_RUNTIME_IMAGE_URI', 'TWITCH_RUNTIME_INTEGRATION_ID', 'TWITCH_RUNTIME_SECRET_ARN', 'TWITCH_RUNTIME_HEARTBEAT_TABLE', 'TWITCH_CLIENT_ID', 'TWITCH_RUNTIME_VPC_ID', 'TWITCH_RUNTIME_PUBLIC_SUBNET_IDS'];
const values = Object.fromEntries(required.map((key) => [key, process.env[key] || '']));
for (const [key, value] of Object.entries(values)) if (!value) throw new Error(`${key} is required`);
const serialized = JSON.stringify(values);
if (/Ntgrestage8|staging|alpha|localhost/i.test(serialized)) throw new Error('Refusing non-production identifier in production runtime inputs');
if (!/^058264289478\.dkr\.ecr\.eu-north-1\.amazonaws\.com\/projectrespawn\/twitchruntime@sha256:[a-f0-9]{64}$/.test(values.TWITCH_RUNTIME_IMAGE_URI)) throw new Error('TWITCH_RUNTIME_IMAGE_URI must be the shared repository with an immutable sha256 digest');
if (!/^arn:aws:secretsmanager:eu-north-1:058264289478:secret:projectrespawn\/production\/twitchruntime\//.test(values.TWITCH_RUNTIME_SECRET_ARN)) throw new Error('Production secret ARN namespace is invalid');
if (process.env.TWITCH_RUNTIME_MASTER_API_BASE && process.env.TWITCH_RUNTIME_MASTER_API_BASE !== 'https://g9eoo6e1h2.execute-api.eu-north-1.amazonaws.com') throw new Error('Runtime API override is not the exact MASTER API');
const aws = (args) => JSON.parse(execFileSync('aws', [...args, '--region', 'eu-north-1', '--output', 'json'], { encoding: 'utf8' }));
const identity = aws(['sts', 'get-caller-identity']);
if (identity.Account !== '058264289478') throw new Error(`Refusing non-production account ${identity.Account}`);
const stack = 'ProjectRespawnTwitchRuntimeProduction';
const args = ['node_modules/aws-cdk/bin/cdk', action, stack, '--app', 'npx tsx infrastructure/twitch-runtime/production-app.ts'];
for (const parameter of [
  `ImageUri=${values.TWITCH_RUNTIME_IMAGE_URI}`, `IntegrationId=${values.TWITCH_RUNTIME_INTEGRATION_ID}`, `RuntimeSecretArn=${values.TWITCH_RUNTIME_SECRET_ARN}`,
  `HeartbeatTableName=${values.TWITCH_RUNTIME_HEARTBEAT_TABLE}`, `TwitchClientId=${values.TWITCH_CLIENT_ID}`, `VpcId=${values.TWITCH_RUNTIME_VPC_ID}`, `PublicSubnetIds=${values.TWITCH_RUNTIME_PUBLIC_SUBNET_IDS}`,
]) args.push('--parameters', `${stack}:${parameter}`);
if (action === 'deploy') args.push('--require-approval', 'broadening');
execFileSync(process.execPath, args, { stdio: 'inherit' });
