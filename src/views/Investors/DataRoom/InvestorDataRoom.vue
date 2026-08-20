<template>
  <main class="data-room-page">
    <section class="data-room-hero">
      <div class="data-room-shell hero-topline">
        <div>
          <p class="data-room-eyebrow">Project Respawn · Investor Data Room</p>
          <h1>Continue your <span>review.</span></h1>
          <p class="hero-lede">Supporting materials for Project Respawn's £300,000 pre-seed raise. Documents are released progressively based on investor access level.</p>
        </div>

        <aside class="access-card">
          <div class="access-card-topline">
            <span class="access-dot" :class="accessLevelClass"></span>
            <div><small>YOUR ACCESS</small><strong>{{ accessLevelLabel }}</strong></div>
          </div>
          <div class="access-card-meta">
            <span><b>Round</b> £300k Pre-Seed</span>
            <span><b>Initial close</b> £250k target</span>
            <span><b>Updated</b> {{ lastUpdated }}</span>
          </div>
          <button v-if="currentAccessLevel !== 'DILIGENCE'" type="button" class="request-access-button" @click="requestHigherAccess">
            <span class="unlock-icon" aria-hidden="true">⌁</span> Request {{ nextAccessLabel }} access
          </button>
        </aside>
      </div>
    </section>

    <section class="data-room-body">
      <div class="data-room-shell data-room-layout">
        <aside class="room-index" aria-label="Investor data room index">
          <div class="room-index-panel">
            <div class="room-index-heading"><small>DATA ROOM</small><span>{{ accessibleDocumentCount }} available</span></div>
            <nav>
              <a v-for="(section, index) in roomSections" :key="section.key" :href="`#${section.key}`" :class="{ active: activeSection === section.key }" @click="activeSection = section.key">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ section.label }}
              </a>
            </nav>
            <a href="/investors" class="back-to-overview">← Investor overview</a>
          </div>
        </aside>

        <div class="room-content">
          <section class="welcome-panel">
            <div>
              <p class="section-kicker">Recommended review path</p>
              <h2>Start with the evidence behind the pitch.</h2>
              <p>The public overview explains the thesis. The data room moves from the financial model into product, commercial strategy, Creator Score and execution evidence.</p>
            </div>
            <ol class="review-path">
              <li v-for="(step, index) in reviewPath" :key="step"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ step }}</strong></li>
            </ol>
          </section>

          <section class="room-status-strip">
            <article><strong>{{ accessibleDocumentCount }}</strong><span>Available documents</span></article>
            <article><strong>{{ lockedDocumentCount }}</strong><span>Protected documents</span></article>
            <article><strong>{{ roomSections.length }}</strong><span>Diligence areas</span></article>
            <article><strong>{{ accessLevelLabel }}</strong><span>Current disclosure tier</span></article>
          </section>

          <section v-for="section in roomSections" :id="section.key" :key="section.key" class="room-section data-room-anchor">
            <header class="room-section-heading">
              <div><p class="section-kicker">{{ section.kicker }}</p><h2>{{ section.label }}</h2><p>{{ section.description }}</p></div>
              <div class="section-counts"><span>{{ accessibleDocs(section).length }} available</span><span v-if="lockedDocs(section).length">{{ lockedDocs(section).length }} protected</span></div>
            </header>

            <div v-if="accessibleDocs(section).length" class="document-grid">
              <article v-for="document in accessibleDocs(section)" :key="document.key" class="document-card">
                <div class="document-topline">
                  <span class="document-type">{{ document.type }}</span>
                  <span class="access-badge" :class="`access-${document.access.toLowerCase().replace('_', '-')}`">{{ accessLabel(document.access) }}</span>
                </div>
                <div class="document-copy"><h3>{{ document.title }}</h3><p>{{ document.description }}</p></div>
                <div class="document-footer">
                  <div><small>Version {{ document.version }}</small><span>{{ document.updated }}</span></div>
                  <button type="button" class="open-document-button" @click="openDocument(document)">Open <span aria-hidden="true">↗</span></button>
                </div>
              </article>
            </div>

            <div v-else class="empty-access-state">
              <span class="empty-lock" aria-hidden="true">⌁</span>
              <div><strong>No documents in this section are available at your current access level.</strong><p>Protected material remains hidden until the relevant investor access has been approved.</p></div>
            </div>

            <button v-if="lockedDocs(section).length" type="button" class="locked-material-row" @click="requestSectionAccess(section)">
              <span class="locked-icon-wrap" aria-hidden="true"><span class="unlock-icon">⌁</span></span>
              <span class="locked-material-copy">
                <strong>{{ lockedDocs(section).length }} additional {{ lockedDocs(section).length === 1 ? 'document' : 'documents' }} protected</strong>
                <small>Sensitive document names and contents are hidden until {{ requiredSectionAccess(section) }} access is approved.</small>
              </span>
              <span class="locked-action">Request unlock <span aria-hidden="true">→</span></span>
            </button>
          </section>

          <section class="data-room-guidance">
            <div><p class="section-kicker">Disclosure model</p><h2>Progressive access, not a public file dump.</h2></div>
            <div class="access-tier-grid">
              <article v-for="tier in accessTiers" :key="tier.key" :class="{ current: tier.key === currentAccessLevel }">
                <span>{{ tier.number }}</span><small>{{ tier.label }}</small><h3>{{ tier.title }}</h3><p>{{ tier.description }}</p>
              </article>
            </div>
          </section>

          <section class="data-room-footer-cta">
            <div><p class="section-kicker">Need something specific?</p><h2>Request additional investor access.</h2><p>Access is granted to individual Project Respawn accounts. Include the email address used to sign in so the correct account can be approved.</p></div>
            <button type="button" class="primary-room-cta" @click="requestHigherAccess">Request investor access</button>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { accessTiers, reviewPath, roomSections } from './investorDataRoom.js';

