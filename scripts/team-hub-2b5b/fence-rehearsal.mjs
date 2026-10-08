import fs from 'node:fs';import assert from 'node:assert/strict';
import {fromIni} from '@aws-sdk/credential-providers';
import {DynamoDBClient,CreateTableCommand,DescribeTableCommand,DeleteTableCommand,PutResourcePolicyCommand,GetResourcePolicyCommand,PutItemCommand,UpdateItemCommand,DeleteItemCommand,BatchWriteItemCommand,TransactWriteItemsCommand,ExecuteStatementCommand,waitUntilTableExists,waitUntilTableNotExists} from '@aws-sdk/client-dynamodb';
import {identity,targets} from '../team-hub-2b4b/preflight/common.mjs';
import {legacyFencePolicies} from '../team-hub-2b4/legacy-fence.mjs';
const E='docs/architecture/team-hub-2b5b-evidence-2026-10-07',name='ProjectRespawn-TeamHub-Ntgre-2B5B-FenceRehearsal-20261007';
const arn='arn:aws:dynamodb:eu-north-1:058264289478:table/'+name;
const db=new DynamoDBClient({region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1});
let r={at:new Date().toISOString(),identity:await identity(),scope:'DISPOSABLE_TABLE_ONLY',actualLegacyFenceInstalled:false,checks:[],cleanup:false,passed:false};
const save=()=>fs.writeFileSync(E+'/fence-rehearsal.json',JSON.stringify(r,null,2)+'\n');
const resume=process.argv.includes('--resume');
if(resume){r=JSON.parse(fs.readFileSync(E+'/fence-rehearsal.json'));const t=(await db.send(new DescribeTableCommand({TableName:name}))).Table;assert.equal(t.TableId,r.tableId);assert.equal(t.TableArn,arn);r.checks=[];delete r.error;}
if(!resume){try{await db.send(new DescribeTableCommand({TableName:name}));throw Error('Disposable name already exists');}catch(e){if(e.name!=='ResourceNotFoundException')throw e;}
const created=(await db.send(new CreateTableCommand({TableName:name,AttributeDefinitions:[{AttributeName:'id',AttributeType:'S'}],KeySchema:[{AttributeName:'id',KeyType:'HASH'}],BillingMode:'PAY_PER_REQUEST',Tags:[{Key:'Purpose',Value:'TeamHub2B5BFenceRehearsal'}]}))).TableDescription;
r.tableId=created.TableId;save();}
async function retry(command){for(let i=0;;i++){try{return await db.send(command);}catch(e){if(i>=30||!['ResourceInUseException','PolicyNotFoundException'].includes(e.name))throw e;await new Promise(resolve=>setTimeout(resolve,2000));}}}
try{
 await waitUntilTableExists({client:db,maxWaitTime:120,minDelay:2,maxDelay:5},{TableName:name});
 if(!resume){await db.send(new PutItemCommand({TableName:name,Item:{id:{S:'synthetic'}}}));r.legacyWriterAllowed=true;save();}
 for(const mode of ['FROZEN','TARGET_WRITER']){
  const original=legacyFencePolicies(mode,targets.map(t=>t.sourceArn))[0].policy;
  const policy=structuredClone(original);for(const s of policy.Statement)s.Resource=arn;
  if(!r.revision){const out=await retry(new PutResourcePolicyCommand({ResourceArn:arn,Policy:JSON.stringify(policy),...(r.revision?{ExpectedRevisionId:r.revision}:{})}));r.revision=out.RevisionId;save();}
  const actual=await retry(new GetResourcePolicyCommand({ResourceArn:arn}));assert.deepEqual(JSON.parse(actual.Policy),policy);
  const probes=[['PutItem',()=>new PutItemCommand({TableName:name,Item:{id:{S:'synthetic'}}})],['UpdateItem',()=>new UpdateItemCommand({TableName:name,Key:{id:{S:'synthetic'}},UpdateExpression:'SET probe = :p',ExpressionAttributeValues:{':p':{S:'synthetic'}}})],['DeleteItem',()=>new DeleteItemCommand({TableName:name,Key:{id:{S:'synthetic'}}})],['BatchWriteItem',()=>new BatchWriteItemCommand({RequestItems:{[name]:[{PutRequest:{Item:{id:{S:'batch-synthetic'}}}}]}})],['TransactWriteItems',()=>new TransactWriteItemsCommand({TransactItems:[{Put:{TableName:name,Item:{id:{S:'transaction-synthetic'}}}}]})],['PartiQLInsert',()=>new ExecuteStatementCommand({Statement:`INSERT INTO "${name}" VALUE {'id':?}`,Parameters:[{S:'partiql-synthetic'}]})]];
  for(const [operation,command] of probes){let denied=false;for(let attempt=0;attempt<12&&!denied;attempt++){try{await db.send(command());}catch(e){if(e.name==='AccessDeniedException')denied=true;else throw e;}if(!denied)await new Promise(resolve=>setTimeout(resolve,2000));}r.checks.push({mode,operation,denied,principal:r.identity.Arn});save();assert.ok(denied,mode+' '+operation+' bypass');}
 }
 r.passed=true;
}catch(e){r.error={name:e.name,message:String(e.message).slice(0,150)};save();throw e;}
finally{const t=(await db.send(new DescribeTableCommand({TableName:name}))).Table;assert.equal(t.TableArn,arn);assert.equal(t.TableId,r.tableId);await retry(new DeleteTableCommand({TableName:name}));await waitUntilTableNotExists({client:db,maxWaitTime:120,minDelay:2,maxDelay:5},{TableName:name});r.cleanup=true;r.completedAt=new Date().toISOString();save();console.log(JSON.stringify(r));}
