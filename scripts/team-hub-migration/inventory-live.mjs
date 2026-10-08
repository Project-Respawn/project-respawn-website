// Explicit read-only scopes. Raw records/cursors/keys remain in process memory only.
import assert from 'node:assert/strict';
import {aws,audit,E,read,save,digest,tables,setBucket} from './read-only.mjs';
const at=new Date().toISOString();
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');save('identity',{at,identity,region:'eu-north-1',environment:'Ntgre'});
const ledger=read('docs/architecture/legacy-resource-ownership.json');
const selected=ledger.resources.filter(r=>r.currentDomainAttribution==='TEAM HUB'&&r.stateful);assert.equal(selected.length,4);
const result=[];const source={};
for(const row of selected){
 assert.ok(row.currentStack.arn.includes('Ntgre-sandbox'));
 const live=(await aws('cloudformation','list-stack-resources','--stack-name',row.currentStack.arn)).StackResourceSummaries;
 const resource=live.find(r=>r.LogicalResourceId===row.logicalId);assert.equal(resource.PhysicalResourceId,row.physicalId);assert.equal(resource.ResourceType,'Custom::AmplifyDynamoDBTable');tables.add(resource.PhysicalResourceId);
 const name=resource.PhysicalResourceId,model=row.model??name.split('-')[0];
 const [description,recovery,ttl,backups]=await Promise.all([aws('dynamodb','describe-table','--table-name',name),aws('dynamodb','describe-continuous-backups','--table-name',name),aws('dynamodb','describe-time-to-live','--table-name',name),aws('dynamodb','list-backups','--table-name',name)]);
 assert.equal(description.Table.TableStatus,'ACTIVE');assert.ok(description.Table.TableArn.startsWith('arn:aws:dynamodb:eu-north-1:058264289478:table/'));
 const scan=async select=>{let key,count=0,pages=0,capacity=0;const items=[],startedAt=new Date().toISOString();do{const args=['--table-name',name,'--consistent-read','--select',select,'--limit','100','--return-consumed-capacity','TOTAL','--no-paginate'];if(key)args.push('--exclusive-start-key',JSON.stringify(key));const r=await aws('dynamodb','scan',...args);count+=r.Count;pages++;capacity+=r.ConsumedCapacity?.CapacityUnits??0;key=r.LastEvaluatedKey;if(r.Items)items.push(...r.Items);}while(key&&Object.keys(key).length);return {count,pages,capacity,startedAt,finishedAt:new Date().toISOString(),paginationCompleted:true,consistentRead:true,items};};
 const first=await scan('COUNT');const second=await scan('COUNT');
 let structural={evaluated:0,reason:'Both complete scans observed zero; no item attributes retrieved.'};
 if(first.count||second.count){const full=await scan('ALL_ATTRIBUTES');source[model]=full.items;structural={evaluated:full.count,pages:full.pages,capacity:full.capacity,digest:digest([...full.items].sort((a,b)=>digest(a).localeCompare(digest(b)))),reason:'Required for relationship/privacy transform validation; raw values remain in memory.'};}
 const strip=({items,...v})=>v;
 result.push({model,table:description.Table,recovery:recovery.ContinuousBackupsDescription,ttl:ttl.TimeToLiveDescription,backups:backups.BackupSummaries,resourceId:row.resourceId,deletionPolicy:row.deletionPolicy,updateReplacePolicy:row.updateReplacePolicy,first:strip(first),second:strip(second),metadataCount:description.Table.ItemCount,structural,atomicSnapshot:false});
 save('table-inventory',{at,identity,region:'eu-north-1',tables:result,complete:result.length===4,scanWarning:'Exact observed paginated counts; no scan isolation or cross-table snapshot while writers remain active.',audit});
}
const outputs=read('amplify_outputs.json'),bucket=outputs.storage.bucket_name;assert.ok(bucket);setBucket(bucket);
const bucketRow=ledger.resources.find(r=>r.resourceType==='AWS::S3::Bucket'&&r.physicalId===bucket);assert.ok(bucketRow&&bucketRow.currentStack.arn.includes('Ntgre-sandbox'));
const currentBucket=(await aws('cloudformation','list-stack-resources','--stack-name',bucketRow.currentStack.arn)).StackResourceSummaries.find(r=>r.LogicalResourceId===bucketRow.logicalId);assert.equal(currentBucket.PhysicalResourceId,bucket);
const versioning=await aws('s3api','get-bucket-versioning','--bucket',bucket);
let token;const objects=[];let pages=0;do{const args=['--bucket',bucket,'--prefix','team-logos/','--max-keys','100','--no-paginate'];if(token)args.push('--continuation-token',token);const r=await aws('s3api','list-objects-v2',...args);objects.push(...r.Contents??[]);pages++;token=r.IsTruncated?r.NextContinuationToken:null;assert.ok(!r.IsTruncated||token);}while(token);
const logos=[];for(const o of objects){const h=await aws('s3api','head-object','--bucket',bucket,'--key',o.Key);logos.push({keyDigest:digest(o.Key),associationDigest:o.Key.match(/^team-logos\/(team:[^/]+)\//)?.[1]?digest(o.Key.split('/')[1]):null,size:h.ContentLength,contentType:h.ContentType,etag:h.ETag,versionId:h.VersionId??null,encryption:h.ServerSideEncryption??null});}
let marker,versionMarker,versionPages=0,versions=0,deleteMarkers=0;do{const args=['--bucket',bucket,'--prefix','team-logos/','--max-keys','100','--no-paginate'];if(marker)args.push('--key-marker',marker);if(versionMarker)args.push('--version-id-marker',versionMarker);const r=await aws('s3api','list-object-versions',...args);versions+=(r.Versions??[]).length;deleteMarkers+=(r.DeleteMarkers??[]).length;versionPages++;marker=r.IsTruncated?r.NextKeyMarker:null;versionMarker=r.NextVersionIdMarker;}while(marker);
save('logo-inventory',{at,bucket,prefix:'team-logos/',versioning,objects:logos,count:logos.length,pages,paginationCompleted:true,versions,deleteMarkers,versionPages,referencesEvaluated:!Object.keys(source).length,referenced:Object.keys(source).length?null:0,orphanCandidates:Object.keys(source).length?null:logos.length,missingReferences:Object.keys(source).length?null:0,associationLimit:'Nonzero business records require transform-derived reference reconciliation; do not infer an orphan from key name alone.',audit});
if(Object.keys(source).length){save('live-dry-run',{status:'BLOCKED_PENDING_STRUCTURAL_TRANSFORM',rawRowsPersisted:false,recordsEvaluated:Object.values(source).reduce((n,x)=>n+x.length,0),awsWrites:0});}
else save('live-dry-run',{status:'EMPTY_OBSERVED_INPUT',recordsEvaluated:0,inputCount:0,outputCount:0,rejects:0,warnings:0,canonicalDigest:digest([]),rawRowsPersisted:false,atomicSnapshot:false,awsWrites:0});
console.log(JSON.stringify({tables:result.map(r=>({model:r.model,first:r.first.count,second:r.second.count})),logos:logos.length,audit}));
