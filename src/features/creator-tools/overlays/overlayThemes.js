export const overlayThemes = Object.freeze({
  'respawn-purple': Object.freeze({ id:'respawn-purple',name:'Respawn Purple',primary:'#8b5cf6',accent:'#ec4899',background:'#0b1020',surface:'rgba(17,24,39,.92)',border:'1px solid rgba(167,139,250,.7)',font:'Inter, ui-sans-serif, system-ui',radius:18,shadow:'0 0 28px rgba(139,92,246,.28)',alertAnimation:'slide' }),
  'neon-cyan': Object.freeze({ id:'neon-cyan',name:'Neon Cyan',primary:'#22d3ee',accent:'#34d399',background:'#06151d',surface:'rgba(5,28,37,.92)',border:'1px solid rgba(34,211,238,.72)',font:'Inter, ui-sans-serif, system-ui',radius:8,shadow:'0 0 30px rgba(34,211,238,.3)',alertAnimation:'fade' }),
  'minimal-dark': Object.freeze({ id:'minimal-dark',name:'Minimal Dark',primary:'#e5e7eb',accent:'#94a3b8',background:'#090b10',surface:'rgba(17,18,23,.94)',border:'1px solid rgba(255,255,255,.2)',font:'Inter, ui-sans-serif, system-ui',radius:4,shadow:'0 12px 30px rgba(0,0,0,.35)',alertAnimation:'fade' }),
})
export function resolveTheme(id){return overlayThemes[id]||overlayThemes['respawn-purple']}
export function themeVariables(id){const t=resolveTheme(id);return{'--overlay-primary':t.primary,'--overlay-accent':t.accent,'--overlay-surface':t.surface,'--overlay-border':t.border,'--overlay-radius':`${t.radius}px`,'--overlay-shadow':t.shadow,'--overlay-font':t.font}}
