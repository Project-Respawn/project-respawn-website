import test from 'node:test';
import assert from 'node:assert/strict';
import {transform,reverse,reconcile,restart,publicProjection,canonical} from './transform.mjs';
import {fixture,options} from './fixtures.mjs';
import {authorize,transition} from './fence.mjs';
test('empty observed domain deterministically produces no records',()=>{const r=transform({},options);assert.equal(r.summary.accepted,true);assert.equal(r.summary.inputCount,0);assert.equal(r.summary.outputCount,0);assert.equal(r.summary.rejectCount,0);assert.equal(r.summary.writes,0);});
test('full synthetic domain round trips without dropping roles, settings, logo or coach fields',()=>{const f=fixture(),r=transform(f,options);assert.equal(r.summary.accepted,true);assert.ok(r.items.some(i=>i.entityType==='COACH_ASSESSMENT'));assert.deepEqual(reverse(r.items,r.recovery,options),r.recovery);assert.equal(reconcile(f,r.items,options).equal,true);assert.ok(r.summary.warnings.some(w=>w.code==='COACH_VISIBILITY_APPROVAL_REQUIRED'));});
test('input ordering, retries and restart never change digest or output',()=>{const f=fixture(),r=transform(f,options);for(const m of Object.keys(f))f[m].reverse();const again=restart(f,r.checkpoint,options);assert.equal(again.summary.canonicalDigest,r.summary.canonicalDigest);assert.deepEqual(again.items,r.items);});
test('changed source refuses stale restart',()=>{const f=fixture(),r=transform(f,options);f.Team[0].name='Other';assert.throws(()=>restart(f,r.checkpoint,options));});
test('invalid cursor refuses restart',()=>{const f=fixture(),r=transform(f,options);assert.throws(()=>restart(f,{...r.checkpoint,nextOrdinal:1e6},options));});
test('changed target and new-only private fields block reverse rather than lose acknowledged data',()=>{const r=transform(fixture(),options);r.items[0].newPrivateField='synthetic';assert.equal(reconcile(r.recovery,r.items,options).equal,false);assert.throws(()=>reverse(r.items,r.recovery,options));});
test('missing and duplicate target entries fail reconciliation',()=>{const r=transform(fixture(),options);assert.equal(reconcile(r.recovery,r.items.slice(1),options).equal,false);assert.equal(reconcile(r.recovery,[...r.items,r.items[0]],options).equal,false);});
test('Player/Manager projections never expose coach or recovery fields',()=>{const r=transform(fixture(),options);for(const persona of ['PLAYER','MANAGER','COACH'])for(const item of r.items){const dto=publicProjection(item,persona);assert.doesNotMatch(canonical(dto),/coachAssessment|coachRecommendation|coachTier|migration|sourceDigest|privateNote/);}assert.equal(publicProjection({entityType:'COACH_PRIVATE',privateNote:'synthetic'},'PLAYER'),null);});
test('summary contains digests and counts, not private data, IDs or names',()=>{const s=canonical(transform(fixture(),options).summary);assert.doesNotMatch(s,/Synthetic Alpha|synthetic-subject|Synthetic assessment|Synthetic player note|team:synthetic-alpha/);});
test('single FREE Team default settings warning is explicit and reversible',()=>{const f=fixture();f.Team[0].teamPlan='FREE';delete f.Team[0].settingsRevision;const r=transform(f,options);assert.equal(r.summary.accepted,true);assert.ok(r.summary.warnings.some(w=>w.code==='DEFAULT_SETTINGS_REVISION_ZERO'));assert.equal(reverse(r.items,r.recovery,options).Team[0].settingsRevision,undefined);});
for(const [name,change,code] of [
 ['ambiguous Coach private text',f=>f.PlayerChampionPoolEntry[0].coachRecommendation='Private: synthetic confidential','AMBIGUOUS_COACH_PRIVACY'],
 ['missing Coach author',f=>delete f.PlayerChampionPoolEntry[0].coachUpdatedByUserId,'MISSING_ASSESSMENT_PROVENANCE'],
 ['duplicate ID',f=>f.Team.push({...f.Team[0]}),'DUPLICATE_ID'],
 ['duplicate member subject',f=>f.TeamMembership.push({...f.TeamMembership[2],id:'different'}),'DUPLICATE_MEMBERSHIP'],
 ['dangling member',f=>f.TeamMembership[2].teamId='missing','DANGLING_TEAM'],
 ['cross-Team champion',f=>f.PlayerChampionPoolEntry[0].teamId='other','DANGLING_OR_FOREIGN_PLAYER'],
 ['missing subject',f=>delete f.TeamMembership[2].userId,'MISSING_SUBJECT'],
 ['invalid role',f=>f.TeamMembership[2].role='OWNER','INVALID_ROLE'],
 ['invalid status',f=>f.TeamMembership[2].status='REVOKED','INVALID_STATUS'],
 ['revoked active',f=>f.TeamMembership[2].revokedAt='2026-01-01','ACTIVE_REVOKED_MEMBERSHIP'],
 ['inactive roster',f=>f.TeamMembership[2].status='INACTIVE','INACTIVE_ROSTER_MEMBER'],
 ['invalid roster role',f=>f.TeamRosterSlot[0].gameRoleKey='INVALID','INVALID_ROSTER'],
 ['missing starter guard',f=>f.TeamRosterSlot.splice(1,1),'MISSING_OR_DUPLICATE_GUARD'],
 ['dangling starter guard',f=>f.TeamRosterSlot.splice(0,1),'DANGLING_GUARD'],
 ['revision conflict',f=>f.Team[0].rosterRevision=-1,'INVALID_REVISION'],
 ['malformed legacy row',f=>delete f.Team[0].name,'INVALID_TEAM'],
 ['invalid champion',f=>f.PlayerChampionPoolEntry[0].comfortLevel='F','INVALID_CHAMPION'],
 ['invalid coach tier',f=>f.PlayerChampionPoolEntry[0].coachTier='F','INVALID_COACH_TIER'],
 ['unknown fields',f=>f.Team[0].unexpected='data','UNKNOWN_SOURCE_FIELD'],
 ['foreign logo',f=>f.Team[0].logoKey='other-domain/asset.png','FOREIGN_LOGO_REFERENCE'],
 ['invalid plan',f=>f.Team[0].teamPlan='PAID','INVALID_PLAN']
])test('fail closed: '+name,()=>{const f=fixture();change(f);const r=transform(f,options);assert.equal(r.summary.accepted,false);assert.equal(r.items.length,0);assert.ok(r.summary.rejects.some(x=>x.code===code));});
test('wrong environment fails before transformation',()=>assert.throws(()=>transform(fixture(),{...options,environment:'production'})));
test('foreign model, non-array input and null rows fail closed without payload output',()=>{for(const input of [{Commerce:[]},{Team:{}},{Team:[null]}])assert.throws(()=>transform(input,options));});
test('object-valued private field is rejected',()=>{const f=fixture();f.PlayerChampionPoolEntry[0].playerNotes={hidden:'synthetic'};assert.equal(transform(f,options).summary.accepted,false);});
test('full five-position roster with guards transforms and reverses',()=>{const f=fixture(),base=f.TeamMembership[2];for(const role of ['TOP','JUNGLE','ADC','SUPPORT']){const m={...base,id:'member-'+role,userId:'synthetic-'+role};f.TeamMembership.push(m);for(const slotType of ['STARTER','STARTER_GUARD'])f.TeamRosterSlot.push({...f.TeamRosterSlot[0],id:slotType+'-'+role,membershipId:m.id,playerUserId:m.userId,gameRoleKey:role,slotType});}const r=transform(f,options);assert.equal(r.summary.accepted,true);assert.equal(r.items.filter(i=>i.SK.startsWith('STARTER#')).length,5);assert.deepEqual(reverse(r.items,r.recovery,options),r.recovery);});
test('50-member boundary accepted, overflow rejected',()=>{const f=fixture();while(f.TeamMembership.length<50){const n=f.TeamMembership.length;f.TeamMembership.push({...f.TeamMembership[2],id:'bounded-'+n,userId:'synthetic-'+n});}assert.equal(transform(f,options).summary.accepted,true);f.TeamMembership.push({...f.TeamMembership[2],id:'overflow',userId:'synthetic-overflow'});assert.ok(transform(f,options).summary.rejects.some(r=>r.code==='TEAM_MEMBERSHIP_BOUND_EXCEEDED'));});
test('inactive historical roster is archived, not silently dropped',()=>{const f=fixture();f.TeamRosterSlot[2].status='INACTIVE';f.TeamRosterSlot[2].deactivatedAt='2026-01-01T00:00:00Z';const r=transform(f,options);assert.equal(r.summary.accepted,true);assert.ok(r.items.some(i=>i.SK==='ARCHIVE#ROSTER#slot-sub'));assert.deepEqual(reverse(r.items,r.recovery,options),r.recovery);});
test('concurrent starter position conflict rejected',()=>{const f=fixture();f.TeamRosterSlot.push({...f.TeamRosterSlot[0],id:'conflicting-slot'});assert.ok(transform(f,options).summary.rejects.some(r=>r.code==='ROSTER_CONFLICT'));});
test('two source IDs targeting one pool key rejected',()=>{const f=fixture();f.PlayerChampionPoolEntry.push({...f.PlayerChampionPoolEntry[0],id:'second-source-id'});assert.ok(transform(f,options).summary.rejects.some(r=>r.code==='DUPLICATE_TARGET_KEY'));});
for(const mode of ['LEGACY_WRITER','FROZEN','TARGET_WRITER','UNKNOWN'])for(const writer of ['LEGACY','TARGET','SCRIPT'])test('fence '+mode+'/'+writer,()=>assert.equal(authorize({mode,epoch:2,expectedEpoch:2,writer}),mode==='LEGACY_WRITER'&&writer==='LEGACY'||mode==='TARGET_WRITER'&&writer==='TARGET'));
test('stale/missing epoch fails closed',()=>{assert.equal(authorize({mode:'LEGACY_WRITER',epoch:2,expectedEpoch:1,writer:'LEGACY'}),false);assert.equal(authorize({mode:'LEGACY_WRITER',writer:'LEGACY'}),false);});
test('cannot bypass freeze or unresolved writers',()=>{assert.throws(()=>transition({mode:'LEGACY_WRITER',epoch:1},'TARGET_WRITER'));assert.throws(()=>transition({mode:'LEGACY_WRITER',epoch:1},'FROZEN'));});
test('freeze/drain/reconcile is required for either authority direction',()=>{const gate={writersEnumerated:true,serverDenyVerified:true,inFlight:0,reconciled:true,backupsRestored:true};const frozen=transition({mode:'LEGACY_WRITER',epoch:1},'FROZEN',gate);assert.equal(transition(frozen,'TARGET_WRITER',gate).epoch,3);assert.throws(()=>transition(frozen,'TARGET_WRITER',{...gate,inFlight:1}));assert.equal(transition(frozen,'LEGACY_WRITER',gate).mode,'LEGACY_WRITER');});
