import {execFile} from 'node:child_process';import {promisify} from 'node:util';import assert from 'node:assert/strict';import {pin,read,E,P,core} from './aws.mjs';
const exec=promisify(execFile);let credentials;
export async function op(service,action,args=[],restricted=false){
 const c=pin(),value=k=>args[args.indexOf(k)+1];
 const allowed={sts:['get-caller-identity','assume-role'],cloudformation:['create-change-set','describe-change-set','get-template','execute-change-set','describe-stacks','describe-stack-events','list-stack-resources'],s3api:['put-object','head-object'],iam:['get-role','get-policy','get-policy-version','get-role-policy','list-role-policies','list-attached-role-policies','simulate-principal-policy'],lambda:['get-function-configuration','get-account-settings'],'cognito-idp':['describe-user-pool']};assert.ok(allowed[service]?.includes(action));
 if(service==='cloudformation'){
  const stack=value('--stack-name');assert.ok([core,core+'-Security'].includes(stack),'Non-Core stack');
  if(action==='create-change-set'){
   assert.equal(value('--change-set-type'),'CREATE');assert.equal(value('--change-set-name'),stack===core?'core-release1-pinned-20261006':'core-security-pinned-20261006');
   assert.equal(read(E+'/prewrite-gate.json').ready,true);
   if(stack===core){assert.ok(restricted);assert.equal(value('--role-arn'),c.executionRole);assert.equal(value('--template-url'),c.templateUrl);assert.equal(read(E+'/installed-security.json').verified,true);}else assert.equal(value('--template-body'),'file://'+P+'/security.template.json');
  }
  if(action==='execute-change-set'){
   const kind=stack===core?'product':'security',gate=read(E+'/'+kind+'-gate.json');assert.equal(gate.ready,true);assert.equal(value('--change-set-name'),gate.changeSetId);assert.ok(args.includes('--no-disable-rollback'));if(kind==='product')assert.ok(restricted);
  }
 }
 if(service==='s3api'){
  assert.equal(value('--bucket'),c.artifact.bucket);const key=value('--key');assert.ok([c.artifact.key,c.artifact.templateKey].includes(key));
  if(action==='put-object'){assert.equal(read(E+'/prewrite-gate.json').ready,true);assert.equal(value('--server-side-encryption'),'AES256');assert.equal(value('--body'),key===c.artifact.key?c.zipPath:P+'/product.template.json');assert.equal(value('--if-none-match'),'*');}
 }
 if(service==='sts'&&action==='assume-role')assert.equal(value('--role-arn'),'arn:aws:iam::058264289478:role/'+core+'-Deploy');
 const env={...process.env,AWS_MAX_ATTEMPTS:'1'};if(restricted){assert.ok(credentials);env.AWS_ACCESS_KEY_ID=credentials.AccessKeyId;env.AWS_SECRET_ACCESS_KEY=credentials.SecretAccessKey;env.AWS_SESSION_TOKEN=credentials.SessionToken;delete env.AWS_PROFILE;delete env.AWS_DEFAULT_PROFILE;}
 try{const {stdout}=await exec('aws',[service,action,...args,...(restricted?[]:['--profile','default']),'--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:35e6,env});return stdout.trim()?JSON.parse(stdout):{};}catch(e){const error=new Error(`${service} ${action}: ${(e.stderr??'').replace(/\s+/g,' ').slice(0,1300)}`);error.code=(e.stderr??'').match(/\(([^)]+)\)/)?.[1];throw error;}
}
export async function assume(){const r=await op('sts','assume-role',['--role-arn','arn:aws:iam::058264289478:role/'+core+'-Deploy','--role-session-name','CoreRelease1Review','--duration-seconds','3600']);credentials=r.Credentials;const identity=await op('sts','get-caller-identity',[],true);assert.equal(identity.Account,'058264289478');assert.ok(identity.Arn.includes(':assumed-role/'+core+'-Deploy/'));return identity;}
