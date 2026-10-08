import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
export {read,save,E,digest} from './read-only.mjs';
import {read,E} from './read-only.mjs';
const exec=promisify(execFile);
export const product='ProjectRespawn-TeamHub-Ntgre',security=product+'-ReadProofSecurity';
export const execution='arn:aws:iam::058264289478:role/'+product+'-ReadProofExecution';
export const caller='arn:aws:iam::058264289478:role/'+product+'-Deploy';
export const tableNames=[product+'-Operational',product+'-Journal'];
export const tableArns=tableNames.map(n=>'arn:aws:dynamodb:eu-north-1:058264289478:table/'+n);
let credentials;
export async function assume(){const r=await aws('sts','assume-role',['--role-arn',caller,'--role-session-name','TeamHubGate3','--duration-seconds','3600']);credentials=r.Credentials;return r.AssumedRoleUser;}
export async function aws(service,action,args=[],restricted=false){
 const v=k=>args[args.indexOf(k)+1];
 const allowed={sts:['get-caller-identity','assume-role'],iam:['simulate-custom-policy','simulate-principal-policy','get-role','get-policy','get-policy-version','get-role-policy','list-role-policies','list-attached-role-policies'],accessanalyzer:['validate-policy'],cloudformation:['describe-stacks','get-template','list-stack-resources','describe-change-set','describe-stack-events','create-change-set','execute-change-set'],s3api:['put-object','head-object'],dynamodb:['describe-table','describe-continuous-backups','describe-time-to-live','list-tags-of-resource','scan']};
 assert.ok(allowed[service]?.includes(action),'Action outside Gate 3');
 if(service==='sts'&&action==='assume-role')assert.equal(v('--role-arn'),caller);
 if(service==='cloudformation'){
  assert.ok([product,security].includes(v('--stack-name')));
  if(action==='create-change-set'){assert.equal(v('--change-set-type'),'UPDATE');assert.equal(v('--change-set-name'),v('--stack-name')===product?'team-hub-gate3-dark-target-20261005':'team-hub-gate3-security-20261005');if(v('--stack-name')===product){assert.ok(restricted);assert.equal(v('--role-arn'),execution);assert.equal(v('--template-url'),read(E+'/candidate.json').url);}else assert.equal(v('--template-body'),'file://'+E+'/security.template.json');}
  if(action==='execute-change-set'){const kind=v('--stack-name')===product?'product':'security';const gate=read(E+'/'+kind+'-execution-gate.json');assert.equal(gate.ready,true);assert.equal(v('--change-set-name'),gate.changeSetId);assert.ok(args.includes('--no-disable-rollback'));if(kind==='product')assert.ok(restricted);}
 }
 if(service==='s3api'){assert.equal(v('--bucket'),'cdk-hnb659fds-assets-058264289478-eu-north-1');assert.equal(v('--key'),read(E+'/candidate.json').key);if(action==='put-object'){assert.equal(v('--server-side-encryption'),'AES256');assert.equal(v('--body'),E+'/product.template.json');}}
 if(service==='dynamodb'){assert.ok(tableNames.includes(v('--table-name'))||tableArns.includes(v('--resource-arn')));if(action==='scan'){assert.equal(v('--select'),'COUNT');assert.ok(args.includes('--consistent-read'));}}
 const env={...process.env,AWS_MAX_ATTEMPTS:'1'};
 if(restricted){assert.ok(credentials);env.AWS_ACCESS_KEY_ID=credentials.AccessKeyId;env.AWS_SECRET_ACCESS_KEY=credentials.SecretAccessKey;env.AWS_SESSION_TOKEN=credentials.SessionToken;delete env.AWS_PROFILE;delete env.AWS_DEFAULT_PROFILE;}
 try{const {stdout}=await exec('aws',[service,action,...args,...(restricted?[]:['--profile','default']),'--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:40e6,env});return stdout.trim()?JSON.parse(stdout):{};}catch(e){const code=(e.stderr??'').match(/\(([^)]+)\)/)?.[1]??'COMMAND_FAILED';const detail=service==='iam'&&action.startsWith('simulate-')?(e.stderr??'').slice(0,2000):'';const error=new Error(`${service} ${action}: ${code} ${detail}`);error.code=code;throw error;}
}
export async function identity(){const r=await aws('sts','get-caller-identity');assert.equal(r.Account,'058264289478');assert.equal(r.Arn,'arn:aws:iam::058264289478:user/RavenTest');return r;}
