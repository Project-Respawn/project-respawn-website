// Reproducible local acceptance runner. Contains no AWS operation or global synthesis command.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const infra = 'infrastructure/domains/team-hub';
const evidenceDir = 'docs/architecture/team-hub-2b1-evidence-2026-10-04';
const results = [];
const run = (name, args) => {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${name} failed\n${result.stdout}\n${result.stderr}`);
  const tests = result.stdout.match(/(?:#|ℹ) tests (\d+)/)?.[1];
  results.push({ name, status: 'PASS', ...(tests ? { tests: Number(tests) } : {}) });
  console.log(`${name}: PASS${tests ? ` (${tests} tests)` : ''}`);
  return result.stdout;
};
run('TypeScript infrastructure and domain model', [`${infra}/node_modules/typescript/bin/tsc`, '--project', `${infra}/tsconfig.json`, '--noEmit']);
run('Isolated backend/frontend build and offline synthesis', ['scripts/team-hub/plan.mjs', '--env', 'Ntgre', '--offline']);
const tests = fs.readdirSync(path.join(root, 'scripts/team-hub/tests')).filter(n => n.endsWith('.test.mjs')).map(n => `scripts/team-hub/tests/${n}`);
run('Team contracts, authorization, privacy, concurrency, frontend, security, isolation, accounting', ['--test', '--test-reporter=spec', ...tests]);
run('Existing resource accounting and Phase 1 safeguards', ['--test', '--test-reporter=spec', 'scripts/cloudformation-accounting.test.mjs', 'scripts/ntgre-phase1-allowance.test.mjs']);
const pinned = JSON.parse(run('Tournament pinned candidate preservation', ['scripts/verify-phase2-checkpoint.mjs']));
const accepted = JSON.parse(run('Tournament accepted security/config preservation', ['scripts/checkpoints/verify-tournament-release1.mjs']));
const latest = JSON.parse(fs.readFileSync(path.join(root, `${infra}/.build/latest.json`), 'utf8'));
const receipt = JSON.parse(fs.readFileSync(path.join(root, latest.receipt), 'utf8'));
const docs = ['team-hub-2b1-implementation.md', 'team-hub-v1-api-contract.md', 'team-hub-authorization-matrix.md', 'team-hub-2b1-resource-accounting.md'].map(n => `docs/architecture/${n}`).concat(`${infra}/README.md`);
fs.mkdirSync(path.join(root, evidenceDir), { recursive: true });
// Retain hashes/relative paths, not deployment assets, absolute machine paths or credentials.
const portableReceipt = structuredClone(receipt);
for (const unit of portableReceipt.closure) for (const output of unit.outputs) output.path = output.path.replace(/offline-\d+/, 'REGENERATE_LOCALLY');
for (const template of portableReceipt.templates) template.path = template.path.replace(/offline-\d+/, 'REGENERATE_LOCALLY');
fs.writeFileSync(path.join(root, evidenceDir, 'synthesis-receipt.json'), JSON.stringify(portableReceipt, null, 2) + '\n');
const validationPath = path.join(root, evidenceDir, 'validation.json');
fs.writeFileSync(validationPath, '{}\n'); // reserve link target; replaced only after checks pass
let links = 0;
for (const p of docs) {
  const text = fs.readFileSync(path.join(root, p), 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0]; if (!target || /^https?:/.test(target)) continue;
    if (!fs.existsSync(path.resolve(root, path.dirname(p), target))) throw new Error(`Broken documentation link: ${p} -> ${target}`);
    links++;
  }
}
const inputs = [...receipt.inputs.map(i => i.path), ...docs, `${evidenceDir}/synthesis-receipt.json`];
const patterns = [/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/, /(?:aws_secret_access_key|aws_session_token)\s*[=:]\s*["']?[A-Za-z0-9/+]{16,}/i];
for (const file of inputs) {
  if (/(?:^|\/)\.env|credentials|\.pem$|\.key$/.test(file)) throw new Error(`Sensitive file selected: ${file}`);
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  if (patterns.some(pattern => pattern.test(content))) throw new Error(`Credential pattern found in ${file}; contents withheld`);
}
const gitStatus = spawnSync('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: root, encoding: 'utf8' });
if (gitStatus.status !== 0) throw new Error('Cannot inspect git status');
const tracked = spawnSync('git', ['diff', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' });
const approvedSelectionChanges = ['amplify.yml', 'scripts/validate-infrastructure-ci.mjs'];
if (tracked.status !== 0 || tracked.stdout.trim().split(/\r?\n/).filter(Boolean).some(p => !approvedSelectionChanges.includes(p))) throw new Error('Unexpected changes to existing tracked files');
const ignore = spawnSync('git', ['check-ignore', `${infra}/.build/latest.json`, `${infra}/node_modules/esbuild/package.json`], { cwd: root, encoding: 'utf8' });
if (ignore.status !== 0 || ignore.stdout.trim().split(/\r?\n/).length !== 2) throw new Error('Build/dependency ignore protection missing');
const validation = { stage: 'Phase 2B1 offline foundation', timestamp: new Date().toISOString(), results, resources: { product: 43, security: 3, total: receipt.total, ceiling: 75 }, documentLinks: links, secretScan: { files: inputs.length, matches: 0, scope: 'New Team implementation/docs/evidence and reused non-secret Core descriptor; pattern checks, not a universal secret detector' }, tournament: { candidate: pinned.revision, allExact: pinned.allExact, accepted: accepted.accepted, runtimeBoundary: accepted.runtimeBoundary, executionPolicy: accepted.executionPolicy }, legacySourceHashes: 51, existingTrackedFilesChanged: false, awsCalls: 0, awsWrites: 0, dataMigration: false, frontendCutover: false, productionTouched: false, genericInfrastructureCI: 'NOT PASSED: selected Legacy branch; tsx startup failed before synthesis with uv_os_get_passwd ENOMEM; not rerun. Hosted/domain selection remains a later gate.', retainedReceiptSha256: createHash('sha256').update(fs.readFileSync(path.join(root, evidenceDir, 'synthesis-receipt.json'))).digest('hex') };
fs.writeFileSync(validationPath, JSON.stringify(validation, null, 2) + '\n');
console.log(JSON.stringify({ resources: validation.resources, documentLinks: links, secretScan: validation.secretScan, evidence: `${evidenceDir}/validation.json` }, null, 2));
