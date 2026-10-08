import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
export const E='docs/architecture/core-2b5a-evidence-2026-10-06';
const exec=promisify(execFile);
const allowed={sts:['get-caller-identity'],cloudformation:['describe-stacks','list-stack-resources','get-template'],lambda:['get-function-configuration','list-functions'],iam:['get-role','get-policy','simulate-custom-policy'],accessanalyzer:['validate-policy'],'cognito-idp':['describe-user-pool','describe-user-pool-client','list-user-pool-clients'],kms:['describe-key','list-aliases','get-key-policy','list-grants'],apigatewayv2:['get-apis'],secretsmanager:['describe-secret']};
export async function aws(service,action,args=[]){
 allowed.logs=['describe-log-groups'];allowed.cloudwatch=['describe-alarms'];
 if(service==='accessanalyzer'&&action==='check-no-new-access'&&!allowed.accessanalyzer.includes(action))allowed.accessanalyzer.push(action);
 assert.ok(allowed[service]?.includes(action),'Read-only Core review guard');
 for(let retry=0;;retry++)try{const {stdout}=await exec('aws',[service,action,...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:30e6,env:{...process.env,AWS_MAX_ATTEMPTS:'1'}});return stdout.trim()?JSON.parse(stdout):{};}
 catch(e){if(retry<3&&/Throttl|Rate exceeded/.test(e.stderr??'')){await new Promise(r=>setTimeout(r,1000*(retry+1)));continue;}const error=new Error(`${service} ${action}: ${(e.stderr??'').replace(/\s+/g,' ').slice(0,350)}`);error.code=(e.stderr??'').match(/\(([^)]+)\)/)?.[1];throw error;}
}
export async function identity(){const i=await aws('sts','get-caller-identity');assert.equal(i.Account,'058264289478');assert.equal(i.Arn,'arn:aws:iam::058264289478:user/RavenTest');return i;}
