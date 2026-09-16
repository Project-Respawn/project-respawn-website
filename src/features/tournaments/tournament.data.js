// Frontend-only fixture adapter. Replace this adapter, not the route pages,
// when approved backend operations are available. Never imply real live data.
const foundersCup = {
  slug: 'founders-cup', name: 'Founders Cup', edition: 'Season Zero',
  game: 'League of Legends', server: 'EUW', entry: 'Free entry', demo: true,
  dateLabel: 'November launch target · Dates to be confirmed',
  registration: { status: 'coming-soon', opensAt: null, closesAt: null },
  format: { label: 'Format to be confirmed', draft: 'Fearless preview', finals: 'Bo5 preview' },
  draftPreview: {
    roles:['Top','Jungle','Mid','ADC','Support'],
    bluePicks:['Gnar','Vi','Orianna','Jinx','Thresh'],
    redPicks:['Renekton','Sejuani','Ahri','Kai’Sa','Nautilus'],
    champions:['Orianna','Ahri','Jinx','Vi','Gnar','Thresh','Renekton','Sejuani','Kai’Sa','Nautilus','Teemo','Yasuo','Poppy','Syndra','Rakan','Ezreal','Lux','Lee Sin','Lucian','Braum'],
    exclusions:['Lux','Lee Sin','Lucian','Braum'],
  },
  teams: [
    { id:'pr', name:'Project Respawn', initials:'PR', creator:'RavensGamer', color:'#b299ff', seed:1, record:'2–0', teamHubSlug:'project-respawn' },
    { id:'mc', name:'Moonlight Collective', initials:'MC', creator:'LunaLive', color:'#86ccff', seed:4, record:'1–1' },
    { id:'ef', name:'Ember Five', initials:'E5', creator:'EmberPlays', color:'#ffb27e', seed:2, record:'2–0' },
    { id:'rr', name:'Rift Runners', initials:'RR', creator:'RiftRadio', color:'#81ecc1', seed:3, record:'1–1' },
    { id:'pk', name:'Pixel Knights', initials:'PK', creator:'PixelParty', color:'#ff9ecb', seed:5, record:'0–2' },
    { id:'ee', name:'Echo Esports', initials:'EE', creator:'EchoOnAir', color:'#ffe58c', seed:6, record:'1–1' },
  ],
  matches: [
    { id:'m1',a:'pr',b:'mc',status:'Live',score:'1 : 0',game:2,round:'Upper bracket · Round 2',coverage:'Official broadcast preview',time:'Simulated live match' },
    { id:'m2',a:'ef',b:'rr',status:'Drafting',score:'0 : 0',game:1,round:'Upper bracket · Round 2',coverage:'Two partner stream previews',time:'Simulated live draft' },
    { id:'m3',a:'pk',b:'ee',status:'Live',score:'0 : 0',game:1,round:'Lower bracket · Round 1',coverage:'Community POV preview',time:'Simulated concurrent match' },
    { id:'m4',a:'pr',b:'ef',status:'Upcoming',score:'—',game:1,round:'Upper final · Example fixture',coverage:'Coverage to be confirmed',time:'Date to be confirmed' },
    { id:'m5',a:'rr',b:'pk',status:'Completed',score:'2 : 0',game:2,round:'Opening round',coverage:'Draft archive preview',time:'Sample completed match' },
    { id:'m6',a:'pr',b:'ee',status:'Completed',score:'2 : 1',game:3,round:'Opening round',coverage:'Draft archive preview',time:'Sample completed match' },
  ],
  bracket: [
    {title:'Opening round',matchIds:['m6','m5']},
    {title:'Round 2',matchIds:['m1','m2']},
    {title:'Upper final · Placeholder',matchIds:['m4']},
  ],
  streams: [
    { creator:'LunaLive',matchId:'m1',type:'Community broadcast',language:'English' },
    { creator:'EmberPlays',matchId:'m2',type:'Player POV',language:'English' },
    { creator:'PixelParty',matchId:'m3',type:'Community broadcast',language:'English' },
  ],
  news: [
    { id:'communities',category:'Community spotlight',title:'The communities behind the competition',text:'A preview of how team introductions and community stories will appear alongside tournament coverage.' },
    { id:'coverage',category:'Broadcast guide',title:'Choose your point of view',text:'Match pages bring together the official broadcast and approved community coverage, including concurrent matches.' },
    { id:'fearless',category:'Draft explainer',title:'New game. New composition.',text:'Follow intentional public hovers, locked picks and the game-by-game draft archive. Final draft rules will be confirmed before entry opens.' },
  ],
};
const tournaments = new Map([[foundersCup.slug, foundersCup]]);
export function getTournament(slug) { return tournaments.get(String(slug)) || null; }
export function tournamentPath(slug, segment='') { return `/tournaments/${encodeURIComponent(slug)}${segment ? '/' + segment : ''}`; }
export function registrationState(registration, now=Date.now()) {
  if (registration.status === 'paused') return 'paused';
  const closes=registration.closesAt ? Date.parse(registration.closesAt) : NaN;
  const opens=registration.opensAt ? Date.parse(registration.opensAt) : NaN;
  if (Number.isFinite(closes) && now >= closes) return 'closed';
  if (Number.isFinite(opens) && now < opens) return 'coming-soon';
  return registration.status;
}
