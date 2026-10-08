import assert from 'node:assert/strict';import {aws,identity,pin,save,read,E,P} from './aws.mjs';
pin();await identity();const resource='arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/core/contracts:log-stream:review';
const unconditional={Version:'2012-10-17',Statement:[{Effect:'Allow',Action:'logs:*',Resource:'*'}]};
const results=[];
for(const policy of ['pinned','unconditional'])for(const action of ['logs:PutLogEvents','logs:CreateLogStream']){
 const p=policy==='pinned'?read(P+'/runtime-policy.json'):unconditional;
 const args=['--policy-input-list',JSON.stringify([JSON.stringify(p)]),'--action-names',action,'--resource-arns',resource];
 if(policy==='pinned')args.push('--permissions-boundary-policy-input-list',JSON.stringify([JSON.stringify(read(P+'/runtime-boundary.json'))]));
 const r=await aws('iam','simulate-custom-policy',args);results.push({policy,service:'logs',action,resource,conditions:{},expected:'allowed',response:r});save('logging-controls',{at:new Date().toISOString(),results,awsWrites:0});
}
const pinned=results.find(r=>r.policy==='pinned'&&r.action==='logs:PutLogEvents').response.EvaluationResults[0].EvalDecision;
const broad=results.find(r=>r.policy==='unconditional'&&r.action==='logs:PutLogEvents').response.EvaluationResults[0].EvalDecision;
save('logging-classification',{at:new Date().toISOString(),original:pinned,unconditional:broad,classification:broad!=='allowed'?'SIMULATOR_UNSUPPORTED':pinned==='allowed'?'OTHER':'UNKNOWN',reason:broad!=='allowed'?'Same concrete log-stream/action representation denies even unconditional logs:* Resource:*; do not broaden candidate.':pinned==='allowed'?'Previously discrepant result is now allowed; compare original evidence.':'Unconditional allows but pinned denies; further investigation required.',candidateChanged:false,awsWrites:0});console.log(JSON.stringify({pinned,unconditional:broad,classification:broad!=='allowed'?'SIMULATOR_UNSUPPORTED':'INVESTIGATE'}));
