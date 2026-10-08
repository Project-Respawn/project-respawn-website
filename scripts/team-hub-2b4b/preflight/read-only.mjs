import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import crypto from 'node:crypto';
export const E='docs/architecture/team-hub-2b4b-evidence-2026-10-06';
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
export const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))):x);
export const digest=v=>crypto.createHash('sha256').update(canonical(v)).digest('hex');
export const save=(name,value)=>fs.writeFileSync(E+'/'+name+'.json',JSON.stringify(value,null,2)+'\n');
const exec=promisify(execFile);
const allowed={sts:['get-caller-identity'],cloudformation:['describe-stacks','list-stack-resources','get-template'],dynamodb:['describe-table','describe-continuous-backups','describe-time-to-live','list-backups','scan','get-resource-policy'],s3api:['get-bucket-versioning','get-bucket-encryption','list-objects-v2','list-object-versions','head-object'],iam:['get-role','get-policy','get-policy-version','list-role-policies','get-role-policy','list-attached-role-policies'],lambda:['get-function-configuration','list-event-source-mappings','get-policy'],events:['list-rule-names-by-target'],apigatewayv2:['get-api','get-authorizers','get-routes','get-integrations','get-stages']};
export const audit={calls:0,retries:0,errors:[],awsWrites:0};
export const tables=new Set();export let bucket='';export const setBucket=value=>{bucket=value;};
export async function aws(service,action,...args){
 if(!allowed[service]?.includes(action))throw Error('Non-read command rejected');
 const value=k=>args[args.indexOf(k)+1];
 if(service==='dynamodb'&&action==='scan'&&!tables.has(value('--table-name')))throw Error('Scan outside exact four tables');
 if(service==='s3api'){
  if(!bucket||value('--bucket')!==bucket)throw Error('Wrong source bucket');
  if(['list-objects-v2','list-object-versions'].includes(action)&&value('--prefix')!=='team-logos/')throw Error('Foreign prefix');
  if(action==='head-object'&&!value('--key').startsWith('team-logos/'))throw Error('Foreign object');
 }
 for(let attempt=0;;attempt++)try{audit.calls++;const {stdout}=await exec('aws',[service,action,...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:64e6});return stdout.trim()?JSON.parse(stdout):{};}catch(e){const code=(e.stderr??'').match(/\(([^)]+)\)/)?.[1]??'COMMAND_FAILED';if(attempt<3&&/Throttl|TooManyRequests|RequestLimit/.test(code)){audit.retries++;await new Promise(r=>setTimeout(r,500*2**attempt));continue;}audit.errors.push({service,action,code});throw Error(service+' '+action+' '+code);}
}
