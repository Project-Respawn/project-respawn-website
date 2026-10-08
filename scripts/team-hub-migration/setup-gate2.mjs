import fs from 'node:fs';
const from='scripts/team-hub-migration/direct-protection',to='scripts/team-hub-migration/gate2';fs.mkdirSync(to,{recursive:true});
const old='docs/architecture/team-hub-2b3-direct-protection-evidence-2026-10-05',next='docs/architecture/team-hub-2b3-gate2-evidence-2026-10-05';fs.mkdirSync(next,{recursive:true});
for(const name of ['read-only.mjs','verify-legacy.mjs','verify-team.mjs','verify-tournament.mjs','table-postcheck.mjs'])fs.writeFileSync(`${to}/${name}`,fs.readFileSync(`${from}/${name}`,'utf8').replaceAll(old,next));
