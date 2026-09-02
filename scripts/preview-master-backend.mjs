import process from 'node:process';
import path from 'node:path';
import { readFile, readdir, stat, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { MASTER, TEAM_HUB, TWITCH_RUNTIME, compareTemplates, phase2Allowlist, validatePhase2ChangeSet, validateTeamHubChangeSet, isExactTeamHubModelTemplate, isExactTwitchRuntimeTemplate, verdict, stableJson, isExpectedApiKeyExpiry, compareLambdaArtifactContent } from './lib/master-backend-preview.mjs';

const assemblyDir = path.resolve(process.argv[2] || path.join('.amplify', 'master-preview', 'cdk.out'));
const errors = [], allChanges = [];
let assetByObjectKey = new Map();
const aws = (args) => {
  const command = process.platform === 'win32' ? 'aws.exe' : 'aws';
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || `aws ${args[0]} failed`);
  return JSON.parse(result.stdout);
};
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

function checkIdentity() {
  const caller = aws(['sts', 'get-caller-identity', '--output', 'json']);
  if (caller.Account !== MASTER.account) errors.push(`AWS account ${caller.Account} is not MASTER account ${MASTER.account}`);
  const app = aws(['amplify', 'get-app', '--app-id', MASTER.appId, '--region', MASTER.region, '--output', 'json']).app;
  if (app.appId !== MASTER.appId || app.productionBranch?.branchName !== MASTER.branch) errors.push('Amplify app/production branch identity mismatch');
  const branch = aws(['amplify', 'get-branch', '--app-id', MASTER.appId, '--branch-name', MASTER.branch, '--region', MASTER.region, '--output', 'json']).branch;
  const root = branch.backend?.stackArn?.split('/')[1];
  if (root !== MASTER.root || root === MASTER.forbiddenRoot) errors.push(`MASTER root mismatch: ${root || '<missing>'}`);
  return { caller, app, branch, root };
}

function checkOutputs(root) {
  const stack = aws(['cloudformation', 'describe-stacks', '--stack-name', root, '--region', MASTER.region, '--output', 'json']).Stacks[0];
  const output = Object.fromEntries((stack.Outputs || []).map((entry) => [entry.OutputKey, entry.OutputValue]));
  let custom;
  try { custom = JSON.parse(output.customOutputs || '{}').custom?.overlaySource; } catch { errors.push('MASTER customOutputs is not valid JSON'); }
  const expected = { httpUrl: MASTER.httpUrl, websocketUrl: MASTER.websocketUrl, region: MASTER.region };
  for (const [key, value] of Object.entries(expected)) if (custom?.[key] !== value) errors.push(`MASTER overlay output ${key} mismatch: ${custom?.[key] || '<missing>'}`);
  const serialized = JSON.stringify(custom || {});
  for (const forbidden of MASTER.forbiddenIds) if (serialized.includes(forbidden)) errors.push(`MASTER outputs contain forbidden sandbox API ID ${forbidden}`);
}

async function assemblyTemplates() {
  const files = (await readdir(assemblyDir)).filter((file) => file.endsWith('.template.json'));
  if (!files.length) throw new Error(`No synthesized templates found in ${assemblyDir}`);
  const entries = await Promise.all(files.map(async (file) => [file, await readJson(path.join(assemblyDir, file))]));
  const byFile = Object.fromEntries(entries);
  const manifest = await readJson(path.join(assemblyDir, 'manifest.json'));
  const assetFile = (await readdir(assemblyDir)).find((file) => file.endsWith('.assets.json'));
  if (!assetFile) throw new Error('Synthesized asset manifest is missing');
  const assets = await readJson(path.join(assemblyDir, assetFile));
  assetByObjectKey = new Map(Object.values(assets.files || {}).flatMap((asset) => Object.values(asset.destinations || {}).map((destination) => [destination.objectKey, path.join(assemblyDir, asset.source.path)])));
  const rootArtifact = Object.values(manifest.artifacts || {}).find((artifact) => artifact.type === 'aws:cloudformation:stack' && artifact.properties?.templateFile && !artifact.properties?.stackTemplateAssetObjectUrl);
  const rootFile = rootArtifact?.properties?.templateFile || entries.find(([, template]) => template.Resources && Object.values(template.Resources).some((r) => r.Type === 'AWS::CloudFormation::Stack'))?.[0];
  if (!rootFile || !byFile[rootFile]) throw new Error('Unable to identify synthesized MASTER root template');
  return { byFile, rootFile };
}

