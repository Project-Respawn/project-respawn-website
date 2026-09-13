<template>
  <main class="about-page">
    <section class="about-hero">
      <div class="about-shell about-hero-grid">
        <div class="about-hero-copy">
          <div class="about-brand">
            <img :src="respawnLogo" alt="" aria-hidden="true">
            <span>PROJECT RESPAWN</span>
          </div>
          <p class="about-kicker">{{ activeTabMeta.kicker }}</p>
          <h1>Your past is just the tutorial.<br><span>Your real game starts now.</span></h1>
          <p class="about-lead">{{ activeTabMeta.lead }}</p>
          <div class="about-actions">
            <router-link v-if="activeTabMeta.primary" class="about-primary" :to="activeTabMeta.primary.to">
              {{ activeTabMeta.primary.label }}
            </router-link>
            <router-link v-if="activeTabMeta.secondary" class="about-secondary" :to="activeTabMeta.secondary.to">
              {{ activeTabMeta.secondary.label }}
            </router-link>
          </div>
        </div>
        <aside class="about-hero-card">
          <span class="about-status">{{ activeTabMeta.cardLabel }}</span>
          <h2>{{ activeTabMeta.cardTitle }}</h2>
          <p>{{ activeTabMeta.cardCopy }}</p>
          <div class="about-hero-path">
            <span>{{ activeTabMeta.path[0] }}</span><b>→</b>
            <span>{{ activeTabMeta.path[1] }}</span><b>→</b>
            <span>{{ activeTabMeta.path[2] }}</span>
          </div>
        </aside>
      </div>
    </section>

    <nav class="about-tabs-wrap" aria-label="About Project Respawn">
      <div class="about-shell about-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="about-tab"
          :class="{ 'is-active': activeTab === tab.id }"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="selectTab(tab.id)"
        >
          <span class="about-tab-icon" aria-hidden="true">{{ tab.icon }}</span>
          <span class="about-tab-label">{{ tab.label }}</span>
          <span class="about-tab-short">{{ tab.shortLabel || tab.label }}</span>
        </button>
      </div>
    </nav>

    <component :is="activeComponent" />

    <section class="about-final-cta">
      <div class="about-shell about-final-grid">
        <div>
          <p class="about-kicker">Choose your path</p>
          <h2>Use Project Respawn, build with it or help shape what comes next.</h2>
        </div>
        <div class="about-final-actions">
          <router-link class="about-primary" :to="{ path: '/join-us', hash: '#how-it-works' }">
            Join Project Respawn
          </router-link>
          <router-link class="about-secondary" to="/careers">Help build Project Respawn</router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script src="./About.js"></script>
<style src="./About.css"></style>
