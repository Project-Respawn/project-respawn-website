import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// Source receipts exclude generated outputs and the receipt itself.
export function infrastructureInputs(root = '.') {
  const files = [];
  function walk(relative) {
    const full = join(root, relative);
    if (!existsSync(full)) return;
    for (const entry of readdirSync(full, { withFileTypes: true })) {
      const next = `${relative}/${entry.name}`;
      if (entry.isDirectory()) { if (!['node_modules', 'cdk.out'].includes(entry.name) && next !== 'scripts/config') walk(next); }
      else if (!entry.name.endsWith('.md')) files.push(next);
    }
  }
  for (const directory of ['amplify', 'infrastructure', 'scripts']) walk(directory);
  files.push('package.json', 'package-lock.json', 'amplify.yml');
  const entries = files.sort().map(file => ({ file, sha256: createHash('sha256').update(readFileSync(join(root, file), 'utf8').replaceAll('\r\n', '\n')).digest('hex') }));
  return { sha256: createHash('sha256').update(JSON.stringify(entries)).digest('hex'), entries };
}
