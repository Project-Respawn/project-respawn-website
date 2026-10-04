import test from 'node:test';
import assert from 'node:assert/strict';
import {state,verify,verifyFiles,read,E} from '../verify-tournament-release1.mjs';
test('accepted endpoint, environment, asset and installed security agree',()=>{assert.equal(verify().accepted,true);assert.equal(verifyFiles(),7);});
for(const [name,mutate]of [
 ['production target',s=>s.manifest.environment='production'],
 ['different API',s=>s.manifest.apiId='unreviewedapi'],
 ['unapproved revision',s=>s.manifest.deploymentRevision='0'.repeat(64)],
 ['planned endpoint',s=>s.manifest.status='PLANNED_NOT_DEPLOYED'],
 ['token in endpoint configuration',s=>s.manifest.accessToken='synthetic-test-value'],
 ['unverified endpoint',s=>s.manifest.provenance.liveVerified=false],
 ['frontend cutover substitution',s=>s.manifest.provenance.frontendCutover=true],
 ['old runtime deny',s=>s.runtime=read('infrastructure/security/tournaments-Ntgre-final/runtime-boundary.json')],
 ['broad runtime KMS grant',s=>s.runtime.Statement.push({Effect:'Allow',Action:'kms:*',Resource:'*'})],
 ['execution permission expansion',s=>s.execution.Statement.push({Effect:'Allow',Action:'*',Resource:'*'})],
 ['deployment target expansion',s=>s.deployment.Statement.push({Effect:'Allow',Action:'cloudformation:*',Resource:'*'})],
 ['incomplete acceptance',s=>s.result.accepted=false]
])test('rejects '+name,()=>{const s=state();mutate(s);assert.throws(()=>verify(s));});
test('recorded post-success tests cover all ten customer keys and all resource decisions',()=>{const r=read(E+'/actual-role-post-success-negatives.json');assert.equal(r.pass,true);const k=r.results.find(x=>x.name==='ten customer keys');assert.ok(k&&k.EvaluationResults.length===24);for(const e of k.EvaluationResults){assert.equal(e.EvalDecision,'explicitDeny');assert.equal(e.ResourceSpecificResults.length,10);assert.ok(e.ResourceSpecificResults.every(x=>x.EvalResourceDecision==='explicitDeny'));}assert.ok(r.results.find(x=>x.name==='cross-domain').pass);});
test('live successful decryption and JWT response are retained without credentials',()=>{const a=read(E+'/live-auth.json');assert.equal(a.validIdentity,200);assert.ok(a.contractValid&&a.identityMatches);assert.ok(['noToken','invalidToken','wrongIssuer','wrongClient'].every(k=>a[k]===401));const kms=read(E+'/runtime-kms-live-events.json');assert.ok(kms.events.some(x=>x.operation==='Decrypt'&&!x.error));assert.ok(!('tokens' in a)&&!('accessToken' in a));});
