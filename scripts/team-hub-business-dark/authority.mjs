import assert from 'node:assert/strict';
import {aws} from '../team-hub-d1/aws.mjs';
import {read,save} from './aws.mjs';
const stage=process.argv[2]??'before';assert.ok(['before','after'].includes(stage));
const r={at:new Date().toISOString(),complete:false};
r.read=await aws('dynamodb','get-item',{TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},ConsistentRead:true});
assert.deepEqual(r.read.Item,read('docs/architecture/team-hub-c1-evidence-2026-10-07/c1-request.json').Item);
const q=await aws('dynamodb','query',{TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',KeyConditionExpression:'PK = :pk',ExpressionAttributeValues:{':pk':{S:'CONTROL#AUTHORITY'}},ConsistentRead:true});assert.equal(q.Count,1);assert.ok(!q.LastEvaluatedKey);r.authorityPartitionCount=q.Count;
for(const [service,action,input,code] of [['iam','get-role',{RoleName:'ProjectRespawn-TeamHub-Ntgre-C1Initialize'},'NoSuchEntity'],['stepfunctions','describe-state-machine',{stateMachineArn:'arn:aws:states:eu-north-1:058264289478:stateMachine:ProjectRespawn-TeamHub-Ntgre-C1Initialize'},'StateMachineDoesNotExist']]){let absent=false;try{await aws(service,action,input);}catch(e){assert.ok(e.message.includes(code));absent=true;}assert.ok(absent);}
r.c1ResourcesAbsent=true;r.complete=true;save('authority-'+stage,r);console.log(JSON.stringify({complete:true,mode:r.read.Item.mode.S,epoch:1,version:1}));
