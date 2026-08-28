<template>
  <div class="chat-widget" :class="[`align-${chat.layout.alignment}`, `animation-${chat.behaviour.messageAnimation}`, { smooth: chat.behaviour.smoothScrolling }]" :style="containerStyle" @mouseenter="paused=true" @mouseleave="paused=false">
    <div class="chat-lines" :style="linesStyle">
      <article v-for="message in visible" :key="message.id" class="chat-line" :class="{ mention: message.isMention && chat.content.highlightMentions, system: message.isSystem }" :style="messageStyle">
        <span v-if="chat.content.showTimestamps && chat.layout.timestampPosition==='left'" class="timestamp" :style="supportStyle">{{ message.timestamp }}</span>
        <span v-if="chat.content.showPlatformIndicator" class="platform" :class="message.platform">{{ platformIcon(message.platform) }}</span>
        <span v-if="chat.content.showBadges && message.badges.length" class="badges" :class="`badges-${chat.layout.avatarBadgePosition}`">{{ message.badges.join(' ') }}</span>
        <strong v-if="chat.content.showUsername" :style="usernameStyle(message)">{{ message.user }}</strong>
        <span class="message" :style="messageTextStyle(message)">{{ displayText(message.text) }}</span>
        <span v-if="chat.content.showTimestamps && chat.layout.timestampPosition==='right'" class="timestamp" :style="supportStyle">{{ message.timestamp }}</span>
      </article>
    </div>
    <footer v-if="runtimeMode !== 'browser-source'">Canonical Chat preview</footer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useWidgetEvents } from '../../widgetHelpers.js'
import { normalizeCreatorChatConfig } from '../../../views/chat/chat.config.js'

const props = defineProps({ widget:{type:Object,required:true}, runtimeMode:{type:String,default:'editor-preview'}, runtimeConfig:{type:Object,default:null} })
const previewMessages = [{id:1,platform:'twitch',user:'PixelPioneer',badges:['◆'],text:'gg!',timestamp:'12:45:01'},{id:2,platform:'youtube',user:'NexusKnight',badges:['▶'],text:'that play 🔥',timestamp:'12:45:04'},{id:3,platform:'kick',user:'StreamBel',badges:[],text:'join our Discord!',timestamp:'12:45:07'},{id:4,platform:'twitch',user:'Moonlight',badges:['★'],text:'nice stream!',timestamp:'12:45:10'}]
const messages = ref(props.runtimeMode==='browser-source'?[]:previewMessages)
const paused = ref(false)
const timers = new Set()
const event = useWidgetEvents(props.widget, props.runtimeMode === 'browser-source' ? null : { id:'initial', actor:{displayName:''}, payload:{text:''} })

function legacyConfig() {
  const value = props.widget.settings || {}
  return { enabled:true, maxMessages:value.maxMessages, platforms:String(value.platforms||'Twitch,YouTube,Kick,Discord').split(','), content:{ showUsername:value.showUsername, showBadges:value.showBadges, showEmotes:value.showEmotes, hideBotMessages:value.hideBotMessages, hideCommandMessages:value.hideCommands, messageDisplayDuration:value.messageDuration }, behaviour:{ messageDirection:value.direction==='down'?'bottom-to-top':'top-to-bottom', messageAnimation:value.animation }, appearance:{container:{backgroundColor:value.background,opacity:value.backgroundOpacity,borderRadius:value.cornerRadius}}, typography:{messageSize:value.fontSize} }
}
const chat = computed(() => normalizeCreatorChatConfig(props.runtimeConfig?.chat || legacyConfig()))
const enabledSources = computed(() => new Set(Object.entries(chat.value.sources).filter(([, source]) => source.enabled).map(([id]) => id)))
const visible = computed(() => {
  if (chat.value.enabled === false) return []
  let list = messages.value.filter((message) => enabledSources.value.has(message.platform))
  if (chat.value.content.hideBotMessages) list = list.filter((message) => !message.isBot)
  if (chat.value.content.hideCommandMessages) list = list.filter((message) => !message.text.trim().startsWith('!'))
  list = list.slice(-chat.value.content.maximumVisibleMessages)
  return chat.value.behaviour.messageDirection === 'bottom-to-top' ? [...list].reverse() : list
})

