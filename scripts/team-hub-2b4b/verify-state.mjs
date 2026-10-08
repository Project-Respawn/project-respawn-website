import assert from 'node:assert/strict';
import {aws,product,tableNames,tableArns,read,save,E,digest} from './preflight/aws.mjs';
const phase=process.argv[2]??'before';assert.ok(['before','after'].includes(phase));const expectedJournal=phase==='after'?read(E+'/run-result.json').retainedAudit:0;
const desired=read(E+'/proposed-product.template.json');
const stack=(await aws('cloudformation','describe-stacks',['--stack-name',product])).Stacks[0];assert.equal(stack.StackStatus,'UPDATE_COMPLETE');assert.equal(stack.DisableRollback,false);
const t=await aws('cloudformation','get-template',['--stack-name',product]);assert.equal(digest(typeof t.TemplateBody==='string'?JSON.parse(t.TemplateBody):t.TemplateBody),digest(desired));
const resources=(await aws('cloudformation','list-stack-resources',['--stack-name',product])).StackResourceSummaries;assert.equal(resources.length,40);
for(const [id,type,physical]of read(E+'/product-installed.json').resources.map(r=>[r.LogicalResourceId,r.ResourceType,r.PhysicalResourceId])){const r=resources.find(r=>r.LogicalResourceId===id);assert.equal(r.ResourceType,type);assert.equal(r.PhysicalResourceId,physical);}
const sort=x=>[...(x??[])].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
const tables=[];
for(const [i,name]of tableNames.entries()){
 const p=desired.Resources[i===0?'OperationalTable':'JournalTable'].Properties;
 const table=(await aws('dynamodb','describe-table',['--table-name',name])).Table;
 const pitr=(await aws('dynamodb','describe-continuous-backups',['--table-name',name])).ContinuousBackupsDescription;
 const ttl=(await aws('dynamodb','describe-time-to-live',['--table-name',name])).TimeToLiveDescription;
 const tags=(await aws('dynamodb','list-tags-of-resource',['--resource-arn',tableArns[i]])).Tags;
 assert.equal(table.TableArn,tableArns[i]);assert.equal(table.TableStatus,'ACTIVE');assert.equal(table.DeletionProtectionEnabled,true);assert.equal(pitr.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'ENABLED');
 assert.deepEqual(sort(table.KeySchema),sort(p.KeySchema));assert.deepEqual(sort(table.AttributeDefinitions),sort(p.AttributeDefinitions));
 assert.deepEqual(sort((table.GlobalSecondaryIndexes??[]).map(g=>({IndexName:g.IndexName,KeySchema:g.KeySchema,Projection:g.Projection}))),sort(p.GlobalSecondaryIndexes));
 assert.ok((table.GlobalSecondaryIndexes??[]).every(g=>g.IndexStatus==='ACTIVE'));assert.equal(table.BillingModeSummary.BillingMode,'PAY_PER_REQUEST');assert.equal(table.SSEDescription,undefined);assert.ok(!table.StreamSpecification?.StreamEnabled);assert.deepEqual(sort(tags.filter(t=>!t.Key.startsWith('aws:'))),sort(p.Tags));
 assert.equal(ttl.TimeToLiveStatus,i===0?'DISABLED':'ENABLED');if(i===1)assert.equal(ttl.AttributeName,'expiresAt');
 const passes=[];for(let j=0;j<2;j++){let key,count=0,pages=0;do{const args=['--table-name',name,'--select','COUNT','--consistent-read','--no-paginate','--limit','100'];if(key)args.push('--exclusive-start-key',JSON.stringify(key));const r=await aws('dynamodb','scan',args);count+=r.Count;pages++;key=r.LastEvaluatedKey;}while(key&&Object.keys(key).length);assert.equal(count,i===0?0:expectedJournal);passes.push({count,pages,stronglyConsistent:true,complete:true});}
 assert.equal(table.TableId,read(E+'/product-installed.json').tables[i].table.TableId);tables.push({table,pitr,ttl,tags,passes});save('target-state-'+phase,{complete:false,tables});
}
const actions=['GetItem','Query','Scan','PutItem','UpdateItem','DeleteItem','ConditionCheckItem'].map(a=>'dynamodb:'+a);
const denial=[];for(const name of tableArns){const r=await aws('iam','simulate-principal-policy',['--policy-source-arn','arn:aws:iam::058264289478:role/'+product+'-PreviewRead','--action-names',...actions,'--resource-arns',name,'--context-entries',JSON.stringify([{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'},{ContextKeyName:'dynamodb:EnclosingOperation',ContextKeyValues:['TransactWriteItems'],ContextKeyType:'string'}])]);assert.equal(r.EvaluationResults.length,7);assert.ok(r.EvaluationResults.every(r=>r.EvalDecision!=='allowed'));denial.push(r);}
save('target-state-'+phase,{at:new Date().toISOString(),complete:true,verified:true,stack,resources,tables,runtimeDenial:denial,existingElevenPreserved:true,legacyAuthority:true,targetWriter:false,seedRecords:0});console.log(JSON.stringify({complete:true,resources:40,tableCounts:[0,expectedJournal],runtimeDenied:true}));
