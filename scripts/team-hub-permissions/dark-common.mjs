// Fixed-package execution support. No runtime/secret values or session credentials persisted.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
export const E='docs/architecture/production-team-hub-permissions-execution-2026-10-24';
export const B='docs/architecture/team-hub-production-permissions-candidate-2026-10-24/v2';
export const H='.codex-worktrees/team-hub-production-preparation';
fs.mkdirSync(E,{recursive:true});
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
export const save=(n,v)=>fs.writeFileSync(E+'/'+n,JSON.stringify(v,null,2)+'\n');
export const sha=v=>createHash('sha256').update(v).digest('hex');
export const canon=v=>Array.isArray(v)?v.map(canon).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
export const digest=v=>sha(JSON.stringify(canon(v)));
export const manifest=read(B+'/candidate.json'),plan=read(B+'/execution-package.PROPOSED.json');
export const pause=ms=>new Promise(r=>setTimeout(r,ms));
let creds,serial=0;
export const setCaller=v=>{creds=v;};
const allowed={sts:['get-caller-identity','assume-role'],s3api:['head-object','get-object','put-object','get-bucket-policy','get-bucket-encryption'],cloudformation:['create-change-set','describe-change-set','execute-change-set','describe-stacks','list-stacks','list-stack-resources','get-template','list-exports','describe-stack-events'],iam:['get-role','get-role-policy','list-role-policies','list-attached-role-policies','get-policy','get-policy-version','simulate-principal-policy'],kms:['describe-key','get-key-policy'],lambda:['get-function-configuration','get-policy','get-account-settings','invoke'],logs:['describe-log-groups','describe-log-streams','filter-log-events'],dynamodb:['describe-table','describe-continuous-backups','get-item','get-resource-policy','scan','describe-backup'],secretsmanager:['describe-secret'],apigatewayv2:['get-api','get-apis','get-authorizers','get-stages','get-routes','get-integrations'],cloudwatch:['describe-alarms','get-metric-statistics'],accessanalyzer:['validate-policy'], 'cognito-idp':['describe-user-pool','describe-user-pool-client','list-users'],amplify:['get-branch','list-jobs']};
export function aws(s,a,input={},who='operator',extra=[]){
 assert(allowed[s]?.includes(a),'API_NOT_ALLOWED '+s+':'+a);
 const env={...process.env,AWS_MAX_ATTEMPTS:'1',AWS_EC2_METADATA_DISABLED:'true'};
 if(who==='caller'){assert(creds);env.AWS_ACCESS_KEY_ID=creds.AccessKeyId;env.AWS_SECRET_ACCESS_KEY=creds.SecretAccessKey;env.AWS_SESSION_TOKEN=creds.SessionToken;delete env.AWS_PROFILE;delete env.AWS_DEFAULT_PROFILE;}
 fs.mkdirSync('.tmp/team-hub-permissions-dark',{recursive:true});const f='.tmp/team-hub-permissions-dark/request-'+process.pid+'-'+serial+++'.json';fs.writeFileSync(f,JSON.stringify(input));
 try{const v=execFileSync('aws',[s,a,...(a==='get-object'?[]:['--cli-input-json','file://'+f]),...extra,...(who==='caller'?[]:['--profile','default']),'--region','eu-north-1','--output','json','--no-cli-pager'],{env,encoding:'utf8',windowsHide:true,maxBuffer:35*1024*1024,stdio:['ignore','pipe','pipe']});return v.trim()?JSON.parse(v):{};}finally{fs.unlinkSync(f);}
}
export async function retryRead(s,a,input={},who='operator'){
 assert(!['create-change-set','execute-change-set','assume-role','put-object','invoke'].includes(a));
 for(let n=0;n<5;n++){await pause(1000);try{return aws(s,a,input,who);}catch(e){if(n===4||!/Throttl|Rate exceeded|TooManyRequests/.test(String(e.stderr)))throw e;await pause(500*2**n+Math.floor(Math.random()*250));}}
}
export function pins(){assert.equal(sha(fs.readFileSync(B+'/execution-package.PROPOSED.json')),'2df8f08fec949b5b0eadac8fb0a472eea8edcc3f8bb3f3a2671d6afb5fd3909e');assert.equal(sha(fs.readFileSync(B+'/candidate.json')),plan.candidateManifestSha256);for(const a of plan.publications)assert.equal(sha(fs.readFileSync(a.path)),a.sha256);assert(read(B+'/security-validation.json').passed);}
export function gate(){pins();const a=read(E+'/authorization.json');assert(a.approved&&a.noConcurrentDeployments&&Date.now()<Date.parse(a.expiresAt),'WINDOW_EXPIRED');assert(read(E+'/preflight.json').passed);assert(read(E+'/preservation-baseline.json').complete);const id=aws('sts','get-caller-identity');assert.equal(id.Arn,plan.operator);assert.equal(id.Account,plan.account);}
export function intent(n,v){fs.writeFileSync(E+'/'+n+'.intent.json',JSON.stringify({at:new Date().toISOString(),automaticRetry:false,...v},null,2)+'\n',{flag:'wx'});}
