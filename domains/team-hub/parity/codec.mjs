import {createHash} from 'node:crypto';
import {entryKey} from '../repository.mjs';
import {fail} from '../contracts.mjs';
import schema from './state-schema.json' with {type:'json'};
export const schemaVersion='team-hub-state.v1';
const copy=x=>structuredClone(x), hash=x=>createHash('sha256').update(x).digest('hex');
const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
export const itemKey=r=>r.PK+'|'+r.SK;
const pick=(r,ks)=>Object.fromEntries(ks.filter(k=>r[k]!==undefined).map(k=>[k,copy(r[k])]));
export function decode(items){
 for(const r of items){const fields=schema.closedFields[r.entityType];if(!fields||Object.keys(r).some(k=>![...schema.commonFields,...fields].includes(k))||r.schemaVersion!==schemaVersion||!Number.isInteger(r.version)||r.version<1||r.entityType==='COACH_PRIVATE'||!Number.isFinite(Date.parse(r.createdAt))||!Number.isFinite(Date.parse(r.updatedAt)))fail('DEPENDENCY_UNAVAILABLE');if(r.entityType==='TEAM'&&(!r.settings||Object.keys(r.settings).some(k=>!schema.settingsFields.includes(k))))fail('DEPENDENCY_UNAVAILABLE');}
 const t=items.find(r=>r.entityType==='TEAM');if(!t){if(items.length)fail('DEPENDENCY_UNAVAILABLE');return undefined;}
 const a={team:pick(t,['id','slug','name','gameKey','status','version','authorizationEpoch','rosterVersion']),memberships:{},roster:[],entries:{},assessments:{},privateNotes:{},intents:{}};
 a.team.settings={plan:t.settings.plan,logoAssetId:t.settings.logoAssetId??''};
 for(const r of items){
  if(r.entityType==='MEMBERSHIP')a.memberships[r.id]=pick(r,['id','teamId','issuer','subject','displayName','role','status','version']);
  else if(r.entityType==='ROSTER'&&r.status==='ACTIVE'&&r.slotType!=='STARTER_GUARD')a.roster.push(pick(r,['membershipId','gameRoleKey','slotType']));
  else if(r.entityType==='PLAYER_POOL')a.entries[entryKey(r.membershipId,r.championId)]=pick(r,['teamId','membershipId','championId','gameRoleKey','comfortLevel','priority','competitiveReady','playerNotes','version']);
  else if(r.entityType==='COACH_ASSESSMENT'){if(r.visibility!=='TEAM_VISIBLE_APPROVED')fail('DEPENDENCY_UNAVAILABLE');a.assessments[entryKey(r.membershipId,r.championId)]={...pick(r,['teamId','membershipId','championId','version']),teamVisible:r.coachAssessment??''};}
 }
 return a;
}
export function encode(a,previous,c){
 const before=new Map(previous.map(r=>[itemKey(r),r])),out=new Map(),at=new Date(c.now*1000).toISOString();
 const put=(PK,SK,type,value)=>{const key=PK+'|'+SK,old=before.get(key);const row={schemaVersion,entityType:type,PK,SK,version:old?.version??1,createdAt:old?.createdAt??at,updatedAt:at,...value};if(old){const same=stable({...row,updatedAt:old.updatedAt})===stable(old);if(same)row.updatedAt=old.updatedAt;else if(!('version'in value))row.version=old.version+1;}if(row.version>2147483647)fail('LIMIT_EXCEEDED');out.set(key,row);return row;};
 const t=a.team,pk='TEAM#'+t.id,old=before.get(pk+'|META'),roleChange=['SET_MANAGER','MANAGE_MEMBER'].includes(c.operation),settingsChange=c.operation==='SET_TEAM_PLAN';
 const pointer=role=>Object.values(a.memberships).find(m=>m.role===role&&m.status==='ACTIVE')?.id??null;
 const settings={...old?.settings,plan:t.settings.plan,logoAssetId:null};if(settingsChange){settings.planUpdatedAt=at;settings.planUpdatedBy=c.actor.subject;if(t.settings.plan==='PRO'){settings.proGrantedAt=at;settings.proGrantedBy=c.actor.subject;}}
 put(pk,'META','TEAM',{...pick(t,['id','slug','name','gameKey','status','version','authorizationEpoch','rosterVersion']),membershipRevision:(old?.membershipRevision??0)+(roleChange?1:0),settingsRevision:(old?.settingsRevision??0)+(settingsChange?1:0),managerMembershipId:pointer('MANAGER'),coachMembershipId:pointer('COACH'),createdByUserId:old?.createdByUserId??c.actor.subject,updatedByUserId:c.actor.subject,settings,StatusPK:'STATUS#'+t.status,StatusSK:pk});
 put('SLUG#'+t.slug,'TEAM','SLUG',{teamId:t.id});
 for(const m of Object.values(a.memberships)){const prior=before.get(pk+'|MEMBER#'+m.subject);put(pk,'MEMBER#'+m.subject,'MEMBERSHIP',{...m,addedByUserId:prior?.addedByUserId??c.actor.subject,...(m.status==='INACTIVE'?{revokedAt:prior?.revokedAt??at,revokedByUserId:prior?.revokedByUserId??c.actor.subject}:{}),SubjectPK:'SUBJECT#'+hash(m.issuer)+'#'+m.subject,SubjectSK:pk});}
 const activeIds=new Set();
 for(const r of a.roster){for(const type of r.slotType==='STARTER'?['STARTER','STARTER_GUARD']:['SUBSTITUTE']){
  const id=type==='STARTER'?`team-roster:${t.id}:starter:${r.gameRoleKey}`:type==='STARTER_GUARD'?`team-roster:${t.id}:starter-player:${r.membershipId}`:`team-roster:${t.id}:substitute:${r.membershipId}:${r.gameRoleKey}`;
  const sk=type==='STARTER'?'STARTER#'+r.gameRoleKey:type==='STARTER_GUARD'?'STARTER_PLAYER#'+r.membershipId:`SUB#${r.membershipId}#${r.gameRoleKey}`;
  const prior=before.get(pk+'|'+sk);activeIds.add(id);put(pk,sk,'ROSTER',{...r,id,teamId:t.id,slotType:type,status:'ACTIVE',assignedByUserId:prior?.assignedByUserId??c.actor.subject});
 }}
 for(const r of previous.filter(r=>r.entityType==='ROSTER'&&!activeIds.has(r.id))){put(pk,'ARCHIVE#ROSTER#'+r.id,'ROSTER',{...pick(r,['id','teamId','membershipId','gameRoleKey','slotType','assignedByUserId','createdAt']),status:'INACTIVE',deactivatedAt:r.deactivatedAt??at});}
 for(const r of Object.values(a.entries)){const m=a.memberships[r.membershipId];if(!m)fail('CONFLICT');put(pk,`POOL#${r.membershipId}#${r.championId}`,'PLAYER_POOL',{...r,id:`team-pool:${t.id}:${m.subject}:${r.championId}`});}
 for(const r of Object.values(a.assessments)){const sk=`ASSESSMENT#${r.membershipId}#${r.championId}`,prior=before.get(pk+'|'+sk);if(/private\s*:/i.test(r.teamVisible))fail('INVALID_INPUT');const changed=!prior||prior.version!==r.version;put(pk,sk,'COACH_ASSESSMENT',{...pick(prior??{},['coachTier','coachRecommendation','coachPriorityPractice']),...pick(r,['teamId','membershipId','championId','version']),coachAssessment:r.teamVisible,coachUpdatedByUserId:changed?c.actor.subject:prior.coachUpdatedByUserId,coachUpdatedAt:changed?at:prior.coachUpdatedAt,visibility:'TEAM_VISIBLE_APPROVED'});}
 for(const r of out.values()){if(Buffer.byteLength(JSON.stringify(r))>350*1024)fail('LIMIT_EXCEEDED');for(const k of ['version','authorizationEpoch','rosterVersion','membershipRevision','settingsRevision'])if(k in r&&(!Number.isInteger(r[k])||r[k]<0||r[k]>2147483647))fail('LIMIT_EXCEEDED');}
 return [...out.values()];
}
