import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { accountAssembly, evaluate } from './cloudformation-accounting.mjs';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function treeDigest(directory) {
  const entries = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Assembly symlinks are not permitted');
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile()) entries.push([path.relative(directory, file).replaceAll('\\', '/'), sha256(fs.readFileSync(file))]);
      else throw new Error('Unsupported assembly entry');
    }
  }
  walk(directory);
  return sha256(JSON.stringify(entries));
}

// No caller-supplied PASS flags: verify source bytes, entire assemblies (including
// assets), and the exact accepted action evidence before granting local debt.
export function verifyPinnedUpdate({ allowance, candidateDirectory, baselineAssembly, candidateAssembly,
  manifestPath, evidenceDirectory, account, region, environment, operation = 'update', now = new Date() }) {
  const fail = message => { throw new Error(message); };
  if (allowance.kind !== 'pinned-phase1-update') fail('Unsupported allowance kind');
  if (account !== allowance.account || region !== allowance.region || environment !== allowance.environment) fail('Target account/region/environment mismatch');
  if (operation !== 'update') fail('Fresh creation is blocked');
  if (!(now >= new Date(allowance.issuedAt) && now < new Date(allowance.expiresAt))) fail('Allowance expired or not yet valid');
  if (new Date(allowance.expiresAt) - new Date(allowance.issuedAt) > 14 * 86400000) fail('Allowance exceeds 14 days');
  const bytes = fs.readFileSync(manifestPath);
  if (sha256(bytes) !== allowance.candidateManifestSha256) fail('Candidate manifest mismatch');
  const manifest = JSON.parse(bytes);
  if (manifest.files.length !== allowance.sourceFiles) fail('Source file count mismatch');
  const root = fs.realpathSync(candidateDirectory);
  for (const entry of manifest.files) {
    const file = fs.realpathSync(path.resolve(root, entry.file));
    const rel = path.relative(root, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) fail('Source path escapes candidate');
    if (sha256(fs.readFileSync(file)) !== entry.sha256) fail(`Candidate source mismatch: ${entry.file}`);
  }
  if (treeDigest(baselineAssembly) !== allowance.baselineAssemblySha256) fail('Baseline assembly mismatch');
  if (treeDigest(candidateAssembly) !== allowance.candidateAssemblySha256) fail('Candidate assembly mismatch (unreviewed infrastructure/assets)');
  for (const [file, digest] of Object.entries(allowance.evidence)) {
    if (sha256(fs.readFileSync(path.join(evidenceDirectory, file))) !== digest) fail(`Accepted evidence mismatch: ${file}`);
  }
  const diff = JSON.parse(fs.readFileSync(path.join(evidenceDirectory, 'live-to-candidate.json')));
  const actions = diff.summary.actions;
  if (actions.ADD !== 0 || actions.MODIFY !== 81 || actions.DELETE !== 308 || (actions.REPLACE || 0) !== 0) fail('Action shape mismatch');
  const baseline = accountAssembly(baselineAssembly), report = accountAssembly(candidateAssembly);
  if (baseline.root !== allowance.roots[0] || report.root !== allowance.roots[0] || allowance.roots.length !== 1) fail('Root mismatch');
  if (baseline.total !== 2929 || allowance.baselineTotal !== 2929) fail('Baseline total mismatch');
  if (report.total > allowance.maximumCandidateTotal || allowance.maximumCandidateTotal !== 2621) fail('Candidate hierarchy ceiling exceeded');
  if (report.contributors.FunctionDirectiveStack !== 167) fail('FunctionDirectiveStack must contain 167 resources');
  const oldPaths = new Set(baseline.stacks.map(s => s.path));
  if (report.stacks.some(s => !oldPaths.has(s.path))) fail('Additional stacks forbidden');
  // The generic evaluator rejects this allowance type unless this verifier has
  // established its stronger constraints. Existing budgets/evaluation stay intact.
  const { kind, ...verifiedException } = allowance;
  const result = evaluate(report, { baseline, exception: verifiedException, operation, now });
  return { report, result, sourceFiles: manifest.files.length, freshCreate: 'BLOCKED',
    liveVerification: 'NOT PERFORMED: offline accounting approval only; fresh AWS checks mandatory',
    decision: result.passed ? 'PASS WITH APPROVED EXISTING DEBT — NOT DEPLOYMENT AUTHORIZATION' : 'BLOCKED' };
}
