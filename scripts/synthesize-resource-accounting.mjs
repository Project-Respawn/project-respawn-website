import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tsImport } from 'tsx/esm/api';
import { CloudAssembly } from 'aws-cdk-lib/cx-api';
import { MemoryContext, StackSelectionStrategy, Toolkit } from '@aws-cdk/toolkit-lib';
import { CDKContextKey } from '@aws-amplify/platform-core';

// Synthesis only. A new directory avoids deleting artifacts or altering outputs.
const branch = process.env.AWS_BRANCH || 'master';
const appId = process.env.AWS_APP_ID || 'd2cux232bpa951';
if (!/^[A-Za-z0-9_-]+$/.test(branch) || !/^d[a-z0-9]+$/.test(appId)) throw new Error('Invalid explicit Amplify branch/app identity');
const requested = process.argv[2];
if (!requested) throw new Error('Provide an unused local synthesis directory');
const outdir = path.resolve(requested), base = path.resolve('.amplify');
const rel = path.relative(base, outdir);
if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Accounting synth must use a child directory of .amplify');
await mkdir(outdir, { recursive: false });
process.env.AWS_BRANCH = branch;
const toolkit = new Toolkit({ ioHost: { notify: async () => undefined, requestResponse: async () => undefined }, emojis: false, color: false });
const context = new MemoryContext({ [CDKContextKey.BACKEND_NAMESPACE]: appId, [CDKContextKey.BACKEND_NAME]: branch, [CDKContextKey.DEPLOYMENT_TYPE]: 'branch' });
const source = await toolkit.fromAssemblyBuilder(async () => {
  await tsImport(pathToFileURL(path.resolve('amplify/backend.ts')).toString(), import.meta.url);
  process.emit('message', 'amplifySynth', undefined);
  return new CloudAssembly(outdir);
}, { contextStore: context, outdir });
await toolkit.synth(source, { stacks: { strategy: StackSelectionStrategy.ALL_STACKS } });
console.log(`SYNTHESIS ONLY: ${appId}/${branch} -> ${outdir}`);
