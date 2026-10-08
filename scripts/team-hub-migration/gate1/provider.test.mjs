import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
const path='node_modules/@aws-amplify/graphql-api-construct/node_modules/@aws-amplify/graphql-model-transformer/lib/resources/amplify-dynamodb-table/amplify-table-manager-lambda/amplify-table-manager-handler.js';
const source=fs.readFileSync(path,'utf8');
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),'4f5589b3eb5bb964ebc642068f169c35e32a5409ba7c7ae79c093d8055d0b075');
const desired={tableName:'offline-only',attributeDefinitions:[{attributeName:'id',attributeType:'S'}],keySchema:[{attributeName:'id',keyType:'HASH'}],billingMode:'PAY_PER_REQUEST',deletionProtectionEnabled:true,pointInTimeRecoverySpecification:{pointInTimeRecoveryEnabled:true},allowDestructiveGraphqlSchemaUpdates:false,replaceTableUponGsiUpdate:false};
function harness(protectedState=false){
 const calls=[];let pitr=protectedState;
 const table={TableName:'offline-only',TableArn:'offline-only-arn',TableStatus:'ACTIVE',KeySchema:[{AttributeName:'id',KeyType:'HASH'}],AttributeDefinitions:[{AttributeName:'id',AttributeType:'S'}],BillingModeSummary:{BillingMode:'PAY_PER_REQUEST'},DeletionProtectionEnabled:protectedState};
 class Ddb {
  async describeTable(){return {Table:structuredClone(table)};}
  async describeContinuousBackups(){return {ContinuousBackupsDescription:{PointInTimeRecoveryDescription:{PointInTimeRecoveryStatus:pitr?'ENABLED':'DISABLED'}}};}
  async updateContinuousBackups(x){calls.push(['pitr',x]);pitr=x.PointInTimeRecoverySpecification.PointInTimeRecoveryEnabled;return {};}
  async updateTable(x){calls.push(['update',x]);if('DeletionProtectionEnabled'in x)table.DeletionProtectionEnabled=x.DeletionProtectionEnabled;return {};}
  async createTable(x){calls.push(['create',x]);table.DeletionProtectionEnabled=x.DeletionProtectionEnabled;return {TableDescription:table};}
  async deleteTable(x){calls.push(['delete',x]);throw Error('Unexpected destructive operation');}
  async send(){return {Tags:[]};}
 }
 const exports={};const modules={
  '@aws-sdk/client-dynamodb':{DynamoDB:Ddb,ListTagsOfResourceCommand:class{},ResourceNotFoundException:class extends Error{},ContinuousBackupsUnavailableException:class extends Error{}},
  '@aws-sdk/client-lambda':{Lambda:class{async send(){return {Tags:{}};}},ListTagsCommand:class{}},
  './cfn-response':{safeHandler:f=>f},'./outbound':{},'./util':{log:()=>{}},'./import-table':{}
 };
 vm.runInNewContext(source+'\nexports.offlineProcess=processOnEvent;', {exports,require:name=>{assert.ok(name in modules,'Unexpected dependency '+name);return modules[name];},console:{log:()=>{}},setTimeout:()=>{throw Error('Unexpected retry delay');}});
 const event=(type,props=desired)=>({RequestType:type,PhysicalResourceId:'offline-only',ResourceProperties:structuredClone(props),OldResourceProperties:structuredClone(desired)});
 return {calls,table,event,run:(type,props)=>exports.offlineProcess(event(type,props),{invokedFunctionArn:'offline'}),complete:()=>exports.processIsComplete(event('Create'),{invokedFunctionArn:'offline'}),pitr:()=>pitr};
}
test('create enables deletion protection and completion enables PITR',async()=>{const h=harness();await h.run('Create');assert.equal(h.calls[0][1].DeletionProtectionEnabled,true);await h.complete();assert.equal(h.pitr(),true);assert.equal((await h.complete()).IsComplete,true);});
test('update changes only PITR and deletion protection, retaining identity',async()=>{const h=harness();const r=await h.run('Update');assert.equal(r.PhysicalResourceId,'offline-only');assert.deepEqual(h.calls.map(c=>c[0]),['pitr','update']);assert.deepEqual(Object.keys(h.calls[1][1]).sort(),['DeletionProtectionEnabled','TableName']);});
test('protected no-op and subsequent deployment preserve protection without writes',async()=>{const h=harness(true);await h.run('Update');await h.run('Update');assert.equal(h.calls.length,0);assert.equal(h.pitr(),true);assert.equal(h.table.DeletionProtectionEnabled,true);});
test('schema replacement is rejected with destructive changes disabled',async()=>{const h=harness(true);await assert.rejects(h.run('Update',{...desired,keySchema:[{attributeName:'different',keyType:'HASH'}]}),/replacement/);assert.equal(h.calls.length,0);});
test('physical deletion protection blocks replacement even if destructive flag is enabled',async()=>{const h=harness(true);await assert.rejects(h.run('Update',{...desired,keySchema:[{attributeName:'different',keyType:'HASH'}],allowDestructiveGraphqlSchemaUpdates:true}),/cannot be replaced/);assert.equal(h.calls.length,0);});
test('delete callback retains a protected physical table',async()=>{const h=harness(true);await h.run('Delete');assert.equal(h.calls.length,0);});
test('rollback to previous desired settings can remove protections in place, never replace/delete',async()=>{const h=harness(true);const old={...desired};delete old.deletionProtectionEnabled;delete old.pointInTimeRecoverySpecification;await h.run('Update',old);assert.deepEqual(h.calls.map(c=>c[0]),['pitr','update']);assert.equal(h.pitr(),false);assert.equal(h.table.DeletionProtectionEnabled,false);});
