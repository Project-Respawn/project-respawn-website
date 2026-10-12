import assert from 'node:assert/strict';
import {aws,read,save,E,canonical} from './aws.mjs';
const norm=v=>Array.isArray(v)?v.map(norm).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,norm(x)])):v;
const original=read(E+'/key-policy.json');
const policy=JSON.parse((await aws('kms','get-key-policy',{KeyId:'arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7',PolicyName:'default'})).Policy);
assert.equal(canonical(norm(policy)),canonical(norm(original.policy)));
const attachments=read(E+'/permanent-attachments.json');
const checks=[];
for(const prior of attachments.checks){const attached=(await aws('iam','list-attached-role-policies',{RoleName:prior.role})).AttachedPolicies;assert.deepEqual(attached.map(x=>x.PolicyArn).sort(),prior.expected.slice().sort());checks.push({role:prior.role,attached,expected:prior.expected});}
const frontend=read('config/domains/team-hub/frontend-cutover.PROPOSAL.json');
assert.equal(frontend.reviewed,false);assert.equal(frontend.epoch,null);
save('preservation-extra',{at:new Date().toISOString(),complete:true,keyPolicyUnchanged:true,checks,frontend,awsWrites:0});
console.log(JSON.stringify({complete:true,keyPolicyUnchanged:true,roles:checks.length,frontendActivated:false}));