const ACCESS_RANK = { PRE_NDA: 1, NDA: 2, DILIGENCE: 3 };

export default {
  name: 'InvestorDataRoom',
  data() {
    return {
      accessTiers,
      reviewPath,
      roomSections,
      // Demo only. Backend must replace this with InvestorAccess.accessLevel.
      currentAccessLevel: 'PRE_NDA',
      activeSection: 'financials',
      lastUpdated: '20 August 2026',
      sectionObserver: null
    };
  },
  computed: {
    accessLevelLabel() { return this.accessLabel(this.currentAccessLevel); },
    accessLevelClass() { return `access-dot-${this.currentAccessLevel.toLowerCase().replace('_', '-')}`; },
    accessibleDocumentCount() { return this.roomSections.reduce((t, s) => t + this.accessibleDocs(s).length, 0); },
    lockedDocumentCount() { return this.roomSections.reduce((t, s) => t + this.lockedDocs(s).length, 0); },
    nextAccessLabel() { return this.currentAccessLevel === 'PRE_NDA' ? 'NDA' : this.currentAccessLevel === 'NDA' ? 'Diligence' : 'Investor'; }
  },
  mounted() { this.setupSectionObserver(); },
  beforeUnmount() { if (this.sectionObserver) this.sectionObserver.disconnect(); },
  methods: {
    accessLabel(access) { return { PRE_NDA: 'Pre-NDA', NDA: 'NDA', DILIGENCE: 'Diligence' }[access] || access; },
    canAccess(required) { return ACCESS_RANK[this.currentAccessLevel] >= ACCESS_RANK[required]; },
    accessibleDocs(section) { return section.documents.filter(d => this.canAccess(d.access)); },
    lockedDocs(section) { return section.documents.filter(d => !this.canAccess(d.access)); },
    requiredSectionAccess(section) { return this.lockedDocs(section).some(d => d.access === 'NDA') ? 'NDA' : 'Diligence'; },
    openDocument(document) {
      if (document.href) { window.location.href = document.href; return; }
      window.alert(`${document.title}\n\nFrontend demo only. Production will request a short-lived secure document URL from the backend.`);
    },
    requestSectionAccess(section) { this.openAccessEmail(section.label, this.requiredSectionAccess(section)); },
    requestHigherAccess() { this.openAccessEmail('Investor Data Room', this.nextAccessLabel); },
    openAccessEmail(area, level) {
      const subject = encodeURIComponent(`Project Respawn | ${level} Investor Data Room Access`);
      const body = encodeURIComponent(`Hello Nicholas,\n\nI would like to request additional access to the Project Respawn Investor Data Room.\n\nACCESS REQUESTED\n${level}\n\nAREA OF INTEREST\n${area}\n\nINVESTOR DETAILS\n\nName:\nCompany / Fund:\nRole:\nWork Email:\n\nPROJECT RESPAWN ACCOUNT\n\nEmail used to sign in to Project Respawn:\n\nADDITIONAL MESSAGE\n\nPlease add any specific questions or diligence requirements here.\n\nKind regards,\n`);
      window.location.href = `mailto:n.grefsheim@projectrespawn.com?subject=${subject}&body=${body}`;
    },
    setupSectionObserver() {
      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
      const sections = this.roomSections.map(s => document.getElementById(s.key)).filter(Boolean);
      this.sectionObserver = new IntersectionObserver(entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) this.activeSection = visible[0].target.id;
      }, { rootMargin: '-22% 0px -62% 0px', threshold: [0.01, 0.15, 0.35] });
      sections.forEach(s => this.sectionObserver.observe(s));
    }
  }
};
</script>

<style scoped src="./InvestorDataRoom.css"></style>
