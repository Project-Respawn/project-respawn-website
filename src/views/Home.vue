<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          <h1>Ravens — Community, Events, Teams</h1>
          <p class="lead">We organise events, build teams and host matches. Join our community or catch upcoming events.</p>
          <div class="btn-group">
            <router-link to="/about" class="btn btn-primary">Learn More</router-link>
            <router-link to="/contact" class="btn btn-outline-primary">Get Involved</router-link>
          </div>
        </div>
        <div class="hero-aside">
          <div class="card highlight">
            <h3>Next Event</h3>
            <p><strong>Friday Night Scrims</strong><br>Starts 8pm — Weekly</p>
            <a href="#events" class="link">See Events</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest News Section -->
    <section class="section container py-5">
      <h2 class="mb-4">Latest News</h2>
      <div class="row g-4">
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="card-title">Team Tryouts</h3>
              <p class="card-text">We're holding tryouts for our competitive squads next month. Signups open now.</p>
              <router-link to="/about" class="link stretched-link">Read</router-link>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="card-title">Community Night</h3>
              <p class="card-text">Casual play and tournaments. All skill levels welcome.</p>
              <a href="#events" class="link stretched-link">Details</a>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="card-title">Merch Drop</h3>
              <p class="card-text">New jerseys and hoodies available — limited stock.</p>
              <router-link to="/contact" class="link stretched-link">Shop</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Teams Section -->
    <section class="section alt py-5">
      <div class="container">
        <h2 class="mb-4">Our Teams</h2>
        <div class="row g-4">
          <div class="col-md-6 col-lg-4">
            <div class="card team-card h-100">
              <div class="card-body d-flex flex-column justify-content-center">
                <h3 class="card-title">Esports - Celestial Ravens</h3>
                <p class="card-text">Competitive team focused on tournaments.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="card team-card h-100">
              <div class="card-body d-flex flex-column justify-content-center">
                <h3 class="card-title">Beta</h3>
                <p class="card-text">Development squad and training.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="card team-card h-100">
              <div class="card-body d-flex flex-column justify-content-center">
                <h3 class="card-title">Casuals</h3>
                <p class="card-text">Community players and fun nights.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Events Section -->
    <section id="events" class="section container py-5">
      <h2 class="mb-4">Upcoming Events</h2>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Friday Night Scrims</h3>
              <p class="card-text">Weekly, 20:00</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Monthly Tournament</h3>
              <p class="card-text">2026-02-14</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Community Bootcamp</h3>
              <p class="card-text">Signup open</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Another Event</h3>
              <p class="card-text">Event details here</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Another Event</h3>
              <p class="card-text">Event details here</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Another Event</h3>
              <p class="card-text">Event details here</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.hero {
  padding: 48px 0;
}

.hero-inner {
  display: flex;
  gap: 28px;
  align-items: stretch;
}

.hero-text {
  flex: 1;
}

.hero-aside {
  width: 260px;
}

.hero-text h1 {
  margin-bottom: 1rem;
  font-weight: 700;
}

.lead {
  color: var(--text);
  max-width: 56ch;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.btn-group {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-block;
  padding: 10px 14px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(90deg, var(--accent), var(--accent-2)) !important;
  color: #2a1b3d !important;
  border: none !important;
}

.btn-outline-primary {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.04) !important;
  color: var(--text) !important;
}

.btn:hover {
  opacity: 0.9;
}

.card {
  background: linear-gradient(180deg, rgba(201, 180, 224, 0.04), rgba(201, 180, 224, 0.01));
  border: 1px solid rgba(201, 180, 224, 0.1);
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(97, 0, 224, 1);
  color: var(--text);
}

.card.highlight {
  background: linear-gradient(180deg, rgba(212, 165, 255, 0.1), rgba(201, 180, 224, 0.05));
  border: 1px solid rgba(212, 165, 255, 0.15);
  box-shadow: 0 0 24px rgba(97, 0, 224, 1);
}

.card-title {
  margin-bottom: 0.5rem;
}

.card-text {
  color: var(--text);
  margin-bottom: 0.75rem;
}

.link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.team-card {
  min-height: 120px;
}

.section {
  padding: 36px 0;
}

.section.alt {
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.01));
}

@media (max-width: 768px) {
  .hero-inner {
    flex-direction: column;
    gap: 20px;
  }

  .hero-aside {
    width: 100%;
  }

  .hero-text h1 {
    font-size: 24px;
  }

  .lead {
    font-size: 14px;
  }

  .btn-group {
    flex-direction: column;
  }
}
</style>
