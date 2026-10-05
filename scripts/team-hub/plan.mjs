import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { isolationPlugin } from './build-isolation.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const infra = path.join(root, 'infrastructure/domains/team-hub');
const relative = p => path.relative(root, p).replaceAll('\\', '/');
const hash = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const args = process.argv.slice(2);
const proof = args.join(' ') === '--env Ntgre --offline --mode READ_PROOF';
if (!proof && args.join(' ') !== '--env Ntgre --offline') throw new Error('Only --env Ntgre --offline [--mode READ_PROOF] is supported. No deploy mode.');
const mode = proof ? 'READ_PROOF' : 'FULL_TARGET';
const require = createRequire(path.join(infra, 'package.json'));
for (const name of ['esbuild', 'aws-cdk-lib', 'constructs', 'typescript']) if (!require.resolve(name).startsWith(path.join(infra, 'node_modules') + path.sep)) throw new Error(`Nonisolated dependency ${name}`);
const { build } = require('esbuild');
const out = path.join(infra, '.build', `offline-${Date.now()}`);
fs.mkdirSync(out, { recursive: true });
const closure = [];
const units = proof ? [['read', 'domains/team-hub/preview.mjs', 'node'], ['app', 'infrastructure/domains/team-hub/read-proof-app.ts', 'node']] : [ ['read', 'domains/team-hub/read-entry.mjs', 'node'], ['command', 'domains/team-hub/command-entry.mjs', 'node'], ['client', 'src/features/team-hub/api/client.mjs', 'browser'], ['routes', 'src/features/team-hub/routes/index.mjs', 'browser'], ['app', 'infrastructure/domains/team-hub/app.ts', 'node'] ];
for (const [name, entry, platform] of units) {
  const output = name === 'routes' ? { outdir: path.join(out, name), splitting: true, entryNames: 'index', chunkNames: 'chunks/[name]-[hash]' } : { outfile: path.join(out, name, name === 'app' ? 'app.cjs' : 'index.js') };
  const result = await build({ absWorkingDir: root, entryPoints: [entry], ...output, bundle: true, format: name === 'app' || platform === 'node' ? 'cjs' : 'esm', platform, target: 'es2022', metafile: true, plugins: [isolationPlugin(root, name)] });
  closure.push({ name, inputs: Object.keys(result.metafile.inputs).sort(), outputs: Object.keys(result.metafile.outputs).map(p => ({ path: relative(path.resolve(root, p)), sha256: hash(path.resolve(root, p)) })) });
  if (['read', 'command'].includes(name)) fs.writeFileSync(path.join(out, name, 'package.json'), '{"type":"commonjs"}\n');
}
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(AWS|AMAZON|CDK_|NODE_OPTIONS)/i.test(k)));
Object.assign(env, { TEAM_HUB_OFFLINE: '1', TEAM_HUB_MODE: mode, TEAM_HUB_CORE: path.join(root, 'config/environments/Ntgre.core.json'), TEAM_HUB_OUT: path.join(out, 'assembly'), TEAM_HUB_READ: path.join(out, 'read'), TEAM_HUB_COMMAND: path.join(out, 'command'), TEAM_HUB_TRACE: path.join(out, 'loaded.json') });
const result = spawnSync(process.execPath, ['--require', path.join(root, 'scripts/team-hub/offline-guard.cjs'), path.join(out, 'app/app.cjs')], { cwd: infra, env, encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr || result.stdout || String(result.error));
const loaded = JSON.parse(fs.readFileSync(env.TEAM_HUB_TRACE, 'utf8'));
for (const p of loaded) if (!p.startsWith(path.join(infra, 'node_modules') + path.sep) && !p.startsWith(out + path.sep)) throw new Error(`Unexpected loaded dependency ${relative(p)}`);
const manifest = JSON.parse(fs.readFileSync(path.join(env.TEAM_HUB_OUT, 'manifest.json'), 'utf8'));
if (manifest.missing?.length) throw new Error('Context lookup prohibited');
const stacks = Object.entries(manifest.artifacts).filter(([, a]) => a.type === 'aws:cloudformation:stack');
if (stacks.length !== 2 || stacks.some(([id]) => !['ProjectRespawn-TeamHub-Ntgre', proof ? 'ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity' : 'ProjectRespawn-TeamHub-Ntgre-Security'].includes(id))) throw new Error('Foreign or missing root');
const counts = {}; const templates = [];
for (const [name, artifact] of stacks) {
  const templatePath = path.join(env.TEAM_HUB_OUT, artifact.properties.templateFile);
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  for (const resource of Object.values(template.Resources)) { counts[resource.Type] = (counts[resource.Type] ?? 0) + 1; if (resource.Type === 'AWS::CloudFormation::Stack' || resource.Type.startsWith('Custom::')) throw new Error('Unexpected nested/custom resource'); }
  templates.push({ name, path: relative(templatePath), count: Object.keys(template.Resources).length, sha256: hash(templatePath) });
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (total > 75) throw new Error(`Resource budget exceeded: ${total}`);
if (proof && (total !== 15 || counts['AWS::Lambda::Function'] !== 1 || counts['AWS::ApiGatewayV2::Route'] !== 1 || counts['AWS::DynamoDB::Table'] || counts['AWS::S3::Bucket'])) throw new Error('Read proof must be state-free and exactly 15 resources');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => ['node_modules', '.build', 'cdk.out'].includes(e.name) ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const inputs = ['domains/team-hub', 'infrastructure/domains/team-hub', 'scripts/team-hub', 'scripts/deployment', 'src/features/team-hub'].flatMap(p => walk(path.join(root, p))).concat(['config/environments/Ntgre.core.json', 'scripts/validate-infrastructure-ci.mjs', 'scripts/legacy/validate-infrastructure-ci.mjs', 'amplify.yml', 'package.json'].map(p => path.join(root, p))).sort().map(p => ({ path: relative(p), sha256: hash(p) }));
const revision = createHash('sha256').update(JSON.stringify({ mode, inputs })).digest('hex');
const receipt = { status: 'OFFLINE_ONLY', mode, revision, target: 'ProjectRespawn-TeamHub-Ntgre', awsCalls: 0, synthesizedAt: new Date().toISOString(), total, counts, templates, closure, inputs, loadedLibraries: loaded.filter(p => p.includes('node_modules')).map(p => ({ path: relative(p), sha256: hash(p) })), networkGuard: true, legacySynthesized: false, tournamentSynthesized: false, liveEndpointManifest: false };
fs.writeFileSync(path.join(out, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
fs.writeFileSync(path.join(infra, proof ? '.build/latest-read-proof.json' : '.build/latest.json'), JSON.stringify({ receipt: relative(path.join(out, 'receipt.json')) }, null, 2) + '\n');
console.log(JSON.stringify({ receipt: relative(path.join(out, 'receipt.json')), total, counts, templates }, null, 2));
