// Offline fixture only. Never regenerate accepted deployment evidence or ZIPs.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { environment } from './config.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifestPath = 'docs/architecture/production-core-emf-evidence-2026-10-21/manifest.json';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

export function prepareCoreTestFixture() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath)));
  const output = path.join(root, '.tmp/team-hub-production/source');
  for (const name of ['contracts.mjs', 'service.mjs']) {
    const source = `domains/shared-core/${name}`;
    const binding = manifest.sources.find(item => item.path === source);
    assert.ok(binding, `Missing accepted source binding: ${source}`);
    const bytes = fs.readFileSync(path.join(root, source));
    assert.equal(sha(bytes), binding.sha256, `Accepted source changed: ${source}`);
    // Same explicit environment overlay used by the accepted Core build.
    const transformed = bytes.toString('utf8')
      .replaceAll('eu-north-1_n24iLL7QE', environment.poolId)
      .replaceAll('1iq7ovjaf7d16imdvbqgfgvf86', environment.clientId)
      .replaceAll('Ntgre', 'Production');
    assert.equal(sha(transformed), binding.productionBaselineSha256, `Production overlay mismatch: ${source}`);
    const target = path.join(output, source);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, transformed);
  }
  return output;
}
