<template>
  <main class="about-page">
    <section class="about-hero">
      <div class="about-shell about-hero-grid">
        <div class="about-hero-copy">
          <div class="about-brand">
            <img :src="respawnLogo" alt="" aria-hidden="true">
            <span>PROJECT RESPAWN</span>
          </div>

          <p class="about-kicker">About us</p>
          <h1>Your past is just the tutorial.<br><span>Your real game starts now.</span></h1>

          <p class="about-lead">
            Project Respawn is building a gaming and creator ecosystem designed to help people
            connect, participate and build confidence through communities they already care about.
          </p>

          <div class="about-actions">
            <router-link
              class="about-primary"
              :to="{ path: '/join-us', hash: '#how-it-works' }"
            >
              For creators
            </router-link>

            <router-link class="about-secondary" to="/careers">
              Help build Project Respawn
            </router-link>
          </div>
        </div>

        <aside class="about-hero-card">
          <span class="about-status">THE MISSION</span>
          <h2>Gaming can be more than entertainment.</h2>
          <p>
            We believe the right communities can make participation feel safer, give people
            reasons to take small social steps and create momentum that carries beyond the screen.
          </p>

          <div class="about-hero-path">
            <span>Find a community</span>
            <b>→</b>
            <span>Take part</span>
            <b>→</b>
            <span>Build confidence</span>
          </div>
        </aside>
      </div>
    </section>

    <section class="about-section">
      <div class="about-shell">
        <header class="about-section-heading">
          <p class="about-kicker">Why Project Respawn exists</p>
          <h2>Being online all the time has not made connecting easier for everyone.</h2>
          <p>
            Many people love gaming and online communities but still find joining conversations,
            meeting new people, recovering from awkward moments or taking the first step into a
            group difficult. Project Respawn is being designed around lowering that barrier.
          </p>
        </header>

        <div class="about-problem-grid">
          <article>
            <span>01</span>
            <h3>Starting is hard</h3>
            <p>Joining a group or speaking for the first time can feel much bigger than it looks from the outside.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Progress is invisible</h3>
            <p>Small social wins are easy to dismiss even though repeating them can be what builds confidence.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Communities are fragmented</h3>
            <p>Creators and members are spread across streams, Discord servers, games and separate tools.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Support should feel natural</h3>
            <p>Not everyone wants a clinical experience. Sometimes the first useful step is simply taking part with people who share your interests.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="about-section about-section-deep">
      <div class="about-shell">
        <header class="about-section-heading">
          <p class="about-kicker">How it is meant to help</p>
          <h2>Confidence grows through participation, not pressure.</h2>
        </header>

        <div class="about-journey">
          <article v-for="step in journey" :key="step.number">
            <span>{{ step.number }}</span>
            <strong>{{ step.title }}</strong>
            <p>{{ step.copy }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="about-section">
      <div class="about-shell about-split">
        <div>
          <p class="about-kicker">Creators are part of the solution</p>
          <h2>Creators already have communities people trust.</h2>
          <p class="about-body-copy">
            Instead of asking people to abandon the communities they already know, Project Respawn
            aims to work with creators and give them connected tools for Twitch, Discord, events,
            rewards, overlays, members and analytics.
          </p>
          <p class="about-body-copy">
            The creator tools are not separate from the confidence mission. They are one of the
            ways Project Respawn can help more communities become structured, welcoming places
            where people have reasons to participate.
          </p>

          <router-link
            class="about-inline-link"
            :to="{ path: '/join-us', hash: '#how-it-works' }"
          >
            See how Project Respawn works for creators →
          </router-link>
        </div>

        <div class="about-tool-grid">
          <article v-for="tool in creatorTools" :key="tool.title">
            <span>{{ tool.icon }}</span>
            <strong>{{ tool.title }}</strong>
            <small>{{ tool.copy }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="about-section about-score-section">
      <div class="about-shell">
        <header class="about-section-heading">
          <p class="about-kicker">Creator Score</p>
          <h2>Followers tell you audience size. We want to understand community strength.</h2>
          <p>
            Creator Score is a proposed intelligence layer designed to help creators understand
            how their community is developing and receive more useful recommendations than raw
            follower or view counts can provide.
          </p>
        </header>

        <div class="about-score-flow">
          <div class="about-score-inputs">
            <span>Participation</span>
            <span>Retention</span>
            <span>Growth</span>
            <span>Engagement</span>
            <span>Community activity</span>
            <span>Respawn activity</span>
          </div>

          <div class="about-score-core">
            <small>PROPOSED INTELLIGENCE LAYER</small>
            <strong>CREATOR<br>SCORE</strong>
          </div>

          <div class="about-score-outputs">
            <article>
              <strong>Understand</strong>
              <p>Identify patterns in how a community is growing and participating.</p>
            </article>
            <article>
              <strong>Recommend</strong>
              <p>Give creators private, practical ideas for strengthening engagement.</p>
            </article>
            <article>
              <strong>Learn</strong>
              <p>Measure what happens after a creator acts on a recommendation and improve over time.</p>
            </article>
          </div>
        </div>

        <div class="about-feedback-loop">
          <span v-for="(step, index) in feedbackLoop" :key="step">
            {{ step }}<b v-if="index < feedbackLoop.length - 1">→</b>
          </span>
        </div>

        <div class="about-score-note">
          <strong>Creator Score is not intended to be a popularity ranking.</strong>
          <p>
            It is not meant to publicly judge whether someone is a “good creator”, sell private
            creator analytics or replace human judgement. The methodology still needs real-world
            validation and should evolve with evidence.
          </p>
        </div>
      </div>
    </section>

    <section class="about-section about-section-deep">
      <div class="about-shell">
        <header class="about-section-heading">
          <p class="about-kicker">What makes Respawn different</p>
          <h2>One ecosystem, several connected layers.</h2>
        </header>

        <div class="about-difference-grid">
          <article>
            <span>🎮</span>
            <h3>Gaming identity</h3>
            <p>Games, achievements, quests, events and shared interests give people an easy place to start.</p>
          </article>
          <article>
            <span>🤝</span>
            <h3>Community participation</h3>
            <p>Progress is designed around showing up, joining in and building momentum with other people.</p>
          </article>
          <article>
            <span>◉</span>
            <h3>Creator ecosystem</h3>
            <p>Free connected creator tools can help communities grow while bringing Project Respawn into existing audiences.</p>
          </article>
          <article>
            <span>⌁</span>
            <h3>Community intelligence</h3>
            <p>Permissioned first-party signals can eventually help creators understand what actually strengthens their communities.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="about-section">
      <div class="about-shell about-evidence">
        <div>
          <p class="about-kicker">Evidence before claims</p>
          <h2>We want to prove what works before saying more than the evidence supports.</h2>
        </div>

        <div>
          <p>
            Project Respawn is being designed to support social confidence. That is different from
            claiming that the platform treats social anxiety or any other health condition.
          </p>
          <p>
            If the product demonstrates meaningful outcomes, the long-term plan is to work with
            independent researchers and pursue university-backed research before making stronger claims.
          </p>
        </div>
      </div>
    </section>

    <section class="about-section about-vision-section">
      <div class="about-shell">
        <header class="about-section-heading">
          <p class="about-kicker">Where this can go</p>
          <h2>Start with communities. Earn the right to build something much bigger.</h2>
          <p>
            The long-term ambition reaches into creator technology, community intelligence, brands,
            esports, research, media and eventually physical spaces. None of that matters unless
            Project Respawn first proves that the core platform helps people and gives creators a
            reason to stay.
          </p>
        </header>

        <div class="about-vision-line">
          <span>Community platform</span>
          <b>→</b>
          <span>Creator ecosystem</span>
          <b>→</b>
          <span>Intelligence & commercial layers</span>
          <b>→</b>
          <span>Research & scale</span>
          <b>→</b>
          <span>Long-term global vision</span>
        </div>
      </div>
    </section>

    <section class="about-final-cta">
      <div class="about-shell about-final-grid">
        <div>
          <p class="about-kicker">Choose your path</p>
          <h2>Use Project Respawn, build with it or help shape what comes next.</h2>
        </div>

        <div class="about-final-actions">
          <router-link
            class="about-primary"
            :to="{ path: '/join-us', hash: '#how-it-works' }"
          >
            For creators
          </router-link>

          <router-link class="about-secondary" to="/careers">
            Help build Project Respawn
          </router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script src="./About.js"></script>
<style src="./About.css"></style>
