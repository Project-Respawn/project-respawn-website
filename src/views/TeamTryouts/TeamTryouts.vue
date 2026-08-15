<template>
  <main class="streamers-page">
    <!-- HERO -->
    <section class="hero-section">
      <div class="container hero-shell">
        <p class="eyebrow">For streamers, creators, and community leaders</p>
        <h1>Turn your stream into a community that grows beyond the broadcast.</h1>
        <p class="hero-copy">
          Project Respawn helps streamers turn their communities into something more meaningful through
          interactive quests, a viewer progression system, cross-platform tools, and a mission focused
          on helping people build real-life social confidence over time.
        </p>

        <div class="hero-actions">
          <button class="btn btn-primary" type="button" @click="scrollToHowItWorks">
            See how it works
          </button>
        </div>

        <p class="hero-note">
          Accepted creators get access to our integrated Twitch + Discord dashboard during beta.
          Built for both competitive creators and community-first streamers.
        </p>

        <!-- Simple stat strip -->
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-number">2</span>
            <span class="hero-stat-label">creator paths</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">3</span>
            <span class="hero-stat-label">connected layers</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">1</span>
            <span class="hero-stat-label">confidence-focused system</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TABLE OF CONTENTS -->
    <section class="content-section toc-section">
      <div class="container">
        <p class="section-label">On this page</p>
        <nav class="toc-nav">
          <button
            v-for="item in tocItems"
            :key="item.id"
            type="button"
            class="toc-link"
            @click="scrollToSection(item.targetId)"
          >
            <span class="toc-link-label">{{ item.label }}</span>
            <span class="toc-link-summary">{{ item.summary }}</span>
          </button>
        </nav>
      </div>
    </section>

    <!-- WHY WE’RE BUILDING THIS -->
    <section id="why" class="content-section alt-surface">
      <div class="container narrow">
        <p class="section-label">Why we’re building this</p>
        <h2>Streamers can shape confidence at community scale.</h2>
        <p>
          Project Respawn exists to help gamers build confidence in real life through games, communities,
          and shared challenges. We believe streamers are one of the most powerful ways to create that impact,
          because creators shape the culture, tone, and behaviour of the communities around them.
        </p>
        <p>
          This is not just about adding another bot to a server. It is about giving people tools and systems that help
          audiences participate, connect, build momentum, and take small steps forward both online and offline.
        </p>
      </div>
    </section>

    <!-- QUEST & PROGRESSION SYSTEM -->
    <section id="quests" class="content-section">
      <div class="container narrow">
        <p class="section-label">Quest & progression system</p>
        <h2>A confidence-focused quest and level system.</h2>
        <p>
          At the centre of Project Respawn is a quest and progression system. People join, pick quests that
          match their comfort level, complete small actions, and gain EXP over time as they participate.
        </p>
        <p>
          Instead of chasing vanity metrics, the system is designed around confidence-building: repeatable
          challenges, soft social exposure, and a clear sense of progress that can be tracked in levels,
          streaks, and milestones.
        </p>
      </div>
    </section>

    <!-- THERAPISTS & PERSONAL TRAINERS -->
    <section id="therapists-trainers" class="content-section">
      <div class="container">
        <p class="section-label">Beyond the stream</p>
        <h2>Built for professionals who work with confidence too.</h2>
        <p class="section-intro">
          Project Respawn isn't only for streamers. We’re building a dedicated space for therapists and
          personal trainers who work with people on confidence, social anxiety, and personal growth — and who
          want tools that connect their work to a wider quest and progression system.
        </p>

        <div class="feature-card-grid two-up">
          <article class="feature-card">
            <h3>For therapists</h3>
            <p>
              Use quests and progression as an optional layer alongside your sessions. Refer clients into a
              structured environment designed to encourage small, achievable steps, and use their quest history
              as one more way to see how they’re practising skills between sessions.
            </p>
            <p class="coming-soon-pill">Therapist partnerships — coming soon</p>
          </article>

          <article class="feature-card">
            <h3>For personal trainers</h3>
            <p>
              Turn training plans into confidence-building challenges. Connect physical goals to quests,
              track how clients engage over time, and use the same progression language they see in the wider
              Project Respawn system.
            </p>
            <p class="coming-soon-pill">Personal trainer partnerships — coming soon</p>
          </article>
        </div>
      </div>
    </section>

    <!-- THREE CONNECTED LAYERS -->
    <section id="layers" class="content-section alt-surface">
      <div class="container">
        <p class="section-label">How the system is structured</p>
        <h2>Three connected layers working together.</h2>
        <div class="feature-card-grid three-up">
          <article class="feature-card">
            <h3>Viewer experience</h3>
            <p>
              Participants join Project Respawn, complete quests, gain EXP, and progress over time through activities designed
              to encourage participation, confidence-building, and personal momentum.
            </p>
          </article>
          <article class="feature-card">
            <h3>Creator dashboard</h3>
            <p>
              Streamers get a central dashboard to manage community experiences, configure quest systems,
              customise engagement prompts, and shape how Project Respawn fits their content.
            </p>
          </article>
          <article class="feature-card">
            <h3>Twitch + Discord tools</h3>
            <p>
              Cross-platform tools, prompts, messages, and integrations help keep engagement flowing across stream and Discord,
              while also supporting validation, continuity, and community interaction between broadcasts.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- CREATOR DASHBOARD -->
    <section id="dashboard" class="content-section">
      <div class="container">
        <p class="section-label">Your free creator dashboard</p>
        <div class="split-layout">
          <div>
            <h2>One place to manage Twitch and Discord together.</h2>
            <p>
              Accepted streamers get access to a creator dashboard that brings Twitch and Discord together in one place.
              Instead of managing disconnected tools, commands, and community systems across multiple platforms,
              you can customise your setup from one dashboard and run a more joined-up community experience.
            </p>
            <p>
              The goal is not just convenience. It is to give you a stronger way to run community participation,
              shape the viewer journey, and support engagement that continues beyond live chat.
            </p>
          </div>
          <div class="feature-card-grid">
            <article class="feature-card">
              <h3>Cross-platform setup</h3>
              <p>Connect your Twitch and Discord communities in one place.</p>
            </article>
            <article class="feature-card">
              <h3>Custom bot messages</h3>
              <p>Configure live messages, welcome messages, go-live announcements, and engagement prompts.</p>
            </article>
            <article class="feature-card">
              <h3>Quest management</h3>
              <p>Run Project Respawn quest experiences across both platforms and tie them into your wider creator system.</p>
            </article>
            <article class="feature-card">
              <h3>Community continuity</h3>
              <p>Give your audience a more consistent experience between streams and outside of chat.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT YOU CAN CONTROL -->
    <section class="content-section alt-surface">
      <div class="container narrow">
        <p class="section-label">What you can control</p>
        <h2>Shape the experience around your audience.</h2>
        <ul class="control-list">
          <li class="control-item">
            <h3>Messaging & announcements</h3>
            <p>Set up custom Twitch and Discord bot messaging, welcomes, and go-live announcements.</p>
          </li>
          <li class="control-item">
            <h3>Confidence-based quests</h3>
            <p>Run quests and participation prompts designed to encourage small steps and momentum.</p>
          </li>
          <li class="control-item">
            <h3>Between-stream engagement</h3>
            <p>Keep engagement flowing between streams, not just during live hours.</p>
          </li>
          <li class="control-item">
            <h3>Future tools</h3>
            <p>Help shape future tools and systems through direct beta feedback.</p>
          </li>
          <li class="control-item">
            <h3>Meaningful progression</h3>
            <p>Create a more trackable and meaningful participation loop for your viewers.</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section id="how-it-works" class="content-section">
      <div class="container">
        <p class="section-label">How it works</p>
        <h2>How the system works</h2>
        <div class="steps-grid">
          <article
            class="step-card"
            v-for="step in steps"
            :key="step.number"
            :ref="setStepRefs"
            :data-step="step.number"
            :class="{ 'step-visible': visibleSteps.includes(step.number) }"
          >
            <span class="step-number">{{ step.number }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.copy }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- TWO WAYS TO PARTNER (TABS) -->
    <section id="tracks" class="content-section alt-surface">
      <div class="container">
        <p class="section-label">Two ways to partner</p>
        <h2>Choose the route that fits your community best.</h2>
        <p class="section-intro">
          We’re building both an esports org and a social confidence platform. As a streamer, you can partner with us
          in one of two main ways — the competitive route or the social confidence route.
        </p>

        <div class="track-tabs">
          <button
            type="button"
            class="track-tab"
            :class="{ 'is-active': activeTrack === 'competitive' }"
            @click="setTrack('competitive')"
          >
            Competitive streamers
          </button>
          <button
            type="button"
            class="track-tab"
            :class="{ 'is-active': activeTrack === 'community' }"
            @click="setTrack('community')"
          >
            Social confidence & community
          </button>
        </div>

        <div class="track-panel">
          <article v-if="activeTrack === 'competitive'" class="partner-card">
            <h3>Competitive streamers</h3>
            <p>
              For creators whose main focus is high-level gameplay, ranked grind, competition, and representing an org.
              You may not think of yourself as community-first, but your audience can still benefit from stronger participation systems,
              better continuity, and deeper engagement around your content.
            </p>
            <ul class="bullet-list compact">
              <li>Stream and compete around a primary title consistently.</li>
              <li>Represent the org professionally in competitive environments.</li>
              <li>Support occasional org events such as tournaments, showmatches, or special streams.</li>
              <li>Use Project Respawn tools where they fit your content and community.</li>
            </ul>
            <p class="track-summary">
              If your content is driven by performance, improvement, and competition, this is likely the right path for you.
            </p>
          </article>

          <article v-else class="partner-card">
            <h3>Social confidence & community streamers</h3>
            <p>
              For creators who want their channel to be a safe, supportive place where viewers can take small steps
              toward building confidence in real life through quests, conversation, and community support.
              This route is especially aligned with streamers who want their community to become something more active and meaningful over time.
            </p>
            <ul class="bullet-list compact">
              <li>Run Project Respawn quests regularly on stream.</li>
              <li>Use the Twitch + Discord dashboard to keep your community engaged between streams.</li>
              <li>Maintain a supportive culture aligned with our confidence-building mission.</li>
              <li>Share feedback to help us improve the system for your audience.</li>
            </ul>
            <p class="track-summary">
              If your content is driven by community, conversation, and helping people feel braver in and out of chat, this is likely the right path for you.
            </p>
          </article>
        </div>

        <div class="clarification-box">
          <p>
            You do not need to be a typical “community streamer” to apply. Some partners will fit clearly into one path,
            while others may overlap both. In the application, we’ll ask which route fits you best and why.
          </p>
        </div>
      </div>
    </section>

    <!-- FOUNDING STREAMER PROGRAM -->
    <section id="founding" class="content-section">
      <div class="container narrow">
        <p class="section-label">Founding streamer program</p>
        <h2>Join as a founding streamer</h2>
        <p>
          Project Respawn is currently in active development and beta. That means early streamer partners aren’t just
          joining a finished program — you’re helping shape what this becomes for your own community.
        </p>
        <p>
          As a founding streamer, you get early access to our Twitch + Discord tools and creator dashboard, closer contact
          with the team, and a bigger say in how features, quests, and community systems evolve to suit your audience.
        </p>

        <div class="info-panel">
          <h3>What founding streamers get right now</h3>
          <ul class="bullet-list compact">
            <li>Early access to the integrated Twitch + Discord dashboard and bot tools at no cost to you.</li>
            <li>A direct feedback loop with the founding team so your ideas and needs influence what we build next.</li>
            <li>Priority when we test new features, quest types, progression systems, and community tools.</li>
            <li>A chance to help shape how Project Respawn supports confidence-building in your community from day one.</li>
          </ul>
        </div>

        <div class="info-panel accent-panel">
          <h3>How we’re thinking about future rewards</h3>
          <p>
            Our long-term goal is for creator rewards to be based on the engagement and impact you generate in your community,
            not just follower counts or one-off flat fees. As we develop our partnerships and advertising model, we plan to use
            the engagement metrics we collect, such as quest participation and community activity, to guide how future creator
            rewards are shared.
          </p>
          <p>
            Nothing is guaranteed yet — we’re still finalising the exact structure and it depends on how the business and campaigns grow —
            but the direction is clear: if Project Respawn generates value through campaigns and partnerships, we want our streaming partners
            to participate in that upside.
          </p>
        </div>

        <div class="beta-note">
          <h3>A clear beta disclaimer</h3>
          <p>
            Because we’re still in beta, some features, workflows, and tools will change as we learn from our founding partners.
            Things may break, get improved, or be rebuilt based on your feedback. If you join at this stage, you’re signing up
            to help shape a living product, not a finished one.
          </p>
        </div>
      </div>
    </section>

    <!-- WHO WE’RE LOOKING FOR -->
    <section class="content-section alt-surface">
      <div class="container narrow">
        <p class="section-label">Who we’re looking for</p>
        <h2>Alignment matters more than vanity metrics.</h2>
        <p>
          We’re open to creators of all sizes, as long as there is a genuine fit with the mission and the way you run your community.
          We care more about alignment, consistency, and community culture than vanity metrics alone.
        </p>
        <ul class="bullet-list">
          <li>Streamers who care about the experience they create for their audience.</li>
          <li>Creators willing to test new formats and give honest feedback.</li>
          <li>Communities that value participation, respect, and growth.</li>
          <li>People who can clearly explain why they are a good fit for Project Respawn.</li>
          <li>Creators with either strong competitive identity, strong community culture, or a blend of both.</li>
        </ul>
      </div>
    </section>

    <!-- APPLY -->
    <section id="apply" class="content-section application-section" tabindex="-1" aria-labelledby="apply-heading">
      <div class="container narrow centered">
        <p class="section-label">Apply to join</p>
        <h2 id="apply-heading">Apply to join Project Respawn</h2>
        <p>
          Applications are open to streamers and creators who want to build stronger communities and help shape the future
          of Project Respawn. We welcome casual, community-focused, entertainment and competitive creators. Alignment and
          community culture matter more than follower count.
        </p>
        <div class="hero-actions center-actions">
          <RouterLink class="btn btn-primary" :to="creatorApplicationRoute">
            Click here to apply as a streamer
          </RouterLink>
        </div>
        <p class="support-note">
          Applications are reviewed for fit, alignment, and community potential. Because this is a curated beta,
          not every applicant will be accepted.
        </p>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="content-section faq-section">
      <div class="container narrow">
        <p class="section-label">FAQ</p>
        <h2>Common questions</h2>

        <div class="faq-list">
          <div
            v-for="item in faqItems"
            :key="item.id"
            class="faq-item"
          >
            <button
              type="button"
              class="faq-summary"
              @click="toggleFaq(item.id)"
            >
              <span>{{ item.question }}</span>
              <span class="faq-icon" :class="{ 'is-open': openFaqId === item.id }">+</span>
            </button>
            <div
              class="faq-body"
              :class="{ 'is-open': openFaqId === item.id }"
            >
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="content-section final-cta-section">
      <div class="container narrow centered">
        <p class="section-label">Next step</p>
        <h2>Help shape the future of Project Respawn</h2>
        <p>
          If you want to build a more meaningful community, test a new kind of creator tooling, and help shape a platform
          built around confidence and participation, this page is the start of that conversation.
        </p>
        <div class="hero-actions center-actions">
          <a class="btn btn-outline" href="#apply" @click.prevent="navigateToSection('apply')">
            Go to application section
          </a>
        </div>
      </div>
    </section>
  </main>
</template>

<script src="./TeamTryouts.js"></script>
<style scoped src="./TeamTryouts.css"></style>
