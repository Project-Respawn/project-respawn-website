// Explicit read-only AWS API allowlist, sequential requests and bounded throttling retries.
import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import fs from 'node:fs';
const allowed={sts:['get-caller-identity'],iam:['get-role','get-role-policy','list-role-policies','list-attached-role-policies','get-policy','get-policy-version','simulate-custom-policy','simulate-principal-policy'],cloudformation:['describe-stacks','list-stack-resources','list-exports','get-template','describe-stack-resource-drifts','validate-template','get-template-summary'],lambda:['get-function-configuration','get-account-settings'],logs:['describe-log-groups'],apigatewayv2:['get-apis'],secretsmanager:['describe-secret'],dynamodb:['describe-table'],cloudwatch:['describe-alarms','get-metric-statistics'],kms:['describe-key','get-key-policy'],accessanalyzer:['validate-policy']};
export const pause=ms=>new Promise(r=>setTimeout(r,ms));
let sequence=0;
export async function aws(service,operation,input={}){
 assert.ok(allowed[service]?.includes(operation),'READ_ONLY_ALLOWLIST '+service+':'+operation);
 const dir='.tmp/production-team-readiness/requests';fs.mkdirSync(dir,{recursive:true});const file=dir+'/'+process.pid+'-'+sequence+++'.json';fs.writeFileSync(file,JSON.stringify(input));
 try{for(let attempt=0;attempt<5;attempt++){await pause(300);try{const result=execFileSync('aws',[service,operation,'--cli-input-json','file://'+file,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{encoding:'utf8',windowsHide:true,maxBuffer:30*1024*1024,stdio:['ignore','pipe','pipe'],env:{...process.env,AWS_MAX_ATTEMPTS:'1',AWS_EC2_METADATA_DISABLED:'true'}});return result.trim()?JSON.parse(result):{};}catch(e){if(/Throttl|Rate exceeded|TooManyRequests/.test(String(e.stderr))&&attempt<4){await pause(500*2**attempt+Math.floor(Math.random()*250));continue;}throw e;}}}finally{fs.unlinkSync(file);}
}
