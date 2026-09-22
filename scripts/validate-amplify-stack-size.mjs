import { readFileSync, writeFileSync } from 'node:fs';
import { accountAssembly, evaluate, formatReport, baselineDigest } from './lib/cloudformation-accounting.mjs';
const args = process.argv.slice(2), options = {};
let directory;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (!arg.startsWith('--') && !directory) { directory = arg; continue; }
  if (!['--root', '--baseline', '--exception', '--operation', '--json'].includes(arg) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Invalid argument: ${arg}`);
  options[arg.slice(2)] = args[++i];
}
try {
  const report = accountAssembly(directory || '.amplify/artifacts/cdk.out', options.root);
  const bytes = options.baseline ? readFileSync(options.baseline) : undefined;
  const parsed = bytes ? JSON.parse(bytes) : undefined;
  const baseline = parsed?.report || parsed;
  const exception = options.exception ? JSON.parse(readFileSync(options.exception, 'utf8')) : undefined;
  if (exception && (!bytes || baselineDigest(bytes) !== exception.baselineSha256)) throw new Error('Debt allowance baseline SHA256 mismatch');
  if (baseline && baseline.root !== report.root && !exception?.roots?.includes(report.root)) throw new Error('Baseline root does not match selected root');
  const result = evaluate(report, { baseline, exception, operation: options.operation || 'create' });
  console.log(formatReport(report, result));
  if (options.json) writeFileSync(options.json, JSON.stringify({ report, result }, null, 2) + '\n');
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  console.error(`CloudFormation accounting failed closed: ${error.message}`);
  process.exitCode = 1;
}