async function filesUnder(root, relative = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(root, child));
    else result.push(child.replaceAll('\\', '/'));
  }
  return result.sort();
}

async function proveGeneratedOnlyLambdaChange(change) {
  const desiredRoot = assetByObjectKey.get(change.newValue);
  if (!desiredRoot) return { proven: false, reason: 'desired asset directory not found' };
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'master-preview-lambda-'));
  try {
    const zip = path.join(temporary, 'deployed.zip'), deployedRoot = path.join(temporary, 'deployed');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(deployedRoot));
    aws(['s3api', 'get-object', '--bucket', `cdk-hnb659fds-assets-${MASTER.account}-${MASTER.region}`, '--key', change.oldValue, zip, '--region', MASTER.region, '--output', 'json']);
    const extracted = spawnSync('tar', ['-xf', zip, '-C', deployedRoot], { encoding: 'utf8' });
    if (extracted.status !== 0) return { proven: false, reason: extracted.stderr?.trim() || 'archive extraction failed' };
    const deployedFiles = await filesUnder(deployedRoot), desiredFiles = await filesUnder(desiredRoot);
    const deployedEntries = Object.fromEntries(await Promise.all(deployedFiles.map(async (file) => [file, await readFile(path.join(deployedRoot, file))])));
    const desiredEntries = Object.fromEntries(await Promise.all(desiredFiles.map(async (file) => [file, await readFile(path.join(desiredRoot, file))])));
    const comparison = compareLambdaArtifactContent(deployedEntries, desiredEntries);
    return { proven: comparison.equivalent, reason: comparison.reason };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

function nestedTemplateFile(resource, byFile) {
  const assetPath = resource?.Metadata?.['aws:asset:path'];
  if (assetPath && byFile[assetPath]) return assetPath;
  if (assetPath) {
    const base = path.basename(assetPath);
    if (byFile[base]) return base;
  }
  return null;
}

async function compareStack(stackName, logicalPath, desired, templates, seen = new Set()) {
  if (seen.has(stackName)) throw new Error(`Nested stack cycle at ${stackName}`);
  seen.add(stackName);
  const deployed = aws(['cloudformation', 'get-template', '--stack-name', stackName, '--region', MASTER.region, '--template-stage', 'Original', '--output', 'json']).TemplateBody;
  const resources = aws(['cloudformation', 'describe-stack-resources', '--stack-name', stackName, '--region', MASTER.region, '--output', 'json']).StackResources || [];
  const physical = Object.fromEntries(resources.map((resource) => [resource.LogicalResourceId, resource.PhysicalResourceId]));
  const stackChanges = compareTemplates({ stack: logicalPath, desired, deployed, physicalByLogical: physical, allowlist: phase2Allowlist });
  for (const change of stackChanges) {
    if (isExpectedApiKeyExpiry(change)) {
      change.classification = 'EXPECTED OPERATIONAL REFRESH';
      change.contentAssessment = 'EXPIRY EXTENSION ONLY; 29-31 DAYS FROM SYNTHESIS';
    } else if (change.changeType === 'ASSET-UPDATE' && change.classification !== 'APPROVED') {
      const proof = await proveGeneratedOnlyLambdaChange(change);
      change.contentAssessment = proof.reason;
      if (proof.proven) change.classification = 'EXPECTED GENERATED CHURN';
    }
  }
  allChanges.push(...stackChanges);
  const desiredNested = Object.entries(desired.Resources || {}).filter(([, resource]) => resource.Type === 'AWS::CloudFormation::Stack');
  const deployedNested = new Map(resources.filter((resource) => resource.ResourceType === 'AWS::CloudFormation::Stack').map((resource) => [resource.LogicalResourceId, resource.PhysicalResourceId]));
  for (const [logicalId, resource] of desiredNested) {
    const childStack = deployedNested.get(logicalId), childFile = nestedTemplateFile(resource, templates.byFile);
    if (!childStack && childFile && logicalId in TEAM_HUB.nestedStacks) {
      if (!isExactTeamHubModelTemplate(templates.byFile[childFile], TEAM_HUB.nestedStacks[logicalId])) errors.push(`Team Hub nested template failed exact validation: ${logicalPath}/${logicalId}`);
      continue;
    }
    if (!childStack && childFile && logicalId === TWITCH_RUNTIME.stack) {
      if (!isExactTwitchRuntimeTemplate(templates.byFile[childFile])) errors.push(`Dedicated Twitch runtime nested template failed exact validation: ${logicalPath}/${logicalId}`);
      continue;
    }
    if (!childStack || !childFile) { errors.push(`Cannot prove nested stack ${logicalPath}/${logicalId}: deployed=${Boolean(childStack)} desiredTemplate=${childFile || '<missing>'}`); continue; }
    await compareStack(childStack, `${logicalPath}/${logicalId}`, templates.byFile[childFile], templates, new Set(seen));
  }
}

