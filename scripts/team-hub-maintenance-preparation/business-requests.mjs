// Pure maintenance request compiler. No credentials, AWS clients, HTTP executor or revision defaults.
import assert from 'node:assert/strict';
import {validateRequest} from '../../domains/team-hub/business-runtime/contracts.mjs';
export const slug='maintenance-proof-20261012-5dc9b348',teamId='team:'+slug;
export function request(operation,{team,membership,target,entryVersion,assessmentVersion,account,runKey,isPlatformAdmin=false,championId='Ahri',action='ASSIGN',role='PLAYER',slotType='STARTER',status='ACTIVE'}={}){
 assert.match(runKey??'',/^[A-Za-z0-9_-]{8,100}$/);
 const idempotencyKey=runKey+'_'+operation;
 if(operation==='CREATE_TEAM')return validateRequest(operation,{slug,name:'Ntgre maintenance proof',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey});
 assert.equal(team?.id,teamId,'Exact acceptance Team required');
 // The accepted website contract uses 0 for an authenticated global Admin with no Team membership.
 // Take isPlatformAdmin from the actual authenticated Team context; the server still checks fresh Core authority.
 const memberVersion=membership==null&&isPlatformAdmin===true?0:membership?.version;
 const base={teamId,idempotencyKey,expectedTeamVersion:team.version,expectedAuthorizationEpoch:team.authorizationEpoch,expectedMembershipVersion:memberVersion};
 let payload;
 switch(operation){
  case 'UPDATE_TEAM':payload={...base,name:'Ntgre maintenance proof',status};break;
  case 'SET_MANAGER':case 'MANAGE_MEMBER':
   payload={...base,action,expectedTargetMembershipVersion:action==='ASSIGN'?target?.membershipVersion:target?.version,...(action==='ASSIGN'?{targetAccount:account}:{targetMembershipId:target?.id}),...(operation==='MANAGE_MEMBER'?{role}:{})};break;
  case 'SET_ROSTER_SLOT':payload={...base,membershipId:target?.id,gameRoleKey:'MID',slotType,action:action==='REVOKE'?'REMOVE':action,expectedRosterVersion:team.rosterVersion,expectedTargetMembershipVersion:target?.version};break;
  case 'UPSERT_MY_CHAMPION':payload={...base,championId,gameRoleKey:'MID',comfortLevel:'B',priority:'NORMAL',competitiveReady:true,playerNotes:'',expectedEntryVersion:entryVersion};break;
  case 'DELETE_MY_CHAMPION':payload={...base,championId,expectedEntryVersion:entryVersion};break;
  case 'UPSERT_COACH_ASSESSMENT':payload={...base,membershipId:target?.id,championId,teamVisible:'Ntgre synthetic acceptance',privateNote:'',expectedAssessmentVersion:assessmentVersion,expectedTargetMembershipVersion:target?.version};break;
  case 'SET_TEAM_PLAN':payload={...base,plan:'FREE'};break;
  default:throw Error('UNAPPROVED_MAINTENANCE_OPERATION');
 }
 return validateRequest(operation,payload);
}
