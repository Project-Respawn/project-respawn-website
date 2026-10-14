import test from 'node:test';import assert from 'node:assert/strict';
import {isolatedTransport,tables,reconcile,cleanupTargets,runId} from './isolation.mjs';
import {checkCursor,handler} from './cursor-probe.mjs';
import {runTransactions} from './transactions.mjs';
import {TransactionEmulator} from '../team-hub-2b4/tests/transport.mjs';
const journal=Object.keys(tables)[1],operational=Object.keys(tables)[0];
test('transaction remaps only tables; retains atomic authority, audit and business conditions byte-equivalent',async()=>{
 let received;const sdk={transactWrite:async p=>{received=p;return {};}};
 const tx={TransactItems:[{ConditionCheck:{TableName:journal,Key:{PK:'CONTROL#AUTHORITY',SK:'STATE'},ConditionExpression:'#m = :m',ExpressionAttributeNames:{'#m':'mode'},ExpressionAttributeValues:{':m':'TARGET_WRITER'}}},{Put:{TableName:operational,Item:{PK:'TEAM#team:isolated',SK:'META'},ConditionExpression:'attribute_not_exists(PK)'}},{Put:{TableName:journal,Item:{PK:'TEAM#team:isolated',SK:'AUDIT#1'},ConditionExpression:'attribute_not_exists(PK)'}}]};
 const original=structuredClone(tx);await isolatedTransport(sdk).transactWrite(tx);assert.deepEqual(tx,original);
 for(let i=0;i<tx.TransactItems.length;i++){const [kind,x]=Object.entries(tx.TransactItems[i])[0];assert.deepEqual(received.TransactItems[i][kind],{...x,TableName:tables[x.TableName]});}
});
test('unknown/physical/live foreign tables reject entire transaction before SDK call',()=>{let calls=0;const t=isolatedTransport({transactWrite:()=>calls++});for(const TableName of ['Legacy',tables[journal],'arn:aws:dynamodb:eu-north-1:058264289478:table/Legacy'])assert.throws(()=>t.transactWrite({TransactItems:[{Put:{TableName:operational,Item:{}}},{Put:{TableName,Item:{}}}]}));assert.equal(calls,0);});
test('strong reads preserved and SDK cancellation not hidden/retried',async()=>{let calls=0;const t=isolatedTransport({get:async p=>{assert.equal(p.ConsistentRead,true);assert.equal(p.TableName,tables[journal]);return {Item:{}};},transactWrite:async()=>{calls++;throw Object.assign(Error('cancel'),{name:'TransactionCanceledException'});}});await t.get({TableName:journal,Key:{PK:'CONTROL#AUTHORITY',SK:'STATE'},ConsistentRead:true});await assert.rejects(t.transactWrite({TransactItems:[{ConditionCheck:{TableName:journal,Key:{}}}]}),{name:'TransactionCanceledException'});assert.equal(calls,1);});
test('cleanup requires exact run, owner, account, region and both exact table names',()=>{const a={account:'058264289478',region:'eu-north-1',runId,tagOwner:'TeamHubIsolatedVerification',tables:Object.values(tables)};assert.equal(cleanupTargets(a).length,2);for(const patch of [{account:'0'},{region:'us-east-1'},{runId:'other'},{tagOwner:'other'},{tables:[journal,operational]}])assert.throws(()=>cleanupTargets({...a,...patch}));});
test('reconciliation detects content changes independent of ordering and rejects duplicate keys',()=>{const a=[{PK:'a',SK:'1',v:1},{PK:'b',SK:'2',v:2}];assert.deepEqual(reconcile(a),reconcile([...a].reverse()));assert.notEqual(reconcile(a).digest,reconcile([{...a[0],v:2},a[1]]).digest);assert.throws(()=>reconcile([a[0],a[0]]));});
test('fixed cursor probe exercises nine checks without disclosing signing material or tokens',()=>{const material='OFFLINE_ONLY_CURSOR_TEST_MATERIAL_123456';const result=checkCursor(material);assert.equal(Object.keys(result.checks).length,9);assert.equal(result.passed,true);assert.ok(!JSON.stringify(result).includes(material));assert.ok(!JSON.stringify(result).includes('nextToken'));});
test('probe input substitution rejected before any AWS call',async()=>{for(const input of [null,[],{secretArn:'other'},{nextToken:'x'}])await assert.rejects(handler(input),/EMPTY_INPUT_REQUIRED/);});
test('prepared real-SDK harness completes against offline emulator and cleans both isolated tables',async()=>{
 class SDK extends TransactionEmulator {
  async scan(p){assert.ok(Object.values(tables).includes(p.TableName));assert.equal(p.ConsistentRead,true);return {Items:[...this.rows.entries()].filter(([k])=>k.startsWith(p.TableName+'|')).map(([,v])=>structuredClone(v))};}
  async put(p){assert.ok(Object.values(tables).includes(p.TableName));this.rows.set(this.key(p.TableName,p.Item),structuredClone(p.Item));}
  async delete(p){assert.ok(Object.values(tables).includes(p.TableName));this.rows.delete(this.key(p.TableName,p.Key));}
  async transactWrite(p){const first=p.TransactItems[0].ConditionCheck,row=this.rows.get(this.key(first.TableName,first.Key)),v=first.ExpressionAttributeValues;if(row?.mode!==v[':mode']||row?.epoch!==v[':epoch']||row?.version!==v[':version'])throw Object.assign(Error('cancel'),{name:'TransactionCanceledException'});return super.transactWrite({...p,TransactItems:p.TransactItems.slice(1)});}
 }
 const sdk=new SDK(),receipts=[];const result=await runTransactions({sdk,record:r=>receipts.push(r),ownership:{account:'058264289478',region:'eu-north-1',runId,tagOwner:'TeamHubIsolatedVerification',tables:Object.values(tables),principalArn:'arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1/verification'}});
 assert.equal(result.passed,true);assert.equal(result.checks.length,48);assert.equal(sdk.rows.size,0);
 assert.deepEqual(receipts.map(r=>r.phase),['before-cleanup','after-cleanup']);assert.ok(receipts[1].cleanup.every(r=>r.count===0));
});
