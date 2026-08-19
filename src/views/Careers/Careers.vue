<template>
  <main class="careers-page">
    <section class="careers-hero">
      <div class="careers-shell careers-hero-grid">
        <div class="careers-hero-copy">
          <div class="careers-brand-line">
            <img :src="respawnLogo" alt="" aria-hidden="true">
            <span>PROJECT RESPAWN</span>
          </div>

          <p class="careers-kicker">Careers & collaboration</p>
          <h1>Want to help build Project Respawn?</h1>
          <p class="careers-lead">
            We are building around gaming, creators, community and social confidence.
            We may not have the exact role for you advertised today, but that does not mean
            we do not want to hear from people who believe they can contribute.
          </p>

          <div class="careers-actions">
            <a class="careers-primary" href="#introduce-yourself">Introduce yourself</a>
            <router-link class="careers-secondary" to="/about">Learn about Project Respawn</router-link>
          </div>
        </div>

        <aside class="careers-hero-card">
          <span class="careers-status">BUILDING OUR NETWORK</span>
          <h2>Not a traditional jobs board.</h2>
          <p>
            Some future opportunities may be employment. Others may be freelance,
            advisory, research, creator, esports or commercial collaborations.
          </p>
          <ul>
            <li>Tell us what you are good at.</li>
            <li>Tell us what you would like to help build.</li>
            <li>Tell us why Project Respawn interests you.</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="careers-section">
      <div class="careers-shell">
        <header class="careers-section-heading">
          <p class="careers-kicker">Where you might fit</p>
          <h2>There is more than one way to get involved.</h2>
          <p>
            Choose the area closest to what you do. If none fits perfectly, choose
            “Something else” and tell us what we have missed.
          </p>
        </header>

        <div class="careers-path-grid">
          <button
            v-for="path in opportunityPaths"
            :key="path.key"
            type="button"
            class="careers-path-card"
            :class="{ selected: selectedArea === path.key }"
            @click="selectArea(path.key)"
          >
            <span class="careers-path-icon" aria-hidden="true">{{ path.icon }}</span>
            <span class="careers-path-content">
              <strong>{{ path.title }}</strong>
              <small>{{ path.copy }}</small>
            </span>
            <span class="careers-path-select">{{ selectedArea === path.key ? '✓' : '+' }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="careers-section careers-section-deep">
      <div class="careers-shell">
        <div class="careers-principles">
          <div>
            <p class="careers-kicker">What we care about</p>
            <h2>Skills matter. How you want to use them matters too.</h2>
          </div>

          <div class="careers-principle-grid">
            <article>
              <strong>Build with purpose</strong>
              <p>Help us create experiences that make gaming communities more useful, welcoming and connected.</p>
            </article>
            <article>
              <strong>Be comfortable learning</strong>
              <p>Project Respawn is early. Some answers will come from testing rather than pretending we already know them.</p>
            </article>
            <article>
              <strong>Respect the community</strong>
              <p>Privacy, safety, accessibility and user trust should remain part of product decisions as we grow.</p>
            </article>
            <article>
              <strong>Think beyond one role</strong>
              <p>We are interested in people who can see how their work connects to creators, gamers and the wider mission.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="introduce-yourself" class="careers-section">
      <div class="careers-shell">
        <header class="careers-section-heading">
          <p class="careers-kicker">Introduce yourself</p>
          <h2>You do not need to wait for the perfect vacancy.</h2>
          <p>
            Complete the short introduction below. It will open a pre-filled email to
            Project Respawn so you can add a CV, portfolio or relevant links before sending.
          </p>
        </header>

        <div class="careers-form-layout">
          <form class="careers-form" @submit.prevent="sendIntroduction">
            <div class="careers-form-row">
              <label>
                <span>Name</span>
                <input v-model.trim="form.name" type="text" required placeholder="Your name">
              </label>

              <label>
                <span>Email</span>
                <input v-model.trim="form.email" type="email" required placeholder="you@example.com">
              </label>
            </div>

            <div class="careers-form-row">
              <label>
                <span>LinkedIn / portfolio</span>
                <input v-model.trim="form.profile" type="url" placeholder="https://">
              </label>

              <label>
                <span>Area of interest</span>
                <select v-model="selectedArea" required>
                  <option disabled value="">Choose an area</option>
                  <option
                    v-for="path in opportunityPaths"
                    :key="path.key"
                    :value="path.key"
                  >
                    {{ path.title }}
                  </option>
                </select>
              </label>
            </div>

            <label>
              <span>What would you like to contribute?</span>
              <textarea
                v-model.trim="form.contribution"
                rows="5"
                required
                placeholder="Tell us what you are good at, what you would like to help with, or the kind of opportunity you are looking for."
              ></textarea>
            </label>

            <label>
              <span>Why Project Respawn?</span>
              <textarea
                v-model.trim="form.whyRespawn"
                rows="4"
                placeholder="Optional, but we would love to know what caught your attention."
              ></textarea>
            </label>

            <div class="careers-form-note">
              <strong>This is an expression of interest.</strong>
              <p>
                Sending an introduction is not an application for a currently advertised
                vacancy unless we explicitly state otherwise. Opportunities may be
                employment, freelance, advisory, partnership or future roles.
              </p>
            </div>

            <button class="careers-submit" type="submit">
              Prepare introduction email
            </button>
          </form>

          <aside class="careers-contact-card">
            <p class="careers-kicker">What happens next?</p>
            <h3>We review every relevant introduction.</h3>
            <ol>
              <li>You tell us where you think you can contribute.</li>
              <li>You add any CV, portfolio or links in your email.</li>
              <li>If there is a potential fit, Project Respawn can continue the conversation directly.</li>
            </ol>

            <div class="careers-contact-highlight">
              <strong>No matching category?</strong>
              <p>Select “Something else”. Unexpected skills and ideas are welcome.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>

<script src="./Careers.js"></script>
<style scoped src="./Careers.css"></style>
