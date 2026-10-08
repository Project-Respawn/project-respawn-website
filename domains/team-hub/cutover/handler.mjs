import {authenticate} from '../auth.mjs';
import {DomainError,fail,operations,VERSION} from './contracts.mjs';
import {createHandler} from './http.mjs';
import {DynamoRepository} from './repository.mjs';
import {readAuthority,requireTarget} from './authority.mjs';
import {realCore} from './core-client.mjs';
import {responseErrorCode} from './observability.mjs';
export function createCutoverHandler({runtime,transport,invokeCore,environment,cursorSecret,clock=()=>Math.floor(Date.now()/1000),log=()=>{}}){
 return async event=>{const requestId=event.requestContext?.requestId??'unavailable';let op;
  try{
   const actor=authenticate(event.requestContext?.authorizer?.jwt?.claims,environment,clock());
   const accessToken=event.headers?.authorization?.replace(/^Bearer /i,'');if(!accessToken)fail('UNAUTHENTICATED');
   op=Object.keys(operations).find(k=>event.routeKey===operations[k].method+' '+operations[k].path);if(!op||operations[op].runtime!==runtime)fail('NOT_FOUND');
   const observedAuthority=async()=>{try{return await readAuthority(transport);}catch(error){log({event:'AUTHORITY_UNAVAILABLE',operation:op,requestId});throw error;}};
   const control=await observedAuthority();if(control.mode!=='TARGET_WRITER')log({event:'WRITER_NOT_AUTHORITATIVE',operation:op,requestId});const authority=requireTarget(control);if(event.headers?.['x-team-authority-epoch']!==String(authority.epoch)){log({event:'AUTHORITY_EPOCH_MISMATCH',operation:op,requestId});fail('CONFLICT');}
   const core=realCore({invoke:invokeCore,accessToken,actor,environment,clock,log:e=>log({...e,operation:op,requestId})});
   // A fresh decision checks actor enabled state even for membership-only operations.
   await core.allows(actor,'teams.admin');
   const repository=new DynamoRepository({transport,operational:'ProjectRespawn-TeamHub-Ntgre-Operational',journal:'ProjectRespawn-TeamHub-Ntgre-Journal',scope:id=>{if(!/^team:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))fail('INVALID_INPUT');},clock,log});
   repository.isAdmin=a=>core.allows(a,'teams.admin');repository.authority=authority;
   const response=await createHandler(runtime,{repository,core,environment,cursorSecret,clock})(event);
   const finalControl=await observedAuthority();if(finalControl.mode!=='TARGET_WRITER')log({event:'WRITER_NOT_AUTHORITATIVE',operation:op,requestId});const final=requireTarget(finalControl);if(final.epoch!==authority.epoch||final.version!==authority.version){log({event:'AUTHORITY_EPOCH_MISMATCH',operation:op,requestId});fail('CONFLICT');}
   log({event:'TEAM_REQUEST',operation:op,requestId,status:response.statusCode,code:responseErrorCode(response)});return response;
  }catch(error){const code=error instanceof DomainError?error.code:'INTERNAL_ERROR';log({event:'TEAM_REQUEST',operation:op,requestId,code});return {statusCode:error instanceof DomainError?error.status:500,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({contractVersion:VERSION,requestId,error:{code}})};}
 };
}
