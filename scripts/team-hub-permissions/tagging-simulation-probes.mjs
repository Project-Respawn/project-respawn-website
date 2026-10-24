import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const E='docs/architecture/production-team-hub-tagging-recovery-2026-10-24',input=JSON.parse(fs.readFileSync('.tmp/team-hub-production-tagging/security/request.json'));
const api='arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages';
for(const [name,request]of [
 ['batch-without-untag',{...input,ActionNames:input.ActionNames.filter(x=>x!=='apigateway:UntagResource')}],
 ['untag-single',{...input,ActionNames:['apigateway:UntagResource'],ResourceArns:[api]}],
 ['tag-single-full-policy',{...input,ActionNames:['apigateway:TagResource'],ResourceArns:[api]}],
]){const path=E+'/'+name+'.request.local.json';fs.writeFileSync(path,JSON.stringify(request));let result;try{const response=JSON.parse(execFileSync('aws',['iam','simulate-custom-policy','--cli-input-json','file://'+path,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:40*1024*1024,env:{...process.env,AWS_MAX_ATTEMPTS:'1'}}));result={name,supported:true,evaluations:response.EvaluationResults.length,decisions:[...new Set(response.EvaluationResults.map(x=>x.EvalDecision))]};}catch(e){result={name,supported:false,error:String(e.stderr??e.message)};}finally{fs.unlinkSync(path);}fs.writeFileSync(E+'/'+name+'.json',JSON.stringify({at:new Date().toISOString(),...result,awsWrites:0},null,2)+'\n');console.log(JSON.stringify(result));}
