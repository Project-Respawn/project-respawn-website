import fs from 'node:fs';
const old='docs/architecture/team-hub-2b3-gate3-evidence-2026-10-05',next='docs/architecture/team-hub-2b4-evidence-2026-10-06';
const from='scripts/team-hub-migration/gate3',to='scripts/team-hub-2b4/preflight';
fs.mkdirSync(to,{recursive:true});fs.mkdirSync(next,{recursive:true});
for(const name of ['read-only.mjs','common.mjs','source.mjs','verify-legacy.mjs','verify-tournament.mjs','verify-product.mjs','verify-security.mjs','verify-runtime.mjs','aws.mjs']){
 let s=fs.readFileSync(`${from}/${name}`,'utf8').replaceAll(old,next);
 if(name==='aws.mjs')s=s.replace(" const v=k=>args[args.indexOf(k)+1];"," if(['assume-role','put-object','create-change-set','execute-change-set'].includes(action))throw Error('Phase 2B4 preflight is strictly read-only');\n const v=k=>args[args.indexOf(k)+1];");
 fs.writeFileSync(`${to}/${name}`,s);
}
for(const name of ['product.template','security.template','team-baseline','candidate'])fs.copyFileSync(`${old}/${name}.json`,`${next}/${name}.json`);
console.log('Isolated read-only Phase 2B4 preflight prepared; no AWS writes.');
