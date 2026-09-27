import fs from 'node:fs';
import { verifyPinnedUpdate } from './lib/pinned-update-allowance.mjs';
const [candidateDirectory, baselineAssembly, candidateAssembly] = process.argv.slice(2);
if (!candidateAssembly) throw new Error('Usage: node scripts/validate-ntgre-phase1-allowance.mjs CANDIDATE_SOURCE BASELINE_ASSEMBLY CANDIDATE_ASSEMBLY');
const result = verifyPinnedUpdate({
  allowance: JSON.parse(fs.readFileSync('scripts/config/ntgre-phase1-resource-debt.json')),
  candidateDirectory, baselineAssembly, candidateAssembly,
  manifestPath: 'docs/architecture/phase1-reproducibility-evidence/candidate-manifest.json',
  evidenceDirectory: 'docs/architecture/phase1-ntgre-artifact-evidence',
  account: '058264289478', region: 'eu-north-1', environment: 'Ntgre',
});
console.log(JSON.stringify(result, null, 2));
if (!result.result.passed) process.exitCode = 1;
