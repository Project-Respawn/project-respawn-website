// EMF counters contain no tokens, request bodies, subjects, names or directory data.
export function metricEvent(runtime,event,now=Date.now()){
 const safe={event:event.event,operation:event.operation,requestId:event.requestId,status:event.status,code:event.code};
 const counts={Requests:event.event==='TEAM_REQUEST'?1:0,AuthorizationFailures:event.event==='TEAM_REQUEST'&&['FORBIDDEN','UNAUTHENTICATED'].includes(event.code)?1:0,DependencyFailures:event.event==='TEAM_REQUEST'&&event.code==='DEPENDENCY_UNAVAILABLE'?1:0,CoreDependencyFailures:event.event==='CORE_DEPENDENCY_FAILED'?1:0,TransactionConflicts:event.event==='TEAM_TRANSACTION_CONFLICT'?1:0,WriterNotAuthoritative:event.event==='WRITER_NOT_AUTHORITATIVE'?1:0};
 return {_aws:{Timestamp:now,CloudWatchMetrics:[{Namespace:'ProjectRespawn/TeamHub',Dimensions:[['Environment','Runtime']],Metrics:Object.keys(counts).map(Name=>({Name,Unit:'Count'}))}]},Environment:'Ntgre',Runtime:runtime,...safe,...counts};
}
