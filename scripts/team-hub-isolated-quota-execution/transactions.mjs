import fs from 'node:fs';import assert from 'node:assert/strict';
import {STSClient,AssumeRoleCommand,GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient,GetCommand,QueryCommand,ScanCommand,PutCommand,DeleteCommand,TransactWriteCommand} from '@aws-sdk/lib-dynamodb';
import {runTransactions} from '../team-hub-isolated-verification/transactions.mjs';
import {E,read,save,options,name,verifyPins} from './common.mjs';
verifyPins();const installed=read(E+'/installed.json');assert.equal(installed.complete,true);assert.ok(!fs.existsSync(E+'/transactions.json'),'No automatic suite replay');
const window=read(E+'/provision.json').window;assert.ok(Date.now()>=Date.parse(window.NotBefore));assert.ok(Date.parse(window.ExpiresAt)-Date.now()>15*60000);
const assumed=await new STSClient(options).send(new AssumeRoleCommand({RoleArn:'arn:aws:iam::058264289478:role/'+name,RoleSessionName:'verification',DurationSeconds:3600}));
const credentials={accessKeyId:assumed.Credentials.AccessKeyId,secretAccessKey:assumed.Credentials.SecretAccessKey,sessionToken:assumed.Credentials.SessionToken};delete assumed.Credentials;
const runtimeOptions={region:'eu-north-1',credentials,maxAttempts:1};
const identity=await new STSClient(runtimeOptions).send(new GetCallerIdentityCommand({}));assert.equal(identity.Arn,'arn:aws:sts::058264289478:assumed-role/'+name+'/verification');assert.equal(identity.Account,'058264289478');
const tables=installed.tables.map(x=>x.table.TableName),client=DynamoDBDocumentClient.from(new DynamoDBClient(runtimeOptions),{marshallOptions:{removeUndefinedValues:true}});
const r={at:new Date().toISOString(),identity,complete:false,attempted:true,requests:[],cleanup:[],businessDataScope:'Exact isolated synthetic tables only'};save('transactions',r);
const commands={get:GetCommand,query:QueryCommand,scan:ScanCommand,put:PutCommand,delete:DeleteCommand,transactWrite:TransactWriteCommand};
const sdk=Object.fromEntries(Object.entries(commands).map(([method,Command])=>[method,async input=>{
 const targets=method==='transactWrite'?input.TransactItems.map(x=>Object.values(x)[0].TableName):[input.TableName];assert.ok(targets.length>0&&targets.every(t=>tables.includes(t)),'Foreign table rejected');
 const receipt={method,tables:[...new Set(targets)],at:new Date().toISOString(),...(Object.hasOwn(input,'ConsistentRead')?{consistentRead:input.ConsistentRead}:{})};
 try{const result=await client.send(new Command(input));receipt.requestId=result.$metadata?.requestId;receipt.status=result.$metadata?.httpStatusCode;return result;}catch(e){receipt.error=e.name;receipt.requestId=e.$metadata?.requestId;receipt.cancellationCodes=e.CancellationReasons?.map(x=>x.Code);throw e;}finally{r.requests.push(receipt);save('transactions',r);}
}]));
try{
 r.result=await runTransactions({sdk,ownership:{account:identity.Account,region:'eu-north-1',runId:'20261012v1',tagOwner:'TeamHubIsolatedVerification',tables,principalArn:identity.Arn},record:async receipt=>{r.cleanup.push(receipt);save('transactions',r);}});
 assert.equal(r.result.passed,true);assert.equal(r.result.checks.length,48);r.complete=true;save('transactions',r);console.log(JSON.stringify({complete:true,scenarios:48,cleanup:r.cleanup.at(-1),requests:r.requests.length}));
}catch(e){r.failure={name:e.name,message:e.message.slice(0,1000),requestId:e.$metadata?.requestId};save('transactions',r);throw Error('ISOLATED_TRANSACTION_GATE_FAILED: '+e.name+' '+e.message.slice(0,250));}finally{client.destroy();for(const k of Object.keys(credentials))delete credentials[k];}
