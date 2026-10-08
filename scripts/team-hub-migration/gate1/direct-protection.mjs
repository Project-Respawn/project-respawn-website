// Explicitly authorized direct, temporary protection. No CloudFormation write operations.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {aws as readAws,read,tables,setBucket,digest} from './read-only.mjs';
const exec=promisify(execFile);
const dir='docs/architecture/team-hub-2b3-direct-protection-evidence-2026-10-05';fs.mkdirSync(dir,{recursive:true});
const save=(n,x)=>fs.writeFileSync(`${dir}/${n}.json`,JSON.stringify(x,null,2)+'\n');
const candidate=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/candidate.json');
const targets=candidate.backups;assert.deepEqual(targets.map(t=>t.model).sort(),['PlayerChampionPoolEntry','Team','TeamMembership','TeamRosterSlot']);
for(const t of targets){assert.equal(t.table,`${t.model}-dxb2tdlulrch7hj2pts2mfijia-NONE`);assert.equal(t.arn,`arn:aws:dynamodb:eu-north-1:058264289478:table/${t.table}`);tables.add(t.table);}
const identity=await readAws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const mode=process.argv[2];assert.ok(['prepare','protect','backups','verify'].includes(mode));
const root=(await readAws('cloudformation','describe-stacks','--stack-name',candidate.root)).Stacks[0];assert.equal(root.StackStatus,'UPDATE_COMPLETE');
const accepted=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/legacy-after.json');assert.equal(root.LastUpdatedTime,accepted.root.lastUpdated);
async function counts(){const result=[];for(const t of targets){let key,count=0,pages=0;do{const args=['--table-name',t.table,'--consistent-read','--select','COUNT','--limit','100','--no-paginate'];if(key)args.push('--exclusive-start-key',JSON.stringify(key));const p=await readAws('dynamodb','scan',...args);count+=p.Count;pages++;key=p.LastEvaluatedKey;}while(key&&Object.keys(key).length);result.push({model:t.model,count,pages,consistent:true,complete:true});}const bucket=read('amplify_outputs.json').storage.bucket_name;setBucket(bucket);let token,logos=0;do{const args=['--bucket',bucket,'--prefix','team-logos/','--no-paginate'];if(token)args.push('--continuation-token',token);const p=await readAws('s3api','list-objects-v2',...args);logos+=(p.Contents??[]).length;token=p.IsTruncated?p.NextContinuationToken:null;assert.ok(!p.IsTruncated||token);}while(token);return {tables:result,logos,empty:logos===0&&result.every(t=>t.count===0)};}
async function metadata(){const result=[];for(const t of targets){const [d,p,b]=await Promise.all([readAws('dynamodb','describe-table','--table-name',t.table),readAws('dynamodb','describe-continuous-backups','--table-name',t.table),readAws('dynamodb','list-backups','--table-name',t.table)]);assert.equal(d.Table.TableArn,t.arn);assert.equal(d.Table.TableStatus,'ACTIVE');result.push({...t,description:d.Table,pitr:p.ContinuousBackupsDescription,backups:b.BackupSummaries});}return result;}
async function write(t,action,args){assert.ok(targets.some(x=>x.table===t.table));assert.ok(['update-table','update-continuous-backups','create-backup'].includes(action));const {stdout}=await exec('aws',['dynamodb',action,'--table-name',t.table,...args,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:4e6,env:{...process.env,AWS_MAX_ATTEMPTS:'1'}});return stdout.trim()?JSON.parse(stdout):{};}
if(mode==='prepare'){
 assert.ok(!fs.existsSync(`${dir}/before.json`),'Preserve existing direct baseline');
 const ledger=read('docs/architecture/legacy-resource-ownership.json');for(const t of targets){const row=ledger.resources.find(r=>r.physicalId===t.table);assert.ok(row);const live=(await readAws('cloudformation','list-stack-resources','--stack-name',row.currentStack.arn)).StackResourceSummaries.find(r=>r.LogicalResourceId===row.logicalId);assert.equal(live.PhysicalResourceId,t.table);}
 const source=await counts();assert.equal(source.empty,true,'TEAM HUB SOURCE NO LONGER EMPTY');const data=await metadata();for(const t of data)assert.ok(!t.backups.some(b=>b.BackupName===t.name),'Named backup already exists');
 const domains=[];for(const name of ['ProjectRespawn-TeamHub-Ntgre','ProjectRespawn-Tournaments-Ntgre']){const s=(await readAws('cloudformation','describe-stacks','--stack-name',name)).Stacks[0];assert.equal(s.StackStatus,name.includes('TeamHub')?'CREATE_COMPLETE':'UPDATE_COMPLETE');domains.push({name,status:s.StackStatus,lastUpdated:s.LastUpdatedTime??s.CreationTime});}
 save('before',{at:new Date().toISOString(),identity,region:'eu-north-1',root:{arn:root.StackId,status:root.StackStatus,lastUpdated:root.LastUpdatedTime},source,tables:data,domains,managedProtection:false,cloudFormationExecution:false});console.log(JSON.stringify({ready:true,source,backups:targets.map(t=>t.name)}));
}
if(mode==='protect'){
 assert.ok(fs.existsSync(`${dir}/before.json`));assert.ok(!fs.existsSync(`${dir}/protection-requests.json`),'Protection request receipt exists; inspect instead of retry');
 const source=await counts();assert.equal(source.empty,true,'TEAM HUB SOURCE NO LONGER EMPTY');const receipt={at:new Date().toISOString(),identity,requests:[],complete:false};save('protection-requests',receipt);
 try{for(const t of targets){await write(t,'update-continuous-backups',['--point-in-time-recovery-specification','PointInTimeRecoveryEnabled=true']);receipt.requests.push({table:t.table,action:'UpdateContinuousBackups',enabled:true});save('protection-requests',receipt);await write(t,'update-table',['--deletion-protection-enabled']);receipt.requests.push({table:t.table,action:'UpdateTable',deletionProtectionEnabled:true});save('protection-requests',receipt);}receipt.complete=true;save('protection-requests',receipt);console.log(JSON.stringify({requests:receipt.requests.length,complete:true}));}catch(e){receipt.error=e.stderr??e.message;save('protection-requests',receipt);throw e;}
}
if(mode==='backups'){
 const data=await metadata();for(const t of data){assert.equal(t.description.DeletionProtectionEnabled,true);assert.equal(t.pitr.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'ENABLED');assert.ok(!t.backups.some(b=>b.BackupName===t.name),'Backup already exists; inspect instead of duplicate');}
 save('protections-verified',{at:new Date().toISOString(),tables:data,managedProtection:false});
 assert.ok(!fs.existsSync(`${dir}/backup-requests.json`),'Backup receipt exists; inspect instead of retry');
 const receipt={at:new Date().toISOString(),identity,backups:[],complete:false};save('backup-requests',receipt);
 try{for(const t of targets){const r=await write(t,'create-backup',['--backup-name',t.name]);receipt.backups.push({...t,...r.BackupDetails});save('backup-requests',receipt);}receipt.complete=true;save('backup-requests',receipt);console.log(JSON.stringify({backups:receipt.backups.map(b=>({model:b.model,arn:b.BackupArn,status:b.BackupStatus})),complete:true}));}catch(e){receipt.error=e.stderr??e.message;save('backup-requests',receipt);throw e;}
}
if(mode==='verify'){
 const receipt=read(`${dir}/backup-requests.json`);assert.equal(receipt.complete,true);assert.equal(receipt.backups.length,4);const backups=[];
 for(const b of receipt.backups){assert.ok(b.BackupArn.startsWith(b.arn+'/backup/'));const {stdout}=await exec('aws',['dynamodb','describe-backup','--backup-arn',b.BackupArn,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:4e6});const d=JSON.parse(stdout).BackupDescription;assert.equal(d.SourceTableDetails.TableArn,b.arn);assert.equal(d.BackupDetails.BackupName,b.name);backups.push({model:b.model,...d});}
 const data=await metadata(),source=await counts();const before=read(`${dir}/before.json`);
 for(const t of data){assert.equal(t.description.DeletionProtectionEnabled,true);assert.equal(t.pitr.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'ENABLED');const old=before.tables.find(b=>b.model===t.model).description;for(const k of ['TableArn','TableId','KeySchema','AttributeDefinitions','LatestStreamArn'])assert.equal(digest(t.description[k]??null),digest(old[k]??null),'Identity/schema changed '+k);}
 const available=backups.every(b=>b.BackupDetails.BackupStatus==='AVAILABLE');save('after',{at:new Date().toISOString(),identity,tables:data,source,backups,available,managedProtection:false,cloudFormationExecution:false,productionTouched:false});assert.equal(source.empty,true,'TEAM HUB SOURCE NO LONGER EMPTY');console.log(JSON.stringify({available,source,backups:backups.map(b=>({model:b.model,status:b.BackupDetails.BackupStatus,arn:b.BackupDetails.BackupArn,size:b.BackupDetails.BackupSizeBytes}))}));
}
