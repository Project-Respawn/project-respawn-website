function overlapArea(a,b){const w=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));const h=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));return w*h}
export function generateSuggestions(scene,preview={brightness:'dark',motion:'medium'}){
  if(!scene)return[];const visible=scene.widgets.filter(w=>w.enabled);const out=[]
  for(const widget of visible){
    const f=widget.frame
    if(f.x<70||f.y<40||f.x+f.width>scene.resolution.width-70||f.y+f.height>scene.resolution.height-40)out.push({id:`edge-${widget.id}`,widgetId:widget.id,severity:'warning',title:'Close to the output edge',message:`${widget.name} may crop on some displays.`,action:'centre',actionLabel:'Centre widget'})
    if((widget.type==='twitch-chat'||widget.type==='unified-chat')&&(f.width<380||f.height<360))out.push({id:`chat-${widget.id}`,widgetId:widget.id,severity:'warning',title:'Chat needs more room',message:'Increase the chat size for readable messages.',action:'resize-chat',actionLabel:'Resize chat'})
    if(preview.brightness==='bright'&&['#ffffff','#e5e7eb'].includes(String(widget.settings.color||'').toLowerCase()))out.push({id:`contrast-${widget.id}`,widgetId:widget.id,severity:'info',title:'Low preview contrast',message:`${widget.name} may be difficult to read over this bright preview.`,action:'contrast',actionLabel:'Increase contrast'})
  }
  for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){const a=visible[i],b=visible[j];const area=overlapArea(a.frame,b.frame);const smallest=Math.min(a.frame.width*a.frame.height,b.frame.width*b.frame.height);if(smallest&&area/smallest>.3){const target=a.zIndex<b.zIndex?a:b;out.push({id:`overlap-${a.id}-${b.id}`,widgetId:target.id,severity:'warning',title:'Widgets overlap',message:`${a.name} and ${b.name} cover the same important space.`,action:'move-clear',actionLabel:'Move lower layer'})}}
  if(visible.filter(w=>['alerts','achievement','upcoming-event'].includes(w.type)).length>2)out.push({id:'priority-density',severity:'info',title:'Busy alert scene',message:'More than two high-priority widgets may compete for attention.'})
  return out.slice(0,8)
}
import { createSceneSnapshot } from './overlaySnapshots.js'
export function applySuggestion(scene,suggestion){const next=createSceneSnapshot(scene);const w=next.widgets.find(x=>x.id===suggestion.widgetId);if(!w)return next
  if(suggestion.action==='centre'){w.frame.x=Math.round((next.resolution.width-w.frame.width)/2);w.frame.y=Math.max(60,w.frame.y)}
  if(suggestion.action==='resize-chat'){w.frame.width=Math.max(430,w.frame.width);w.frame.height=Math.max(520,w.frame.height);w.frame.x=Math.min(w.frame.x,next.resolution.width-w.frame.width);w.frame.y=Math.min(w.frame.y,next.resolution.height-w.frame.height)}
  if(suggestion.action==='contrast'){w.settings.background='#07111f';w.settings.opacity=1}
  if(suggestion.action==='move-clear'){w.frame.x=70;w.frame.y=Math.max(70,next.resolution.height-w.frame.height-70)}
  return next
}
