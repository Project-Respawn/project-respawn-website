import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {read, pinPath} from './lib.mjs';
export function select(paths) {
  const pin = read(pinPath), deploy = new Set(), test = new Set();
  for (let p of paths) {
    p = p.replaceAll('\\', '/');
    if (p.startsWith('/') || /^[A-Za-z]:/.test(p) || p.split('/').includes('..')) throw Error('Expected repository-relative changed path');
    if (pin.owned.some(prefix => p === prefix || prefix.endsWith('/') && p.startsWith(prefix))) {deploy.add('tournaments'); test.add('tournaments');}
    if (pin.sharedContracts.includes(p)) test.add('tournaments');
  }
  return {deploy: [...deploy], compatibilityTests: [...test], automaticDeployment: false};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(select(process.argv.slice(2)), null, 2));
