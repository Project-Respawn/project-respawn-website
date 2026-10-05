import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws,read,save,dir,previous} from './read-aws.mjs';
const manifest=read(dir+'/manifest.json'),inventory=read(dir+'/key-inventory.json');
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Arn,inventory.identity.Arn);assert.equal(identity.Account,'058264289478');
const p={bootstrap:read(dir+'/first-create-policy.json'),steady:read(dir+'/steady-state-fixture-policy.json'),caller:read(dir+'/deployment-caller-policy.json')};
const analyzer={};for(const [name,policy] of Object.entries(p)){save('analyzer-request-'+name,{policyDocument:JSON.stringify(policy),policyType:'IDENTITY_POLICY'});analyzer[name]=await aws('accessanalyzer','validate-policy','--cli-input-json','file://'+dir+'/analyzer-request-'+name+'.json');}save('analyzer',analyzer);
const customer=inventory.keys.filter(k=>k.manager==='CUSTOMER');
for(const key of customer){assert.equal(key.grants.length,0,'Unexpected grant '+key.id);assert.equal(key.policy.Statement.length,1,'Unexpected key-policy statement '+key.id);const s=key.policy.Statement[0];assert.equal(s.Effect,'Allow');assert.deepEqual(s.Principal,{AWS:'arn:aws:iam::058264289478:root'});assert.equal(s.Action,'kms:*');assert.equal(s.Resource,'*');assert.ok(!s.Condition&&!s.NotPrincipal,'Unexpected key policy');}
const jobs=[];const now=new Date().toISOString();
const ctx=[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'},{ContextKeyName:'aws:CurrentTime',ContextKeyValues:[now],ContextKeyType:'date'}];
function add(name,policy,request,expected,kind){const context=[...(request.ContextEntries??[])];for(const [key,value] of [['iam:PermissionsBoundary','arn:aws:iam::058264289478:policy/ProjectRespawn-TeamHub-Ntgre-PreviewBoundary'],['iam:PassedToService','lambda.amazonaws.com']])if(!context.some(c=>c.ContextKeyName===key))context.push({ContextKeyName:key,ContextKeyValues:[value],ContextKeyType:'string'});jobs.push({name,policy,expected,kind,request:{...request,ContextEntries:context,PolicyInputList:[JSON.stringify(p[policy])],PermissionsBoundaryPolicyInputList:[JSON.stringify(p[policy])]}});}
// Replay ALL supported prior cases. The 280 resolved representations are excluded,
// not revisited. API/caller semantics are unchanged by the exact KMS-only diff.
const previousValidation=read(previous+'/validation.json');let carried=0;
for(const job of previousValidation.results){const request=read(previous+'/request-'+job.name+'.json');const excluded=new Set(job.unresolved.map(r=>r.action+' '+r.resource));const groups=new Map();
 for(const action of request.ActionNames){const resources=request.ResourceArns.filter(r=>!excluded.has(action+' '+r));if(!resources.length)continue;const key=JSON.stringify(resources);if(!groups.has(key))groups.set(key,{resources,actions:[]});groups.get(key).actions.push(action);carried+=resources.length;}
 let i=0;for(const g of groups.values()){const policy=job.name.startsWith('bootstrap')?'bootstrap':job.name.startsWith('steady')?'steady':'caller';const context=request.ContextEntries.map(x=>x.ContextKeyName==='aws:CurrentTime'&&job.name!=='bootstrap-expired'?{...x,ContextKeyValues:[now]}:x);add(job.name+'-'+(++i),policy,{...request,ActionNames:g.actions,ResourceArns:g.resources,ContextEntries:context},job.name.endsWith('-kms')?'implicitDeny':job.expected,'full-suite');}
}assert.equal(carried,1214);
const operations=['kms:Decrypt','kms:Encrypt','kms:GenerateDataKey','kms:GenerateDataKeyWithoutPlaintext','kms:ReEncryptFrom','kms:ReEncryptTo','kms:CreateGrant','kms:RetireGrant','kms:PutKeyPolicy','kms:ScheduleKeyDeletion','kms:DisableKey','kms:EnableKey'];
for(const policy of ['bootstrap','steady']){
 for(const key of customer){
  add(policy+'-key-'+key.id,policy,{ActionNames:operations,ResourceArns:[key.arn],ContextEntries:ctx},'implicitDeny','customer-key-negative');
  const aliases=key.aliases.length?key.aliases.map(a=>'arn:aws:kms:eu-north-1:058264289478:'+a):['arn:aws:kms:eu-north-1:058264289478:alias/team-review-unused-'+key.id];
  add(policy+'-alias-create-update-'+key.id,policy,{ActionNames:['kms:CreateAlias','kms:UpdateAlias'],ResourceArns:[key.arn,...aliases],ContextEntries:ctx},'implicitDeny','customer-key-negative');
  add(policy+'-alias-delete-'+key.id,policy,{ActionNames:['kms:DeleteAlias'],ResourceArns:aliases,ContextEntries:ctx},'implicitDeny','customer-key-negative');
 }
 add(policy+'-create-key',policy,{ActionNames:['kms:CreateKey'],ResourceArns:['*'],ContextEntries:ctx},'implicitDeny','kms-administration');
 add(policy+'-lambda-key-no-identity-grant',policy,{ActionNames:['kms:Encrypt','kms:Decrypt','kms:DescribeKey','kms:CreateGrant'],ResourceArns:[inventory.lambdaKeyArn],ContextEntries:ctx},'implicitDeny','default-lambda-no-explicit-deny');
}
// Re-run the exact eleven-resource create/read/rollback cases from the final gate.
const oldLifecycle=read('docs/architecture/team-hub-2b2-final-security-evidence-2026-10-05/lifecycle-simulations.json');
for(const j of oldLifecycle.results){if(j.name==='default-lambda-kms')continue;const req=read('docs/architecture/team-hub-2b2-final-security-evidence-2026-10-05/lifecycle-request-'+j.name+'.json');req.ContextEntries=req.ContextEntries.map(x=>x.ContextKeyName==='aws:CurrentTime'?{...x,ContextKeyValues:[now]}:x);add('rollback-'+j.name,'bootstrap',req,'allowed','rollback-and-create');}
const artifact=read(dir+'/artifact-encryption.json');const zip='arn:aws:s3:::'+artifact.bucket+'/'+artifact.key;
for(const policy of ['bootstrap','steady']){add(policy+'-exact-asset-read',policy,{ActionNames:['s3:GetObject','s3:GetObjectVersion'],ResourceArns:[zip],ContextEntries:ctx},'allowed','artifact');add(policy+'-other-asset-deny',policy,{ActionNames:['s3:GetObject'],ResourceArns:['arn:aws:s3:::'+artifact.bucket+'/unrelated.zip'],ContextEntries:ctx},'explicitDeny','artifact');}
let cursor=0;const results=[];
await Promise.all(Array.from({length:3},async()=>{while(cursor<jobs.length){const job=jobs[cursor++];save('request-'+job.name,job.request);const response=await aws('iam','simulate-custom-policy','--cli-input-json','file://'+dir+'/request-'+job.name+'.json');save('response-'+job.name,response);const rows=response.EvaluationResults.flatMap(e=>e.ResourceSpecificResults?.length?e.ResourceSpecificResults.map(r=>({action:e.EvalActionName,resource:r.EvalResourceName,decision:r.EvalResourceDecision,missing:r.MissingContextValues??e.MissingContextValues??[]})):[{action:e.EvalActionName,resource:e.EvalResourceName,decision:e.EvalDecision,missing:e.MissingContextValues??[]}]);const failures=rows.filter(r=>r.missing.length||(job.expected==='denied'?!['implicitDeny','explicitDeny'].includes(r.decision):r.decision!==job.expected));if(rows.length!==job.request.ActionNames.length*job.request.ResourceArns.length)failures.push({error:'Incomplete coverage'});results.push({name:job.name,kind:job.kind,expected:job.expected,count:rows.length,failures});}}));
results.sort((a,b)=>a.name.localeCompare(b.name));const findings=Object.values(analyzer).flatMap(a=>a.findings);
const summary={at:new Date().toISOString(),identity,jobs:results.length,assertions:results.reduce((n,j)=>n+j.count,0),positive:results.filter(j=>j.expected==='allowed').reduce((n,j)=>n+j.count,0),negative:results.filter(j=>j.expected!=='allowed').reduce((n,j)=>n+j.count,0),carriedSupportedCases:carried,resolvedSimulatorCasesNotRerun:280,customerKeys:customer.length,failures:results.filter(j=>j.failures.length),analyzerFindings:findings,results,awsWrites:0};save('validation',summary);console.log(JSON.stringify({...summary,results:undefined}));if(summary.failures.length||findings.length)process.exitCode=1;
