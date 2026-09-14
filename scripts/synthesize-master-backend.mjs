import process from 'node:process';
import path from 'node:path';
import { rm, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tsImport } from 'tsx/esm/api';
import { AssetStaging } from 'aws-cdk-lib/core';
import { CloudAssembly } from 'aws-cdk-lib/cx-api';
import { MemoryContext, StackSelectionStrategy, Toolkit } from '@aws-cdk/toolkit-lib';
import { CDKContextKey } from '@aws-amplify/platform-core';
import { MASTER } from './lib/master-backend-preview.mjs';

const requested = process.argv[2] || path.join('.amplify', 'master-preview', 'cdk.out');
const outdir = path.resolve(requested);
if (process.env.AWS_BRANCH && process.env.AWS_BRANCH !== MASTER.branch) throw new Error(`Refusing non-MASTER AWS_BRANCH ${process.env.AWS_BRANCH}`);
if (outdir.toLowerCase().includes('ntgrestage8')) throw new Error('Refusing sandbox-named synthesis output');
process.env.AWS_BRANCH = MASTER.branch;
process.env.CDK_DEFAULT_ACCOUNT = MASTER.account;
process.env.CDK_DEFAULT_REGION = MASTER.region;
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
AssetStaging.clearAssetHashCache();

const ioHost = { notify: async () => undefined, requestResponse: async () => undefined };
const toolkit = new Toolkit({ ioHost, emojis: false, color: false });
const context = new MemoryContext({
  [CDKContextKey.BACKEND_NAMESPACE]: MASTER.appId,
  [CDKContextKey.BACKEND_NAME]: MASTER.branch,
  [CDKContextKey.DEPLOYMENT_TYPE]: 'branch',
});
const source = await toolkit.fromAssemblyBuilder(async () => {
  await tsImport(pathToFileURL(path.resolve('amplify', 'backend.ts')).toString(), import.meta.url);
  process.emit('message', 'amplifySynth', undefined);
  return new CloudAssembly(outdir);
}, { contextStore: context, outdir });
await toolkit.synth(source, { stacks: { strategy: StackSelectionStrategy.ALL_STACKS } });
console.log(`MASTER backend synthesized without deployment: ${outdir}`);
