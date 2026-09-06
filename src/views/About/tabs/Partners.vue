<template>
  <div>
    <section class="about-section">
      <div class="about-shell">
        <header class="about-section-heading">
          <p class="about-kicker">A connected partner ecosystem</p>
          <h2>Project Respawn should become more useful as more good partners join it.</h2>
          <p>Partnerships should give users better communities, better opportunities, useful tools or experiences they genuinely want.</p>
        </header>

        <div class="about-partner-grid">
          <article><span>◉</span><h3>Creators</h3><p>Connected Twitch, Discord, events, rewards, automation and analytics.</p></article>
          <article><span>✦</span><h3>Brands</h3><p>Campaigns, challenges and experiences that fit naturally into the communities already here.</p></article>
          <article><span>🏃</span><h3>Trainers</h3><p>Connect planned activity and challenges into the wider Project Respawn experience where the user chooses to share it.</p></article>
          <article><span>🤝</span><h3>Community organisations</h3><p>Create structured, welcoming places for people to participate around shared interests and events.</p></article>
          <article><span>🏆</span><h3>Esports</h3><p>Teams, tournaments and competitive communities can become another way people find belonging and shared goals.</p></article>
          <article><span>🧪</span><h3>Research partners</h3><p>Help us test assumptions properly and understand whether Project Respawn creates meaningful outcomes.</p></article>
        </div>
      </div>
    </section>

    <section class="about-section about-section-deep">
      <div class="about-shell about-split">
        <div>
          <p class="about-kicker">Creators</p>
          <h2>Creators already have communities people trust.</h2>
          <p class="about-body-copy">Instead of asking users to abandon the communities they already know, Project Respawn can work with creators and give them connected tools for Twitch, Discord, events, rewards, overlays, members and analytics.</p>
          <router-link class="about-inline-link" :to="{ path: '/join-us', hash: '#how-it-works' }">See how Project Respawn works for creators →</router-link>
        </div>

        <div class="about-tool-grid">
          <article><span>◉</span><strong>Twitch + Discord</strong><small>Connected creator and community management.</small></article>
          <article><span>▣</span><strong>Overlays</strong><small>Flexible stream experiences.</small></article>
          <article><span>▤</span><strong>Events</strong><small>Coordinate community activity across platforms.</small></article>
          <article><span>✦</span><strong>Rewards</strong><small>Give participation visible value and progression.</small></article>
          <article><span>⌁</span><strong>Analytics</strong><small>Understand what is actually happening in the community.</small></article>
          <article><span>↻</span><strong>Automation</strong><small>Reduce repetitive work and keep communities moving.</small></article>
        </div>
      </div>
    </section>

    <section class="about-section about-score-section">
      <div class="about-shell">
        <header class="about-section-heading">
          <p class="about-kicker">Creator Score</p>
          <h2>Followers tell you audience size. We want to understand community strength.</h2>
          <p>Creator Score is a proposed intelligence layer designed to help creators understand how their community is developing.</p>
        </header>

        <div class="about-score-flow">
          <div class="about-score-inputs"><span>Participation</span><span>Retention</span><span>Growth</span><span>Engagement</span><span>Community activity</span><span>Respawn activity</span></div>
          <div class="about-score-core"><small>PROPOSED INTELLIGENCE LAYER</small><strong>CREATOR<br>SCORE</strong></div>
          <div class="about-score-outputs">
            <article><strong>Understand</strong><p>Identify patterns in how a community is growing and participating.</p></article>
            <article><strong>Recommend</strong><p>Give creators private, practical ideas for strengthening engagement.</p></article>
            <article><strong>Learn</strong><p>Measure what happens after a creator acts and improve over time.</p></article>
          </div>
        </div>

        <div class="about-score-note">
          <strong>Creator Score is not intended to be a popularity ranking.</strong>
          <p>It is not meant to publicly judge whether someone is a “good creator”, sell private creator analytics or replace human judgement.</p>
        </div>
      </div>
    </section>

    <section class="about-section">
      <div class="about-shell">
        <header class="about-section-heading"><p class="about-kicker">How we want partnerships to work</p><h2>Useful first. Commercial second.</h2><p>Sponsored activity should be clear, relevant and additive to the user's experience.</p></header>
        <div class="about-principle-grid">
          <article><span>01</span><h3>Transparent</h3><p>Users should know when something is sponsored or commercial.</p></article>
          <article><span>02</span><h3>Relevant</h3><p>Partnerships should fit the communities, games or goals they appear alongside.</p></article>
          <article><span>03</span><h3>Non-exploitative</h3><p>Supportive mechanics, affection and reconnection should never be sold back to vulnerable users.</p></article>
        </div>
      </div>
    </section>

    <section class="about-section about-vision-section">
      <div class="about-shell about-feature-callout">
        <div><p class="about-kicker">Interested in working together?</p><h2>Bring something useful to the ecosystem.</h2><p>Tell us what you are building, who you serve and what a Project Respawn partnership could make better for users.</p></div>
        <router-link class="about-primary about-large-cta" to="/contact">Work with Project Respawn</router-link>
      </div>
    </section>
  </div>
</template>
