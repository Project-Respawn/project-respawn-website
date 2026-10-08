import {randomBytes} from 'node:crypto';
import {authenticate} from '../auth.mjs';
import {DomainError,fail,operations,VERSION} from '../contracts.mjs';
import {createHandler} from '../http.mjs';
import {DynamoRepository} from './repository.mjs';
import {VerificationCore} from './core.mjs';
import {verifyScope} from './fence.mjs';
export const deferredBranding=Object.freeze(['REQUEST_TEAM_LOGO_UPLOAD','COMMIT_TEAM_LOGO','REMOVE_TEAM_LOGO']);
export const commandOperations=Object.freeze(Object.keys(operations).filter(k=>operations[k].runtime==='command'&&!deferredBranding.includes(k)));
export const readOperations=Object.freeze(['GET_TEAM_HUB','LIST_MY_CHAMPION_POOL','LIST_TEAM_CHAMPION_POOLS','GET_PLAYER_COMPETITIVE_DETAIL']);
export function createParityHandler({runtime,transport,environment,verification,clock=()=>Math.floor(Date.now()/1000),log=console.info}){
 const cursorSecret=randomBytes(32).toString('hex');
 return async event=>{
  const requestId=event?.requestContext?.requestId??'unavailable';
  try{
   const actor=authenticate(event?.requestContext?.authorizer?.jwt?.claims,environment,clock());
   const op=Object.keys(operations).find(k=>`${operations[k].method} ${operations[k].path}`===event.routeKey);
   if(!(runtime==='command'?commandOperations:readOperations).includes(op))fail('NOT_FOUND');
   if(event.isBase64Encoded||Buffer.byteLength(event.body??'')>16384)fail('INVALID_INPUT');
   let body;try{body=JSON.parse(event.body||'{}');}catch{fail('INVALID_INPUT');}
   if(!body||typeof body!=='object'||Array.isArray(body))fail('INVALID_INPUT');
   const teamId=op==='CREATE_TEAM'?'team:'+body.slug:event.pathParameters?.teamId;
   if(typeof teamId!=='string')fail('INVALID_INPUT');
   const scope=id=>verifyScope(verification,actor,id,clock());scope(teamId);
   if(op==='UPSERT_COACH_ASSESSMENT'&&body.privateNote!=='')fail('FORBIDDEN');
   const core=new VerificationCore(verification,teamId,clock),repository=new DynamoRepository({transport,operational:'ProjectRespawn-TeamHub-Ntgre-Operational',journal:'ProjectRespawn-TeamHub-Ntgre-Journal',scope,clock,log:e=>log(JSON.stringify(e))});
   const response=await createHandler(runtime,{repository,core,environment,cursorSecret,clock})(event);
   log(JSON.stringify({domain:'TeamHub',mode:'SYNTHETIC_VERIFICATION',operation:op,requestId,status:response.statusCode}));return response;
  }catch(e){return {statusCode:e instanceof DomainError?e.status:500,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({contractVersion:VERSION,requestId,error:{code:e instanceof DomainError?e.code:'INTERNAL_ERROR'}})};}
 };
}
