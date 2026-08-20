<template>
  <div class="creator-shell">
    <CreatorSidebar />
    <div class="creator-content">
      <header class="creator-mobile-header">
        <strong>Creator Tools</strong>
        <select aria-label="Creator Tools page" :value="activeMobileRouteName" @change="navigate">
          <optgroup v-for="group in creatorNavigation" :key="group.label" :label="group.label">
            <option v-for="key in mobileItems(group.items)" :key="key" :value="registry[key].routeName">{{ registry[key].label }}</option>
          </optgroup>
        </select>
      </header>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorSidebar from './CreatorSidebar.vue'
import { creatorFeatureRegistry as registry, creatorNavigation } from '../config/creatorFeatureRegistry.js'

const router = useRouter()
const route = useRoute()
const activeMobileRouteName = computed(() => registry[route.meta?.creatorFeature]?.routeName || route.name)
function mobileItems(items) { return items.filter((key) => registry[key].showInMobileNavigation !== false) }
function navigate(event) { router.push({ name: event.target.value }) }
</script>

<style>
.creator-shell { min-height:100vh; display:grid; grid-template-columns:270px minmax(0,1fr); color:#eef2ff; background:radial-gradient(circle at top left,rgba(124,58,237,.16),transparent 25%),linear-gradient(180deg,#0c1020,#12182b); }
.creator-sidebar { position:sticky; top:0; height:100vh; overflow:auto; padding:24px 18px; background:rgba(7,10,24,.92); border-right:1px solid rgba(255,255,255,.08); }
.creator-brand { display:flex; gap:12px; align-items:center; color:#fff; text-decoration:none; margin-bottom:26px; }
.creator-brand-mark { width:42px; height:42px; flex:0 0 42px; display:grid; place-items:center; }
.creator-brand-mark img { display:block; width:100%; height:100%; object-fit:contain; }
.creator-brand small,.creator-brand strong { display:block; }.creator-brand small { color:#94a3b8; font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; }
.creator-nav-group { margin:0 0 20px; }.creator-nav-group h2 { margin:0 0 7px; color:#64748b; font-size:.68rem; letter-spacing:.13em; text-transform:uppercase; }
.creator-nav-link { min-height:40px; padding:9px 10px; margin:2px 0; display:flex; gap:8px; justify-content:space-between; align-items:center; color:#cbd5e1; text-decoration:none; border-radius:10px; font-size:.9rem; }
.creator-nav-link:hover { color:#fff; background:rgba(255,255,255,.06); }.creator-nav-link.router-link-exact-active,.creator-nav-link.is-active { color:#fff; background:rgba(124,58,237,.28); }
.creator-nav-icon { display:inline-grid; place-items:center; width:20px; height:20px; margin-right:8px; color:#c4b5fd; vertical-align:middle; }
.creator-back-link { display:block; padding:10px; color:#94a3b8; text-decoration:none; font-size:.85rem; border-top:1px solid rgba(255,255,255,.08); }
.creator-content { min-width:0; }.creator-mobile-header { display:none; }
.creator-content > .bot-page,.creator-content > .tts-settings-container { grid-template-columns:minmax(0,1fr) !important; min-height:auto; background:transparent; }.creator-content > .bot-page > .bot-sidebar,.creator-content > .tts-settings-container > .bot-sidebar { display:none !important; }
@media (max-width: 900px) { .creator-shell { grid-template-columns:1fr; }.creator-sidebar { display:none; }.creator-mobile-header { display:flex; position:sticky; top:0; z-index:20; align-items:center; justify-content:space-between; gap:16px; padding:14px 18px; background:rgba(7,10,24,.96); border-bottom:1px solid rgba(255,255,255,.08); }.creator-mobile-header select { max-width:60%; padding:8px; color:#fff; background:#1e293b; border:1px solid #475569; border-radius:8px; } }
</style>
