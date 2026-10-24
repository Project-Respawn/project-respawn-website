// Shared UI/server capability catalogue. Planned rows never grant access.
export const featurePermissions = Object.freeze([
  {key:'roster.manage',label:'Manage lineup',description:'Assign starters and substitutes.',status:'CANDIDATE',operations:['SET_ROSTER_SLOT']},
  {key:'members.manage',label:'Manage members',description:'Add or remove players. Protected leadership is excluded.',status:'CANDIDATE',operations:['MANAGE_MEMBER']},
  {key:'pools.read',label:'View team player pools',description:'View competitive pools for active team players.',status:'CANDIDATE',operations:['LIST_TEAM_CHAMPION_POOLS','GET_PLAYER_COMPETITIVE_DETAIL']},
  {key:'reviews.read',label:'Read shared reviews',description:'Read team-visible feedback alongside player pools.',status:'CANDIDATE',operations:[]},
  {key:'reviews.write',label:'Write shared reviews',description:'Create or update team-visible coaching feedback.',status:'CANDIDATE',operations:['UPSERT_COACH_ASSESSMENT']},
  {key:'staff.manage',label:'Assign additional staff',description:'Assistant coaches, position coaches and two Analysts.',status:'PLANNED',operations:[]},
  {key:'settings.manage',label:'Manage team details',description:'Edit permitted team details without ownership or branding changes.',status:'PLANNED',operations:[]},
  {key:'practice.manage',label:'Practice and scrims',description:'Schedule practices and scrims.',status:'PLANNED',operations:[]},
  {key:'strategy.manage',label:'Strategies and drafts',description:'Manage game-specific strategy resources.',status:'PLANNED',operations:[]},
  {key:'analytics.read',label:'Performance analytics',description:'View future team performance reports.',status:'PLANNED',operations:[]},
  {key:'development.ai',label:'Player development assistance',description:'Future personal-pool and AI coaching tools; consent and privacy require separate review.',status:'PLANNED',operations:[]},
  {key:'games.manage',label:'Additional game squads',description:'Game-specific rosters and tools advertised by the backend.',status:'PLANNED',operations:[]},
].map(row=>Object.freeze({...row,operations:Object.freeze(row.operations)})));
export const assignablePermissions=Object.freeze(featurePermissions.filter(p=>p.status==='CANDIDATE').map(p=>p.key));
export function validPermissionList(value){return Array.isArray(value)&&value.length<=assignablePermissions.length&&new Set(value).size===value.length&&value.every(p=>assignablePermissions.includes(p))&&(!value.includes('reviews.read')||value.includes('pools.read'))&&(!value.includes('reviews.write')||value.includes('reviews.read'));}
