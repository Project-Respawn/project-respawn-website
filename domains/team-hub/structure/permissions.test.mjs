import test from 'node:test';
import assert from 'node:assert/strict';
import {permits,setMemberPermissions,revokeMember,transferOwnership} from './permissions.mjs';
import {assertStaffAssignment,availableGameProfiles,projectStaff} from './catalog.mjs';
const fixture = () => ({status:'ACTIVE',managerMembershipId:'manager',
  memberships:['manager','head','analyst','player','removed'].map(id=>({id,displayName:id,status:id==='removed'?'INACTIVE':'ACTIVE'})),
  assignments:[{membershipId:'head',positionKey:'HEAD_COACH',status:'ACTIVE'}],
  grants:{},roster:[{membershipId:'player'}],personalPools:{player:['retained']}});
const actor=id=>({actorMembershipId:id});
test('Manager controls coach; coach cannot remove or replace Manager',()=>{
  const s=fixture();
  assert.equal(permits(s,actor('manager'),'members.manage','head'),true);
  for(const action of ['members.manage','staff.manage','permissions.manage','manager.replace','ownership.transfer'])
    assert.equal(permits(s,actor('head'),action,'manager'),false,action);
  for(const action of ['roster.manage','members.manage','pools.read','reviews.write','settings.manage','permissions.manage'])
    assert.equal(permits(s,actor('head'),action,'player'),true,action);
});
test('Only server-verified global Admin can delete; Admin can replace Manager',()=>{
  const s=fixture();
  for(const id of ['manager','head','analyst'])assert.equal(permits(s,actor(id),'team.delete'),false);
  assert.equal(permits(s,{platformAdmin:true},'team.delete'),true);
  assert.equal(permits(s,{platformAdmin:true},'manager.replace'),true);
  assert.equal(permits(s,{platformAdmin:'true'},'team.delete'),false);
  assert.equal(permits(s,{platformAdmin:true},'unknown'),false);
});
test('Manager and Head Coach can configure and revoke granular analyst access',()=>{
  for(const id of ['manager','head']){
    let s=fixture(); assert.equal(permits(s,actor('analyst'),'pools.read'),false);
    s=setMemberPermissions(s,actor(id),'analyst',['pools.read','reviews.read']);
    assert.equal(permits(s,actor('analyst'),'pools.read'),true);
    assert.equal(permits(s,actor('analyst'),'reviews.write'),false);
    s=setMemberPermissions(s,actor(id),'analyst',[]);
    assert.equal(permits(s,actor('analyst'),'pools.read'),false);
  }
});
test('No self-escalation, private notes grant or delegating ownership/governance',()=>{
  for(const permission of ['permissions.manage','ownership.transfer','team.delete','privateNotes.read','*'])
    assert.throws(()=>setMemberPermissions(fixture(),actor('manager'),'analyst',[permission]),/INVALID_PERMISSION/);
  assert.throws(()=>setMemberPermissions(fixture(),actor('analyst'),'analyst',['pools.read']),/FORBIDDEN/);
});
test('Revocation removes access, appointments and roster, preserving personal pools',()=>{
  const s=fixture();s.grants.player=['pools.read'];
  const next=revokeMember(s,actor('head'),'player');
  assert.equal(permits(next,actor('player'),'team.read'),false);
  assert.equal(permits(next,actor('player'),'pools.read'),false);
  assert.deepEqual(next.roster,[]);assert.deepEqual(next.personalPools,s.personalPools);
  const noCoach=revokeMember(s,actor('manager'),'head');
  assert.equal(permits(noCoach,actor('head'),'members.manage'),false);
  assert.equal(projectStaff(noCoach.assignments,noCoach.memberships).length,0);
});
test('Ownership transfer atomically changes sole Manager, rejects inactive recipients',()=>{
  const s=fixture(),next=transferOwnership(s,actor('manager'),'player');
  assert.equal(permits(next,actor('manager'),'ownership.transfer'),false);
  assert.equal(permits(next,actor('player'),'ownership.transfer'),true);
  assert.throws(()=>transferOwnership(s,actor('head'),'player'),/FORBIDDEN/);
  assert.throws(()=>transferOwnership(s,actor('manager'),'removed'),/INACTIVE_MEMBER/);
  assert.throws(()=>revokeMember(s,actor('manager'),'manager'),/TRANSFER_REQUIRED/);
});
test('Staff capacities: two analysts, one Head Coach and one coach per position',()=>{
  const add=(positionKey,assignments=[],specialty=null)=>assertStaffAssignment({gameKey:'LEAGUE_OF_LEGENDS',membershipId:'new',positionKey,assignments,specialty});
  const rows=[{membershipId:'a',positionKey:'ANALYST',status:'ACTIVE'},{membershipId:'b',positionKey:'ANALYST',status:'ACTIVE'}];
  assert.throws(()=>add('ANALYST',rows),/FULL/);
  assert.doesNotThrow(()=>add('ANALYST',rows.slice(1)));
  assert.throws(()=>add('HEAD_COACH',[{positionKey:'HEAD_COACH',status:'ACTIVE'}]),/FULL/);
  assert.throws(()=>add('POSITION_COACH',[],'GOALKEEPER'),/SPECIALTY/);
});
test('Unsupported games are not offered; League positions do not leak into other games',()=>{
  assert.deepEqual(availableGameProfiles(),[]);
  const [game]=availableGameProfiles(['ROCKET_LEAGUE']);
  assert.equal(game.startingSize,3);assert.equal(game.substituteLimit,3);
  assert.equal(game.positions.some(p=>p.key==='JUNGLE'),false);
});
