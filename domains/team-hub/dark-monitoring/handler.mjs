import {createCoreIntegrationHandler} from '../core-integration/handler.mjs';
import {metricEvent} from '../cutover/observability.mjs';
export function createDarkMonitoringHandler({invokeCore,configuration,clock,emit=()=>{}}){return async (event,context={})=>{const id=event?.requestContext?.requestId??context.awsRequestId??'unavailable';const metric=e=>emit(metricEvent(configuration.TEAM_HUB_RUNTIME,{requestId:id,...e}));if(configuration.TEAM_HUB_AUTHORITY!=='LEGACY_WRITER'||configuration.TEAM_HUB_STAGE!=='PRE_CUTOVER'||configuration.TEAM_HUB_NORMAL_WRITES!=='DISABLED'){metric({event:'AUTHORITY_UNAVAILABLE'});metric({event:'TEAM_REQUEST',code:'DEPENDENCY_UNAVAILABLE',status:503});return {statusCode:503,body:'{"error":{"code":"DEPENDENCY_UNAVAILABLE"}}'};}
 const run=createCoreIntegrationHandler({invokeCore,clock,log:()=>{}});const r=await run(event);let code=r.error?.code;if(r.body){try{code=JSON.parse(r.body).error?.code;}catch{}}
 const isHttp=Boolean(event?.requestContext||event?.routeKey||event?.httpMethod);if(isHttp&&r.statusCode===403)metric({event:'WRITER_NOT_AUTHORITATIVE'});
 // The direct proof handler has no data repository: a classified dependency failure
 // is its accepted Core dependency path, not a synthetic business-authority response.
 if(!isHttp&&code==='DEPENDENCY_UNAVAILABLE')metric({event:'CORE_DEPENDENCY_FAILED'});
 metric({event:'TEAM_REQUEST',code,status:r.statusCode??(r.ok?200:undefined)});return r;};}

