import assert from 'node:assert/strict';
import {aws,read,save,tables,setBucket,audit} from './read-only.mjs';
const phase=process.argv[2]??'before';if(!['before','preexecute','after'].includes(phase))throw Error('Invalid phase');
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const ledger=read('docs/architecture/legacy-resource-ownership.json');
const selected=ledger.resources.filter(r=>r.currentDomainAttribution==='TEAM HUB'&&r.resourceType==='Custom::AmplifyDynamoDBTable');assert.equal(selected.length,4);
const result=[];
for(const row of selected){
 const resource=(await aws('cloudformation','list-stack-resources','--stack-name',row.currentStack.arn)).StackResourceSummaries.find(r=>r.LogicalResourceId===row.logicalId);
 assert.equal(resource.PhysicalResourceId,row.physicalId);assert.equal(resource.ResourceType,row.resourceType);tables.add(row.physicalId);
 const name=row.physicalId;
 const [description,pitr,backups]=await Promise.all([aws('dynamodb','describe-table','--table-name',name),aws('dynamodb','describe-continuous-backups','--table-name',name),aws('dynamodb','list-backups','--table-name',name)]);
 assert.equal(description.Table.TableStatus,'ACTIVE');
 const passes=[];for(let pass=0;pass<2;pass++){let key,count=0,pages=0;do{const args=['--table-name',name,'--consistent-read','--select','COUNT','--limit','100','--no-paginate'];if(key)args.push('--exclusive-start-key',JSON.stringify(key));const r=await aws('dynamodb','scan',...args);count+=r.Count;pages++;key=r.LastEvaluatedKey;}while(key&&Object.keys(key).length);passes.push({count,pages,consistent:true,complete:true});}
 result.push({model:row.model,resourceId:row.resourceId,stack:row.currentStack.arn,table:description.Table,pitr:pitr.ContinuousBackupsDescription,backups:backups.BackupSummaries,passes});
 save('source-'+phase,{at:new Date().toISOString(),identity,tables:result,complete:false,audit});
 if(passes.some(p=>p.count!==0))throw Error('TEAM HUB SOURCE NO LONGER EMPTY');
}
const bucket=read('amplify_outputs.json').storage.bucket_name;setBucket(bucket);
let token,count=0,pages=0;do{const args=['--bucket',bucket,'--prefix','team-logos/','--max-keys','100','--no-paginate'];if(token)args.push('--continuation-token',token);const r=await aws('s3api','list-objects-v2',...args);count+=(r.Contents??[]).length;pages++;token=r.IsTruncated?r.NextContinuationToken:null;assert.ok(!r.IsTruncated||token);}while(token);
save('source-'+phase,{at:new Date().toISOString(),identity,tables:result,logos:{bucket,prefix:'team-logos/',count,pages,complete:true},complete:true,empty:count===0&&result.every(t=>t.passes.every(p=>p.count===0)),audit});
if(count)throw Error('TEAM HUB SOURCE NO LONGER EMPTY');
console.log(JSON.stringify({phase,counts:result.map(t=>({model:t.model,passes:t.passes.map(p=>p.count)})),logos:count,audit}));
