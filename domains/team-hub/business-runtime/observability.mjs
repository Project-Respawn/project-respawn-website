import {metricEvent as acceptedMetric} from '../cutover/observability.mjs';
export {responseErrorCode} from '../cutover/observability.mjs';
export function metricEvent(runtime,event,now){
 const r=acceptedMetric(runtime,event,now);
 r.TransactionThrottles=event.event==='TEAM_TRANSACTION_THROTTLED'?1:0;
 if(r.TransactionThrottles)r.event='TEAM_TRANSACTION_THROTTLED';
 r._aws.CloudWatchMetrics[0].Metrics.push({Name:'TransactionThrottles',Unit:'Count'});
 return r;
}
