import fs from 'node:fs';
const from='scripts/team-hub-migration/gate2',to='scripts/team-hub-migration/gate3';
fs.mkdirSync(to,{recursive:true});
const old='docs/architecture/team-hub-2b3-gate2-evidence-2026-10-05',next='docs/architecture/team-hub-2b3-gate3-evidence-2026-10-05';
fs.mkdirSync(next,{recursive:true});
for(const name of ['read-only.mjs','verify-legacy.mjs','verify-team.mjs','verify-tournament.mjs','table-postcheck.mjs','source.mjs','common.mjs']) {
 let text=fs.readFileSync(`${from}/${name}`,'utf8').replaceAll(old,next);
 if(name==='common.mjs')text=text.replace("if(['restore-table-from-backup','delete-table','update-table'].includes(action))guardWrite(action,args);","if(['restore-table-from-backup','delete-table','update-table'].includes(action))throw Error('Gate 3 source verifier is read-only');");
 fs.writeFileSync(`${to}/${name}`,text);
}
const ledger=JSON.parse(fs.readFileSync('docs/architecture/legacy-resource-ownership.json','utf8'));
console.log(JSON.stringify({ledgerKeys:Object.keys(ledger),rows:ledger.resources?.length}));
