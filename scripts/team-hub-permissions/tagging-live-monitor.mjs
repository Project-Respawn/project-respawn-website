// Read actual native/custom metrics after the one-shot safe probes. No metric writes.
import assert from 'node:assert/strict';
import {E,read,save,retryRead as aws,pause} from './tagging-live-common.mjs';
const accept=read(E+'/dark-acceptance.json');assert(accept.passed);const start=read(E+'/authorization.json').startsAt;
let result;for(let attempt=0;attempt<4;attempt++){
 result={at:new Date().toISOString(),attempt:attempt+1,metrics:[],alarms:[],awsWrites:0};
 for(const probe of accept.probes){const queries=[...['Invocations','Errors','Throttles'].map(MetricName=>({Namespace:'AWS/Lambda',MetricName,Dimensions:[{Name:'FunctionName',Value:probe.functionName}]})),...['Requests','AuthorizationFailures'].map(MetricName=>({Namespace:'ProjectRespawn/TeamHub',MetricName,Dimensions:[{Name:'Environment',Value:'Production'},{Name:'Runtime',Value:probe.runtime}]}))];
  for(const query of queries){const response=await aws('cloudwatch','get-metric-statistics',{...query,StartTime:start,EndTime:new Date().toISOString(),Period:60,Statistics:['Sum']});const sum=response.Datapoints.reduce((n,p)=>n+(p.Sum??0),0);result.metrics.push({runtime:probe.runtime,...query,datapoints:response.Datapoints,sum,observed:response.Datapoints.length>0});if(['Errors','Throttles'].includes(query.MetricName))assert.equal(sum,0,'UNEXPECTED_NATIVE_'+query.MetricName);}
 }
 const invocations=result.metrics.filter(m=>m.MetricName==='Invocations');result.nativeInvocationsObserved=invocations.every(m=>m.observed&&m.sum>=1);result.customCountersObserved=result.metrics.filter(m=>m.Namespace==='ProjectRespawn/TeamHub').every(m=>m.observed&&m.sum>=1);
 result.alarms=(await aws('cloudwatch','describe-alarms',{AlarmNamePrefix:'ProjectRespawn-TeamHub-Production-'})).MetricAlarms.map(a=>({name:a.AlarmName,state:a.StateValue,namespace:a.Namespace,metric:a.MetricName,dimensions:a.Dimensions,statistic:a.Statistic,period:a.Period,threshold:a.Threshold,treatMissingData:a.TreatMissingData}));assert.equal(result.alarms.length,5);assert(result.alarms.every(a=>a.state!=='ALARM'),'UNEXPECTED_DARK_ALARM');
 result.passed=result.nativeInvocationsObserved;result.fullBusinessMonitoringAccepted=false;result.zeroDatapointsAreNotProofOfZeroActivity=true;save('monitoring.json',result);
 if(result.nativeInvocationsObserved&&result.customCountersObserved)break;if(attempt<3)await pause(15000);
}
assert(result.nativeInvocationsObserved,'NATIVE_INVOCATION_SIGNALS_NOT_YET_OBSERVED');console.log(JSON.stringify({passed:result.passed,nativeInvocationsObserved:result.nativeInvocationsObserved,customCountersObserved:result.customCountersObserved,alarms:result.alarms,fullBusinessMonitoringAccepted:false}));
