// Preserve prior evidence; stage existing read-only verifiers in a separate gate directory.
import fs from 'node:fs';
const dir='scripts/team-hub-migration/gate1';
const evidence='docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05';
fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(evidence,{recursive:true});
fs.writeFileSync(dir+'/read-only.mjs',fs.readFileSync('scripts/team-hub-migration/read-only.mjs','utf8').replace("export const E='docs/architecture/team-hub-2b3-evidence-2026-10-05'",`export const E='${evidence}'`));
for(const name of ['verify-legacy.mjs','verify-team.mjs','verify-tournament.mjs']){
 const source=fs.readFileSync('scripts/team-hub-migration/'+name,'utf8');
 fs.writeFileSync(dir+'/'+name,source.replace("const dir='docs/architecture/team-hub-2b3-evidence-2026-10-05'",`const dir='${evidence}'`));
}
