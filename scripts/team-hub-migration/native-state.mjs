// Pure offline contract/rollback codec. No AWS adapter, credentials or write commands.
import crypto from 'node:crypto';
import {transform,canonical,digest,models} from './transform.mjs';
export const schemaVersion='team-hub-state.v1';
export const issuer='https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE';
const common=['schemaVersion','entityType','PK','SK','version','createdAt','updatedAt'];
export const fields={
 TEAM:['id','slug','name','gameKey','status','authorizationEpoch','rosterVersion','membershipRevision','settingsRevision','managerMembershipId','coachMembershipId','createdByUserId','updatedByUserId','settings','StatusPK','StatusSK'],
 SLUG:['teamId'],
 MEMBERSHIP:['id','teamId','issuer','subject','displayName','role','status','addedByUserId','revokedAt','revokedByUserId','SubjectPK','SubjectSK'],
 ROSTER:['id','teamId','membershipId','gameRoleKey','slotType','status','assignedByUserId','deactivatedAt'],
 PLAYER_POOL:['id','teamId','membershipId','championId','gameRoleKey','comfortLevel','priority','competitiveReady','playerNotes'],
 COACH_ASSESSMENT:['teamId','membershipId','championId','coachTier','coachAssessment','coachRecommendation','coachPriorityPractice','coachUpdatedByUserId','coachUpdatedAt','visibility'],
 COACH_PRIVATE:['teamId','membershipId','championId','authorIssuer','authorSubject','privateNote']
};
export const settingsFields=['plan','logoAssetId','proGrantedAt','proGrantedBy','proExpiresAt','planUpdatedAt','planUpdatedBy','logoUpdatedAt','logoUpdatedBy'];
const take=(r,keys)=>Object.fromEntries(keys.filter(k=>r[k]!==undefined).map(k=>[k,r[k]]));
const fail=()=>{throw Error('Invalid native state; payload withheld');};
const sub=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const integer=n=>Number.isInteger(n)&&n>=0&&n<=2147483647;
const timestamp=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(v)&&Number.isFinite(Date.parse(v));
const actor=v=>typeof v==='string'&&sub.test(v);
export const subjectKey=subject=>'SUBJECT#'+crypto.createHash('sha256').update(issuer).digest('hex')+'#'+subject;
export function keys(r){
 const PK='TEAM#'+(r.entityType==='TEAM'?r.id:r.teamId);
 switch(r.entityType){
 case 'TEAM':return [PK,'META'];
 case 'SLUG':return ['SLUG#'+r.slug,'TEAM']; // slug derived from referenced Team when validating
 case 'MEMBERSHIP':return [PK,'MEMBER#'+r.subject];
 case 'ROSTER':return [PK,r.status==='INACTIVE'?'ARCHIVE#ROSTER#'+r.id:r.slotType==='STARTER'?'STARTER#'+r.gameRoleKey:r.slotType==='STARTER_GUARD'?'STARTER_PLAYER#'+r.membershipId:'SUB#'+r.membershipId+'#'+r.gameRoleKey];
 case 'PLAYER_POOL':return [PK,'POOL#'+r.membershipId+'#'+r.championId];
 case 'COACH_ASSESSMENT':return [PK,'ASSESSMENT#'+r.membershipId+'#'+r.championId];
 case 'COACH_PRIVATE':return [PK,'PRIVATE#'+r.membershipId+'#'+r.championId+'#'+r.authorSubject];
 default:fail();
 }
}
export function nativeToLegacy(items,{logoMappings={},allowVerifiedLogoRollback=false}={}){
 if(!Array.isArray(items))fail();
 items=[...items].sort((a,b)=>canonical(a)<canonical(b)?-1:canonical(a)>canonical(b)?1:0);
 const out=Object.fromEntries(models.map(m=>[m,[]]));
 const teams=new Map(),members=new Map(),pool=new Map(),unique=new Set();
 for(const r of items){
  if(!r||!fields[r.entityType]||Object.keys(r).some(k=>![...common,...fields[r.entityType]].includes(k))||r.schemaVersion!==schemaVersion||!integer(r.version)||r.version<1||!timestamp(r.createdAt)||!timestamp(r.updatedAt)||Date.parse(r.updatedAt)<Date.parse(r.createdAt)||Buffer.byteLength(canonical(r))>350*1024)fail();
  const k=r.PK+'|'+r.SK;if(unique.has(k))fail();unique.add(k);
  if(r.entityType==='COACH_PRIVATE')throw Error('NON_REVERSIBLE_DURING_ROLLBACK_WINDOW');
  if(r.entityType==='TEAM'){if(teams.has(r.id))fail();teams.set(r.id,r);}
  if(r.entityType==='MEMBERSHIP'){if(members.has(r.id))fail();members.set(r.id,r);}
 }
 for(const team of teams.values())for(const role of ['MANAGER','COACH'])if([...members.values()].filter(m=>m.teamId===team.id&&m.status==='ACTIVE'&&m.role===role).length>1)fail();
 for(const r of items){
  const team=teams.get(r.entityType==='TEAM'?r.id:r.teamId);if(!team)fail();
  const expected=keys(r.entityType==='SLUG'?{...r,slug:team.slug}:r);if(r.PK!==expected[0]||r.SK!==expected[1])fail();
  const audit=take(r,['createdAt','updatedAt']);
  if(r.entityType==='TEAM'){
   if(typeof r.slug!=='string'||r.slug.length>48||typeof r.name!=='string'||!r.name.trim()||r.name.length>100||!(r.settings?.logoAssetId===null||typeof r.settings?.logoAssetId==='string'))fail();
   if(r.id!=='team:'+r.slug||r.id.length>70||!actor(r.createdByUserId)||!actor(r.updatedByUserId)||!integer(r.authorizationEpoch)||!integer(r.rosterVersion)||!integer(r.membershipRevision)||!integer(r.settingsRevision)||!r.settings||Object.keys(r.settings).some(k=>!settingsFields.includes(k))||!['FREE','PRO'].includes(r.settings.plan)||r.StatusPK!=='STATUS#'+r.status||r.StatusSK!=='TEAM#'+r.id)fail();
   if(items.filter(x=>x.entityType==='SLUG'&&x.teamId===r.id).length!==1)fail();
   const settings=take(r.settings,settingsFields.filter(k=>!['plan','logoAssetId'].includes(k)));
   for(const k of ['proGrantedBy','planUpdatedBy','logoUpdatedBy'])if(settings[k]!=null&&!actor(settings[k]))fail();
   for(const k of ['proGrantedAt','proExpiresAt','planUpdatedAt','logoUpdatedAt'])if(settings[k]!=null&&!timestamp(settings[k]))fail();
   if(r.settings.logoAssetId){const mapping=logoMappings[r.settings.logoAssetId];if(!allowVerifiedLogoRollback||!mapping||mapping.teamId!==r.id||mapping.sha256Verified!==true||mapping.restoredAndHeadVerified!==true||!new RegExp('^team-logos/'+r.id+'/[0-9a-f-]{36}\\.png$').test(mapping.legacyKey))throw Error('Logo recovery proof required');settings.logoKey=mapping.legacyKey;}
   out.Team.push({...take(r,['id','slug','name','gameKey','status','managerMembershipId','coachMembershipId','createdByUserId','updatedByUserId','membershipRevision','settingsRevision']),rosterRevision:r.rosterVersion,teamPlan:r.settings.plan,...settings,...audit,__typename:'Team'});
  }else if(r.entityType==='MEMBERSHIP'){
   if(typeof r.displayName!=='string'||!r.displayName.trim())fail();
   if(r.issuer!==issuer||!actor(r.subject)||r.id!=='team-membership:'+r.teamId+':'+r.subject||!actor(r.addedByUserId)||r.SubjectPK!==subjectKey(r.subject)||r.SubjectSK!=='TEAM#'+r.teamId||r.revokedAt!=null&&(!timestamp(r.revokedAt)||!actor(r.revokedByUserId)))fail();
   out.TeamMembership.push({...take(r,['id','teamId','displayName','role','status','addedByUserId','revokedAt','revokedByUserId']),userId:r.subject,...audit,__typename:'TeamMembership'});
  }else if(['ROSTER','PLAYER_POOL'].includes(r.entityType)){
   const m=members.get(r.membershipId);if(!m||m.teamId!==r.teamId||m.role!=='PLAYER')fail();
   if(r.entityType==='ROSTER'){
    const id=r.slotType==='STARTER'?'team-roster:'+r.teamId+':starter:'+r.gameRoleKey:r.slotType==='STARTER_GUARD'?'team-roster:'+r.teamId+':starter-player:'+r.membershipId:'team-roster:'+r.teamId+':substitute:'+r.membershipId+':'+r.gameRoleKey;
    if(r.id!==id||!actor(r.assignedByUserId)||r.deactivatedAt!=null&&!timestamp(r.deactivatedAt))fail();
    out.TeamRosterSlot.push({...take(r,fields.ROSTER),playerUserId:m.subject,...audit,__typename:'TeamRosterSlot'});
   }else{
    if(r.playerNotes!=null&&(typeof r.playerNotes!=='string'||r.playerNotes.length>500))fail();
    if(r.id!=='team-pool:'+r.teamId+':'+m.subject+':'+r.championId||!/^[A-Za-z0-9]{1,40}$/.test(r.championId))fail();
    const row={...take(r,fields.PLAYER_POOL),playerUserId:m.subject,...audit,__typename:'PlayerChampionPoolEntry'};out.PlayerChampionPoolEntry.push(row);pool.set(r.teamId+'|'+r.membershipId+'|'+r.championId,row);
   }
  }
 }
 for(const r of items.filter(r=>r.entityType==='COACH_ASSESSMENT')){
  for(const k of ['coachAssessment','coachRecommendation'])if(r[k]!=null&&(typeof r[k]!=='string'||r[k].length>1000))fail();
  const row=pool.get(r.teamId+'|'+r.membershipId+'|'+r.championId);
  if(!row||r.visibility!=='TEAM_VISIBLE_APPROVED'||!actor(r.coachUpdatedByUserId)||!timestamp(r.coachUpdatedAt)||[r.coachAssessment,r.coachRecommendation].some(v=>/private\s*:/i.test(v??'')))throw Error('Assessment privacy/provenance review required');
  Object.assign(row,take(r,fields.COACH_ASSESSMENT.filter(k=>k.startsWith('coach'))));
  if(Date.parse(r.updatedAt)>Date.parse(row.updatedAt))row.updatedAt=r.updatedAt;
 }
 const check=transform(out,{issuer,environment:'Ntgre'});if(!check.summary.accepted)fail();
 return {legacy:out,manifest:{schemaVersion,nativeDigest:digest(items),legacyDigest:digest(out),counts:Object.fromEntries(models.map(m=>[m,out[m].length])),sourceSnapshotRequired:false,archiveRequired:['all native items including versions/epochs','audit','idempotency','authority transitions'],writes:0}};
}
export function reconcileNative(items,legacy,options){return digest(nativeToLegacy(items,options).legacy)===digest(legacy);}
export function emptyGate(state,{afterFreeze=false,now=Date.now(),maxAgeMs=60000}={}){
 const errors=[];if(!Array.isArray(state.counts)||state.counts.length!==4||state.counts.some(n=>n!==0)||state.logos!==0)errors.push('NONEMPTY_OR_UNVERIFIED_STOP_MODE_B');
 if(!Number.isFinite(state.observedAt)||state.observedAt>now||now-state.observedAt>maxAgeMs)errors.push('STALE_OBSERVATION');
 for(const k of ['unknownWriters','unknownReaders'])if(state[k]!==0)errors.push(k);
 for(const k of ['consistentCompleteCounts','logoListingComplete','legacyProtectionVerified','restoreRehearsalPassed','targetRecoveryVerified','targetEmpty','targetWriterDisabled','coverageRevalidated','allPathFenceProved','rollbackRehearsalPassed'])if(state[k]!==true)errors.push(k);
 if(state.authority!==(afterFreeze?'FROZEN':'LEGACY_WRITER'))errors.push('WRONG_AUTHORITY');
 if(afterFreeze&&state.inFlightDrained!==true)errors.push('INFLIGHT_NOT_DRAINED');
 return {eligible:errors.length===0,mode:errors.includes('NONEMPTY_OR_UNVERIFIED_STOP_MODE_B')?'STOP_MODE_B':'MODE_A',errors};
}
