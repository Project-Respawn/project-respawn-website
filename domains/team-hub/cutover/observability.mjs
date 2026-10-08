// EMF counters contain no tokens, request bodies, subjects, names or directory data.
import {errorCodes,operations} from './contracts.mjs';
const codes=new Set([...Object.keys(errorCodes),'INTERNAL_ERROR']);
export function responseErrorCode(response){
 if(response.statusCode<400)return undefined;
 try{const code=JSON.parse(response.body)?.error?.code;return codes.has(code)?code:undefined;}catch{return undefined;}
}
export function metricEvent(runtime,event,now=Date.now()){
 const names=new Set(['TEAM_REQUEST','CORE_DEPENDENCY_FAILED','TEAM_TRANSACTION_CONFLICT','WRITER_NOT_AUTHORITATIVE','AUTHORITY_UNAVAILABLE','AUTHORITY_EPOCH_MISMATCH','IDEMPOTENCY_REPLAY']);
 const safe={event:names.has(event.event)?event.event:'UNKNOWN_EVENT',operation:Object.hasOwn(operations,event.operation??'')?event.operation:undefined,requestId:/^[A-Za-z0-9_=-]{1,128}$/.test(event.requestId??'')?event.requestId:undefined,status:Number.isInteger(event.status)&&event.status>=100&&event.status<=599?event.status:undefined,code:codes.has(event.code)?event.code:undefined};
 const counts={Requests:safe.event==='TEAM_REQUEST'?1:0,AuthorizationFailures:safe.event==='TEAM_REQUEST'&&['FORBIDDEN','UNAUTHENTICATED'].includes(safe.code)?1:0,DependencyFailures:safe.event==='TEAM_REQUEST'&&safe.code==='DEPENDENCY_UNAVAILABLE'?1:0,CoreDependencyFailures:safe.event==='CORE_DEPENDENCY_FAILED'?1:0,TransactionConflicts:safe.event==='TEAM_TRANSACTION_CONFLICT'?1:0,WriterNotAuthoritative:safe.event==='WRITER_NOT_AUTHORITATIVE'?1:0,AuthorityUnavailable:safe.event==='AUTHORITY_UNAVAILABLE'?1:0,AuthorityEpochMismatch:safe.event==='AUTHORITY_EPOCH_MISMATCH'?1:0};
 return {_aws:{Timestamp:now,CloudWatchMetrics:[{Namespace:'ProjectRespawn/TeamHub',Dimensions:[['Environment','Runtime']],Metrics:Object.keys(counts).map(Name=>({Name,Unit:'Count'}))}]},Environment:'Ntgre',Runtime:['read','command'].includes(runtime)?runtime:'unknown',...safe,...counts};
}
