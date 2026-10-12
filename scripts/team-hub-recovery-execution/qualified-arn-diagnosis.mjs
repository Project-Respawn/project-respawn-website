import assert from 'node:assert/strict';
import {aws,read,save,E} from './aws.mjs';
const installed=read(E+'/installed.json'),checks=[];
for(const kind of ['Read','Command'])for(const suffix of ['',':$LATEST']){
 const resource='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-Parity'+kind+suffix;
 const result=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(installed.policy)],ActionNames:['lambda:UpdateFunctionConfiguration'],ResourceArns:[resource],ContextEntries:[{ContextKeyName:'aws:CurrentTime',ContextKeyType:'date',ContextKeyValues:['2026-10-09T22:07:45Z']},{ContextKeyName:'aws:RequestedRegion',ContextKeyType:'string',ContextKeyValues:['eu-north-1']}]});
 const decision=result.EvaluationResults[0].EvalDecision;assert.equal(decision,suffix?'explicitDeny':'allowed');checks.push({resource,decision,result});
}
save('qualified-arn-diagnosis',{at:new Date().toISOString(),complete:true,checks,policyChanged:false,limitation:'Post-failure diagnostic simulation; not live update or authorization to revise the pin.'});console.log(JSON.stringify({complete:true,qualifiedDenied:2,unqualifiedAllowed:2}));
