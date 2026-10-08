import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {identity,targets,count,metadata,aws as sourceAws} from '../team-hub-2b4b/preflight/common.mjs';
import {aws,tables,setBucket,read,digest} from '../team-hub-2b4b/preflight/read-only.mjs';
const E='docs/architecture/team-hub-ef-evidence-2026-10-08/after';
fs.mkdirSync(E,{recursive:true});
const result={at:new Date().toISOString(),identity:await identity(),region:'eu-north-1',awsWrites:0,sources:[],stacks:[],complete:false};
const save=()=>fs.writeFileSync(`${E}/inventory.json`,JSON.stringify(result,null,2)+'\n');
for(const t of targets){
 const m=await metadata(t.sourceName);
 assert.equal(m.table.TableArn,t.sourceArn);
 const backup=(await sourceAws('dynamodb','describe-backup','--backup-arn',t.backupArn)).BackupDescription;
 const passes=await count(t.sourceName);
 result.sources.push({model:t.model,name:t.sourceName,arn:t.sourceArn,tableId:m.table.TableId,passes,pitr:m.pitr.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,deletionProtection:m.table.DeletionProtectionEnabled,backupStatus:backup.BackupDetails.BackupStatus,backupArn:t.backupArn});save();
 if(passes.some(p=>p.count!==0)){result.stop='SOURCE_NONEMPTY_MODE_B_REQUIRED';save();throw Error(result.stop);}
 assert.equal(m.table.DeletionProtectionEnabled,true);assert.equal(m.pitr.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'ENABLED');assert.equal(backup.BackupDetails.BackupStatus,'AVAILABLE');
}
const bucket=read('amplify_outputs.json').storage.bucket_name;setBucket(bucket);
const objects=await aws('s3api','list-objects-v2','--bucket',bucket,'--prefix','team-logos/');
const versions=await aws('s3api','list-object-versions','--bucket',bucket,'--prefix','team-logos/');
result.logos={objects:(objects.Contents??[]).length,versions:(versions.Versions??[]).length,deleteMarkers:(versions.DeleteMarkers??[]).length};save();
assert.equal(Object.values(result.logos).reduce((a,b)=>a+b,0),0,'SOURCE_LOGOS_NONEMPTY');
result.target=[];
for(const suffix of ['Operational','Journal']){
 const name='ProjectRespawn-TeamHub-Ntgre-'+suffix;tables.add(name);
 let key,total=0,business=0,audits=0,control=0,pages=0;
 do{const args=['--table-name',name,'--consistent-read','--projection-expression','PK, SK','--no-paginate'];if(key)args.push('--exclusive-start-key',JSON.stringify(key));const r=await aws('dynamodb','scan',...args);pages++;for(const item of r.Items??[]){total++;const pk=item.PK?.S??'',sk=item.SK?.S??'';if(pk==='CONTROL#AUTHORITY'&&sk==='STATE')control++;else if(pk.startsWith('AUDIT#')||sk.startsWith('AUDIT#'))audits++;else business++;}key=r.LastEvaluatedKey;}while(key&&Object.keys(key).length);
 result.target.push({name,total,business,audits,control,pages,stronglyConsistent:true});save();
}
for(const [name,expected] of [['ProjectRespawn-TeamHub-Ntgre',40],['ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity',7],['ProjectRespawn-Core-Ntgre',8],['ProjectRespawn-Core-Ntgre-Security',5],['ProjectRespawn-Tournaments-Ntgre',11]]){
 const s=(await aws('cloudformation','describe-stacks','--stack-name',name)).Stacks[0];
 const r=(await aws('cloudformation','list-stack-resources','--stack-name',name)).StackResourceSummaries.filter(r=>r.ResourceStatus!=='DELETE_COMPLETE');
 assert.equal(r.length,expected);assert.ok(['CREATE_COMPLETE','UPDATE_COMPLETE'].includes(s.StackStatus));
 result.stacks.push({name,status:s.StackStatus,count:r.length,api:r.find(r=>r.ResourceType==='AWS::ApiGatewayV2::Api')?.PhysicalResourceId});save();
}
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const inventory=read('docs/architecture/phase2-resource-domain-map.json');result.legacy={total:0,directive:0,templatesIdentical:true};
for(const s of inventory.stacks){const t=(await aws('cloudformation','get-template','--stack-name',s.arn)).TemplateBody;const template=typeof t==='string'?JSON.parse(t):t;assert.equal(crypto.createHash('sha256').update(JSON.stringify(stable(template))).digest('hex'),s.templateSha256,'Legacy template changed '+s.key);const n=Object.keys(template.Resources).length;result.legacy.total+=n;if(s.key==='029')result.legacy.directive=n;save();}
assert.equal(result.legacy.total,2621);assert.equal(result.legacy.directive,167);
result.complete=true;save();console.log(JSON.stringify(result));





