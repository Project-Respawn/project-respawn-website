// Pure offline migration preparation. Returned state/recovery is sensitive in memory.
// Only summary is suitable for repository evidence. No AWS clients or write adapter.
import crypto from 'node:crypto';
export const models=['Team','TeamMembership','TeamRosterSlot','PlayerChampionPoolEntry'];
export const version='team-hub-migration.v1';
export const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.entries(x).sort(([a],[b])=>(a<b?-1:a>b?1:0))):x);
export const digest=v=>crypto.createHash('sha256').update(canonical(v)).digest('hex');
const sorted=rows=>[...rows].sort((a,b)=>(canonical(a)<canonical(b)?-1:canonical(a)>canonical(b)?1:0));
const roleKeys=['TOP','JUNGLE','MID','ADC','SUPPORT'];
const common=['id','createdAt','updatedAt','__typename'];
const fields={Team:[...common,'slug','name','gameKey','status','createdByUserId','updatedByUserId','rosterRevision','membershipRevision','managerMembershipId','coachMembershipId','teamPlan','proGrantedAt','proGrantedBy','proExpiresAt','planUpdatedAt','planUpdatedBy','logoKey','logoUpdatedAt','logoUpdatedBy','settingsRevision'],TeamMembership:[...common,'teamId','userId','displayName','role','status','addedByUserId','revokedAt','revokedByUserId'],TeamRosterSlot:[...common,'teamId','membershipId','playerUserId','gameRoleKey','slotType','status','assignedByUserId','deactivatedAt'],PlayerChampionPoolEntry:[...common,'teamId','membershipId','playerUserId','championId','gameRoleKey','comfortLevel','priority','competitiveReady','playerNotes','coachTier','coachAssessment','coachRecommendation','coachPriorityPractice','coachUpdatedByUserId','coachUpdatedAt']};
const pick=(r,keys)=>Object.fromEntries(keys.filter(k=>r[k]!==undefined).map(k=>[k,r[k]]));
export function transform(input,{issuer,environment='Ntgre'}={}){
 if(environment!=='Ntgre'||issuer!=='https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE')throw Error('Wrong migration identity environment');
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!models.includes(k))||models.some(m=>input[m]!==undefined&&!Array.isArray(input[m])))throw Error('Invalid normalized source shape');
 if(models.some(m=>(input[m]??[]).some(r=>!r||typeof r!=='object'||Array.isArray(r))))throw Error('Malformed source row; payload withheld');
 const source=Object.fromEntries(models.map(m=>[m,sorted(structuredClone(input[m]??[]))]));
 const rejects=[],warnings=[],items=[],seen=new Set(),keys=new Set();
 const issue=(list,code,model,r)=>list.push({code,model,recordDigest:digest(r)});
 const reject=(code,m,r)=>issue(rejects,code,m,r),warn=(code,m,r)=>issue(warnings,code,m,r);
 for(const m of models)for(const r of source[m]){
  if(!r||typeof r!=='object'||Array.isArray(r)||typeof r.id!=='string'||!r.id) {reject('MALFORMED_ROW',m,r);continue;}
  const id=m+'|'+r.id;if(seen.has(id))reject('DUPLICATE_ID',m,r);seen.add(id);
  if(Object.keys(r).some(k=>!fields[m].includes(k)))reject('UNKNOWN_SOURCE_FIELD',m,r);
  for(const [k,v] of Object.entries(r))if(v!=null&&fields[m].includes(k)){
   const expected=['rosterRevision','membershipRevision','settingsRevision'].includes(k)?'number':['competitiveReady','coachPriorityPractice'].includes(k)?'boolean':'string';
   if(typeof v!==expected)reject('INVALID_FIELD_TYPE',m,r);
  }
  if(m!=='PlayerChampionPoolEntry'&&!['ACTIVE','INACTIVE'].includes(r.status))reject('INVALID_STATUS',m,r);
 }
 const teamMap=new Map(source.Team.map(r=>[r.id,r])),memberMap=new Map(source.TeamMembership.map(r=>[r.id,r]));
 const put=(PK,SK,entityType,value,sourceModel,row,visibility='TEAM_AUTHORIZED')=>{
  if(keys.has(PK+'|'+SK))reject('DUPLICATE_TARGET_KEY',sourceModel,row);keys.add(PK+'|'+SK);
  items.push({PK,SK,schemaVersion:version,entityType,visibility,...value,migration:{sourceModel,sourceId:row.id,sourceDigest:digest(row)}});
 };
 const slugs=new Set();
 for(const r of source.Team){
  if(typeof r.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug)||slugs.has(r.slug))reject('INVALID_OR_DUPLICATE_SLUG','Team',r);slugs.add(r.slug);
  if(typeof r.name!=='string'||!r.name||r.gameKey!=='LEAGUE_OF_LEGENDS')reject('INVALID_TEAM','Team',r);
  for(const k of ['rosterRevision','membershipRevision'])if(!Number.isSafeInteger(r[k])||r[k]<0)reject('INVALID_REVISION','Team',r);
  if(r.settingsRevision!=null&&(!Number.isSafeInteger(r.settingsRevision)||r.settingsRevision<0))reject('INVALID_REVISION','Team',r);
  if(r.settingsRevision==null)warn('DEFAULT_SETTINGS_REVISION_ZERO','Team',r);
  if(r.teamPlan!=null&&!['FREE','PRO'].includes(r.teamPlan))reject('INVALID_PLAN','Team',r);
  if(r.logoKey&&!r.logoKey.startsWith('team-logos/'+r.id+'/'))reject('FOREIGN_LOGO_REFERENCE','Team',r);
  for(const [key,role] of [['managerMembershipId','MANAGER'],['coachMembershipId','COACH']])if(r[key]){const m=memberMap.get(r[key]);if(!m||m.teamId!==r.id||m.role!==role||m.status!=='ACTIVE')reject('INVALID_TEAM_ROLE_POINTER','Team',r);}
  put('TEAM#'+r.id,'META','TEAM',{...pick(r,['id','slug','name','gameKey','status','managerMembershipId','coachMembershipId']),version:1,authorizationEpoch:0,rosterVersion:r.rosterRevision,membershipRevision:r.membershipRevision,settingsRevision:r.settingsRevision??0,settings:{plan:r.teamPlan??'FREE',logoAssetId:null},legacySettings:pick(r,['proGrantedAt','proGrantedBy','proExpiresAt','planUpdatedAt','planUpdatedBy','logoKey','logoUpdatedAt','logoUpdatedBy']),StatusPK:'STATUS#'+r.status,StatusSK:'TEAM#'+r.id},'Team',r);
  put('SLUG#'+r.slug,'TEAM','SLUG',{teamId:r.id},'Team',r);
 }
 const subjects=new Set();
 for(const r of source.TeamMembership){
  if(!teamMap.has(r.teamId))reject('DANGLING_TEAM','TeamMembership',r);
  if(typeof r.userId!=='string'||!r.userId.trim())reject('MISSING_SUBJECT','TeamMembership',r);
  if(!['MANAGER','COACH','PLAYER'].includes(r.role))reject('INVALID_ROLE','TeamMembership',r);
  const k=r.teamId+'|'+r.userId;if(subjects.has(k))reject('DUPLICATE_MEMBERSHIP','TeamMembership',r);subjects.add(k);
  if(r.revokedAt&&r.status==='ACTIVE')reject('ACTIVE_REVOKED_MEMBERSHIP','TeamMembership',r);
  put('TEAM#'+r.teamId,'MEMBER#'+r.userId,'MEMBERSHIP',{...pick(r,['id','teamId','displayName','role','status','revokedAt','revokedByUserId']),issuer,subject:r.userId,version:1,SubjectPK:'SUBJECT#'+crypto.createHash('sha256').update(issuer).digest('hex')+'#'+r.userId,SubjectSK:'TEAM#'+r.teamId},'TeamMembership',r);
 }
 const reference=(r,m)=>{const member=memberMap.get(r.membershipId);if(!member||member.teamId!==r.teamId||member.userId!==r.playerUserId||member.role!=='PLAYER'||!teamMap.has(r.teamId)){reject('DANGLING_OR_FOREIGN_PLAYER',m,r);return null;}return member;};
 const starters=new Set(),starterPlayers=new Set();
 for(const r of source.TeamRosterSlot){
  const m=reference(r,'TeamRosterSlot');
  if(!roleKeys.includes(r.gameRoleKey)||!['STARTER','STARTER_GUARD','SUBSTITUTE'].includes(r.slotType))reject('INVALID_ROSTER','TeamRosterSlot',r);
  if(r.status==='ACTIVE'&&m?.status!=='ACTIVE')reject('INACTIVE_ROSTER_MEMBER','TeamRosterSlot',r);
  if(r.status==='ACTIVE'&&r.slotType==='STARTER'){
   const key=r.teamId+'|'+r.gameRoleKey,player=r.teamId+'|'+r.membershipId;
   if(starters.has(key)||starterPlayers.has(player))reject('ROSTER_CONFLICT','TeamRosterSlot',r);starters.add(key);starterPlayers.add(player);
   const guard=source.TeamRosterSlot.filter(g=>g.teamId===r.teamId&&g.membershipId===r.membershipId&&g.slotType==='STARTER_GUARD'&&g.status==='ACTIVE'&&g.gameRoleKey===r.gameRoleKey);if(guard.length!==1)reject('MISSING_OR_DUPLICATE_GUARD','TeamRosterSlot',r);
  }
  if(r.status==='ACTIVE'&&r.slotType==='STARTER_GUARD'&&!source.TeamRosterSlot.some(s=>s.teamId===r.teamId&&s.membershipId===r.membershipId&&s.slotType==='STARTER'&&s.status==='ACTIVE'&&s.gameRoleKey===r.gameRoleKey))reject('DANGLING_GUARD','TeamRosterSlot',r);
  const sk=r.status==='INACTIVE'?'ARCHIVE#ROSTER#'+r.id:r.slotType==='STARTER'?'STARTER#'+r.gameRoleKey:r.slotType==='STARTER_GUARD'?'STARTER_PLAYER#'+r.membershipId:'SUB#'+r.membershipId+'#'+r.gameRoleKey;
  put('TEAM#'+r.teamId,sk,'ROSTER',pick(r,['id','teamId','membershipId','gameRoleKey','slotType','status','deactivatedAt']),'TeamRosterSlot',r);
 }
 const coachFields=['coachTier','coachAssessment','coachRecommendation','coachPriorityPractice','coachUpdatedByUserId','coachUpdatedAt'];
 for(const r of source.PlayerChampionPoolEntry){
  reference(r,'PlayerChampionPoolEntry');
  if(!r.championId||!['S','A','B','C','D'].includes(r.comfortLevel)||!['LOW','NORMAL','HIGH'].includes(r.priority)||typeof r.competitiveReady!=='boolean'||(r.gameRoleKey!=null&&!roleKeys.includes(r.gameRoleKey)))reject('INVALID_CHAMPION','PlayerChampionPoolEntry',r);
  if([r.coachAssessment,r.coachRecommendation].some(t=>typeof t==='string'&&/private\s*:/i.test(t)))reject('AMBIGUOUS_COACH_PRIVACY','PlayerChampionPoolEntry',r);
  put('TEAM#'+r.teamId,'POOL#'+r.membershipId+'#'+r.championId,'PLAYER_POOL',{...pick(r,['id','teamId','membershipId','championId','gameRoleKey','comfortLevel','priority','competitiveReady','playerNotes']),version:1},'PlayerChampionPoolEntry',r,'PLAYER_OWN_FIELDS');
  if(coachFields.some(k=>r[k]!=null)){
   if(!r.coachUpdatedByUserId||!r.coachUpdatedAt)reject('MISSING_ASSESSMENT_PROVENANCE','PlayerChampionPoolEntry',r);
   if(r.coachTier!=null&&!['S','A','B','C','D'].includes(r.coachTier))reject('INVALID_COACH_TIER','PlayerChampionPoolEntry',r);
   put('TEAM#'+r.teamId,'ASSESSMENT#'+r.membershipId+'#'+r.championId,'COACH_ASSESSMENT',{teamId:r.teamId,membershipId:r.membershipId,championId:r.championId,...pick(r,coachFields),version:1},'PlayerChampionPoolEntry',r,'REQUIRES_OWNER_VISIBILITY_APPROVAL');
   warn('COACH_VISIBILITY_APPROVAL_REQUIRED','PlayerChampionPoolEntry',r);
  }
 }
 for(const team of source.Team)if(source.TeamMembership.filter(m=>m.teamId===team.id).length>50)reject('TEAM_MEMBERSHIP_BOUND_EXCEEDED','Team',team);
 for(const item of items)if(Buffer.byteLength(canonical(item))>350*1024)reject('ITEM_SIZE_SAFETY_LIMIT',item.migration.sourceModel,item);
 const accepted=rejects.length===0,output=accepted?sorted(items):[];
 const summary={version,accepted,inputCount:models.reduce((n,m)=>n+source[m].length,0),inputByModel:Object.fromEntries(models.map(m=>[m,source[m].length])),outputCount:output.length,outputByType:Object.fromEntries([...new Set(output.map(i=>i.entityType))].map(t=>[t,output.filter(i=>i.entityType===t).length])),rejectCount:rejects.length,warningCount:warnings.length,rejects,warnings,sourceDigest:digest(source),canonicalDigest:digest(output),relationshipsValid:accepted,perTeam:source.Team.map(t=>({teamDigest:digest(t.id),members:source.TeamMembership.filter(m=>m.teamId===t.id).length,sourceRows:models.reduce((n,m)=>n+source[m].filter(r=>r.teamId===t.id||(m==='Team'&&r.id===t.id)).length,0)})),writes:0};
 return {summary,items:output,recovery:source,checkpoint:{version,sourceDigest:summary.sourceDigest,outputDigest:summary.canonicalDigest,nextOrdinal:output.length,complete:accepted}};
}
export function restart(input,checkpoint,options){const result=transform(input,options);if(checkpoint&&(checkpoint.version!==version||checkpoint.sourceDigest!==result.summary.sourceDigest||checkpoint.outputDigest!==result.summary.canonicalDigest||!Number.isSafeInteger(checkpoint.nextOrdinal)||checkpoint.nextOrdinal<0||checkpoint.nextOrdinal>result.items.length))throw Error('Checkpoint/source mismatch');return result;}
export function reconcile(input,items,options){const expected=transform(input,options);return {equal:expected.summary.accepted&&digest(sorted(items))===expected.summary.canonicalDigest,sourceDigest:expected.summary.sourceDigest,expectedDigest:expected.summary.canonicalDigest,actualDigest:digest(sorted(items)),expectedCount:expected.items.length,actualCount:items.length};}
export function reverse(items,recovery,options){const comparison=reconcile(recovery,items,options);if(!comparison.equal)throw Error('Post-transform target writes/new fields require a separately reviewed reverse mapping');return structuredClone(recovery);}
export function publicProjection(item,persona){if(item.entityType==='COACH_ASSESSMENT'||item.entityType==='COACH_PRIVATE')return null;if(item.entityType==='PLAYER_POOL')return pick(item,['teamId','membershipId','championId','gameRoleKey','comfortLevel','priority','competitiveReady','playerNotes','version']);return null;}
