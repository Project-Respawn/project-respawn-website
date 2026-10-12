import {aws,save} from './aws.mjs';
const r={start:'2026-10-08T22:24:00Z',end:'2026-10-08T22:27:00Z',events:[],pages:[],complete:false,awsWrites:0};
for(const event of ['Decrypt']){
 let next,pages=0;
 do{const out=await aws('cloudtrail','lookup-events',{LookupAttributes:[{AttributeKey:'EventName',AttributeValue:event}],StartTime:r.start,EndTime:r.end,MaxResults:50,...(next?{NextToken:next}:{})});pages++;
 for(const raw of out.Events??[]){const e=JSON.parse(raw.CloudTrailEvent),p=e.requestParameters??{},issuer=e.userIdentity?.sessionContext?.sessionIssuer?.arn,fn=p.functionName,ctx=p.encryptionContext??{};if(!/ProjectRespawn-TeamHub-Ntgre-Parity(Read|Command)/.test(fn??'')&&!/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution/.test(issuer??'')&&!Object.values(ctx).some(x=>/ProjectRespawn-TeamHub-Ntgre-Parity(Read|Command)/.test(String(x))))continue;
 r.events.push({id:e.eventID,time:e.eventTime,eventName:e.eventName,principal:e.userIdentity?.arn,issuer,invokedBy:e.userIdentity?.invokedBy,functionName:fn,keyId:p.keyId,errorCode:e.errorCode??null,errorMessage:e.errorMessage??null,requestVariableNames:Object.keys(p.environment?.variables??{}),responseEnvironmentError:e.responseElements?.environment?.error??null,context:ctx,resources:e.resources?.map(x=>x.ARN)});}
 next=out.NextToken;save('history-provider-window',r);if(pages>=50&&next)throw Error('History pagination limit; evidence incomplete');
 }while(next);r.pages.push({event,pages});
}
r.complete=true;save('history-provider-window',r);console.log(JSON.stringify({complete:true,events:r.events.length,pages:r.pages,updates:r.events.filter(e=>e.eventName.startsWith('Update')).map(e=>({time:e.time,event:e.eventName,function:e.functionName,error:e.errorCode}))}));
