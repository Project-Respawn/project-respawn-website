import assert from 'node:assert/strict';
import {aws} from '../team-hub-describekey-execution/aws.mjs';
import {E,read,save,name} from './common.mjs';
const probe=read(E+'/probe.json');assert.equal(probe.complete,true);
const start=new Date(Date.parse(probe.at)-30000),end=new Date(Date.parse(probe.completedAt)+30000);
const r={at:new Date().toISOString(),complete:false,events:[],secretValueReadByInspector:false};
for(const eventName of ['GetSecretValue','Decrypt']){let token,pages=0;do{
 const events=await aws('cloudtrail','lookup-events',{LookupAttributes:[{AttributeKey:'EventName',AttributeValue:eventName}],StartTime:start.toISOString(),EndTime:end.toISOString(),MaxResults:50,...(token?{NextToken:token}:{})});
 for(const row of events.Events??[]){const e=JSON.parse(row.CloudTrailEvent),arn=e.userIdentity?.arn??'';if(!arn.endsWith('/'+name+'-CursorProbe'))continue;
 assert.ok(arn.includes(':assumed-role/ProjectRespawn-TeamHub-Ntgre-ParityRead/'));assert.ok(!e.errorCode,'Actual probe service failure');
 const resource=eventName==='GetSecretValue'?e.requestParameters?.secretId:e.requestParameters?.encryptionContext?.SecretARN;
 assert.equal(resource,'arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV');
 r.events.push({eventId:e.eventID,eventTime:e.eventTime,eventName:e.eventName,requestId:e.requestID,principalArn:arn,resource,keyResources:(e.resources??[]).map(x=>x.ARN),sourceService:e.sourceIPAddress,errorCode:e.errorCode});
 }
 token=events.NextToken;assert.ok(++pages<=20,'Bounded audit pagination');
}while(token);}
r.complete=['GetSecretValue','Decrypt'].every(n=>r.events.some(e=>e.eventName===n));save('probe-audit',r);console.log(JSON.stringify({complete:r.complete,events:r.events.map(x=>({name:x.eventName,eventId:x.eventId}))}));
