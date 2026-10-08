import {realCore} from '../cutover/core-client.mjs';
import {authenticate} from '../auth.mjs';
import {DomainError,fail} from '../contracts.mjs';
import {acceptedCore} from './manifest.mjs';
export const proofVersion='team-hub.core-integration-proof.v1';
// No repository, mutation service, verification adapter, or authority writer exists here.
// API Gateway events always deny. Only an IAM-authenticated direct Lambda invocation
// can use the read-only proof envelope; Core independently verifies its delegated JWT.
export function createCoreIntegrationHandler({invokeCore,clock=()=>Math.floor(Date.now()/1000),log=()=>{}}){
 return async event=>{
  if(event?.requestContext||event?.routeKey||event?.httpMethod)return {statusCode:403,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify({contractVersion:'team-hub.v1',error:{code:'FORBIDDEN'}})};
  try{
   if(!event||event.contractVersion!==proofVersion||Object.keys(event).some(k=>!['contractVersion','accessToken','operation','query','limit','nextToken','account'].includes(k)))fail('INVALID_INPUT');
   if(typeof event.accessToken!=='string'||event.accessToken.length>16384)fail('UNAUTHENTICATED');
   let claims;try{claims=JSON.parse(Buffer.from(event.accessToken.split('.')[1],'base64url').toString());}catch{fail('UNAUTHENTICATED');}
   // Decoding does not grant authority. Every accepted result requires live Core JWT verification.
   const actor=authenticate(claims,acceptedCore.environmentContract,clock());
   const core=realCore({invoke:invokeCore,accessToken:event.accessToken,actor,environment:acceptedCore.environmentContract,clock});
   const admin=await core.allows(actor,'teams.admin');let data;
   if(event.operation==='authorization')data={teamsAdmin:admin,brandingManage:await core.allows(actor,'teams.branding.manage')};
   else if(event.operation==='search'||event.operation==='resolve'){
    // No Team Manager fixture or membership bypass. Only live global capability permits proof-directory access.
    if(!admin)fail('FORBIDDEN');
    data=event.operation==='search'?await core.search(actor,event.query,event.limit??1,'team:core-integration-proof',event.nextToken):await core.resolve(actor,event.account,'team:core-integration-proof');
   }else fail('INVALID_INPUT');
   log({event:'TEAM_CORE_PROOF',operation:event.operation,status:'PASS'});
   return {ok:true,contractVersion:proofVersion,authority:'LEGACY_WRITER',normalWritesEnabled:false,data};
  }catch(error){const code=error instanceof DomainError?error.code:'DEPENDENCY_UNAVAILABLE';log({event:'TEAM_CORE_PROOF',status:'DENY',code});return {ok:false,contractVersion:proofVersion,error:{code}};}
 };
}
