import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const domainDir = path.join(root, 'infrastructure/domains/tournaments');
export const buildDir = path.join(domainDir, '.build');
export const stackName = 'ProjectRespawn-Tournaments-Ntgre';
export const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
export const sha = data => crypto.createHash('sha256').update(data).digest('hex');
export const fileSha = p => sha(fs.readFileSync(p));
export const relative = p => path.relative(root, path.resolve(p)).replaceAll('\\', '/');
export const write = (p, data) => {fs.mkdirSync(path.dirname(p), {recursive: true}); fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');};
export const pinPath = path.join(root, 'scripts/config/domain-build-inputs.json');
export const corePath = path.join(root, 'config/environments/Ntgre.core.json');
export function target(args) {
  if (JSON.stringify(args) !== JSON.stringify(['tournaments', '--env', 'Ntgre'])) throw Error('Only: tournaments --env Ntgre; no stack/account overrides or execution flags');
  if (process.env.CDK_DEFAULT_ACCOUNT && process.env.CDK_DEFAULT_ACCOUNT !== '058264289478' || process.env.CDK_DEFAULT_REGION && process.env.CDK_DEFAULT_REGION !== 'eu-north-1' || process.env.AWS_REGION && process.env.AWS_REGION !== 'eu-north-1' || process.env.AWS_DEFAULT_REGION && process.env.AWS_DEFAULT_REGION !== 'eu-north-1') throw Error('Conflicting AWS target environment');
  return validateCore(read(corePath));
}
export function validateCore(core, expectedHash = read(pinPath).coreSha256, bytes = fs.readFileSync(corePath)) {
  if (core.account !== '058264289478') throw Error('Wrong account');
  if (core.region !== 'eu-north-1') throw Error('Wrong region');
  if (core.environment !== 'Ntgre') throw Error('Wrong environment; production forbidden');
  if (core.contractVersion !== 'environment.v1' || core.issuer !== `https://cognito-idp.eu-north-1.amazonaws.com/${core.poolId}` || !/^eu-north-1_[a-zA-Z0-9]+$/.test(core.poolId) || !/^[a-z0-9]{26}$/.test(core.clientId)) throw Error('Wrong Cognito contract');
  const p = core.provenance;
  if (!p || p.source !== 'amplify_outputs.json' || !/^[a-f0-9]{64}$/.test(p.sourceSha256) || !p.legacyRootArn?.startsWith('arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332/') || !p.authStackArn?.startsWith('arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-auth') || !p.verifiedBy?.startsWith('arn:aws:iam::058264289478:') || !Number.isFinite(Date.parse(p.verifiedAt))) throw Error('Wrong Cognito provenance');
  // Compare both the object and exact approved bytes; callers cannot validate a substituted object against trusted bytes.
  if (JSON.stringify(core) !== JSON.stringify(JSON.parse(bytes.toString())) || sha(bytes) !== expectedHash) throw Error('Core identity differs from reviewed provenance pin');
  return core;
}
export function isolatedRequire() {
  if (!fs.existsSync(path.join(domainDir, 'node_modules/esbuild/package.json'))) throw Error('Install the isolated Tournament package first');
  const req = createRequire(path.join(domainDir, 'package.json'));
  for (const name of ['esbuild', 'aws-cdk-lib', 'constructs', 'typescript', 'ajv']) if (!req.resolve(name).startsWith(path.join(domainDir, 'node_modules') + path.sep)) throw Error(`Dependency escaped isolated package: ${name}`);
  return req;
}
export function sourceAllowed(p) {
  return /^(infrastructure\/domains\/tournaments\/|domains\/tournaments\/|scripts\/domains\/)/.test(p) || ['scripts/config/domain-build-inputs.json', 'config/environments/Ntgre.core.json', 'contracts/environment-v1.schema.json', 'contracts/tournament-preview-v1.schema.json'].includes(p);
}
export function checkClosure(inputs) {
  for (const p of inputs) if (!sourceAllowed(p) || p.includes('node_modules') || p.split('/').includes('..')) throw Error(`Forbidden dependency: ${p}`);
}
export function isolationPlugin() {
  return {name: 'tournament-isolation', setup(build) {
    build.onLoad({filter: /./}, args => {checkClosure([relative(args.path)]);});
    build.onResolve({filter: /./}, args => {
      if (args.path.startsWith('node:')) return {path: args.path, external: true};
      if (['aws-cdk-lib', 'constructs'].includes(args.path) && args.importer.includes('infrastructure')) return {path: args.path, external: true};
      if (!args.path.startsWith('.') && !path.isAbsolute(args.path)) throw Error(`Undeclared package dependency: ${args.path}`);
    });
  }};
}
export function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.name === 'node_modules' || e.name === '.build' ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
export function sourceFiles() {
  return ['infrastructure/domains/tournaments', 'domains/tournaments', 'scripts/domains'].flatMap(p => walk(path.join(root, p))).concat(['scripts/config/domain-build-inputs.json', 'config/environments/Ntgre.core.json', 'contracts/environment-v1.schema.json', 'contracts/tournament-preview-v1.schema.json'].map(p => path.join(root, p))).sort();
}
export function verifyReceipt() {
  const receipt = read(path.join(buildDir, 'isolation-receipt.json'));
  if (receipt.stackName !== stackName || receipt.account !== '058264289478' || receipt.environment !== 'Ntgre' || receipt.region !== 'eu-north-1') throw Error('Invalid receipt target');
  for (const x of [...receipt.sourceInputs, ...receipt.generatedAssets, ...receipt.loadedLibraries]) {
    const p = path.resolve(root, x.path);
    if (!p.startsWith(root + path.sep) || !sourceAllowed(x.path) || fileSha(p) !== x.sha256) throw Error(`Pinned input changed: ${x.path}`);
  }
  checkClosure(receipt.actualSourceClosure);
  if (JSON.stringify(sourceFiles().map(relative)) !== JSON.stringify(receipt.sourceInputs.map(x => x.path))) throw Error('Source file set changed');
  return receipt;
}
