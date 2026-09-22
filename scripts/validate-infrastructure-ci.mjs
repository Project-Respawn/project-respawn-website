import { readFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { infrastructureInputs } from './lib/infrastructure-inputs.mjs';
import { baselineDigest } from './lib/cloudformation-accounting.mjs';

const baselinePath = 'scripts/config/legacy-resource-baseline.json';
const exceptionPath = 'scripts/config/legacy-resource-debt.json';
const baselineBytes = readFileSync(baselinePath), baseline = JSON.parse(baselineBytes), debt = JSON.parse(readFileSync(exceptionPath));
if (baselineDigest(baselineBytes) !== debt.baselineSha256) throw new Error('Pinned resource baseline receipt mismatch');
const inputs = infrastructureInputs();
const branch = process.env.AWS_BRANCH || 'master';
const appId = process.env.AWS_APP_ID || 'd2cux232bpa951';
const contextMatches = debt.scope.appId === appId && debt.scope.branches.includes(branch) && (process.env.RESPAWN_AUTH_MODE || 'managed') === debt.scope.authMode;
if (inputs.sha256 === baseline.inputs.sha256 && contextMatches && !process.argv.includes('--force') && process.env.RESOURCE_ACCOUNTING_FORCE !== '1') {
  console.log(`Infrastructure inputs match reviewed baseline; no synthesis needed for frontend-only changes. LegacyPlatform ${baseline.report.total}, largest ${baseline.report.largest}; ${baseline.report.hierarchyState}. Existing debt remains; this is not fresh-create safety or deployment approval.`);
} else {
  const old = new Map(baseline.inputs.entries.map(e => [e.file,e.sha256]));
  console.log('Infrastructure changes:', inputs.entries.filter(e => old.get(e.file)!==e.sha256).map(e=>e.file).join(', ') || 'removed inputs');
  mkdirSync('.amplify', { recursive: true });
  const directory = `.amplify/resource-ci-${Date.now()}`;
  const run = args => {
    const r = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
    if (r.error) throw r.error;
    if (r.status !== 0) process.exit(r.status || 1);
  };
  run(['scripts/synthesize-resource-accounting.mjs', directory]);
  run(['scripts/validate-amplify-stack-size.mjs', directory, '--baseline', baselinePath, '--exception', exceptionPath, '--operation', 'update', '--json', `${directory}/resource-report.json`]);
}
