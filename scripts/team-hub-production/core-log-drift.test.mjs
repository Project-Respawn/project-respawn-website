import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';
import {out,read,addition} from './core-log-drift-prepare.mjs';import {sha} from './deployment-prepare.mjs';
const m=read(out+'/manifest.json'),before=read(m.installedSecurity.path),after=read(m.security.path);
test('only the exact region-bound index metadata read is added to both execution policy layers',()=>{
 const t=structuredClone(after);for(const[id,kind]of [['Execution','identity'],['ExecutionBoundary','boundary']]){const p=kind==='identity'?t.Resources[id].Properties.Policies[0].PolicyDocument:t.Resources[id].Properties.PolicyDocument;assert.deepEqual(p.Statement.pop(),addition);}
 assert.deepEqual(t,before);assert.deepEqual(Object.keys(after.Resources),Object.keys(before.Resources));assert.equal(Object.keys(after.Resources).length,6);
 assert.deepEqual(addition,{Effect:'Allow',Action:'logs:DescribeIndexPolicies',Resource:'*',Condition:{StringEquals:{'aws:RequestedRegion':'eu-north-1'}}});
});
test('all KMS lifecycle conditions and explicit Deny/NotAction statements remain identical',()=>{
 for(const d of read(out+'/policy-diff.json')){const keep=p=>p.Statement.filter(s=>s.Effect==='Deny'||s.NotAction||[].concat(s.Action??[]).some(a=>a.startsWith('kms:')));assert.deepEqual(keep(d.after),keep(d.before));}
});
test('policy and template pins reject artifact substitution and fit aggregate role/managed-policy quotas',()=>{
 for(const a of [m.security,m.product,m.runtime,...m.policies])assert.equal(sha(fs.readFileSync(a.path)),a.sha256);
 for(const p of m.policies)assert.ok(JSON.stringify(read(p.path)).length<=p.limit);assert.equal(after.Resources.Execution.Properties.Policies.length,1);
 assert.equal(m.product.sha256,'b9c5d96e7123a6d837c903f1e1779080e020aba8c9eab8af1e2ddccde912ed96');assert.equal(m.runtime.sha256,'fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503');
});
test('runtime/caller boundaries, service-only trust, PassRole and artifact/rollback access are preserved',()=>{
 for(const[id,r]of Object.entries(before.Resources))if(!['Execution','ExecutionBoundary'].includes(id))assert.deepEqual(after.Resources[id],r);
 assert.deepEqual(after.Resources.Execution.Properties.AssumeRolePolicyDocument,before.Resources.Execution.Properties.AssumeRolePolicyDocument);
 const unaffected=p=>p.Statement.filter(s=>s.Action!=='logs:DescribeIndexPolicies');for(const d of read(out+'/policy-diff.json'))assert.deepEqual(unaffected(d.after),d.before.Statement);
});
test('no delete/reimport, Team deployment, authority initialization or publication is authorized',()=>{
 assert.equal(m.approved,false);assert.equal(m.awsWrites,0);assert.equal(m.importedLogs.deleteOrReimport,false);assert.equal(m.teamDeploymentAuthorized,false);assert.equal(m.authorityInitialization,false);assert.equal(m.masterPublication,false);assert.equal(m.expectedProductChanges.additions.length,6);assert.equal(m.expectedProductChanges.finalResourceCount,7);assert.deepEqual(Object.keys(read(m.product.path).Resources).filter(id=>id!=='Logs').sort(),m.expectedProductChanges.additions.slice().sort());
});
