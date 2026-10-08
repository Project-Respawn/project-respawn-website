import {readAuthority,requireTarget,authorityCondition} from './authority.mjs';
import {createHash,randomUUID} from 'node:crypto';
import {activeMembership} from '../repository.mjs';
import {fail} from '../contracts.mjs';
import {decode,encode,itemKey} from '../parity/codec.mjs';
export const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const hash=x=>createHash('sha256').update(x).digest('hex');
export class DynamoRepository {
 constructor({transport,operational,journal,scope,clock,log=()=>{}}){Object.assign(this,{transport,operational,journal,scope,clock,log});if(operational!=='ProjectRespawn-TeamHub-Ntgre-Operational'||journal!=='ProjectRespawn-TeamHub-Ntgre-Journal')throw Error('Exact Ntgre Team targets required');}
 async get(table,Key){try{return (await this.transport.get({TableName:table,Key,ConsistentRead:true})).Item;}catch{fail('DEPENDENCY_UNAVAILABLE');}}
 async load(id){
  this.scope(id);const PK='TEAM#'+id;const first=await this.get(this.operational,{PK,SK:'META'});let key,items=[],bytes=0;
  do{let r;try{r=await this.transport.query({TableName:this.operational,KeyConditionExpression:'PK = :pk',ExpressionAttributeValues:{':pk':PK},ConsistentRead:true,Limit:100,...(key?{ExclusiveStartKey:key}:{})});}catch{fail('DEPENDENCY_UNAVAILABLE');}items.push(...(r.Items??[]));bytes+=Buffer.byteLength(JSON.stringify(r.Items??[]));if(bytes>4*1024*1024||items.length>3000)fail('LIMIT_EXCEEDED');key=r.LastEvaluatedKey;}while(key&&Object.keys(key).length);
  const last=await this.get(this.operational,{PK,SK:'META'});if(canonical(first)!==canonical(last))fail('CONFLICT');
  if(first){const slug=await this.get(this.operational,{PK:'SLUG#'+first.slug,SK:'TEAM'});if(!slug||slug.teamId!==id)fail('DEPENDENCY_UNAVAILABLE');items.push(slug);}
  return {items,aggregate:decode(items)};
 }
 async readTeamStrong(id){return (await this.load(id)).aggregate;}
 async listCandidateTeamIds(actor){
  const ids=new Set();const admin=await this.isAdmin(actor);const queries=admin?['ACTIVE','INACTIVE'].map(status=>({IndexName:'ByTeamStatus',KeyConditionExpression:'StatusPK = :pk',ExpressionAttributeValues:{':pk':'STATUS#'+status}})):[{IndexName:'BySubject',KeyConditionExpression:'SubjectPK = :pk',ExpressionAttributeValues:{':pk':'SUBJECT#'+hash(actor.issuer)+'#'+actor.subject}}];
  for(const q of queries){let key;do{let page;try{page=await this.transport.query({TableName:this.operational,...q,ConsistentRead:false,Limit:100,...(key?{ExclusiveStartKey:key}:{})});}catch{fail('DEPENDENCY_UNAVAILABLE');}for(const row of page.Items??[])if(row.PK?.startsWith('TEAM#'))ids.add(row.PK.slice(5));if(ids.size>500)fail('LIMIT_EXCEEDED');key=page.LastEvaluatedKey;}while(key&&Object.keys(key).length);}
  return [...ids].sort(); // Each candidate is re-read strongly and authorized by TeamService.
 }
 async transact(c,authorize,mutate){
  const authority=requireTarget(await readAuthority(this.transport));if(authority.epoch!==this.authority.epoch||authority.version!==this.authority.version)fail('CONFLICT');this.scope(c.teamId);const {items,aggregate}=await this.load(c.teamId);const state={teams:aggregate?{[c.teamId]:aggregate}:{},journal:{},audit:[]};await authorize(state);
  const key={PK:`IDEMP#${hash(c.actor.issuer)}#${c.actor.subject}#${c.teamId}`,SK:c.operation+'#AUTH'+authority.epoch+'#'+c.key};const previous=await this.get(this.journal,key);
  if(previous&&previous.expiresAt>c.now){if(previous.digest!==c.digest)fail('CONFLICT');const latest=await this.load(c.teamId);await authorize({teams:latest.aggregate?{[c.teamId]:latest.aggregate}:{}});if(canonical(aggregate)!==canonical(latest.aggregate))fail('CONFLICT');this.scope(c.teamId);this.log({event:'IDEMPOTENCY_REPLAY',operation:c.operation,requestId:c.requestId});const response=structuredClone(previous.response);if(c.operation==='UPSERT_COACH_ASSESSMENT')response.privateNote={championId:response.assessment.championId,privateNote:'',version:response.assessment.version};return response;}
  if((aggregate?.team.version??0)!==c.teamVersion||(aggregate?.team.authorizationEpoch??0)!==c.epoch||(activeMembership(aggregate,c.actor)?.version??0)!==c.membershipVersion)fail('CONFLICT');
  const response=mutate(state);const next=encode(state.teams[c.teamId],items,c);const oldMap=new Map(items.map(r=>[itemKey(r),r])),newMap=new Map(next.map(r=>[itemKey(r),r]));const tx=[authorityCondition(authority)];
  const condition=old=>old?{ConditionExpression:'#v = :v',ExpressionAttributeNames:{'#v':'version'},ExpressionAttributeValues:{':v':old.version}}:{ConditionExpression:'attribute_not_exists(PK)'};
  const meta='TEAM#'+c.teamId+'|META',member='TEAM#'+c.teamId+'|MEMBER#'+c.actor.subject;
  const changed=new Set([...oldMap.keys(),...newMap.keys()].filter(k=>canonical(oldMap.get(k))!==canonical(newMap.get(k))));
  for(const k of changed){const old=oldMap.get(k),row=newMap.get(k),base={TableName:this.operational,...condition(old)};
   if(k===meta&&old){base.ConditionExpression+=' AND authorizationEpoch = :epoch';base.ExpressionAttributeValues[':epoch']=c.epoch;}
   if(row)tx.push({Put:{...base,Item:row}});else tx.push({Delete:{...base,Key:{PK:old.PK,SK:old.SK}}});
  }
  if(!changed.has(member)){const old=oldMap.get(member);tx.push({ConditionCheck:{TableName:this.operational,Key:{PK:'TEAM#'+c.teamId,SK:'MEMBER#'+c.actor.subject},...condition(old)}});}
  const cached=structuredClone(response);delete cached.privateNote;
  const now=new Date(c.now*1000).toISOString(),auditId=randomUUID();
  tx.push({Put:{TableName:this.journal,Item:{PK:'TEAM#'+c.teamId,SK:`AUDIT#${now}#${auditId}`,actorIssuer:c.actor.issuer,actorSubject:c.actor.subject,operation:c.operation,teamId:c.teamId,requestId:c.requestId,resultingVersion:state.teams[c.teamId].team.version,authorizationEpoch:state.teams[c.teamId].team.authorizationEpoch,at:now,expiresAt:c.now+365*86400},ConditionExpression:'attribute_not_exists(PK)'}});
  tx.push({Put:{TableName:this.journal,Item:{...key,digest:c.digest,response:cached,expiresAt:c.now+86400,authorizationEpoch:state.teams[c.teamId].team.authorizationEpoch,version:(previous?.version??0)+1},ConditionExpression:previous?'#v = :v AND expiresAt <= :now':'attribute_not_exists(PK)',...(previous?{ExpressionAttributeNames:{'#v':'version'},ExpressionAttributeValues:{':v':previous.version,':now':c.now}}:{})}});
  if(tx.length>25||Buffer.byteLength(JSON.stringify(tx))>4*1024*1024)fail('LIMIT_EXCEEDED');
  // Authority ConditionCheck commits atomically with every business/audit/idempotency write.
  this.scope(c.teamId);try{await this.transport.transactWrite({TransactItems:tx,ClientRequestToken:auditId});}catch(e){if(['TransactionCanceledException','ConditionalCheckFailedException'].includes(e.name)){this.log({event:'TEAM_TRANSACTION_CONFLICT',operation:c.operation,requestId:c.requestId});fail('CONFLICT');}fail('DEPENDENCY_UNAVAILABLE');}
  return response;
 }
}
