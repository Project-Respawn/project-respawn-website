import {aws,save} from './aws.mjs';
const r=await aws('cloudtrail','lookup-events',{LookupAttributes:[{AttributeKey:'EventSource',AttributeValue:'lambda.amazonaws.com'}],StartTime:new Date(Date.now()-30*60000).toISOString(),MaxResults:50});
const events=[];for(const event of r.Events??[]){const x=JSON.parse(event.CloudTrailEvent);if(!JSON.stringify(x.userIdentity??{}).includes('ProjectRespawn-TeamHub-Ntgre'))continue;events.push({at:x.eventTime,event:x.eventName,role:x.userIdentity?.sessionContext?.sessionIssuer?.arn,errorCode:x.errorCode,errorMessage:x.errorMessage,functionName:x.requestParameters?.functionName});}
save('lambda-event-diagnosis',{at:new Date().toISOString(),events});console.log(JSON.stringify({events}));
