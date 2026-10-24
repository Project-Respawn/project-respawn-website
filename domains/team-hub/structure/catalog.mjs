// Proposed structure contract. Catalogues do not grant permissions or activate games.
export const STRUCTURE_VERSION = 'team-hub.structure.v2';
const freeze = rows => Object.freeze(rows.map(row => Object.freeze(row)));
export const staffPositions = freeze([
  {key:'TEAM_MANAGER',label:'Team Manager',category:'management',capacity:1,accessClass:'MANAGER',required:false},
  {key:'HEAD_COACH',label:'Head Coach',category:'coaching',capacity:1,accessClass:'COACH',required:false},
  {key:'ASSISTANT_HEAD_COACH',label:'Assistant Head Coach',category:'coaching',capacity:1,accessClass:'COACH',required:false},
  {key:'POSITION_COACH',label:'Position Coach',category:'coaching',capacityPerSpecialty:1,accessClass:'COACH',required:false},
  {key:'ANALYST',label:'Analyst',category:'analysis',capacity:2,accessClass:'CONFIGURABLE',required:false},
  {key:'PERFORMANCE_COACH',label:'Performance Coach',category:'support',capacity:1,accessClass:'STAFF',required:false},
  {key:'STRATEGIC_COACH',label:'Strategic Coach',category:'coaching',capacity:1,accessClass:'COACH',required:false},
  {key:'SCOUT',label:'Scout',category:'support',capacity:1,accessClass:'STAFF',required:false},
  {key:'TEAM_COORDINATOR',label:'Team Coordinator',category:'support',capacity:1,accessClass:'STAFF',required:false},
]);
const numbered = count => Array.from({length:count},(_,n)=>Object.freeze({key:'POSITION_'+(n+1),label:'Player '+(n+1)}));
const profile = (key,label,size,roles=numbered(size),competitivePool=null) => Object.freeze({key,label,startingSize:size,substituteLimit:3,positions:Object.freeze(roles),competitivePool});
export const gameProfiles = Object.freeze({
 LEAGUE_OF_LEGENDS:profile('LEAGUE_OF_LEGENDS','League of Legends',5,[{key:'TOP',label:'Top'},{key:'JUNGLE',label:'Jungle'},{key:'MID',label:'Mid'},{key:'ADC',label:'Bot / ADC'},{key:'SUPPORT',label:'Support'}].map(Object.freeze),'champions'),
 VALORANT:profile('VALORANT','VALORANT',5),
 COUNTER_STRIKE_2:profile('COUNTER_STRIKE_2','Counter-Strike 2',5),
 ROCKET_LEAGUE:profile('ROCKET_LEAGUE','Rocket League',3),
 DOTA_2:profile('DOTA_2','Dota 2',5),
 OVERWATCH_2:profile('OVERWATCH_2','Overwatch 2',5),
});
// League positions never leak into other games; profiles describe product
// defaults, not universal tournament rules. An API must advertise support.
export function availableGameProfiles(supportedGameKeys = []) {
 return supportedGameKeys.map(key=>gameProfiles[key]).filter(Boolean);
}
export function staffPosition(key) {
 const position=staffPositions.find(p=>p.key===key);
 if(!position)throw Error('INVALID_STAFF_POSITION');
 return position;
}
export function assertStaffAssignment({gameKey,assignments=[],membershipId,positionKey,specialty=null}) {
 const game=gameProfiles[gameKey],position=staffPosition(positionKey);
 if(!game||typeof membershipId!=='string'||!membershipId)throw Error('INVALID_STAFF_ASSIGNMENT');
 if(positionKey==='POSITION_COACH') {
  if(!game.positions.some(p=>p.key===specialty))throw Error('INVALID_COACH_SPECIALTY');
 }else if(specialty!==null)throw Error('INVALID_COACH_SPECIALTY');
 const active=assignments.filter(a=>a.status==='ACTIVE');
 if(active.some(a=>a.membershipId===membershipId&&a.positionKey===positionKey&&a.specialty===specialty))throw Error('STAFF_ASSIGNMENT_EXISTS');
 const occupancy=active.filter(a=>a.positionKey===positionKey&&(!position.capacityPerSpecialty||a.specialty===specialty));
 if(occupancy.length>=(position.capacity??position.capacityPerSpecialty))throw Error('STAFF_POSITION_FULL');
 return Object.freeze({membershipId,positionKey,specialty,status:'ACTIVE'});
}
export function projectStaff(assignments,memberships) {
 const active=new Map(memberships.filter(m=>m.status==='ACTIVE').map(m=>[m.id,m]));
 return assignments.filter(a=>a.status==='ACTIVE'&&active.has(a.membershipId)).map(a=>({membershipId:a.membershipId,positionKey:a.positionKey,specialty:a.specialty??null,displayName:active.get(a.membershipId).displayName}));
}
// This is a capacity/visibility model only. Mutations must also verify the
// actual authority epoch, membership/role versions, Core authorization,
// idempotency and audit inside the existing Team-owned transaction boundary.
// Never accept accessClass, privileges or a grant from a browser-supplied title.
