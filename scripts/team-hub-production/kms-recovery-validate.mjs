// Read-only AWS API allowlist. No deployment, publication, drift initiation or IAM mutation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {out,read,save} from './kms-recovery-prepare.mjs';
import {sha,lambdaKey,secretKey,out as previous} from './deployment-prepare.mjs';
import {resolve} from './deployment-validate.mjs';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const allowed={sts:['get-caller-identity'],iam:['get-role','list-role-policies','get-role-policy','list-attached-role-policies','get-policy','get-policy-version','simulate-custom-policy'],kms:['describe-key','get-key-policy'],cloudformation:['describe-stacks','list-stack-resources','describe-stack-events','validate-template','get-template-summary'],logs:['describe-log-groups','describe-log-streams'],lambda:['get-function-configuration'],dynamodb:['describe-table','describe-continuous-backups','describe-backup'],accessanalyzer:['validate-policy']};
export async function aws(service,op,args=[]){
 assert.ok(allowed[service]?.includes(op),'NON_READ_ONLY_API');
 for(let i=0;i<5;i++){await pause(200);try{const s=execFileSync('aws',[service,op,...args,'--region','eu-north-1','--profile','default','--output','json','--no-cli-pager'],{encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024,stdio:['ignore','pipe','pipe']});return JSON.parse(s);}catch(e){if(/Throttl|Rate exceeded|TooManyRequests/.test(String(e.stderr))&&i<4){await pause(500*2**i+Math.floor(Math.random()*200));continue;}throw e;}}
}
export async function preflight(){
 const e='docs/architecture/production-dark-deployment-evidence-2026-10-20',original=read(e+'/preflight.json'),result={at:new Date().toISOString(),awsWrites:0};
 result.identity=await aws('sts','get-caller-identity');assert.equal(result.identity.Arn,'arn:aws:iam::058264289478:user/RavenTest');
 result.stacks={};for(const name of ['ProjectRespawn-Core-Production-Security','ProjectRespawn-Core-Production']){result.stacks[name]=await aws('cloudformation','describe-stacks',['--stack-name',name]);assert.equal(result.stacks[name].Stacks[0].StackStatus,name.endsWith('Security')?'CREATE_COMPLETE':'ROLLBACK_COMPLETE');}
 result.resources=await aws('cloudformation','list-stack-resources',['--stack-name','ProjectRespawn-Core-Production']);result.events=await aws('cloudformation','describe-stack-events',['--stack-name','ProjectRespawn-Core-Production']);
 const role='ProjectRespawn-Core-Production-Execution';result.role=await aws('iam','get-role',['--role-name',role]);result.inlineNames=await aws('iam','list-role-policies',['--role-name',role]);result.attached=await aws('iam','list-attached-role-policies',['--role-name',role]);assert.equal(result.attached.AttachedPolicies.length,0);
 result.inline=[];for(const n of result.inlineNames.PolicyNames)result.inline.push(await aws('iam','get-role-policy',['--role-name',role,'--policy-name',n]));assert.equal(result.inline.length,1);
 const b=result.role.Role.PermissionsBoundary.PermissionsBoundaryArn;result.boundary=await aws('iam','get-policy',['--policy-arn',b]);result.boundaryVersion=await aws('iam','get-policy-version',['--policy-arn',b,'--version-id',result.boundary.Policy.DefaultVersionId]);
 const blocked=read(e+'/kms-blocking-installed-policies.json');assert.deepEqual(result.inline[0].PolicyDocument,blocked.identityPolicy);assert.deepEqual(result.boundaryVersion.PolicyVersion.Document,blocked.permissionsBoundary);
 result.key=await aws('kms','describe-key',['--key-id',lambdaKey]);assert.equal(result.key.KeyMetadata.KeyManager,'AWS');result.keyPolicy=await aws('kms','get-key-policy',['--key-id',lambdaKey,'--policy-name','default']);
 result.logs=await aws('logs','describe-log-groups',['--log-group-name-prefix','/project-respawn/Production/core/contracts']);assert.equal(result.logs.logGroups.length,1);assert.equal(result.logs.logGroups[0].logGroupName,'/project-respawn/Production/core/contracts');result.streams=await aws('logs','describe-log-streams',['--log-group-name','/project-respawn/Production/core/contracts']);
 result.sources=[];for(const t of original.tables){const a=await aws('dynamodb','describe-table',['--table-name',t.sourceArn]),p=await aws('dynamodb','describe-continuous-backups',['--table-name',t.sourceArn]),b=await aws('dynamodb','describe-backup',['--backup-arn',t.backupArn]);assert.equal(a.Table.TableId,t.tableId);assert.equal(a.Table.DeletionProtectionEnabled,true);assert.equal(p.ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'ENABLED');assert.equal(b.BackupDescription.BackupDetails.BackupStatus,'AVAILABLE');result.sources.push({model:t.model,table:a.Table,protection:p,backup:b});}
 result.recordContentRescan=false;result.limitations=['No production source item scan or raw personal data collected; prior content preservation is historical and must be refreshed at execution','No exhaustive organization-policy visibility or account-wide drift claim'];save('fresh-read-only.json',result);return result;
}
export async function validate(){
 const m=read(out+'/manifest.json'),old=read(previous+'/security-validation.json');fs.mkdirSync(out+'/resolved-policies',{recursive:true});
 const result={at:new Date().toISOString(),awsWrites:0,syntheticTeamApiId:true,policies:[],cases:[],limitations:['Custom policy simulation does not prove actual service context, AWS-managed key grant creation, role trust, Organizations permissions or Lambda provisioning']};
 const ids=[...new Set(old.cases.map(c=>c.policy))];
 for(const id of ids){
  const revised=m.policies.find(p=>p.id===id),p=revised?resolve(read(revised.path)):read(previous+'/policies/'+id+'.json');
  const file=out+'/resolved-policies/'+id+'.json';fs.writeFileSync(file,JSON.stringify(p));
  const kind=revised?.kind??(id.includes('Boundary')?'boundary':'identity'),limit=kind==='boundary'?6144:10240;assert.ok(JSON.stringify(p).length<=limit);
  const analyzer=await aws('accessanalyzer','validate-policy',['--policy-type','IDENTITY_POLICY','--policy-document','file://'+file]);assert.deepEqual(analyzer.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)),[]);
  result.policies.push({id,size:JSON.stringify(p).length,limit,sha256:sha(JSON.stringify(p)),analyzer});
  const cases=old.cases.filter(c=>c.policy===id).map(c=>({...c}));
  if(revised){const ctx={'aws:RequestedRegion':'eu-north-1','kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478','kms:GrantIsForAWSResource':true};
   const add=(name,resource,allowed,context)=>cases.push({policy:id,name,action:'kms:CreateGrant',resource,allowed,context});
   add('service-resource-grant',lambdaKey,true,ctx);for(const [k,v]of [['kms:ViaService','s3.eu-north-1.amazonaws.com'],['kms:CallerAccount','111111111111'],['kms:GrantIsForAWSResource',false]])add('grant wrong '+k,lambdaKey,false,{...ctx,[k]:v});
   for(const k of Object.keys(ctx).filter(k=>k.startsWith('kms:'))){const c={...ctx};delete c[k];add('grant missing '+k,lambdaKey,false,c);}
   for(const key of [secretKey,lambdaKey.replace('13ae83f9-bc5f-4486-a013-e07b9d7d52e7','00000000-0000-0000-0000-000000000000')])add('grant wrong key '+key,key,false,ctx);
   for(const a of ['kms:RevokeGrant','kms:ListGrants','kms:RetireGrant','kms:PutKeyPolicy','kms:ScheduleKeyDeletion'])cases.push({policy:id,name:'grant-admin denied '+a,action:a,resource:lambdaKey,allowed:false,context:ctx});
   if(id.startsWith('core'))cases.push({policy:id,name:'exact-import-template',action:'s3:GetObject',resource:'arn:aws:s3:::'+ 'cdk-hnb659fds-assets-058264289478-eu-north-1/'+m.logImport.key,allowed:true,context:{'aws:RequestedRegion':'eu-north-1'}});
  }
  const groups=new Map();for(const c of cases){const key=JSON.stringify(c.context)+(c.resource==='*'?' STAR':' ARN');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
  for(const group of groups.values()){
   const req={PolicyInputList:[JSON.stringify(p)],ActionNames:[...new Set(group.map(c=>c.action))],ResourceArns:[...new Set(group.map(c=>c.resource))],ContextEntries:Object.entries(group[0].context).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[].concat(v).map(String),ContextKeyType:typeof v==='boolean'?'boolean':Array.isArray(v)?'stringList':'string'}))};
   save('simulation-request.json',req);const r=await aws('iam','simulate-custom-policy',['--cli-input-json','file://'+out+'/simulation-request.json']);
   for(const c of group){const top=r.EvaluationResults.find(x=>x.EvalActionName.toLowerCase()===c.action.toLowerCase()&&(x.EvalResourceName===c.resource||x.ResourceSpecificResults?.some(s=>s.EvalResourceName===c.resource)));assert.ok(top,c.name);const sub=top.ResourceSpecificResults?.find(x=>x.EvalResourceName===c.resource),decision=sub?.EvalResourceDecision??top.EvalDecision;const row={...c,decision,passed:(decision==='allowed')===c.allowed};result.cases.push(row);save('security-validation.json',result);assert.equal(row.passed,true,id+' '+c.name+' '+decision);}
  }
 }
 result.complete=true;result.passed=true;save('security-validation.json',result);
 const templates=[];for(const a of [...Object.values(m.security),m.logImport]){const t=JSON.stringify(read(a.path));save('template-validation-body.json',JSON.parse(t));const file=out+'/template-validation-minified.json';fs.writeFileSync(file,t);const r=await aws('cloudformation','validate-template',['--template-body','file://'+file]);templates.push({sha256:a.sha256,result:r});}
 const file=out+'/template-validation-minified.json';fs.writeFileSync(file,JSON.stringify(read(m.logImport.path)));const summary=await aws('cloudformation','get-template-summary',['--template-body','file://'+file]);save('template-validation.json',{templates,importSummary:summary});
 console.log(JSON.stringify({policies:result.policies.length,cases:result.cases.length,templates:templates.length,passed:true}));
}
if(process.argv[1]?.endsWith('kms-recovery-validate.mjs')){if(process.argv.includes('--preflight'))await preflight();else await validate();}
