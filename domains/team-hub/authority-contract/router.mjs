import {createAuthorityStatusHandler} from './handler.mjs';
import {AUTHORITY_PATH} from './contract.mjs';
import {metricEvent} from '../cutover/observability.mjs';

// Existing D1 event paths delegate unchanged. This route cannot dispatch business work.
export function createAuthorityStatusRouter({darkHandler,getItem,environment,configuration,clock=Date.now,emit=()=>{}}){
 const status=createAuthorityStatusHandler({getItem,environment,clock});
 return async(event,context={})=>{
  if(event?.routeKey!=='GET '+AUTHORITY_PATH)return darkHandler(event,context);
  const requestId=event?.requestContext?.requestId??context.awsRequestId;
  const metric=e=>emit(metricEvent('read',{requestId,...e},clock()));
  let response;
  if(configuration.TEAM_HUB_RUNTIME!=='read'||configuration.TEAM_HUB_AUTHORITY!=='LEGACY_WRITER'||configuration.TEAM_HUB_STAGE!=='PRE_CUTOVER'||configuration.TEAM_HUB_NORMAL_WRITES!=='DISABLED'){
   response={statusCode:503,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({error:{code:'AUTHORITY_UNAVAILABLE'}})};
  }else response=await status(event);
  if(response.statusCode===503)metric({event:'AUTHORITY_UNAVAILABLE'});
  metric({event:'TEAM_REQUEST',status:response.statusCode,code:response.statusCode===503?'DEPENDENCY_UNAVAILABLE':response.statusCode===401?'UNAUTHENTICATED':response.statusCode===400?'INVALID_REQUEST':undefined});
  return response;
 };
}
