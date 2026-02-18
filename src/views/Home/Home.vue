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

<style scoped src="./Home.css"></style>
