// Read-only collection decision. The caller owns bounded polling; missing data is never zero.
export function assessMetricWindow({samples,namespace,dimensions,metric,minimum,logsVerified,deadlineReached=false}){
 const same=d=>JSON.stringify(Object.entries(d??{}).sort())===JSON.stringify(Object.entries(dimensions).sort());
 const matching=samples.filter(s=>s.namespace===namespace&&s.metric===metric&&same(s.dimensions)&&s.complete===true);
 const observed=matching.length?matching.reduce((n,s)=>n+s.sum,0):null;
 if(logsVerified&&observed!==null&&observed>=minimum)return {status:'OBSERVED',observed,exactInvocationCountProven:false};
 return {status:deadlineReached?'FAILED_MISSING_EVIDENCE':'PENDING_INGESTION',observed};
}
