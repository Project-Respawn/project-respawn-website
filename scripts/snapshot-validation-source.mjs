import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Preserve the reviewed working tree, including uncommitted Phase 1 changes.
// Git selects files; raw Buffer copies preserve their actual working-tree bytes.
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const [mode, destination] = process.argv.slice(2);
if (!destination || !['copy', 'verify'].includes(mode)) throw new Error('Usage: snapshot-validation-source.mjs copy|verify DIRECTORY');
const target = path.resolve(destination);
const manifestPath = path.join(target, '.validation-source-manifest.json');
if (mode === 'verify') {
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  for (const entry of manifest.files) {
    const relative = path.relative(target, path.resolve(target, entry.file));
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Unsafe manifest path');
    if (hash(fs.readFileSync(path.join(target, entry.file))) !== entry.sha256) throw new Error(`Source bytes changed: ${entry.file}`);
  }
  console.log(`Verified exact bytes of ${manifest.files.length} source files`);
} else {
  const relative = path.relative(path.resolve('.amplify'), target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || fs.existsSync(target)) throw new Error('Snapshot must be a new directory below .amplify');
  const files = [...new Set(execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean))]
    .filter(file => !file.startsWith('.codex-worktrees/') && fs.existsSync(file) && fs.lstatSync(file).isFile()).sort();
  fs.mkdirSync(target, { recursive: true });
  const entries = files.map(file => {
    const bytes = fs.readFileSync(file);
    const output = path.join(target, file);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, bytes);
    if (hash(fs.readFileSync(output)) !== hash(bytes)) throw new Error(`Copy failed: ${file}`);
    return { file, sha256: hash(bytes) };
  });
  fs.writeFileSync(manifestPath, JSON.stringify({ representation: 'Exact working-tree bytes; no checkout filters or newline conversion', files: entries }, null, 2));
  console.log(`Copied ${entries.length} files without byte conversion`);
}
