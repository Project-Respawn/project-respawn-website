// Synthetic fixture only; never imported by production runtime.
import {schemaVersion,issuer,subjectKey,keys} from '../team-hub-migration/native-state.mjs';
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