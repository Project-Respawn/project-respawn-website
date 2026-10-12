import assert from 'node:assert/strict';import {aws,read,save,E,canonical} from './aws.mjs';
const cases=read(E+'/security-validation.json').checks,r=read(E+'/actual-security.json');
const done=new Set(r.checks.map(c=>c.label+'|'+c.action+'|'+c.resource));const groups=new Map();
for(const c of cases){if(done.has(c.label+'|'+c.action+'|'+c.resource))continue;const k=c.action+'|'+canonical(c.context);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);}
console.log(JSON.stringify({remainingCases:cases.length-r.checks.length,batchedCalls:groups.size}));
for(const group of groups.values()){
 await new Promise(resolve=>setTimeout(resolve,6000));const c=group[0];
 const out=await aws('iam','simulate-principal-policy',{PolicySourceArn:'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009',ActionNames:[c.action],ResourceArns:[...new Set(group.map(x=>x.resource))],ContextEntries:Object.entries(c.context).filter(([,v])=>v!==null).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:ContextKeyName==='aws:CurrentTime'?'date':'string'}))});
 assert.ok(!out.IsTruncated);for(const item of group){const flattened=out.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({...x,...y,EvalResourceName:y.EvalResourceName,EvalDecision:y.EvalResourceDecision})): [x]);const e=flattened.find(x=>x.EvalResourceName===item.resource&&x.EvalActionName===item.action);assert.ok(e,item.label);assert.equal(e.EvalDecision,item.expected,item.label);r.checks.push({label:item.label,action:item.action,resource:item.resource,decision:e.EvalDecision,evaluation:e});}save('actual-security',r);
}assert.equal(r.checks.length,cases.length);r.complete=true;save('actual-security',r);console.log(JSON.stringify({complete:true,actualRoleChecks:r.checks.length}));
