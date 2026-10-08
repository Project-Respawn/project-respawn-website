import test from 'node:test';
import assert from 'node:assert/strict';
import {schemaVersion,issuer,subjectKey,keys,nativeToLegacy,reconcileNative,emptyGate} from './native-state.mjs';
export function nativeFixture(){
 const teamId='team:native-alpha',at='2026-10-05T00:00:00Z';
 const subjects=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003'];
 const mid=s=>'team-membership:'+teamId+':'+s;
 const rows=[{entityType:'TEAM',id:teamId,slug:'native-alpha',name:'Native Alpha',gameKey:'LEAGUE_OF_LEGENDS',status:'ACTIVE',authorizationEpoch:8,rosterVersion:3,membershipRevision:3,settingsRevision:1,managerMembershipId:mid(subjects[0]),coachMembershipId:mid(subjects[1]),createdByUserId:subjects[0],updatedByUserId:subjects[0],settings:{plan:'FREE',logoAssetId:null},StatusPK:'STATUS#ACTIVE',StatusSK:'TEAM#'+teamId},{entityType:'SLUG',teamId}];
 subjects.forEach((subject,i)=>rows.push({entityType:'MEMBERSHIP',id:mid(subject),teamId,issuer,subject,displayName:'Synthetic role '+i,role:['MANAGER','COACH','PLAYER'][i],status:'ACTIVE',addedByUserId:subjects[0],SubjectPK:subjectKey(subject),SubjectSK:'TEAM#'+teamId}));
 for(const slotType of ['STARTER','STARTER_GUARD'])rows.push({entityType:'ROSTER',id:'team-roster:'+teamId+(slotType==='STARTER'?':starter:MID':':starter-player:'+mid(subjects[2])),teamId,membershipId:mid(subjects[2]),gameRoleKey:'MID',slotType,status:'ACTIVE',assignedByUserId:subjects[0]});
 rows.push({entityType:'PLAYER_POOL',id:'team-pool:'+teamId+':'+subjects[2]+':Ahri',teamId,membershipId:mid(subjects[2]),championId:'Ahri',gameRoleKey:'MID',comfortLevel:'A',priority:'HIGH',competitiveReady:true,playerNotes:'Player controlled'});
 rows.push({entityType:'COACH_ASSESSMENT',teamId,membershipId:mid(subjects[2]),championId:'Ahri',coachTier:'S',coachAssessment:'Approved team evaluation',coachRecommendation:'Practice',coachPriorityPractice:true,coachUpdatedByUserId:subjects[1],coachUpdatedAt:at,visibility:'TEAM_VISIBLE_APPROVED'});
 return rows.map(r=>{const [PK,SK]=keys(r.entityType==='SLUG'?{...r,slug:'native-alpha'}:r);return {...r,PK,SK,schemaVersion,version:1,createdAt:at,updatedAt:at};});
}
test('native new state reverses without Legacy snapshot; roles, guard, pool and assessment survive',()=>{const r=nativeToLegacy(nativeFixture());assert.equal(r.manifest.sourceSnapshotRequired,false);assert.deepEqual(r.manifest.counts,{Team:1,TeamMembership:3,TeamRosterSlot:2,PlayerChampionPoolEntry:1});assert.deepEqual(r.legacy.TeamMembership.map(m=>m.role),['MANAGER','COACH','PLAYER']);assert.equal(r.legacy.PlayerChampionPoolEntry[0].coachTier,'S');assert.equal(r.legacy.Team[0].rosterRevision,3);assert.equal(r.manifest.writes,0);assert.ok(reconcileNative(nativeFixture(),r.legacy));r.legacy.Team[0].name='drift';assert.equal(reconcileNative(nativeFixture(),r.legacy),false);});
const cases={
 'unknown future field':s=>s[0].unmappedBusinessValue='lose me',
 'wrong schema':s=>s[0].schemaVersion='v999',
 'missing slug claim':s=>s.splice(1,1),
 'wrong identity issuer':s=>s[2].issuer='other',
 'invalid membership ID':s=>s[2].id='old-id',
 'missing starter guard':s=>s.splice(s.findIndex(r=>r.slotType==='STARTER_GUARD'),1),
 'foreign player':s=>s.find(r=>r.entityType==='PLAYER_POOL').membershipId=s[2].id,
 'unapproved Coach visibility':s=>s.at(-1).visibility='UNDECIDED',
 'ambiguous private assessment':s=>s.at(-1).coachAssessment='Private: sensitive',
 'unknown settings':s=>s[0].settings.unmapped='lose me',
 'missing audit actor':s=>delete s[0].createdByUserId,
 'wrong PK':s=>s[0].PK='TEAM#other',
 'wrong subject GSI':s=>s[2].SubjectPK='wrong',
 'future revision overflow':s=>s[0].rosterVersion=2147483648,
 'duplicate keys':s=>s.push(structuredClone(s[0])),
 'missing target recovery mapping for logo':s=>s[0].settings.logoAssetId='logo-native',
 'private note prohibited':s=>s.push({...s.at(-1),entityType:'COACH_PRIVATE',privateNote:'secret'})
};
for(const [name,mutate]of Object.entries(cases))test('reject '+name,()=>{const s=nativeFixture();mutate(s);assert.throws(()=>nativeToLegacy(s));});
test('private item is explicitly non-reversible',()=>{const s=nativeFixture(),r=s.at(-1);const p={schemaVersion,entityType:'COACH_PRIVATE',version:1,createdAt:r.createdAt,updatedAt:r.updatedAt,teamId:r.teamId,membershipId:r.membershipId,championId:r.championId,authorIssuer:issuer,authorSubject:r.coachUpdatedByUserId,privateNote:'Synthetic only'};[p.PK,p.SK]=keys(p);s.push(p);assert.throws(()=>nativeToLegacy(s),/NON_REVERSIBLE/);});
test('verified logo and PRO settings map; feature remains disabled in Mode A',()=>{const s=nativeFixture();s[0].settings={plan:'PRO',logoAssetId:'logo-native',proExpiresAt:'2030-01-01T00:00:00Z',planUpdatedBy:s[0].createdByUserId,planUpdatedAt:s[0].updatedAt};const legacyKey='team-logos/team:native-alpha/00000000-0000-4000-8000-000000000004.png';const r=nativeToLegacy(s,{allowVerifiedLogoRollback:true,logoMappings:{'logo-native':{teamId:s[0].id,legacyKey,sha256Verified:true,restoredAndHeadVerified:true}}});assert.equal(r.legacy.Team[0].logoKey,legacyKey);assert.equal(r.legacy.Team[0].teamPlan,'PRO');});
test('inactive/revoked membership is retained',()=>{const s=nativeFixture();s.splice(5);s[4].status='INACTIVE';s[4].revokedAt=s[4].updatedAt;s[4].revokedByUserId=s[2].subject;assert.equal(nativeToLegacy(s).legacy.TeamMembership[2].status,'INACTIVE');});
test('substitute roster reverses to exact Legacy key',()=>{const s=nativeFixture(),p=s[4];const r={...s[5],slotType:'SUBSTITUTE',gameRoleKey:'TOP',id:'team-roster:'+p.teamId+':substitute:'+p.id+':TOP'};[r.PK,r.SK]=keys(r);s.push(r);assert.equal(nativeToLegacy(s).legacy.TeamRosterSlot.at(-1).slotType,'SUBSTITUTE');});
test('export ordering does not change reverse manifest or content',()=>assert.deepEqual(nativeToLegacy(nativeFixture()),nativeToLegacy(nativeFixture().reverse())));
test('assessment update timestamp survives joined Legacy row',()=>{const s=nativeFixture();s.at(-1).updatedAt='2026-10-05T01:00:00Z';assert.equal(nativeToLegacy(s).legacy.PlayerChampionPoolEntry[0].updatedAt,s.at(-1).updatedAt);});
test('duplicate active Manager fails',()=>{const s=nativeFixture();s[4].role='MANAGER';assert.throws(()=>nativeToLegacy(s));});
test('oversized player notes fail before reverse import',()=>{const s=nativeFixture();s.find(r=>r.entityType==='PLAYER_POOL').playerNotes='x'.repeat(501);assert.throws(()=>nativeToLegacy(s));});
const good=()=>({counts:[0,0,0,0],logos:0,unknownWriters:0,unknownReaders:0,observedAt:1000,consistentCompleteCounts:true,logoListingComplete:true,legacyProtectionVerified:true,restoreRehearsalPassed:true,targetRecoveryVerified:true,targetEmpty:true,targetWriterDisabled:true,coverageRevalidated:true,allPathFenceProved:true,rollbackRehearsalPassed:true,authority:'LEGACY_WRITER'});
test('empty gate before and after freeze requires fresh independent proof',()=>{assert.ok(emptyGate(good(),{now:1001}).eligible);assert.ok(emptyGate({...good(),authority:'FROZEN',inFlightDrained:true},{now:1001,afterFreeze:true}).eligible);});
for(const field of ['consistentCompleteCounts','logoListingComplete','legacyProtectionVerified','restoreRehearsalPassed','targetRecoveryVerified','targetEmpty','targetWriterDisabled','coverageRevalidated','allPathFenceProved','rollbackRehearsalPassed'])test('gate fails missing '+field,()=>assert.equal(emptyGate({...good(),[field]:false},{now:1001}).eligible,false));
for(const field of ['unknownWriters','unknownReaders'])test('gate fails '+field,()=>assert.equal(emptyGate({...good(),[field]:1},{now:1001}).eligible,false));
for(let i=0;i<4;i++)test('nonempty table '+i+' stops Mode A',()=>{const s=good();s.counts[i]=1;assert.equal(emptyGate(s,{now:1001}).mode,'STOP_MODE_B');assert.equal(emptyGate({...s,authority:'FROZEN',inFlightDrained:true},{now:1001,afterFreeze:true}).eligible,false);});
test('new logo stops Mode A',()=>assert.equal(emptyGate({...good(),logos:1},{now:1001}).mode,'STOP_MODE_B'));
test('stale or future evidence fails',()=>{assert.equal(emptyGate(good(),{now:70000}).eligible,false);assert.equal(emptyGate(good(),{now:900}).eligible,false);});
test('freeze drain cannot be skipped',()=>assert.equal(emptyGate({...good(),authority:'FROZEN'},{afterFreeze:true,now:1001}).eligible,false));
