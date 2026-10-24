// Read-only request/log/metric correlation after real authenticated dark checks.
import assert from 'node:assert/strict';import {E,read,save,retryRead as aws,pause} from './live-common.mjs';
const acceptance=read(E+'/authenticated-dark-acceptance.json');assert(acceptance.passed&&acceptance.routes.length===19);
assert(read(E+'/configuration-acceptance.json').passed);
const start=read(E+'/authorization.json').startsAt;let result;
for(let attempt=0;attempt<4;attempt++){
 result={at:new Date().toISOString(),attempt:attempt+1,metrics:[],logs:[],awsWrites:0,fullTargetBusinessMonitoringAccepted:false};
 for(const runtime of ['read','command']){
  const functionName='ProjectRespawn-TeamHub-Production-Parity'+(runtime==='read'?'Read':'Command');
  const dimensions=[{Name:'Environment',Value:'Production'},{Name:'Runtime',Value:runtime}];
  const queries=[...['Invocations','Errors','Throttles'].map(MetricName=>({Namespace:'AWS/Lambda',MetricName,Dimensions:[{Name:'FunctionName',Value:functionName}]})),...['Requests','AuthorizationFailures','WriterNotAuthoritative','DependencyFailures','CoreDependencyFailures','AuthorityUnavailable','AuthorityEpochMismatch','TransactionThrottles'].map(MetricName=>({Namespace:'ProjectRespawn/TeamHub',MetricName,Dimensions:dimensions}))];
  for(const query of queries){const r=await aws('cloudwatch','get-metric-statistics',{...query,StartTime:start,EndTime:new Date().toISOString(),Period:60,Statistics:['Sum']});const sum=r.Datapoints.reduce((n,p)=>n+(p.Sum??0),0);result.metrics.push({runtime,...query,datapoints:r.Datapoints,sum,observed:r.Datapoints.length>0});if(['Errors','Throttles','DependencyFailures','CoreDependencyFailures','AuthorityUnavailable','AuthorityEpochMismatch','TransactionThrottles'].includes(query.MetricName))assert.equal(sum,0,'UNEXPECTED_'+query.MetricName);}
  const LogGroupName='/project-respawn/Production/team-hub/parity-'+runtime;
  const requestIds=[acceptance.authority,...acceptance.routes].map(r=>r.requestId).filter(Boolean);
  let token,events=[];do{const page=await aws('logs','filter-log-events',{logGroupName:LogGroupName,startTime:Date.parse(start),limit:100,...(token?{nextToken:token}:{})});events.push(...page.events);token=page.nextToken;}while(token);
  const records=events.flatMap(event=>{try{const x=JSON.parse(event.message);return x._aws?.CloudWatchMetrics?.some(m=>m.Namespace==='ProjectRespawn/TeamHub')?[x]:[];}catch{return[];}});
  const matched=records.filter(x=>x.Environment==='Production'&&x.Runtime===runtime&&requestIds.includes(x.requestId));
  assert(records.every(x=>!x.message),'NESTED_EMF_RECORD');assert(!events.some(e=>/Task timed out|Runtime\.ImportModuleError|KMSAccessDeniedException|UnhandledPromiseRejection/.test(e.message)),'UNEXPECTED_RUNTIME_ERROR');
  result.logs.push({runtime,group:LogGroupName,rootEmfRecords:records.length,correlated:matched.map(x=>({requestId:x.requestId,event:x.event,operation:x.operation,code:x.code,status:x.status})),secretsOrTokensStored:false});
 }
 result.alarms=(await aws('cloudwatch','describe-alarms',{AlarmNamePrefix:'ProjectRespawn-TeamHub-Production-'})).MetricAlarms.map(a=>({name:a.AlarmName,state:a.StateValue,metric:a.MetricName,namespace:a.Namespace,dimensions:a.Dimensions,period:a.Period,threshold:a.Threshold,statistic:a.Statistic}));assert.equal(result.alarms.length,5);assert(result.alarms.every(a=>a.state!=='ALARM'));
 const positive=['Invocations','Requests','AuthorizationFailures','WriterNotAuthoritative'];result.signalsObserved=result.metrics.filter(m=>m.Namespace==='ProjectRespawn/TeamHub'||m.MetricName==='Invocations').every(m=>m.observed)&&result.metrics.filter(m=>positive.includes(m.MetricName)).every(m=>m.sum>=1);result.requestLogsCorrelated=result.logs.every(l=>l.correlated.length>0);result.passed=result.signalsObserved&&result.requestLogsCorrelated;result.nativeMissingDatapointsAreNotProofOfZero=true;
 save('monitoring.json',result);if(result.passed)break;if(attempt<3)await pause(15000);
}
assert(result.passed,'MONITORING_INGESTION_OR_CORRELATION_INCOMPLETE');console.log(JSON.stringify({passed:true,metrics:result.metrics.length,alarms:result.alarms.length,logs:result.logs.map(x=>({runtime:x.runtime,correlated:x.correlated.length})),fullTargetBusinessMonitoringAccepted:false}));
