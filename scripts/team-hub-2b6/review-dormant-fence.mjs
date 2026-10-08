import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { aws, identity } from '../core-2b5a/aws.mjs';
import { dormantBundle, denialProjection } from './fence-sequencing.mjs';
const E='docs/architecture/team-hub-2b6-evidence-2026-10-07';
const B=E+'/gate-b'; fs.mkdirSync(B,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const save=(name,value)=>fs.writeFileSync(B+'/'+name+'.json',JSON.stringify(value,null,2)+'\n');
const candidatePath='docs/architecture/team-hub-2b5b-evidence-2026-10-07/fence-candidates.json';
const candidate=read(candidatePath), bundle=dormantBundle(candidate);
bundle.candidate={path:candidatePath,sha256:sha(candidatePath)};
bundle.inputs=['iam-coverage','coverage-refresh','edge-refresh'].map(n=>({path:E+'/'+n+'.json',sha256:sha(E+'/'+n+'.json')}));
save('dormant-bundle',bundle);
const r={at:new Date().toISOString(),identity:await identity(),scope:'POLICY_VALIDATION_AND_IDENTITY_DENY_PROJECTION_ONLY',resourcePolicyRoleSimulation:false,liveEnforcement:false,installed:false,awsWrites:0,analyzer:[],simulations:[],complete:false};
const checkpoint=()=>save('policy-evaluation',r);
for(const [name,policy] of [...bundle.future.tables.map((t,i)=>['table-'+i,t.policy]),['logo',bundle.future.logo.policy]]) {
  save(name+'-frozen-policy',policy);
  const out=await aws('accessanalyzer','validate-policy',['--policy-document','file://'+path.resolve(B+'/'+name+'-frozen-policy.json').replaceAll('\\','/'),'--policy-type','RESOURCE_POLICY']);
  r.analyzer.push({name,findings:out.findings}); checkpoint();
  assert.ok(!out.findings.some(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)),name+' policy finding');
}
const writeActions=bundle.future.tables[0].policy.Statement.find(s=>s.Sid==='TeamHubMigrationWriterFence').Action;
const tables=bundle.future.tables.map(t=>t.arn), other='arn:aws:dynamodb:eu-north-1:058264289478:table/NOT_A_DEPLOYMENT_TARGET_SIMULATION_ONLY';
const frozen={Version:'2012-10-17',Statement:bundle.future.tables.flatMap(t=>denialProjection(t.policy).Statement)};
async function simulate(name,actions,resources,deny,expected,context=[]) {
  // This Allow exists ONLY in simulator input. It is never attached or deployed.
  const allow={Version:'2012-10-17',Statement:[{Effect:'Allow',Action:actions,Resource:resources}]};
  const input={PolicyInputList:[JSON.stringify(allow),...(deny?[JSON.stringify(deny)]:[])],ActionNames:actions,ResourceArns:resources,ContextEntries:context};
  const file='.tmp/team-hub-2b6/gate-b-simulation.json';fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(input));
  const out=await aws('iam','simulate-custom-policy',['--cli-input-json','file://'+path.resolve(file).replaceAll('\\','/')]);
  assert.equal(out.IsTruncated??false,false);
  const decisions=out.EvaluationResults.flatMap(result => result.ResourceSpecificResults?.length
    ? result.ResourceSpecificResults.map(resource=>({EvalActionName:result.EvalActionName,EvalResourceName:resource.EvalResourceName,EvalDecision:resource.EvalResourceDecision,MissingContextValues:[...(result.MissingContextValues??[]),...(resource.MissingContextValues??[])]}))
    : [result]);
  for(const result of decisions) {
    const want=expected(result.EvalActionName,result.EvalResourceName);
    r.simulations.push({name,action:result.EvalActionName,resource:result.EvalResourceName,expected:want,actual:result.EvalDecision,missingContext:result.MissingContextValues??[]});
    checkpoint();assert.equal(result.EvalDecision,want,name);assert.equal((result.MissingContextValues??[]).length,0);
  }
  assert.equal(decisions.length,actions.length*resources.length);
}
const actions=[...writeActions,'dynamodb:GetItem'];
await simulate('UNATTACHED_BASELINE_CONTROL',actions,[...tables,other],null,()=> 'allowed');
await simulate('FROZEN_IDENTITY_DENY_PROJECTION',actions,[...tables,other],frozen,(a,res)=>tables.includes(res)&&writeActions.includes(a)?'explicitDeny':'allowed');
await simulate('OMITTED_TABLE_NEGATIVE_CONTROL',actions,[tables[0]],{...frozen,Statement:frozen.Statement.slice(1)},()=> 'allowed');
const txContext=[{ContextKeyName:'dynamodb:EnclosingOperation',ContextKeyValues:['TransactWriteItems'],ContextKeyType:'string'}];
await simulate('TRANSACTION_UNDERLYING_ACTIONS',['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem'],tables,frozen,()=> 'explicitDeny',txContext);
const logo=denialProjection(bundle.future.logo.policy),prefix=logo.Statement[0].Resource.replace('*','gate-b-simulation-only');
const outside=prefix.replace('/team-logos/','/unrelated-simulation-only/');
const logoActions=[...logo.Statement[0].Action,'s3:GetObject'];
await simulate('LOGO_UNATTACHED_CONTROL',logoActions,[prefix,outside],null,()=> 'allowed');
await simulate('LOGO_FROZEN_PROJECTION',logoActions,[prefix,outside],logo,(a,res)=>res===prefix&&a!=='s3:GetObject'?'explicitDeny':'allowed');
const prior=read('docs/architecture/team-hub-2b5b-evidence-2026-10-07/fence-rehearsal.json');
assert.ok(prior.passed&&prior.cleanup&&prior.legacyWriterAllowed);
r.priorIsolatedLiveProof={path:'docs/architecture/team-hub-2b5b-evidence-2026-10-07/fence-rehearsal.json',sha256:sha('docs/architecture/team-hub-2b5b-evidence-2026-10-07/fence-rehearsal.json'),checks:prior.checks.length,scope:prior.scope,sourceFenceInstalled:false,limits:'One administrative principal on disposable table; not generated AppSync, S3 or every role; no new live isolated resources created.'};
r.complete=true;checkpoint();console.log(JSON.stringify({analyzer:r.analyzer.length,simulations:r.simulations.length,complete:true,awsWrites:0,liveEnforcement:false}));
