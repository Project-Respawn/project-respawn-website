import fs from 'node:fs';
import path from 'node:path';

const STAGE_PLACEHOLDER_PATTERN = /<\s*stage\s*>|%3Cstage%3E/i;
const ENV_FILES = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
  '.env.development',
  '.env.development.local',
];

function getEnvFileValues() {
  const results = [];

  for (const fileName of ENV_FILES) {
    const fullPath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const match = content.match(/^\s*VITE_API_BASE_URL\s*=\s*(.*)\s*$/m);
    if (!match) continue;

    const rawValue = String(match[1] || '').replace(/^['"]|['"]$/g, '').trim();
    results.push({
      fileName,
      value: rawValue,
    });
  }

  return results;
}

function formatSourceDetails(fileValues) {
  if (!fileValues.length) {
    return 'No VITE_API_BASE_URL assignment was found in local .env files.';
  }

  const lines = fileValues.map((entry) => `- ${entry.fileName}: ${entry.value || '(empty)'}`);
  return `Detected VITE_API_BASE_URL values in local files:\n${lines.join('\n')}`;
}

const baseUrl = String(process.env.VITE_API_BASE_URL || '').trim();
const revolutMode = String(process.env.VITE_REVOLUT_MODE || '').trim().toLowerCase();
const revolutPublicKey = String(process.env.VITE_REVOLUT_PUBLIC_KEY || '').trim();
const envFileValues = getEnvFileValues();
const outputsPath = path.resolve(process.cwd(), 'amplify_outputs.json');
let generatedApiBaseUrl = '';

if (fs.existsSync(outputsPath)) {
  try {
    const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
    generatedApiBaseUrl = String(outputs?.custom?.API?.projectRespawnApi?.endpoint || '')
      .trim()
      .replace(/\/+$/, '');
  } catch {
    throw new Error('Build failed: amplify_outputs.json is not valid JSON.');
  }
}

if (!baseUrl) {
  throw new Error(
    [
      'Build failed: VITE_API_BASE_URL is not set in process.env.',
      'Set VITE_API_BASE_URL in AWS Amplify environment variables for each branch (for example: dev, staging, prod).',
      formatSourceDetails(envFileValues),
    ].join('\n')
  );
}

if (STAGE_PLACEHOLDER_PATTERN.test(baseUrl)) {
  const matchingFiles = envFileValues
    .filter((entry) => entry.value === baseUrl)
    .map((entry) => entry.fileName);

  const probableSource = matchingFiles.length
    ? `Probable source file(s): ${matchingFiles.join(', ')}`
    : 'Probable source: AWS Amplify environment variable VITE_API_BASE_URL';

  throw new Error(
    [
      'Build failed: VITE_API_BASE_URL contains a stage placeholder token.',
      probableSource,
      `Current value: ${baseUrl}`,
      'Replace it with your real API Gateway base URL including the deployed stage path (for example, /prod).',
    ].join('\n')
  );
}

if (!/^https?:\/\//i.test(baseUrl)) {
  throw new Error(
    [
      'Build failed: VITE_API_BASE_URL must be an absolute URL starting with http:// or https://.',
      `Current value: ${baseUrl}`,
      'Set this in AWS Amplify environment variables as VITE_API_BASE_URL.',
    ].join('\n')
  );
}

const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

if (generatedApiBaseUrl && normalizedBaseUrl !== generatedApiBaseUrl) {
  throw new Error(
    [
      'Build failed: VITE_API_BASE_URL does not match the API generated for this Amplify branch.',
      'Configure a branch-specific VITE_API_BASE_URL using the projectRespawnApi endpoint from this branch output.',
      'This guard prevents staging from calling the production API (and production from calling staging).',
    ].join('\n')
  );
}

if (!revolutMode) {
  throw new Error(
    'Build failed: VITE_REVOLUT_MODE is not set. Set it explicitly to sandbox or live for each Amplify branch.'
  );
}

if (!['sandbox', 'live'].includes(revolutMode)) {
  throw new Error(
    `Build failed: invalid VITE_REVOLUT_MODE "${revolutMode}". Expected sandbox or live.`
  );
}

if (!revolutPublicKey) {
  throw new Error(
    'Build failed: VITE_REVOLUT_PUBLIC_KEY is not set. Configure the public Merchant API key matching VITE_REVOLUT_MODE.'
  );
}

console.log('VITE_API_BASE_URL is set and matches the generated branch API.');
console.log('Revolut frontend environment is set and valid:', revolutMode);
