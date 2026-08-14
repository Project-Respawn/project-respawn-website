export const gamePreviewDefinitions=Object.freeze([
  {id:'league-of-legends',name:'League of Legends',context:'Bright lane and dark jungle concept',image:'/images/overlay-previews/fantasy-moba-draft.png',brightness:'mixed',motion:'high',contrast:'Use outlined light text over the jungle and dark surfaces over the lane'},
  {id:'fortnite',name:'Fortnite',context:'Bright landscape battle concept',image:'/images/overlay-previews/battle-royale-draft.png',brightness:'bright',motion:'high',contrast:'Prefer dark translucent widget surfaces'},
  {id:'dead-by-daylight',name:'Dead by Daylight',context:'Foggy forest and industrial concept',image:'/images/overlay-previews/asymmetrical-horror-draft.png',brightness:'dark',motion:'medium',contrast:'Prefer bright type and restrained glow'},
  {id:'swtor',name:'Star Wars: The Old Republic',context:'Luminous science-fiction city concept',image:'/images/overlay-previews/science-fiction-rpg-draft.png',brightness:'mixed',motion:'medium',contrast:'Avoid cyan text over energy lighting'},
])
export function resolveGamePreview(id){return gamePreviewDefinitions.find(item=>item.id===id)||gamePreviewDefinitions[0]}
export function applyGamePreview(preview,id){const item=resolveGamePreview(id);return{...preview,backgroundType:'game-draft',referenceAssetId:item.id,gameId:item.id,gameName:item.name,customImageUrl:item.image,brightness:item.brightness,motion:item.motion,contrastProfile:item.contrast}}