function displayValue(value) {
  const text = JSON.stringify(value);
  return text && text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function printReport(identity) {
  const material = allChanges.filter((change) => change.changeType !== 'METADATA-ONLY');
  console.log('\nPROJECT RESPAWN MASTER DEPLOYMENT PREVIEW\n');
  console.log(`Target:\n  App: ${MASTER.appId}\n  Branch: ${MASTER.branch}\n  Root: ${identity.root}\n  Account: ${identity.caller.Account}\n  Region: ${MASTER.region}\n`);
  for (const group of ['APPROVED', 'EXPECTED GENERATED CHURN', 'EXPECTED OPERATIONAL REFRESH', 'UNRELATED', 'DANGEROUS', 'UNKNOWN']) {
    const changes = material.filter((change) => change.classification === group);
    console.log(`${group}:`);
    if (!changes.length) console.log('  none');
    for (const change of changes) {
      console.log(`  ${change.stack} :: ${change.logicalId} (${change.resourceType})`);
      console.log(`    ${change.changeType} ${change.property}: ${displayValue(change.oldValue)} -> ${displayValue(change.newValue)}`);
      if (change.contentAssessment) console.log(`    Evidence: ${change.contentAssessment}${change.changeType === 'ASSET-UPDATE' ? ' (CDK content-addressed S3 key changed)' : ''}`);
      console.log(`    Physical: ${change.physicalId || '<none>'}; replacement: ${change.replacementRisk || 'NO'}`);
    }
    console.log('');
  }
  if (errors.length) console.log(`GUARD ERRORS:\n${errors.map((error) => `  - ${error}`).join('\n')}\n`);
  const resourceKeys = new Set(material.map((change) => `${change.stack}/${change.logicalId}`));
  console.log(`Resources added: ${new Set(material.filter((c) => c.changeType === 'ADD').map((c) => `${c.stack}/${c.logicalId}`)).size}`);
  console.log(`Resources removed: ${new Set(material.filter((c) => c.changeType === 'REMOVE').map((c) => `${c.stack}/${c.logicalId}`)).size}`);
  console.log(`Resources modified: ${resourceKeys.size}`);
  console.log(`Replacement risks: ${material.filter((change) => change.replacementRisk === true || change.replacementRisk === 'UNKNOWN').length}`);
  console.log(`\nVERDICT:\n\n${verdict(allChanges, errors)}\n`);
}

try {
  if (!(await stat(assemblyDir)).isDirectory()) throw new Error(`Assembly path is not a directory: ${assemblyDir}`);
  const identity = checkIdentity();
  checkOutputs(identity.root);
  const templates = await assemblyTemplates();
  await compareStack(identity.root, identity.root, templates.byFile[templates.rootFile], templates);
  errors.push(...validatePhase2ChangeSet(allChanges));
  errors.push(...validateTeamHubChangeSet(allChanges));
  printReport(identity);
  if (verdict(allChanges, errors) !== 'SAFE TO DEPLOY') process.exitCode = 1;
} catch (error) {
  console.error(`MASTER deployment preview BLOCKED: ${error.message}`);
  process.exitCode = 1;
}
