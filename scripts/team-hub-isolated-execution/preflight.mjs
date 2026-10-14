import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {build} from 'esbuild';import {spawn} from 'node:child_process';
const P='docs/architecture/team-hub-isolated-verification-evidence-2026-10-12';
export const E='docs/architecture/team-hub-isolated-execution-evidence-2026-10-12';
const B='.tmp/team-hub-isolated-execution';fs.mkdirSync(E,{recursive:true});fs.mkdirSync(B,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(sha(P+'/candidate.json'),'5b701d83da949d2a59df7807f6fe716986432cd08b2e0a84fde72dd0d6f03da6');
const candidate=read(P+'/candidate.json');for(const a of [candidate.template,candidate.policy,candidate.probe,...candidate.sourceHashes])assert.equal(sha(a.path),a.sha256,a.path);
const closure=read(P+'/probe-source-closure.json');assert.equal(sha('package-lock.json'),closure.dependencyLockSha256);for(const a of closure.sources)assert.equal(sha(a.path),a.sha256,a.path);
const template=read(candidate.template.path);assert.deepEqual(Object.keys(template.Resources).sort(),['CursorProbe','IsolatedJournal','IsolatedOperational','IsolatedRunner']);
assert.ok(!template.Transform);assert.equal(template.Resources.CursorProbe.Properties.Role,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ParityRead');
fs.writeFileSync(E+'/pins.json',JSON.stringify({at:new Date().toISOString(),candidateSha256:sha(P+'/candidate.json'),candidate,sourceClosureVerified:true,resourceInventory:Object.entries(template.Resources).map(([logicalId,r])=>({logicalId,type:r.Type,properties:r.Properties})),supportingResources:{inlinePolicies:1,newManagedPolicies:0,newLogGroups:0,newInvocationPermissions:0,existingLogGroup:'/project-respawn/Ntgre/team-hub/parity-read',existingReadRoleReused:true,artifactObjects:1},complete:true,awsWrites:0},null,2)+'\n');
// Bundle inspection scripts only. Preserve all pinned source/runtime bytes and prior receipts.
await build({entryPoints:['scripts/team-hub-isolated-verification/baseline.mjs'],outfile:B+'/baseline.mjs',bundle:true,platform:'node',format:'esm',packages:'external',logLevel:'silent',plugins:[{name:'fresh-evidence',setup(b){b.onLoad({filter:/\.mjs$/},({path})=>({contents:fs.readFileSync(path,'utf8').replaceAll(P,E),loader:'js'}));}}]});
await new Promise((resolve,reject)=>{const c=spawn(process.execPath,[B+'/baseline.mjs'],{stdio:'inherit',windowsHide:true});c.on('exit',code=>code===0?resolve():reject(Error('Fresh baseline failed '+code)));});
console.log(JSON.stringify({pins:true,freshBaseline:true,awsResourceChanges:0}));
