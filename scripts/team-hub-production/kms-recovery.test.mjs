import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {out,read} from './kms-recovery-prepare.mjs';
import {sha,lambdaKey} from './deployment-prepare.mjs';
const m=read(out+'/manifest.json');
test('exact proposed artifacts and original product/runtime pins are intact',()=>{
 for(const a of [...Object.values(m.security),m.logImport,...Object.values(m.products),...Object.values(m.assets)])assert.equal(sha(fs.readFileSync(a.path)),a.sha256);
 assert.equal(m.products.coreProduct.sha256,'b9c5d96e7123a6d837c903f1e1779080e020aba8c9eab8af1e2ddccde912ed96');assert.equal(m.approved,false);assert.equal(m.awsWrites,0);
});
test('only execution policies change; runtime boundaries, callers, generated resources and trust preserved',()=>{
 for(const kind of Object.keys(m.security)){
  const a=read(m.previousSecurity[kind].path),b=read(m.security[kind].path);
  for(const[id,r]of Object.entries(a.Resources)){
   if(!/Execution/.test(id)){assert.deepEqual(b.Resources[id],r);continue;}
   const before=structuredClone(r),after=structuredClone(b.Resources[id]);
   if(r.Type==='AWS::IAM::Role'){delete before.Properties.Policies;delete after.Properties.Policies;}
   else {delete before.Properties.PolicyDocument;delete after.Properties.PolicyDocument;}
   assert.deepEqual(after,before);
  }
  assert.deepEqual(b.Outputs,a.Outputs);
 }
});
test('new grant permission is exact-key and service/account/resource mediated, never unrestricted KMS',()=>{
 for(const p of m.policies){const d=read(p.path),s=d.Statement.filter(s=>s.Effect==='Allow'&&s.Action==='kms:CreateGrant');assert.equal(s.length,1);assert.equal(s[0].Resource,lambdaKey);assert.deepEqual(s[0].Condition,{StringEquals:{'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478'},Bool:{'kms:GrantIsForAWSResource':'true'}});assert.ok(JSON.stringify(d).length<=(p.kind==='boundary'?6144:10240));
  if(p.kind==='identity'){assert.ok(d.Statement.some(s=>s.NotAction?.includes('kms:CreateGrant')));assert.ok(d.Statement.some(s=>s.Effect==='Deny'&&s.Condition?.BoolIfExists));}
 }
});
test('bootstrap imports one retained exact existing log without creating a replacement',()=>{
 const t=read(m.logImport.path),full=read(m.products.coreProduct.path);assert.deepEqual(Object.keys(t.Resources),['Logs']);assert.deepEqual(t.Resources.Logs,full.Resources.Logs);assert.equal(t.Resources.Logs.DeletionPolicy,'Retain');assert.equal(t.Resources.Logs.UpdateReplacePolicy,'Retain');assert.equal(Object.keys(full.Resources).length-1,6);assert.equal(m.importResources[0].ResourceIdentifier.LogGroupName,'/project-respawn/Production/core/contracts');
});
test('all unchanged deny statements survive and only the reviewed Deny NotAction changes',()=>{
 for(const d of read(out+'/policy-diff.json')){
  for(const s of d.before.Statement.filter(s=>s.Effect==='Deny')){
   const expected=structuredClone(s);if(expected.NotAction?.includes('kms:DescribeKey')&&JSON.stringify(expected.Resource).includes(lambdaKey))expected.NotAction.push('kms:CreateGrant');
   assert.ok(d.after.Statement.some(a=>JSON.stringify(a)===JSON.stringify(expected)),d.policy);
  }
 }
});
