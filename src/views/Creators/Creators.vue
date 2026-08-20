<template>
  <main class="showcase-page">
    <section class="showcase-hero">
      <div class="showcase-shell">
        <p class="showcase-kicker">Community · Creators</p>
        <h1>Meet the creators building with Project Respawn.</h1>
        <p class="showcase-lead">
          Project Respawn is designed to grow alongside creators and their communities.
          This page will showcase participating creators who choose to be publicly listed.
        </p>
      </div>
    </section>

    <section class="showcase-section">
      <div class="showcase-shell">
        <div v-if="visibleCreators.length" class="showcase-grid">
          <article
            v-for="creator in visibleCreators"
            :key="creator.id"
            class="showcase-card creator-card"
          >
            <div class="creator-image-wrap">
              <img
                v-if="creator.image"
                :src="creator.image"
                :alt="`${creator.name} profile`"
                class="creator-image"
              >
              <div v-else class="creator-fallback" aria-hidden="true">
                {{ creatorInitials(creator.name) }}
              </div>

              <span v-if="creator.featured" class="featured-badge">Featured</span>
            </div>

            <div class="showcase-card-body">
              <div class="showcase-card-heading">
                <div>
                  <h2>{{ creator.name }}</h2>
                  <p>{{ creator.headline }}</p>
                </div>

                <span v-if="creator.status" class="status-pill">
                  {{ creator.status }}
                </span>
              </div>

              <p class="showcase-description">{{ creator.description }}</p>

              <div v-if="creator.tags?.length" class="tag-row">
                <span v-for="tag in creator.tags" :key="tag">{{ tag }}</span>
              </div>

              <div class="showcase-links">
                <a
                  v-if="creator.twitch"
                  :href="creator.twitch"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitch
                </a>
                <a
                  v-if="creator.youtube"
                  :href="creator.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
                <a
                  v-if="creator.website"
                  :href="creator.website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              </div>
            </div>
          </article>
        </div>

        <section v-else class="empty-state">
          <span class="empty-icon">◉</span>
          <h2>Founding creators coming soon.</h2>
          <p>
            We are currently building our first creator relationships. As creators join
            Project Respawn and opt into public discovery, they will appear here.
          </p>
          <router-link :to="{ path: '/join-us', hash: '#how-it-works' }" class="primary-cta">
            Explore the Creator Programme
          </router-link>
        </section>
      </div>
    </section>

    <section class="showcase-cta">
      <div class="showcase-shell showcase-cta-grid">
        <div>
          <p class="showcase-kicker">For creators</p>
          <h2>Want your community to help shape Project Respawn?</h2>
        </div>
        <router-link :to="{ path: '/join-us', hash: '#how-it-works' }" class="secondary-cta">
          See how it works
        </router-link>
      </div>
    </section>
  </main>
</template>

<script src="./Creators.js"></script>
<style scoped src="./Creators.css"></style>
