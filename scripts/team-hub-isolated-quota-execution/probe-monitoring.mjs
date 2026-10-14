import assert from 'node:assert/strict';
import {aws} from '../team-hub-describekey-execution/aws.mjs';
import {E,read,save,name} from './common.mjs';
const probe=read(E+'/probe.json');assert.equal(probe.complete,true);
const start=new Date(Math.floor(Date.parse(probe.at)/60000)*60000),end=new Date(Math.ceil((Date.parse(probe.completedAt)+1)/60000)*60000);
const r={at:new Date().toISOString(),complete:false,window:{start:start.toISOString(),end:end.toISOString()},metrics:[],platformEvents:[],pending:[]};
for(const MetricName of ['Invocations','Errors','Throttles']){const m=await aws('cloudwatch','get-metric-statistics',{Namespace:'AWS/Lambda',MetricName,Dimensions:[{Name:'FunctionName',Value:name+'-CursorProbe'}],StartTime:start.toISOString(),EndTime:end.toISOString(),Period:60,Statistics:['Sum']});const sum=m.Datapoints.reduce((n,x)=>n+x.Sum,0);r.metrics.push({name:MetricName,sum,...m});if(MetricName==='Invocations'){if(sum===0)r.pending.push('Invocation ingestion');else assert.equal(sum,1,'Unexpected extra probe invocation');}else assert.equal(sum,0,'Probe error/throttle');}
let next;do{const logs=await aws('logs','filter-log-events',{logGroupName:'/project-respawn/Ntgre/team-hub/parity-read',startTime:Date.parse(probe.at)-1000,endTime:Date.parse(probe.completedAt)+10000,...(next?{nextToken:next}:{})});
for(const e of logs.events??[]){if(!e.logStreamName?.includes(name+'-CursorProbe'))continue;assert.ok(!/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/.test(e.message));const v=JSON.parse(e.message);assert.ok(v.type?.startsWith('platform.'),'Unexpected probe application output');r.platformEvents.push({eventId:e.eventId,timestamp:e.timestamp,stream:e.logStreamName,type:v.type,requestId:v.record?.requestId,status:v.record?.status});}
const old=next;next=logs.nextToken;if(next===old)break;
}while(next);
if(!r.platformEvents.some(e=>e.type==='platform.report'))r.pending.push('Platform report ingestion');
r.complete=r.pending.length===0;r.scope='Fixed isolated probe; no live API business acceptance claimed';save('probe-monitoring',r);console.log(JSON.stringify({complete:r.complete,pending:r.pending,platformEvents:r.platformEvents.length,metrics:r.metrics.map(x=>({name:x.name,sum:x.sum}))}));
