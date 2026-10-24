import {createCutoverHandler} from './handler.mjs';
import {createAuthorityStatusHandler} from '../authority-contract/handler.mjs';
import {metricEvent} from './observability.mjs';
export function createBusinessRouter({runtime,transport,invokeCore,environment,loadCursorSecret,configuration,clock=Date.now,emit=()=>{}}){
 const log=e=>emit(metricEvent(runtime,e,clock()));
 const status=createAuthorityStatusHandler({getItem:p=>transport.get(p),environment,clock});
 const business=createCutoverHandler({runtime,transport,invokeCore,environment,loadCursorSecret,permissionsEnabled:configuration.TEAM_HUB_PERMISSIONS==='MEMBER_GRANTS_V1',clock:()=>Math.floor(clock()/1000),log});
 return async event=>{
  if(configuration.TEAM_HUB_BUSINESS_RUNTIME!=='AUTHORITY_GATED_V1'||!['read','command'].includes(runtime)){
   log({event:'AUTHORITY_UNAVAILABLE',requestId:event?.requestContext?.requestId});log({event:'TEAM_REQUEST',code:'DEPENDENCY_UNAVAILABLE',requestId:event?.requestContext?.requestId});return {statusCode:503,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({error:{code:'AUTHORITY_UNAVAILABLE'}})};
  }
  if(runtime==='read'&&event?.routeKey==='GET /v1/authority'){
   const response=await status(event);if(response.statusCode===503)log({event:'AUTHORITY_UNAVAILABLE',requestId:event?.requestContext?.requestId});log({event:'TEAM_REQUEST',status:response.statusCode,requestId:event?.requestContext?.requestId,code:response.statusCode===503?'DEPENDENCY_UNAVAILABLE':response.statusCode===401?'UNAUTHENTICATED':response.statusCode===400?'INVALID_REQUEST':undefined});return response;
  }
  return business(event);
 };
}
