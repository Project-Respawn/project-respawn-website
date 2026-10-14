// Exact accepted guarded requests, before fence activation. No arbitrary keys.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {fromIni} from '@aws-sdk/credential-providers';
import * as ddb from '@aws-sdk/client-dynamodb';
import * as s3 from '@aws-sdk/client-s3';
import {directRequests,logoRequests,tables,reserved,bucket,logoKey} from './probe-requests.mjs';
import {aws} from '../team-hub-describekey-execution/aws.mjs';
const E='docs/architecture/team-hub-resumed-cutover-evidence-2026-10-13';
const opts={region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1};
const dc=new ddb.DynamoDBClient(opts),sc=new s3.S3Client(opts);
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Arn,'arn:aws:iam::058264289478:user/RavenTest');
const r={at:new Date().toISOString(),principal:identity.Arn,phase:'PRE_FENCE',requests:[],complete:false,businessChanges:0};
const save=()=>fs.writeFileSync(E+'/operator-precontrols.json',JSON.stringify(r,null,2)+'\n');save();
for(const TableName of tables){const q=await dc.send(new ddb.GetItemCommand({TableName,Key:{id:{S:reserved}},ConsistentRead:true}));assert.equal(q.Item,undefined,'Reserved diagnostic key must be absent');}
const listed=await sc.send(new s3.ListObjectsV2Command({Bucket:bucket,Prefix:logoKey,ExpectedBucketOwner:'058264289478'}));assert.equal(listed.IsTruncated,false);assert.equal((listed.Contents??[]).length,0);
for(const p of [...directRequests(),...logoRequests()]){
 let receipt;try{const result=await (p.input.Bucket?sc:dc).send(new (p.input.Bucket?s3:ddb)[p.api+'Command'](p.input));receipt={api:p.api,action:p.action,resource:p.input.TableName??p.input.Bucket??Object.keys(p.input.RequestItems??{})[0]??p.input.TransactItems?.[0]?.Put?.TableName,status:result.$metadata.httpStatusCode,requestId:result.$metadata.requestId,outcome:'SUCCESS_ON_ABSENT_OR_CONTRADICTORY_KEY',changedBusinessState:false};}
 catch(e){receipt={api:p.api,action:p.action,status:e.$metadata?.httpStatusCode,requestId:e.$metadata?.requestId,error:e.name,message:String(e.message).slice(0,1400),reasons:e.CancellationReasons?.map(x=>({code:x.Code})),changedBusinessState:false};}
 receipt.validControl=Boolean(receipt.requestId)&&!['ValidationException','AccessDeniedException','AccessDenied','InvalidRequest','InvalidArgument'].includes(receipt.error??'')&&(!receipt.error||['ConditionalCheckFailedException','TransactionCanceledException','NoSuchKey','NoSuchUpload','PreconditionFailed','NotFound'].includes(receipt.error));
 r.requests.push(receipt);save();if(!receipt.validControl){r.stop='MANDATORY_SOURCE_SERVICE_POSITIVE_CONTROL_FAILED';save();console.log(JSON.stringify({complete:false,stop:r.stop,receipt}));process.exitCode=1;break;}
}
if(!r.stop){for(const TableName of tables){const q=await dc.send(new ddb.GetItemCommand({TableName,Key:{id:{S:reserved}},ConsistentRead:true}));assert.equal(q.Item,undefined);}r.complete=true;save();console.log(JSON.stringify({complete:true,requests:r.requests.length,businessChanges:0}));}

