import fs from 'node:fs';
import assert from 'node:assert/strict';
import {E,read,save,digest,targets} from './common.mjs';
const source=read(E+'/source-before.json'),security=read(E+'/security.json'),legacy=read(E+'/legacy-before.json'),team=read(E+'/team-baseline.json'),tournament=read(E+'/tournament-baseline.json'),tables=read(E+'/all-table-protection-after.json');
assert.equal(source.empty,true);assert.equal(source.complete,true);assert.equal(security.allowed,true);assert.equal(team.unchanged,true);assert.deepEqual(tournament.issues,[]);assert.equal(tables.onlyFourApprovedProtectionsChanged,true);
const accepted=read('docs/architecture/team-hub-2b3-direct-protection-evidence-2026-10-05/legacy-after.json');
for(const key of ['root','stacks','protectedResources','lambdas','coreIdentity']){const normalize=v=>key==='protectedResources'?[...v].sort((a,b)=>a.physicalId.localeCompare(b.physicalId)):v;assert.equal(digest(normalize(legacy[key])),digest(normalize(accepted[key])),'Legacy drift '+key);}
for(const name of ['team-baseline','tournament-baseline','all-table-protection-after']){assert.ok(!fs.existsSync(`${E}/${name}-before.json`));fs.copyFileSync(`${E}/${name}.json`,`${E}/${name}-before.json`);}
const plan={at:new Date().toISOString(),identity:source.identity,account:'058264289478',region:'eu-north-1',targets,temporaryTables:4,ready:true,newRoles:0,newGrants:0,legacyDeployments:0,productionTarget:null,guardTests:11};save('execution-gate',{...plan,planSha256:digest(plan)});console.log(JSON.stringify({ready:true,targets:targets.map(t=>t.name),planSha256:digest(plan)}));
