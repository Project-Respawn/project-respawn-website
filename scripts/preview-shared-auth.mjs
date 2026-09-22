import path from 'node:path';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { tsImport } from 'tsx/esm/api';
import { CloudAssembly } from 'aws-cdk-lib/cx-api';
import { MemoryContext, StackSelectionStrategy, Toolkit } from '@aws-cdk/toolkit-lib';
import { CDKContextKey } from '@aws-amplify/platform-core';

// Synthesis only: no deployments, change sets, output-file replacement or cleanup.
const branch = process.argv[2] || 'staging';
const mode = process.argv[3] || 'shared';
if (!['staging', 'Demo', 'master'].includes(branch)) throw new Error('Preview expects an existing hosted branch: staging, Demo or master.');
if (!['managed', 'shared'].includes(mode)) throw new Error('Preview mode must be managed or shared.');
if (branch === 'master' && mode === 'shared') throw new Error('master must retain ownership of auth.');
process.env.AWS_BRANCH = branch;
process.env.RESPAWN_AUTH_MODE = mode;
process.env.CDK_DEFAULT_ACCOUNT = '058264289478';
process.env.CDK_DEFAULT_REGION = 'eu-north-1';
const outdir = path.resolve('.amplify', 'shared-auth-preview', `${branch}-${mode}-${Date.now()}`);
await mkdir(outdir, { recursive: true });

const toolkit = new Toolkit({
  ioHost: { notify: async () => undefined, requestResponse: async () => undefined },
  emojis: false, color: false,
});
const context = new MemoryContext({
  [CDKContextKey.BACKEND_NAMESPACE]: 'd2cux232bpa951',
  [CDKContextKey.BACKEND_NAME]: branch,
  [CDKContextKey.DEPLOYMENT_TYPE]: 'branch',
});
const source = await toolkit.fromAssemblyBuilder(async () => {
  await tsImport(pathToFileURL(path.resolve('amplify', 'backend.ts')).toString(), import.meta.url);
  process.emit('message', 'amplifySynth', undefined);
  return new CloudAssembly(outdir);
}, { contextStore: context, outdir });
await toolkit.synth(source, { stacks: { strategy: StackSelectionStrategy.ALL_STACKS } });
const counts = {};
for (const name of await readdir(outdir)) {
  if (!name.endsWith('.template.json')) continue;
  const template = JSON.parse(await readFile(path.join(outdir, name), 'utf8'));
  for (const resource of Object.values(template.Resources || {})) {
    counts[resource.Type] = (counts[resource.Type] || 0) + 1;
  }
}
if (mode === 'shared' && (counts['AWS::Cognito::UserPool'] || counts['AWS::Cognito::IdentityPool'])) {
  throw new Error('Shared-auth preview unexpectedly creates a Cognito pool.');
}
if (mode === 'shared' && counts['Custom::AmplifyRefAuth'] !== 1) {
  throw new Error('Shared-auth preview must reference exactly one existing auth configuration.');
}
console.log(JSON.stringify({ branch, mode, outdir, resourceCounts: counts }, null, 2));
console.log('Synthesis only. No infrastructure was deployed. Review deployed resource retention before enabling shared mode.');