watch(event, (next) => {
  if (!next || !next.payload?.text) return
  const blocked = chat.value.blockedTerms || [], text = String(next.payload.text)
  if (blocked.some((term) => text.toLowerCase().includes(String(term).toLowerCase()))) return
  const item = { id:next.id, platform:String(next.payload.platform||'twitch').toLowerCase(), user:next.actor?.displayName||'Viewer', badges:Array.isArray(next.payload.badges)?next.payload.badges:[], text, timestamp:next.payload.timestamp||new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), isBot:next.payload.isBot===true, isMention:next.payload.isMention===true, isSystem:next.payload.isSystem===true, usernameColor:next.payload.usernameColor }
  messages.value.push(item)
  const timer = setTimeout(() => { if (!paused.value || !chat.value.behaviour.pauseOnHover) messages.value = messages.value.filter((message) => message.id !== item.id); timers.delete(timer) }, chat.value.behaviour.messageLifetime * 1000)
  timers.add(timer)
}, { deep:true })
onBeforeUnmount(() => timers.forEach(clearTimeout))

const hexAlpha = (hex, alpha) => /^#[0-9a-f]{6}$/i.test(hex||'') ? `${hex}${Math.round(alpha*255).toString(16).padStart(2,'0')}` : hex
const containerStyle = computed(() => { const c=chat.value.appearance.container,l=chat.value.layout; return { width:l.width==='compact'?'65%':l.width==='medium'?'82%':'100%', marginLeft:l.alignment==='right'?'auto':l.alignment==='center'?'auto':'0', marginRight:l.alignment==='center'?'auto':'0', padding:`${c.padding}px`, borderRadius:`${c.borderRadius}px`, background:c.backgroundType==='none'?'transparent':hexAlpha(c.backgroundColor,c.opacity), border:c.borderEnabled?`1px solid ${c.borderColor}`:'none', backdropFilter:c.backgroundType==='glass'?`blur(${c.blur}px)`:'none', overflow:'hidden' } })
const linesStyle = computed(() => ({ display:'flex',flexDirection:'column',gap:`${chat.value.behaviour.messageSpacing}px`,height:'100%',justifyContent:chat.value.behaviour.autoScroll?'flex-end':'flex-start' }))
const messageStyle = computed(() => { const m=chat.value.appearance.message,l=chat.value.layout,b=chat.value.behaviour; const speed={slow:0.8,normal:0.4,fast:0.2}[b.animationSpeed]||0.4; return { display:'flex',alignItems:'center',gap:'6px',padding:`${m.verticalPadding}px ${m.horizontalPadding}px`,borderRadius:`${m.borderRadius}px`,background:m.backgroundType==='none'?'transparent':hexAlpha(m.backgroundColor,m.opacity),borderBottom:l.showMessageSeparators?`1px ${l.separatorStyle} ${l.separatorColor}`:'none',textAlign:l.alignment,animationDuration:`${speed}s`,transitionDuration:`${b.fadeDuration}s` } })
const messageTextStyle = (message) => ({ color:message.isSystem?chat.value.typography.systemMessageColor:chat.value.typography.messageColor,fontFamily:chat.value.typography.messageFont,fontWeight:chat.value.typography.messageWeight,fontSize:`${chat.value.typography.messageSize}px`,textShadow:chat.value.typography.textShadow?'0 1px 4px rgba(0,0,0,.75)':'none' })
const usernameStyle = (message) => ({ color:message.usernameColor||chat.value.typography.usernameColor,fontFamily:chat.value.typography.usernameFont,fontWeight:chat.value.typography.usernameWeight,fontSize:`${chat.value.typography.usernameSize}px`,textShadow:chat.value.typography.textShadow?'0 1px 4px rgba(0,0,0,.75)':'none' })
const supportStyle = computed(() => ({ color:chat.value.typography.timestampColor }))
const platformIcon = (platform) => ({twitch:'T',youtube:'▶',tiktok:'♪',discord:'D',kick:'K'}[platform]||'•')
const displayText = (text) => chat.value.content.showEmotes ? text : String(text).replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
</script>

<style scoped>
.chat-widget{box-sizing:border-box;height:100%;color:#fff}.chat-line{width:100%;box-sizing:border-box;overflow-wrap:anywhere}.chat-line.mention{outline:1px solid rgba(139,92,246,.5)}.platform{display:inline-grid;width:20px;height:20px;flex:none;place-items:center;border-radius:4px;background:#9146ff;font-size:10px;font-weight:800}.platform.youtube{background:#dc2626}.platform.kick{color:#111;background:#53fc18}.platform.discord{background:#5865f2}.badges-right{order:5}.timestamp{font-size:10px}.message{min-width:0}.animation-fade .chat-line{animation:chat-fade both}.animation-slide .chat-line{animation:chat-slide both}.smooth .chat-lines{scroll-behavior:smooth}@keyframes chat-fade{from{opacity:0}to{opacity:1}}@keyframes chat-slide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.chat-widget footer{margin-top:8px;color:#94a3b8;font-size:10px}
</style>
