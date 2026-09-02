import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import test from 'node:test';

const backend = readFileSync('amplify/backend.ts', 'utf8');
const sharedRouter = readFileSync('amplify/myFunction/router/restRouter.ts', 'utf8');
const runtimeResource = readFileSync('amplify/functions/twitch-runtime/resource.ts', 'utf8');

test('Twitch runtime route and overlay grants belong to the dedicated function', () => {
  assert.match(backend, /TwitchRuntimeIntegration[\s\S]*backend\.twitchRuntime\.resources\.lambda/);
  assert.match(backend, /const runtimeHandler = backend\.twitchRuntime\.resources\.lambda/);
  assert.doesNotMatch(sharedRouter, /handleTwitchRuntime|\/twitch\/runtime/);
  assert.match(runtimeResource, /name: 'twitch-runtime'/);
});

test('Lambda environment bindings never use AWS-invalid underscore-prefixed names', () => {
  const configuredNames = [...backend.matchAll(/addEnvironment\(['"]([^'"]+)['"]/g)].map((match) => match[1]);
  assert.equal(configuredNames.some((name) => name.startsWith('_')), false);
});

test('synthesized dependency graph has no data to overlay edge', () => {
  const directory = '.amplify/master-preview/cdk.out';
  const rootFile = readdirSync(directory).find((file) => file.startsWith('amplify-') && file.endsWith('.template.json'));
  const root = JSON.parse(readFileSync(join(directory, rootFile), 'utf8'));
  const nested = Object.fromEntries(Object.entries(root.Resources).filter(([, resource]) => resource.Type === 'AWS::CloudFormation::Stack').map(([id, resource]) => [id, basename(resource.Metadata?.['aws:asset:path'] || '')]));
  const edges = [];
  for (const [consumer, resource] of Object.entries(root.Resources)) if (resource.Type === 'AWS::CloudFormation::Stack') {
    for (const value of Object.values(resource.Properties?.Parameters || {})) {
      const source = value?.['Fn::GetAtt']?.[0];
      if (nested[source]) edges.push([consumer, source]);
    }
  }
  assert.equal(edges.some(([consumer, producer]) => consumer.startsWith('data') && producer.startsWith('overlaysource')), false);
  assert.equal(edges.some(([consumer, producer]) => consumer.startsWith('function') && producer.startsWith('overlaysource')), true);
  assert.equal(edges.some(([consumer, producer]) => consumer.startsWith('overlaysource') && producer.startsWith('data')), true);
});
