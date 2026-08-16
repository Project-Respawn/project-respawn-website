<template>
  <main class="creator-dashboard">
    <header class="dashboard-header"><div><h1>Creator Dashboard</h1><p>Welcome to Creator Tools! Let's build your community.</p></div></header>

    <div class="dashboard-layout">
      <div class="dashboard-main">
        <section class="metric-grid" aria-label="Community overview">
          <CreatorDashboardCard v-for="card in metricCards" :key="card.key" :card="card" metric @activate="activateCard" />
        </section>

        <section class="preview-grid">
          <CreatorDashboardCard :card="cardByKey.activity" class="preview-card preview-card--wide" @activate="activateCard">
            <template v-if="cardByKey.activity.state==='active'"><div class="activity-chart" aria-label="Community activity trend over the last nineteen days"><svg viewBox="0 0 380 120" role="img" aria-label="Activity is trending upward"><defs><linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5cf6" stop-opacity=".35"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></linearGradient></defs><polygon :points="chartArea" fill="url(#activityFill)"/><polyline :points="chartLine" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg><div><strong>2,846 interactions</strong><span>+18% over the previous period</span></div></div><span class="dashboard-card__action">View analytics <b>→</b></span></template>
          </CreatorDashboardCard>
          <CreatorDashboardCard :card="cardByKey.recent" class="preview-card" @activate="activateCard">
            <template v-if="cardByKey.recent.state==='active'"><ul class="activity-feed"><li v-for="item in recentActivity" :key="item.text"><span aria-hidden="true">◆</span><span><strong>{{ item.text }}</strong><small>{{ item.time }}</small></span></li></ul><span class="dashboard-card__action">View community <b>→</b></span></template>
          </CreatorDashboardCard>
          <CreatorDashboardCard :card="cardByKey.events" class="preview-card" @activate="activateCard">
            <template v-if="cardByKey.events.state==='active'"><ul class="event-list"><li v-for="event in upcomingEvents" :key="event.title"><span class="event-date">{{ event.date.split(' ')[0] }}</span><span><strong>{{ event.title }}</strong><small>{{ event.date }} · {{ event.attending }}</small></span></li></ul><span class="dashboard-card__action">View events <b>→</b></span></template>
          </CreatorDashboardCard>
        </section>

        <section class="feature-grid" aria-label="Creator features"><CreatorDashboardCard v-for="card in featureCards" :key="card.key" :card="card" @activate="activateCard"><template v-if="card.state==='active'"><div class="feature-active"><strong>{{ activeCopy[card.key].value }}</strong><span>{{ activeCopy[card.key].detail }}</span></div><span class="dashboard-card__action">Open {{ card.title }} <b>→</b></span></template></CreatorDashboardCard></section>

        <section class="platforms-panel dashboard-panel" aria-labelledby="platforms-title"><header class="panel-heading"><div><h2 id="platforms-title">Connected Platforms</h2><span>Simulated connection status</span></div><CreatorInfoPopover text="Review the platforms that can contribute to your wider creator community." /></header><div class="platform-grid"><CreatorPlatformStatus v-for="platform in platforms" :key="platform.key" :platform="platform" :connected="platform.step ? isComplete(state,platform.step) : state.preset==='full'" @activate="openPlatform" /></div><button class="creator-button creator-button--outline" type="button" @click="router.push({name:'CreatorIntegrations'})">Manage Integrations</button></section>
      </div>

      <aside class="dashboard-rail"><CreatorDemoControls :presets="presets" :current="state.preset" :progress="completion" @select="setPreset" @reset="resetDemo"/><CreatorSetupChecklist :steps="setupSteps" :state="state" :progress="completion" @complete="completeStep"/></aside>
    </div>

    <footer class="demo-banner"><strong>DEMO MODE</strong><span>This is a simulated Creator Tools experience. No real connections are being made.</span><button type="button" @click="router.push({name:'CreatorSetup'})">View Setup Guide →</button></footer>
    <CreatorLockedModal :card="lockedCard" @close="lockedCard=null" @complete="completeFromModal" />
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'; import { useRouter } from 'vue-router'
import CreatorDashboardCard from '../../components/dashboard/CreatorDashboardCard.vue'; import CreatorDemoControls from '../../components/dashboard/CreatorDemoControls.vue'; import CreatorInfoPopover from '../../components/dashboard/CreatorInfoPopover.vue'; import CreatorLockedModal from '../../components/dashboard/CreatorLockedModal.vue'; import CreatorPlatformStatus from '../../components/dashboard/CreatorPlatformStatus.vue'; import CreatorSetupChecklist from '../../components/dashboard/CreatorSetupChecklist.vue'
import { activityPoints, createDemoState, dashboardCards, isComplete, platforms, presets, progress, recentActivity, resolveCard, setupSteps, upcomingEvents } from './creatorDashboardDemoState.js'

const router=useRouter(); const state=reactive(createDemoState()); const lockedCard=ref(null)
const resolvedCards=computed(()=>dashboardCards.map(card=>resolveCard(card,state)));const cardByKey=computed(()=>Object.fromEntries(resolvedCards.value.map(card=>[card.key,card])));const metricCards=computed(()=>resolvedCards.value.slice(0,4));const featureCards=computed(()=>resolvedCards.value.slice(7));const completion=computed(()=>progress(state))
const activeCopy={rewards:{value:'6 active rewards',detail:'128 redemptions this month'},achievements:{value:'12 achievements',detail:'436 unlocks this month'},bots:{value:'Respawn Bot online',detail:'18 automations running'},analytics:{value:'+18% engagement',detail:'Across 3 simulated platforms'}}
const chartLine=computed(()=>activityPoints.map((value,index)=>`${index*(380/(activityPoints.length-1))},${112-value*1.75}`).join(' '));const chartArea=computed(()=>`0,120 ${chartLine.value} 380,120`)
function setPreset(key){Object.assign(state,createDemoState(key));lockedCard.value=null}function resetDemo(){setPreset('fresh')}
function completeStep(id){if(!id||isComplete(state,id))return;const step=setupSteps.find(item=>item.id===id);if(step.requires.some(parent=>!isComplete(state,parent)))return;state.completed.push(id);state.preset='custom'}
function activateCard(card){if(card.state==='locked'){lockedCard.value=card;return}router.push({name:card.routeName})}
function completeFromModal(id){completeStep(id);lockedCard.value=null}
function openPlatform(platform){router.push({name:platform.routeName})}
</script>
<style src="./CreatorDashboard.css"></style>
