<template>
  <main class="showcase-page">
    <section class="showcase-hero">
      <div class="showcase-shell">
        <p class="showcase-kicker">Community · Partners</p>
        <h1>The organisations helping Project Respawn grow.</h1>
        <p class="showcase-lead">
          This page will showcase confirmed commercial, technology, research,
          esports and community relationships as Project Respawn develops.
        </p>
      </div>
    </section>

    <section class="showcase-section">
      <div class="showcase-shell">
        <div v-if="visiblePartners.length" class="showcase-grid">
          <article
            v-for="partner in visiblePartners"
            :key="partner.id"
            class="showcase-card partner-card"
          >
            <div class="partner-logo-wrap">
              <img
                v-if="partner.logo"
                :src="partner.logo"
                :alt="`${partner.name} logo`"
                class="partner-logo"
              >
              <span v-else class="partner-fallback">{{ partner.name }}</span>

              <span v-if="partner.featured" class="featured-badge">Featured</span>
            </div>

            <div class="showcase-card-body">
              <div class="showcase-card-heading">
                <div>
                  <h2>{{ partner.name }}</h2>
                  <p>{{ partner.category }}</p>
                </div>
                <span v-if="partner.relationship" class="status-pill">
                  {{ partner.relationship }}
                </span>
              </div>

              <p class="showcase-description">{{ partner.description }}</p>

              <div v-if="partner.tags?.length" class="tag-row">
                <span v-for="tag in partner.tags" :key="tag">{{ tag }}</span>
              </div>

              <div class="showcase-links">
                <a
                  v-if="partner.website"
                  :href="partner.website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit website
                </a>
              </div>
            </div>
          </article>
        </div>

        <section v-else class="empty-state">
          <span class="empty-icon">↗</span>
          <h2>Our partner network is being built.</h2>
          <p>
            We will only list organisations here when there is a confirmed relationship
            and we are comfortable describing that relationship publicly.
          </p>
          <router-link to="/contact" class="primary-cta">
            Talk to Project Respawn
          </router-link>
        </section>

        <section class="partner-principles">
          <div>
            <p class="showcase-kicker">What belongs here</p>
            <h2>Partnership means more than a logo.</h2>
          </div>

          <div class="partner-principle-grid">
            <article>
              <strong>Commercial & brand</strong>
              <p>Campaigns, sponsorships or other confirmed commercial collaborations.</p>
            </article>
            <article>
              <strong>Technology</strong>
              <p>Organisations with a genuine integration, supplier or technology relationship.</p>
            </article>
            <article>
              <strong>Research & impact</strong>
              <p>Universities, researchers, charities or organisations supporting evidence and social impact.</p>
            </article>
            <article>
              <strong>Esports & community</strong>
              <p>Teams, events, leagues and communities formally working with Project Respawn.</p>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script src="./Partners.js"></script>
<style scoped src="./Partners.css"></style>
