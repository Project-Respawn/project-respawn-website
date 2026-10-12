import assert from 'node:assert/strict';
import {aws,read,save,canonical} from './aws.mjs';
import {verify} from './pins.mjs';
const c=verify(),p=read(c.root+'/product.template.json'),s=read(c.root+'/security.template.json');
const result={at:new Date().toISOString(),roles:[],checks:[],complete:false,liveDecryptionProven:false};
for(const kind of ['Read','Command']){
 const props=p.Resources['Parity'+kind+'Role'].Properties,name=props.RoleName,role=(await aws('iam','get-role',{RoleName:name})).Role;
 assert.equal(canonical(role.AssumeRolePolicyDocument),canonical(props.AssumeRolePolicyDocument));
 const names=(await aws('iam','list-role-policies',{RoleName:name})).PolicyNames;assert.deepEqual(names,props.Policies.map(x=>x.PolicyName));
 for(const item of props.Policies)assert.equal(canonical((await aws('iam','get-role-policy',{RoleName:name,PolicyName:item.PolicyName})).PolicyDocument),canonical(item.PolicyDocument));
 assert.equal((await aws('iam','list-attached-role-policies',{RoleName:name})).AttachedPolicies.length,0);
 const arn='arn:aws:iam::058264289478:policy/'+s.Resources['Parity'+kind+'Boundary'].Properties.ManagedPolicyName;assert.equal(role.PermissionsBoundary.PermissionsBoundaryArn,arn);
 const meta=(await aws('iam','get-policy',{PolicyArn:arn})).Policy;assert.equal(canonical((await aws('iam','get-policy-version',{PolicyArn:arn,VersionId:meta.DefaultVersionId})).PolicyVersion.Document),canonical(s.Resources['Parity'+kind+'Boundary'].Properties.PolicyDocument));
 result.roles.push({name,arn:role.Arn,boundary:arn,version:meta.DefaultVersionId,exactPinnedPolicies:true});save('runtime-security-after',result);
}
const old=read('docs/architecture/team-hub-business-runtime-evidence-2026-10-08/security-review.json').checks.filter(x=>x.mode==='candidate');
const cursor=read('docs/architecture/team-hub-cursor-security-evidence-2026-10-08/security-review.json').checks.filter(x=>x.mode==='candidate'&&['Read','Command'].includes(x.kind));
const entries=o=>Object.entries(o).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:Array.isArray(v)?v:[v],ContextKeyType:Array.isArray(v)?'stringList':'string'}));
const cases=[...old.map(x=>({...x,expected:x.after})),...cursor.map(x=>({...x,context:entries(x.context)}))];
for(let i=0;i<cases.length;i+=5){const settled=await Promise.allSettled(cases.slice(i,i+5).map(async x=>{const r=await aws('iam','simulate-principal-policy',{PolicySourceArn:'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-Parity'+x.kind,ActionNames:[x.action],ResourceArns:[x.resource],ContextEntries:x.context});const d=r.EvaluationResults[0];assert.equal(d.EvalDecision==='allowed',x.expected,x.kind+' '+x.label);return {kind:x.kind,label:x.label,action:x.action,resource:x.resource,expected:x.expected,decision:d.EvalDecision};}));for(const r of settled){if(r.status==='rejected')throw r.reason;result.checks.push(r.value);}save('runtime-security-after',result);}
result.complete=true;save('runtime-security-after',result);console.log(JSON.stringify({complete:true,decisions:result.checks.length,liveDecryptionProven:false}));
