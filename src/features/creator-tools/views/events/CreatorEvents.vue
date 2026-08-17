<template>
  <main class="ccd-page events-page">
    <ConnectedDemoHeader
      icon="▣"
      title="Community Events"
      subtitle="Create once · Coordinate everywhere"
    />

    <section class="events-layout">
      <div class="events-main">
        <section class="ccd-card event-hero">
          <div class="event-icon">▣</div>

          <div class="event-copy">
            <small class="ccd-purple">UPCOMING EVENT</small>
            <h2>Friday Game Night</h2>
            <p>🎮 Cooperative Adventure</p>
            <p>▣ Fri, May 16, 2025 &nbsp; | &nbsp; ◷ Friday · 7:30 PM</p>
            <b class="ccd-cyan">Your time · 19:30 BST</b>
          </div>

          <div class="event-counts">
            <strong>
              <span class="ccd-positive">♙</span>
              {{ going }}
              <small>GOING</small>
            </strong>

            <strong>
              <span class="ccd-gold">★</span>
              18
              <small>INTERESTED</small>
            </strong>
          </div>

          <footer>
            <b :class="demo.event.rsvp ? 'ccd-positive' : 'ccd-purple'">
              {{ demo.event.rsvp ? 'You’re going! 🎉' : 'Nova has not RSVP’d' }}
            </b>
            <span>Attendance reward: 100 Community Points ✦</span>
          </footer>
        </section>

        <section class="ccd-card calendar-card">
          <header class="calendar-toolbar">
            <div class="calendar-title">
              <h2>May 12 – May 18, 2025</h2>
              <div class="calendar-nav">
                <button class="ccd-button" type="button">‹</button>
                <button class="ccd-button" type="button">Today</button>
                <button class="ccd-button" type="button">›</button>
              </div>
            </div>

            <select class="calendar-view">
              <option>Week</option>
            </select>
          </header>

          <div class="calendar-grid">
            <div class="calendar-time-column">
              <span>All-day</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>00:00</span>
            </div>

            <div
              v-for="day in calendarDays"
              :key="day.key"
              class="calendar-day"
              :class="{ selected: day.key === 'fri' }"
            >
              <div class="calendar-day-label">{{ day.label }}</div>

              <article
                v-for="event in day.events"
                :key="event.title"
                class="calendar-slot"
                :class="event.tone"
                :style="{ top: event.top, height: event.height }"
              >
                <strong>{{ event.title }}</strong>
                <small>{{ event.time }}</small>
                <small>{{ event.platform }}</small>
              </article>
            </div>
          </div>
        </section>

        <section class="event-summary">
          <article class="ccd-card summary-card">
            <h3>RSVP Summary</h3>
            <div class="rsvp-row">
              <div class="donut">
                <strong>{{ going }}<small>Going</small></strong>
              </div>
              <p>
                <span class="ccd-positive">● {{ going }} Going</span><br>
                <span class="ccd-gold">● 18 Interested</span><br>
                ● 9 Not going
              </p>
            </div>
          </article>

          <article class="ccd-card summary-card">
            <h3>Reminder Schedule</h3>
            <ul class="ccd-list compact-list">
              <li>✉ <span>24h before<small>May 15, 19:30 BST</small></span></li>
              <li>✉ <span>1h before<small>May 16, 18:30 BST</small></span></li>
              <li>✉ <span>10m before<small>May 16, 19:20 BST</small></span></li>
            </ul>
          </article>

          <article class="ccd-card summary-card">
            <h3>Attendance Reward</h3>
            <div class="reward-heading">
              <span class="reward-medal">✦</span>
              <strong>100<small>Community Points</small></strong>
            </div>
            <p class="summary-muted">Awarded to verified attendees</p>
            <div class="ccd-progress">
              <i :style="{ width: demo.achievement.progress / 5 * 100 + '%' }"></i>
            </div>
            <p class="summary-muted">Community Regular {{ demo.achievement.progress }} / 5</p>
          </article>

          <article class="ccd-card summary-card">
            <h3>Recurring Event Rule</h3>
            <div class="recurring-rule">
              <span class="recurring-icon">↻</span>
              <div>
                <strong>Repeats weekly</strong>
                <p>Every Friday</p>
              </div>
            </div>
            <p class="summary-muted">Ends: Never</p>
            <p class="summary-muted">Next 3 occurrences</p>
            <ul class="occurrence-list">
              <li>May 23, 19:30 BST</li>
              <li>May 30, 19:30 BST</li>
              <li>Jun 6, 19:30 BST</li>
            </ul>
          </article>

          <article class="ccd-card summary-card timezone-card">
            <h3>Time-zone conversion</h3>
            <ul class="timezone-list">
              <li><span>🇬🇧</span><div><strong>London (Your time)</strong><small>Fri, May 16, 2025</small></div><b>19:30 BST</b></li>
              <li><span>🇺🇸</span><div><strong>New York</strong><small>Fri, May 16, 2025</small></div><b>14:30 EDT</b></li>
              <li><span>🌴</span><div><strong>Los Angeles</strong><small>Fri, May 16, 2025</small></div><b>11:30 PDT</b></li>
            </ul>
          </article>
        </section>
      </div>

      <aside class="event-builder">
        <section class="ccd-card builder-card">
          <div class="builder-topline">
            <div>
              <h2>Create Event</h2>
              <p class="builder-subtitle">Plan once and publish everywhere.</p>
            </div>

            <div class="builder-meta">
              <span>Event status</span>
              <b>Draft · Nothing sent</b>
            </div>
          </div>

          <div class="builder-wip">WORK IN PROGRESS</div>

          <div class="builder-fields">
            <label class="field field-full">
              <span>Title</span>
              <div class="input-with-count">
                <input value="Friday Game Night">
                <small>21/80</small>
              </div>
            </label>

            <label class="field field-full">
              <span>Game / Category</span>
              <button class="select-field" type="button">
                <span class="select-field-value">
                  <span class="field-icon">🎮</span>
                  Cooperative Adventure
                </span>
                <span class="select-chevron">⌄</span>
              </button>
            </label>

            <label class="field date-field">
              <span>Date</span>
              <div class="input-icon-field">
                <span>▣</span>
                <input value="May 16, 2025">
              </div>
            </label>

            <label class="field time-field">
              <span>Time</span>
              <div class="input-icon-field">
                <span>◷</span>
                <input value="19:30">
              </div>
            </label>

            <label class="field zone-field">
              <span>Zone</span>
              <button class="select-field" type="button">
                <span>BST</span>
                <span class="select-chevron">⌄</span>
              </button>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <strong>↻ Recurring event</strong>
              <small>Repeat this event automatically.</small>
            </div>
            <label class="switch-control" aria-label="Recurring event">
              <input v-model="demo.event.recurring" type="checkbox">
              <span></span>
            </label>
          </div>

          <div class="platform-block">
            <div class="field-heading">
              <strong>Platforms</strong>
              <small>Choose where this event should appear.</small>
            </div>

            <div class="platform-row">
              <label
                v-for="platform in platforms"
                :key="platform.id"
                class="platform-card"
                :class="{ selected: demo.event.platforms.includes(platform.id) }"
              >
                <input
                  type="checkbox"
                  :checked="demo.event.platforms.includes(platform.id)"
                  @change="setEventPlatform(platform.id, $event.target.checked)"
                >

                <span class="platform-logo" :class="platform.id">
                  <svg
                    v-if="platform.id === 'twitch'"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path fill="currentColor" d="M4 3h16v11l-5 5h-4l-3 3v-3H4V3Zm2 2v12h4v2l2-2h4l2-2V5H6Zm4 3h2v5h-2V8Zm4 0h2v5h-2V8Z"/>
                  </svg>

                  <svg
                    v-else-if="platform.id === 'discord'"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path fill="currentColor" d="M8.4 7.2c1-.45 2.06-.68 3.1-.7l.38.76c-1.1.12-1.9.38-2.6.7 1.58-.72 4.15-.72 5.74 0-.7-.32-1.52-.58-2.62-.7l.38-.76c1.05.02 2.1.25 3.1.7 1.2 1.72 1.8 3.58 1.62 5.42-.83 1.02-1.86 1.7-3.02 2.08l-.75-.96c.52-.2 1-.46 1.43-.78-1.82.84-4.3.84-6.12 0 .44.32.92.58 1.44.78l-.75.96c-1.16-.38-2.2-1.06-3.02-2.08-.18-1.84.42-3.7 1.61-5.42Zm1.52 3.44c-.55 0-.98.48-.98 1.08s.44 1.08.98 1.08.98-.48.98-1.08-.44-1.08-.98-1.08Zm4.16 0c-.55 0-.98.48-.98 1.08s.44 1.08.98 1.08.98-.48.98-1.08-.44-1.08-.98-1.08Z"/>
                  </svg>

                  <img
                    v-else
                    :src="respawnLogo"
                    alt=""
                  >
                </span>

                <span class="platform-name">{{ platform.label }}</span>
                <span class="platform-check">✓</span>
              </label>
            </div>
          </div>

          <label class="field field-full">
            <span>Invite Roles <small>(optional)</small></span>
            <button class="role-selector" type="button" aria-label="Selected invite roles">
              <span class="role-chip">Community Member <b>×</b></span>
              <span class="role-chip">VIP <b>×</b></span>
              <span class="role-chip">Moderator <b>×</b></span>
              <span class="select-chevron">⌄</span>
            </button>
          </label>

          <div class="setting-row">
            <div>
              <strong>♙ Attendance Rewards</strong>
              <small>Reward verified attendees automatically.</small>
            </div>
            <label class="switch-control" aria-label="Attendance rewards">
              <input type="checkbox" checked>
              <span></span>
            </label>
          </div>

          <label class="field field-full reward-control">
            <span>Reward</span>
            <button class="select-field reward-field" type="button">
              <span class="select-field-value">
                <span class="reward-dot">✦</span>
                100 Community Points
              </span>
              <span class="select-chevron">⌄</span>
            </button>
          </label>

          <div class="builder-actions">
            <button class="ccd-button preview-button" type="button" @click="previewAnnouncements">
              ◉ Preview announcements
            </button>
            <button class="ccd-button primary publish-button" type="button" @click="rsvpNova">
              ✈ Publish in demo
            </button>
          </div>
        </section>

        <section class="ccd-card delivery">
          <h2>Cross-platform delivery preview</h2>
          <p class="ccd-card-sub">This is how your announcements will look.</p>

          <article class="enabled delivery-item">
            <div class="delivery-logo discord">☁</div>
            <div>
              <b>Discord announcement</b>
              <small>Today at 12:00</small>
              <p>Friday Game Night is happening on May 16 at 19:30 BST. Join us for a fun night in Cooperative Adventure.</p>
            </div>
          </article>

          <article class="enabled delivery-item">
            <div class="delivery-logo twitch">▣</div>
            <div>
              <b>Twitch reminder</b>
              <small>May 16 at 19:00 BST</small>
              <p>Going live soon! Friday Game Night starts at 19:30 BST.</p>
            </div>
          </article>

          <article class="enabled delivery-item">
            <div class="delivery-logo respawn">R</div>
            <div>
              <b>Project Respawn listing</b>
              <small>May 16</small>
              <p>Friday Game Night · 19:30 BST · Cooperative Adventure · {{ going }} Going · 18 Interested</p>
            </div>
          </article>
        </section>
      </aside>
    </section>
  </main>
</template>

<script src="./CreatorEvents.js"></script>
<style scoped src="./CreatorEvents.css"></style>
