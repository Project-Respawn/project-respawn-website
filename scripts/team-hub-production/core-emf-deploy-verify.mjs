// Installed-state inspection and read-only policy simulation; no IAM mutation.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {installed,aws,E,save} from './core-emf-deploy-support.mjs';
const pause=ms=>new Promise(r=>setTimeout(r,ms)),read=p=>JSON.parse(fs.readFileSync(p));
if(process.argv[2]==='security'){
 const result=await installed('coreSecurity','ProjectRespawn-Core-Production-Security');save('security-installed.json',result);
 const cases=read('docs/architecture/production-core-emf-binding-evidence-2026-10-21/security-validation.json').cases.filter(c=>c.policy==='coreSecurity.Execution'),groups=new Map(),rows=[];
 for(const c of cases){const k=JSON.stringify(c.context)+(c.resource==='*'?' STAR':' ARN');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);}
 for(const group of groups.values()){
  const req={PolicySourceArn:'arn:aws:iam::058264289478:role/ProjectRespawn-Core-Production-Execution',ActionNames:[...new Set(group.map(c=>c.action))],ResourceArns:[...new Set(group.map(c=>c.resource))],ContextEntries:Object.entries(group[0].context).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[].concat(v).map(String),ContextKeyType:typeof v==='boolean'?'boolean':Array.isArray(v)?'stringList':'string'}))};
  let response;for(let attempt=0;attempt<5;attempt++){await pause(300);try{response=aws('iam','simulate-principal-policy',req);break;}catch(e){if(!/Throttl|Rate exceeded/.test(String(e.stderr))||attempt===4)throw e;await pause(500*2**attempt+Math.floor(Math.random()*200));}}
  for(const c of group){const top=response.EvaluationResults.find(r=>r.EvalActionName.toLowerCase()===c.action.toLowerCase()&&(r.EvalResourceName===c.resource||r.ResourceSpecificResults?.some(x=>x.EvalResourceName===c.resource)));assert.ok(top);const sub=top.ResourceSpecificResults?.find(x=>x.EvalResourceName===c.resource),decision=sub?.EvalResourceDecision??top.EvalDecision;const row={...c,decision,passed:(decision==='allowed')===c.allowed};rows.push(row);save('installed-iam-simulation.json',{passed:false,complete:false,cases:rows});assert.ok(row.passed,c.name+' '+decision);}
 }
 save('installed-iam-simulation.json',{at:new Date().toISOString(),passed:true,complete:true,cases:rows,limitations:['Simulated context does not prove actual Lambda/KMS service behavior']});console.log(JSON.stringify({installedSecurity:true,actualRoleCases:rows.length,passed:true}));
}else if(process.argv[2]==='import'){
 const r=aws('cloudformation','detect-stack-resource-drift',{StackName:'ProjectRespawn-Core-Production',LogicalResourceId:'Logs'});save('import-drift.json',r);assert.equal(r.StackResourceDrift.StackResourceDriftStatus,'IN_SYNC');console.log('Imported Logs IN_SYNC');
}else if(process.argv[2]==='product'){
 await installed('coreProduct','ProjectRespawn-Core-Production');console.log('Core product installed configuration, runtime hash and IAM verified');
}else throw Error('UNKNOWN_VERIFICATION');
