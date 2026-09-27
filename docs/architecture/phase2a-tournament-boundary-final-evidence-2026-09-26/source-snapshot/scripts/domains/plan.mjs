import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root, domainDir, buildDir, corePath, pinPath, target, isolatedRequire, isolationPlugin, sourceFiles, relative, fileSha, sha, write, read, checkClosure, stackName} from './lib.mjs';
const core = target(process.argv.slice(2));
const require = isolatedRequire(), esbuild = require('esbuild'), Ajv = require('ajv');
const ajv = new Ajv();
if (!ajv.validate(read(path.join(root, 'contracts/environment-v1.schema.json')), core)) throw Error(ajv.errorsText());
const start = Date.now();
fs.mkdirSync(buildDir, {recursive: true});
execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '-p', path.join(domainDir, 'tsconfig.json')], {stdio: 'inherit', windowsHide: true});
const sourceInputs = sourceFiles().map(p => ({path: relative(p), sha256: fileSha(p)}));
const revision = sha(JSON.stringify(sourceInputs));
const runtimeDir = path.join(buildDir, 'runtime');
// Fail before esbuild can consume implementation files outside the declared domain boundary.
const common = {absWorkingDir: root, tsconfigRaw: {compilerOptions: {target: 'ES2022'}}, bundle: true, platform: 'node', target: 'node22', format: 'cjs', metafile: true, plugins: [isolationPlugin()], logLevel: 'warning'};
const runtime = await esbuild.build({...common, entryPoints: [path.join(root, 'domains/tournaments/preview/handler.ts')], outfile: path.join(runtimeDir, 'index.js')});
write(path.join(runtimeDir, 'package.json'), {type: 'commonjs'});
if (JSON.stringify(fs.readdirSync(runtimeDir).sort()) !== JSON.stringify(['index.js', 'package.json'])) throw Error('Unexpected file in Lambda asset directory');
if (Object.values(runtime.metafile.outputs).some(o => o.imports.length)) throw Error('Runtime must have no external clients/dependencies');
const infra = await esbuild.build({...common, entryPoints: [path.join(root, 'infrastructure/domains/tournaments/app.ts')], outfile: path.join(buildDir, 'app.cjs')});
const client = await esbuild.build({...common, entryPoints: [path.join(root, 'domains/tournaments/client.ts')], outfile: path.join(buildDir, 'client.cjs')});
write(path.join(buildDir, 'client-metafile.json'), client.metafile);
const actualSourceClosure = [...new Set([...Object.keys(runtime.metafile.inputs), ...Object.keys(infra.metafile.inputs)])].sort();
checkClosure(actualSourceClosure);
write(path.join(buildDir, 'runtime-metafile.json'), runtime.metafile); write(path.join(buildDir, 'infrastructure-metafile.json'), infra.metafile);
const outdir = path.join(buildDir, 'assembly');
if (fs.existsSync(outdir)) {
  // Only this fixed local build directory; never delete a cloud resource or unrelated assembly.
  if (path.dirname(outdir) !== buildDir) throw Error('Invalid assembly path');
  fs.rmSync(outdir, {recursive: true});
}
execFileSync(process.execPath, ['--require', path.join(root, 'scripts/domains/trace.cjs'), path.join(buildDir, 'app.cjs')], {cwd: domainDir, stdio: 'inherit', windowsHide: true, env: {...process.env, CDK_DISABLE_VERSION_CHECK: '1', TOURNAMENT_CONFIG: corePath, TOURNAMENT_PIN: pinPath, TOURNAMENT_OUTDIR: outdir, TOURNAMENT_ASSET: runtimeDir, TOURNAMENT_REVISION: revision, TOURNAMENT_CORE_SHA: fileSha(corePath), TOURNAMENT_TRACE: path.join(buildDir, 'loaded-libraries.json')}});
const manifest = read(path.join(outdir, 'manifest.json'));
const stacks = Object.entries(manifest.artifacts).filter(([, a]) => a.type === 'aws:cloudformation:stack');
if (stacks.length !== 1 || stacks[0][0] !== stackName || manifest.missing?.length) throw Error('Unexpected stack or AWS context lookup');
const template = read(path.join(outdir, stacks[0][1].properties.templateFile));
const resources = Object.entries(template.Resources).map(([logicalId, r]) => ({logicalId, type: r.Type}));
const expected = {'AWS::ApiGatewayV2::Api': 1, 'AWS::ApiGatewayV2::Stage': 1, 'AWS::ApiGatewayV2::Authorizer': 1, 'AWS::ApiGatewayV2::Integration': 1, 'AWS::ApiGatewayV2::Route': 1, 'AWS::Lambda::Function': 1, 'AWS::Lambda::Permission': 1, 'AWS::IAM::Role': 1, 'AWS::Logs::LogGroup': 1, 'AWS::CloudWatch::Alarm': 2};
const counts = Object.fromEntries(Object.keys(expected).map(type => [type, resources.filter(r => r.type === type).length]));
if (resources.length !== 11 || JSON.stringify(counts) !== JSON.stringify(expected) || /AccessLogSettings|AWS::Logs::ResourcePolicy|AWS::Logs::Delivery|Fn::ImportValue|AWS::CloudFormation::Stack|AWS::AppSync|AWS::Cognito|AWS::DynamoDB|Custom::|AWS::S3::|AWS::KMS::/.test(JSON.stringify(template))) throw Error('Unexpected resource envelope/dependency');
const loaded = read(path.join(buildDir, 'loaded-libraries.json')).map(p => {
  if (!p.startsWith(path.join(domainDir, 'node_modules') + path.sep) && p !== path.join(buildDir, 'app.cjs')) throw Error(`Library escaped isolated package: ${p}`);
  return {path: relative(p), sha256: fileSha(p)};
});
const allGenerated = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? allGenerated(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const generatedAssets = allGenerated(buildDir).filter(p => !['isolation-receipt.json', 'deployment-review.json', 'domain-endpoints.Ntgre.json'].includes(path.basename(p))).sort().map(p => ({path: relative(p), sha256: fileSha(p)}));
const receipt = {version: 1, stackName, account: core.account, region: core.region, environment: core.environment, revision, coreSha256: fileSha(corePath), sourceInputs, actualSourceClosure, explicitConfigurationReads: ['config/environments/Ntgre.core.json', 'scripts/config/domain-build-inputs.json', 'contracts/environment-v1.schema.json'], isolatedPackage: 'infrastructure/domains/tournaments/package-lock.json', loadedLibraries: loaded, generatedAssets, resources, counts, total: resources.length, assembly: relative(outdir), awsWrites: 0, legacySynthesized: false, unrelatedLambdasBundled: false, durationMs: Date.now() - start};
write(path.join(buildDir, 'isolation-receipt.json'), receipt);
console.log(JSON.stringify({stackName, total: resources.length, revision, receipt: relative(path.join(buildDir, 'isolation-receipt.json')), durationMs: receipt.durationMs}, null, 2));
