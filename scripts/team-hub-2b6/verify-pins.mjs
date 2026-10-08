import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const E='docs/architecture/team-hub-2b6-evidence-2026-10-07',B='docs/architecture/team-hub-2b5b-evidence-2026-10-07';
const read=p=>JSON.parse(fs.readFileSync(p));const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const candidate=read(B+'/candidate.json'),frontend=read(B+'/frontend-source-manifest.json');
const revision=read(E+'/frontend-revision.json');
assert.equal(revision.backendChanged,false);assert.equal(revision.liveActivation,false);
assert.deepEqual(revision.changes.map(c=>c.path).sort(),['src/features/team-hub/services/website-adapter.mjs','src/features/Team Hub/team-hub.routes.js','src/features/team-hub/services/route-access.mjs','src/features/Team Hub/champion-pool/ChampionPool.vue'].sort());for(const c of revision.changes)assert.equal(sha(c.path),c.sha256);
for(const item of [...candidate.sourceHashes,...frontend.files]){
 const change=revision.changes.find(c=>c.path===item.path);
 if(change){assert.equal(change.previousSha256,item.sha256);assert.equal(sha(item.path),change.sha256,item.path);}
 else assert.equal(sha(item.path),item.sha256,item.path);
}
for(const kind of ['product','security'])assert.equal(sha(B+'/'+kind+'-candidate.template.json'),candidate[kind+'Sha256']);
assert.equal(sha(B+'/monitoring-candidate.template.json'),candidate.monitoringSha256);
assert.equal(sha(candidate.runtimePath),candidate.runtimeSha256);
assert.equal(read('config/domains/team-hub/frontend-cutover.PROPOSAL.json').reviewed,false);
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',windowsHide:true}).trim();
const receipt={at:new Date().toISOString(),branch:git('branch','--show-current'),head:git('rev-parse','HEAD'),workingTree:git('status','--porcelain=v1').split('\n'),candidateRuntime:candidate.runtimeSha256,product:candidate.productSha256,security:candidate.securitySha256,monitoring:candidate.monitoringSha256,sourceFiles:[...candidate.sourceHashes,...frontend.files].map(f=>({...f,sha256:revision.changes.find(c=>c.path===f.path)?.sha256??f.sha256})),frontendRevision:revision,pinsVerified:true,frontendActivation:false,awsWrites:0};
fs.writeFileSync(E+'/pins.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({pinsVerified:true,branch:receipt.branch,head:receipt.head,dirtyEntries:receipt.workingTree.length}));
