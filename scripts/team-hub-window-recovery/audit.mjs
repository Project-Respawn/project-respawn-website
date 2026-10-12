import assert from 'node:assert/strict';
import {aws,read,save,E} from './aws.mjs';
const execution=read(E+'/workflow-status.json'),r={at:new Date().toISOString(),events:[],complete:false,awsWrites:0};
const start=new Date(Date.parse(execution.startDate)-1000).toISOString(),end=new Date(Date.parse(execution.stopDate)+60000).toISOString();
for(const service of ['lambda.amazonaws.com','kms.amazonaws.com']){let token;do{
 const page=await aws('cloudtrail','lookup-events',{LookupAttributes:[{AttributeKey:'EventSource',AttributeValue:service}],StartTime:start,EndTime:end,...(token?{NextToken:token}:{})});
 for(const event of page.Events??[]){const e=JSON.parse(event.CloudTrailEvent);if(e.userIdentity?.arn?.includes('assumed-role/ProjectRespawn-TeamHub-Ntgre-ConfigRecovery-20261009/'))r.events.push({eventID:e.eventID,eventTime:e.eventTime,eventSource:e.eventSource,eventName:e.eventName,requestID:e.requestID,errorCode:e.errorCode,errorMessage:e.errorMessage,principal:e.userIdentity.arn,resources:e.resources,encryptionContext:e.requestParameters?.encryptionContext});}
 token=page.NextToken;
}while(token);}
r.updateEvents=r.events.filter(e=>e.eventName.startsWith('UpdateFunctionConfiguration'));
r.denied=r.events.filter(e=>e.errorCode);
r.complete=r.updateEvents.length===2&&!r.denied.length;
save('execution-cloudtrail',r);console.log(JSON.stringify({complete:r.complete,updates:r.updateEvents.length,errors:r.denied}));
