import { App } from 'aws-cdk-lib';
import { PRODUCTION_RUNTIME, TwitchRuntimeProductionStack } from './twitch-runtime-production-stack.js';
const app = new App();
new TwitchRuntimeProductionStack(app, PRODUCTION_RUNTIME.stack, { env: { account: PRODUCTION_RUNTIME.account, region: PRODUCTION_RUNTIME.region }, description: 'Project Respawn production Twitch runtime: one isolated signed-API Fargate worker with canonical delivery disabled' });
