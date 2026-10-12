import assert from 'node:assert/strict';import {aws,read,save,E,L} from './common.mjs';
const policy=JSON.parse(JSON.stringify(read(E+'/recovery-policy.template.json')).replaceAll('${NotBefore}','2030-01-01T00:00:00Z').replaceAll('${ExpiresAt}','2030-01-01T00:15:00Z'));
const r={checks:[],complete:false,model:'IAM-user composite model; NOT actual temporary-role/SCP/live-service proof'};
for(const c of read(E+'/security-validation.json').checks.filter(x=>/^(Read|Command) mediated /.test(x.label))){
 const out=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(policy)],ResourcePolicy:JSON.stringify(read(L+'/lifecycle-inspection.json').keyPolicy),CallerArn:'arn:aws:iam::058264289478:user/RavenTest',ResourceOwner:'arn:aws:iam::058264289478:root',ActionNames:[c.action],ResourceArns:[c.resource],ContextEntries:Object.entries(c.context).filter(([,v])=>v!==null).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:ContextKeyName==='aws:CurrentTime'?'date':'string'}))});
 r.checks.push({label:c.label,result:out.EvaluationResults});save('composite-key-policy',r);assert.equal(out.EvaluationResults[0].EvalDecision,'allowed');
}r.complete=true;save('composite-key-policy',r);console.log(JSON.stringify({complete:true,checks:r.checks.length,model:r.model}));
