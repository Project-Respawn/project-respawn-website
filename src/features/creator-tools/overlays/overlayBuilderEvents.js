export const recentDemoActivities=Object.freeze([
  ['activity-follow','stream.follow','twitch','PixelPioneer','New follower','2m ago','alerts'],
  ['activity-sub','stream.subscription','twitch','RavenAsh','New subscriber · Tier 1','6m ago','alerts'],
  ['activity-achievement','achievement.unlocked','respawn','Nova','Achievement earned · Epic Comeback','10m ago','achievement'],
  ['activity-raid','stream.raid','twitch','KnightRider','Twitch raid · 23 viewers','18m ago','alerts'],
  ['activity-event','community.event.upcoming','respawn','GamerGal','Event RSVP · Custom Lobby Night','27m ago','upcoming-event'],
  ['activity-discord','discord.member.joined','discord','Nova#1234','Discord member joined','34m ago','recent-activity'],
  ['activity-supporter','supporter.tier.changed','respawn','PixelPioneer','Supporter tier changed','41m ago','recent-activity'],
  ['activity-tts','tts.requested','twitch','VoiceTester','Text to Speech request','48m ago','tts'],
].map(([id,type,platform,actor,summary,createdAtLabel,targetWidgetType])=>({id,type,platform,actor,summary,createdAtLabel,targetWidgetType,payload:{demo:true}})))
export function routeDemoEvent(scene,event){const widget=scene?.widgets.find(w=>w.enabled&&(w.type===event.targetWidgetType||(event.targetWidgetType==='alerts'&&w.type==='alerts')));return widget?{ok:true,widgetId:widget.id,message:`Replaying ${event.summary}` }:{ok:false,widgetId:'',message:`This scene does not currently contain a ${event.targetWidgetType.replaceAll('-',' ')} widget.`}}
export function createReplayController({duration=900,onClear=()=>{}}={}){let timer=null;return{trigger(id,reducedMotion=false){if(timer)clearTimeout(timer);if(reducedMotion){onClear();return 0}timer=setTimeout(()=>{timer=null;onClear()},duration);return timer},clear(){if(timer)clearTimeout(timer);timer=null;onClear()}}}
