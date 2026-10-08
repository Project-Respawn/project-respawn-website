import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
import {CAPABILITIES,CoreError,requireCore,environmentContract,requestContract} from './contracts.mjs';
const attr=(u,k)=>(u.UserAttributes??u.Attributes??[]).find(a=>a.Name===k)?.Value;
const eligible=u=>u?.Enabled===true&&u.UserStatus==='CONFIRMED';
const summary=u=>({subject:attr(u,'sub'),displayName:(attr(u,'name')||attr(u,'preferred_username')||'Project Respawn member').slice(0,100)});
export function createCoreService({environment,verifyAccessToken,directory,cursorKey,clock=()=>Math.floor(Date.now()/1000),limitDirectory=()=>{}}){
 const e=environmentContract(environment);requireCore(Buffer.isBuffer(cursorKey)&&cursorKey.length===32,'CONFIGURATION_REQUIRED');
 const seal=value=>{const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',cursorKey,iv),bytes=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),bytes]).toString('base64url');};
 const open=token=>{try{const b=Buffer.from(token,'base64url'),d=createDecipheriv('aes-256-gcm',cursorKey,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]));}catch{throw new CoreError('INVALID_INPUT');}};
 async function active(subject){const u=await directory.get(subject);requireCore(eligible(u)&&attr(u,'sub')===subject,'FORBIDDEN');return u;}
 return async input=>{
  try{
   requestContract(input);let claims;try{claims=await verifyAccessToken(input.accessToken);}catch{throw new CoreError('UNAUTHENTICATED');}
   requireCore(claims.iss===e.issuer&&claims.client_id===e.clientId&&claims.token_use==='access'&&Number(claims.exp)>clock()&&(!claims.nbf||Number(claims.nbf)<=clock())&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claims.sub),'UNAUTHENTICATED');
   const actor=await active(claims.sub); // Fresh owner lookup; stale JWT groups never grant capabilities.
   if(input.contractVersion==='authorization.decision.v1'){
    requireCore(CAPABILITIES.includes(input.capability));const groups=await directory.groups(actor.Username);
    const admin=groups.some(g=>['Admin','SuperAdmin'].includes(g));
    // Branding is disabled for the initial cutover. No inferred Staff permission migration.
    return {contractVersion:input.contractVersion,subject:claims.sub,environment:e.environment,capability:input.capability,allowed:input.capability==='teams.admin'&&admin,decisionVersion:1,evaluatedAt:clock(),expiresAt:clock()+5};
   }
   limitDirectory(claims.sub);
   // Invocation is restricted to the reviewed Team service roles. Team owns and
   // rechecks assignment authorization before delegation; Core owns directory data.
   if(input.action==='resolve'){
    const email=input.account.toLowerCase();const page=await directory.list({Filter:`email = "${email}"`,Limit:2});
    requireCore(!page.PaginationToken&&page.Users?.length===1,'NOT_FOUND');const candidate=page.Users[0];
    requireCore(attr(candidate,'email')?.toLowerCase()===email,'NOT_FOUND');return {contractVersion:input.contractVersion,...summary(await active(attr(candidate,'sub')))};
   }
   const scope=createHash('sha256').update(JSON.stringify([claims.sub,e.issuer,input.teamId,input.query.toLowerCase(),input.limit])).digest('hex');let next;
   if(input.nextToken){const cursor=open(input.nextToken);requireCore(cursor.scope===scope&&cursor.expiresAt>clock());next=cursor.token;}
   const page=await directory.list({Filter:`email ^= "${input.query.toLowerCase()}"`,Limit:input.limit,...(next?{PaginationToken:next}:{})});
   requireCore(Array.isArray(page.Users)&&page.Users.length<=input.limit,'DEPENDENCY_UNAVAILABLE');const items=[];
   for(const user of page.Users){if(!eligible(user))continue;try{items.push(summary(await active(attr(user,'sub'))));}catch(error){if(error.code!=='FORBIDDEN')throw error;}}
   return {contractVersion:input.contractVersion,items,...(page.PaginationToken?{nextToken:seal({scope,token:page.PaginationToken,expiresAt:clock()+300})}:{})};
  }catch(error){if(error instanceof CoreError)throw error;throw new CoreError('DEPENDENCY_UNAVAILABLE');}
 };
}
