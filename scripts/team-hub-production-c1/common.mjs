import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
export {B,manifest,read,sha,canon,digest,pins} from '../team-hub-permissions/tagging-live-common.mjs';
// Exact sanitized prerequisites are checkpointed for clones without the historical checkout.
export const H=fs.existsSync('.codex-worktrees/team-hub-production-preparation/docs/architecture/production-core-emf-binding-evidence-2026-10-21/sealed-manifest.json')?'.codex-worktrees/team-hub-production-preparation':'docs/architecture/production-team-hub-checkpoint-history-2026-10-24';
export const E='docs/architecture/production-team-hub-c1-2026-10-24';
fs.mkdirSync(E,{recursive:true});
export const save=(n,v)=>fs.writeFileSync(E+'/'+n,JSON.stringify(v,null,2)+'\n');
export const name='ProjectRespawn-TeamHub-Production-C1Initialize';
export const machine='arn:aws:states:eu-north-1:058264289478:stateMachine:'+name;
export const role='arn:aws:iam::058264289478:role/'+name;
export const table='ProjectRespawn-TeamHub-Production-Journal';
export const tableArn='arn:aws:dynamodb:eu-north-1:058264289478:table/'+table;
export const key={PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}};
const writeActions=new Set(['create-change-set','execute-change-set','delete-stack','start-execution']);
const allowed={sts:['get-caller-identity'],cloudformation:['validate-template','create-change-set','describe-change-set','execute-change-set','delete-stack','describe-stacks','list-stacks','list-stack-resources','get-template','list-exports','describe-stack-events'],iam:['get-user','list-groups-for-user','list-attached-group-policies','list-group-policies','get-role','get-role-policy','list-role-policies','list-attached-role-policies','get-policy','get-policy-version','simulate-custom-policy','simulate-principal-policy'],dynamodb:['describe-table','describe-continuous-backups','get-item','scan','describe-backup','get-resource-policy'],s3api:['get-bucket-policy'],lambda:['get-function-configuration'],kms:['describe-key','get-key-policy'],secretsmanager:['describe-secret'],cloudwatch:['describe-alarms','get-metric-statistics'],amplify:['get-branch','list-jobs'],'cognito-idp':['describe-user-pool','describe-user-pool-client'],stepfunctions:['validate-state-machine-definition','describe-state-machine','start-execution','describe-execution','get-execution-history'],accessanalyzer:['validate-policy']};
let serial=0;
export function aws(s,a,input={}){
 assert(allowed[s]?.includes(a),'UNREVIEWED_API '+s+':'+a);
 if(writeActions.has(a)){assert.equal(process.env.TEAM_HUB_C1_AUTHORIZED,'yes');assert(input.StackName===name||input.stateMachineArn===machine,'UNREVIEWED_WRITE_TARGET');}
 fs.mkdirSync('.tmp/production-c1',{recursive:true});const f='.tmp/production-c1/'+process.pid+'-'+serial+++'.json';fs.writeFileSync(f,JSON.stringify(input));
 try{const out=execFileSync('aws',[s,a,'--cli-input-json','file://'+f,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,encoding:'utf8',maxBuffer:35e6,env:{...process.env,AWS_MAX_ATTEMPTS:'1'}});return out.trim()?JSON.parse(out):{};}finally{fs.unlinkSync(f);}
}
export const pause=ms=>new Promise(r=>setTimeout(r,ms));
export async function retryRead(s,a,input={}){assert(!writeActions.has(a));for(let n=0;n<5;n++){await pause(800);try{return aws(s,a,input);}catch(e){if(n===4||!/Throttl|Rate exceeded|TooManyRequests/.test(String(e.stderr)))throw e;await pause(700*2**n+Math.floor(Math.random()*200));}}}
export function intent(n,input){fs.writeFileSync(E+'/'+n+'.intent.json',JSON.stringify({at:new Date().toISOString(),automaticRetry:false,input},null,2)+'\n',{flag:'wx'});}
