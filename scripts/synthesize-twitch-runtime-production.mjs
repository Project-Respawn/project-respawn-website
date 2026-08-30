import path from 'node:path';
import { rm, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { App } from 'aws-cdk-lib';
import { tsImport } from 'tsx/esm/api';

const requested = process.argv[2] || path.join('.amplify', 'twitch-runtime-production', 'cdk.out');
const outdir = path.resolve(requested);
if (/ntgrestage8|staging|alpha/i.test(outdir)) throw new Error('Refusing non-production synthesis output path');
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
const module = await tsImport(pathToFileURL(path.resolve('infrastructure/twitch-runtime/twitch-runtime-production-stack.ts')).toString(), import.meta.url);
const app = new App({ outdir });
new module.TwitchRuntimeProductionStack(app, module.PRODUCTION_RUNTIME.stack, {
  env: { account: module.PRODUCTION_RUNTIME.account, region: module.PRODUCTION_RUNTIME.region },
  description: 'Project Respawn production Twitch runtime: one isolated signed-API Fargate worker with canonical delivery disabled',
});
app.synth();
console.log(`Production Twitch runtime synthesized without deployment: ${outdir}`);
