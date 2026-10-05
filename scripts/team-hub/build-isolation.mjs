import fs from 'node:fs';
import path from 'node:path';
export function isolationPlugin(root, unit) {
  const relative = p => path.relative(root, p).replaceAll('\\', '/');
  return { name: 'team-only', setup(build) {
    build.onLoad({ filter: /\.(?:mjs|ts)$/ }, args => {
      const source = fs.readFileSync(args.path, 'utf8');
      if (/\bimport\s*\(\s*[^'"\s]|\brequire\s*\(|\beval\s*\(|\bnew\s+Function\s*\(/.test(source)) throw new Error('Unresolved dynamic dependency/evaluation prohibited');
      return { contents: source, loader: args.path.endsWith('.ts') ? 'ts' : 'js' };
    });
    build.onResolve({ filter: /.*/ }, args => {
      if (args.path.startsWith('node:')) {
        if (['client', 'routes'].includes(unit) || !['node:crypto', ...(unit === 'app' ? ['node:fs'] : [])].includes(args.path)) throw new Error(`Forbidden builtin in ${unit}: ${args.path}`);
        return { path: args.path, external: true };
      }
      if (['aws-cdk-lib', 'constructs'].includes(args.path)) {
        if (unit !== 'app') throw new Error('Infrastructure library cannot enter a runtime or frontend');
        return { path: args.path, external: true };
      }
      if (!args.path.startsWith('.') && !path.isAbsolute(args.path)) throw new Error(`Undeclared dependency ${args.path}`);
      let resolved = path.resolve(args.resolveDir || root, args.path);
      if (!fs.existsSync(resolved) && resolved.endsWith('.js')) resolved = resolved.slice(0, -3) + '.ts';
      resolved = fs.realpathSync(resolved);
      const name = relative(resolved);
      const allowed = unit === 'app' ? ['infrastructure/domains/team-hub/', 'domains/team-hub/contracts.mjs'] : ['client', 'routes'].includes(unit) ? ['src/features/team-hub/', 'domains/team-hub/contracts.mjs'] : ['domains/team-hub/'];
      if (!allowed.some(p => p.endsWith('/') ? name.startsWith(p) : name === p) || name.includes('/node_modules/')) throw new Error(`Foreign source ${name}`);
      return { path: resolved };
    });
  } };
}
