// Fixed dark-update package only. No authority, data, source-fence or hosting writes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws as transport,retryRead as transportRead,setCaller,pause,sha,canon,digest,read,B} from '../team-hub-permissions/tagging-live-common.mjs';
export {setCaller,pause,sha,canon,digest,read,B};
export const H=fs.existsSync('.codex-worktrees/team-hub-production-preparation/docs/architecture/production-core-emf-binding-evidence-2026-10-21/sealed-manifest.json')?'.codex-worktrees/team-hub-production-preparation':'docs/architecture/production-team-hub-checkpoint-history-2026-10-24';
export const R='docs/architecture/team-hub-production-migration-2026-10-24';
export const E=R+'/execution';fs.mkdirSync(E,{recursive:true});
export const save=(name,value)=>{const target=E+'/'+name,temp=target+'.'+process.pid+'.atomic';fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n');fs.renameSync(temp,target);};
export const plan=read(R+'/dark-parity-execution.PROPOSED.json');
export const manifest=read(plan.candidate.path);
export const baselineSecurity={path:'docs/architecture/production-team-hub-tagging-recovery-2026-10-24/'+plan.baseline.securitySha256+'.security.template.json',sha256:plan.baseline.securitySha256};
export function pins(){
 assert.equal(sha(fs.readFileSync(R+'/dark-parity-execution.PROPOSED.json')),'49418cbce1980ed0eb0987e94f06a5c81a0e9dac0585f241bd452315b0ab2930');
 assert.equal(sha(fs.readFileSync(plan.candidate.path)),plan.candidate.sha256);
 for(const a of [manifest.security,manifest.product,manifest.runtime,manifest.rollback.product,manifest.rollback.runtime,baselineSecurity])assert.equal(sha(fs.readFileSync(a.path)),a.sha256);
 const c=read(R+'/runtime-candidate/security-validation.json');assert(c.certificationPassed&&c.cases.length===423&&c.cases.every(x=>x.passed)&&c.templates.length===2);
}
export function windowGate(){pins();const a=read(E+'/authorization.json');assert(a.approved&&a.operatorAvailable&&a.noConcurrentChanges&&a.analyzerExceptionAccepted&&a.packageSha256==='49418cbce1980ed0eb0987e94f06a5c81a0e9dac0585f241bd452315b0ab2930');assert(Date.now()>=Date.parse(a.startsAt)&&Date.now()<Date.parse(a.expiresAt),'WINDOW_EXPIRED');}
export function gate(){windowGate();assert(read(E+'/preflight.json').passed);assert(read(E+'/preservation-baseline.json').complete);assert(read(E+'/post-core-preservation.json').passed);const id=transport('sts','get-caller-identity');assert.equal(id.Account,plan.account);assert.equal(id.Arn,plan.operatorArn);}
const mutations=new Set(['put-object','create-change-set','execute-change-set']);
export function aws(service,operation,input={},who='operator',extra=[]){
 if(mutations.has(operation)){
  gate();
  if(service==='s3api'&&operation==='put-object'){
   const bucket=read(manifest.product.path).Resources.ParityReadFunction.Properties.Code.S3Bucket;
   const artifacts=[manifest.security,manifest.product,manifest.runtime].map(a=>({...a,key:a.key??'production/'+a.sha256+'.json'}));
   const a=artifacts.find(a=>a.key===input.Key);assert(a);assert.equal(input.Bucket,bucket);assert.equal(input.IfNoneMatch,'*');assert.equal(input.ServerSideEncryption,'AES256');assert.equal(input.ChecksumSHA256,Buffer.from(a.sha256,'hex').toString('base64'));assert.deepEqual(extra,['--body',a.path]);
  }else if(service==='cloudformation'){
   assert(['ProjectRespawn-TeamHub-Production','ProjectRespawn-TeamHub-Production-Security'].includes(input.StackName));
   if(operation==='create-change-set'){
    assert.equal(input.ChangeSetType,'UPDATE');assert.equal(input.IncludeNestedStacks,true);
    if(input.StackName==='ProjectRespawn-TeamHub-Production')assert.equal(input.RoleARN,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Production-ReadProofExecution');
    const a=input.StackName.endsWith('-Security')?manifest.security:manifest.product;
    const key=a.key??'production/'+a.sha256+'.json';
    assert.equal(input.TemplateURL,'https://cdk-hnb659fds-assets-058264289478-eu-north-1.s3.eu-north-1.amazonaws.com/'+key);
   }else {const inspected=read(E+'/'+(input.StackName.endsWith('-Security')?'security':'product')+'-change-set-inspected.json');assert(inspected.passed);assert.equal(input.ChangeSetName,inspected.completeAwsChangeSet.ChangeSetId);}
  }else throw Error('UNAUTHORIZED_MUTATION');
 }else if(operation==='assume-role'){windowGate();assert.equal(service,'sts');assert.equal(input.RoleArn,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Production-Deploy');assert(input.DurationSeconds<=3600);}
 else assert(!['delete-stack','invoke'].includes(operation),'UNAUTHORIZED_OPERATION');
 return transport(service,operation,input,who,extra);
}
export const retryRead=(s,a,input={},who='operator')=>{assert(!mutations.has(a)&&!['assume-role','delete-stack','invoke'].includes(a));return transportRead(s,a,input,who);};
export function intent(name,value){windowGate();fs.writeFileSync(E+'/'+name+'.intent.json',JSON.stringify({at:new Date().toISOString(),automaticRetry:false,...value},null,2)+'\n',{flag:'wx'});}
