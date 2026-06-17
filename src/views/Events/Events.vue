<template>
  <main class="events-page">
    <section class="events-shell">
      <!-- =========================
        1. PAGE HERO CARD
      ========================== -->
      <section class="events-card events-hero-card">
        <div class="events-hero-copy">
          <div
            v-if="sectionStatus.hero?.inProgress"
            class="events-page-status-row"
          >
            <span class="events-page-status-badge">In Progress Layout Not Final</span>
          </div>

          <p class="events-card-kicker">Project Respawn</p>
          <h1 class="events-hero-title">Events hub</h1>
          <p class="events-card-description">
            Keep track of community sessions, challenge nights, support meetups, and upcoming activities across the platform.
          </p>
        </div>

        <div class="events-hero-actions">
          <button
            type="button"
            class="events-btn events-btn--primary"
            @click="openSuggestEvent"
          >
            Suggest event
          </button>

          <button
            type="button"
            class="events-btn events-btn--secondary"
            @click="setActiveView(activeView === 'upcoming' ? 'calendar' : 'upcoming')"
          >
            {{ activeView === 'upcoming' ? 'Open calendar' : 'Back to upcoming' }}
          </button>
        </div>
      </section>

      <!-- =========================
        2. SUMMARY STRIP
      ========================== -->
      <section class="events-summary-grid">
        <article
          class="events-card events-summary-card"
          :class="{ 'events-card--coming-soon': sectionStatus.summaryNext?.comingSoon }"
        >
          <p class="events-card-kicker">Next event</p>
          <h2 class="events-summary-value">
            {{ nextEventTitle }}
          </h2>
          <p class="events-summary-meta">
            {{ nextEventDateText }}
          </p>
        </article>

        <article
          class="events-card events-summary-card"
          :class="{ 'events-card--coming-soon': sectionStatus.summaryUpcoming?.comingSoon }"
        >
          <p class="events-card-kicker">Upcoming</p>
          <h2 class="events-summary-number">
            {{ filteredUpcomingEvents.length }}
          </h2>
          <p class="events-summary-meta">
            Events currently planned
          </p>
        </article>

        <article
          class="events-card events-summary-card"
          :class="{ 'events-card--coming-soon': sectionStatus.summaryThisWeek?.comingSoon }"
        >
          <p class="events-card-kicker">This week</p>
          <h2 class="events-summary-number">
            {{ upcomingSoonEvents.length }}
          </h2>
          <p class="events-summary-meta">
            Happening soon
          </p>
        </article>

        <article
          class="events-card events-summary-card"
          :class="{ 'events-card--coming-soon': sectionStatus.summaryPast?.comingSoon }"
        >
          <p class="events-card-kicker">Past recaps</p>
          <h2 class="events-summary-number">
            {{ pastEvents.length }}
          </h2>
          <p class="events-summary-meta">
            Community sessions completed
          </p>
        </article>
      </section>

      <!-- =========================
        3. MAIN DASHBOARD GRID
      ========================== -->
      <section class="events-dashboard-grid">
        <!-- =========================
          3A. UPCOMING MAIN CARD
        ========================== -->
        <article
          class="events-card events-main-card"
          :class="{ 'events-card--coming-soon': sectionStatus.upcoming?.comingSoon }"
        >
          <div class="events-card-header">
            <div>
              <p class="events-card-kicker">Upcoming</p>
              <h2 class="events-card-title">Join next</h2>
            </div>

            <div class="events-card-header-actions">
              <button
                type="button"
                class="events-view-chip"
                :class="{ 'is-active': activeView === 'upcoming' }"
                @click="setActiveView('upcoming')"
              >
                List
              </button>
              <button
                type="button"
                class="events-view-chip"
                :class="{ 'is-active': activeView === 'calendar' }"
                @click="setActiveView('calendar')"
              >
                Calendar
              </button>
            </div>
          </div>

          <template v-if="activeView === 'upcoming'">
            <div v-if="filteredUpcomingEvents.length" class="events-main-list">
              <article
                v-for="event in filteredUpcomingEvents"
                :key="event.id"
                class="events-main-list-item"
              >
                <div class="events-main-list-date">
                  <span class="events-main-list-day">{{ formatEventDay(event.startAt) }}</span>
                  <span class="events-main-list-month">{{ formatEventMonth(event.startAt) }}</span>
                </div>

                <div class="events-main-list-body">
                  <div class="events-pill-row">
                    <span class="events-pill events-pill--status" :class="statusClass(event.status)">
                      {{ event.statusLabel }}
                    </span>
                    <span class="events-pill events-pill--platform">
                      {{ event.platformLabel }}
                    </span>
                    <span class="events-pill events-pill--tag">
                      {{ event.categoryLabel }}
                    </span>
                  </div>

                  <h3 class="events-item-title">{{ event.title }}</h3>
                  <p class="events-item-description">{{ event.description }}</p>

                  <div class="events-inline-meta">
                    <span>{{ formatEventDate(event.startAt) }}</span>
                    <span>{{ formatEventTimeRange(event.startAt, event.endAt) }}</span>
                    <span>{{ event.locationLabel }}</span>
                    <span>{{ event.rewardText }}</span>
                  </div>
                </div>

                <div class="events-main-list-actions">
                  <button type="button" class="events-btn events-btn--secondary">
                    {{ event.ctaLabel }}
                  </button>
                </div>
              </article>
            </div>

            <div v-else class="events-empty-state">
              <h3 class="events-empty-title">No events match the current filters</h3>
              <p class="events-empty-copy">
                Try a different category or switch the location filter.
              </p>
            </div>
          </template>

          <template v-else>
            <div class="events-mini-calendar">
              <div class="events-mini-calendar-header">
                <h3 class="events-mini-calendar-title">{{ currentCalendarLabel }}</h3>
                <p class="events-mini-calendar-subtitle">
                  {{ filteredUpcomingEvents.length }} planned
                </p>
              </div>

              <div class="events-mini-calendar-grid">
                <div
                  v-for="day in calendarDays"
                  :key="day.key"
                  class="events-mini-calendar-cell"
                  :class="{
                    'is-muted': !day.inCurrentMonth,
                    'is-has-events': day.events.length,
                  }"
                >
                  <div class="events-mini-calendar-date">
                    {{ day.dayNumber }}
                  </div>

                  <div class="events-mini-calendar-events">
                    <span
                      v-for="event in day.events.slice(0, 2)"
                      :key="event.id"
                      class="events-mini-calendar-event"
                    >
                      {{ formatCalendarTime(event.startAt) }} {{ event.title }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </article>

        <!-- =========================
          3B. FILTERS CARD
        ========================== -->
        <article
          class="events-card events-side-card"
          :class="{ 'events-card--coming-soon': sectionStatus.filters?.comingSoon }"
        >
          <div class="events-card-header">
            <div>
              <p class="events-card-kicker">Filters</p>
              <h2 class="events-card-title">Refine view</h2>
            </div>
          </div>

          <div class="events-filter-stack">
            <div class="events-filter-group">
              <span class="events-filter-label">Format</span>
              <div class="events-chip-row">
                <button
                  v-for="filter in locationFilters"
                  :key="filter.value"
                  type="button"
                  class="events-chip"
                  :class="{ 'is-active': selectedLocation === filter.value }"
                  @click="setLocationFilter(filter.value)"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>

            <div class="events-filter-group">
              <span class="events-filter-label">Category</span>
              <div class="events-chip-row">
                <button
                  v-for="filter in categoryFilters"
                  :key="filter.value"
                  type="button"
                  class="events-chip"
                  :class="{ 'is-active': selectedCategory === filter.value }"
                  @click="setCategoryFilter(filter.value)"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>
          </div>
        </article>

        <!-- =========================
          3C. FEATURED CARD
        ========================== -->
        <article
          v-if="featuredEvent"
          class="events-card events-side-card"
          :class="{ 'events-card--coming-soon': sectionStatus.featured?.comingSoon }"
        >
          <div class="events-card-header">
            <div>
              <p class="events-card-kicker">Featured</p>
              <h2 class="events-card-title">Spotlight</h2>
            </div>
          </div>

          <div class="events-featured-compact">
            <div class="events-pill-row">
              <span class="events-pill events-pill--status" :class="statusClass(featuredEvent.status)">
                {{ featuredEvent.statusLabel }}
              </span>
              <span class="events-pill events-pill--platform">
                {{ featuredEvent.platformLabel }}
              </span>
            </div>

            <h3 class="events-item-title">{{ featuredEvent.title }}</h3>
            <p class="events-item-description">{{ featuredEvent.description }}</p>

            <div class="events-featured-meta">
              <span>{{ formatEventDate(featuredEvent.startAt) }}</span>
              <span>{{ formatEventTimeRange(featuredEvent.startAt, featuredEvent.endAt) }}</span>
              <span>{{ featuredEvent.host }}</span>
              <span>{{ featuredEvent.rewardText }}</span>
            </div>

            <button type="button" class="events-btn events-btn--primary">
              {{ featuredEvent.ctaLabel }}
            </button>
          </div>
        </article>

        <!-- =========================
          3D. THIS WEEK CARD
        ========================== -->
        <article
          class="events-card events-side-card"
          :class="{ 'events-card--coming-soon': sectionStatus.thisWeek?.comingSoon }"
        >
          <div class="events-card-header">
            <div>
              <p class="events-card-kicker">Soon</p>
              <h2 class="events-card-title">This week</h2>
            </div>
          </div>

          <div v-if="upcomingSoonEvents.length" class="events-compact-list">
            <article
              v-for="event in upcomingSoonEvents"
              :key="event.id"
              class="events-compact-item"
            >
              <div class="events-compact-item-top">
                <h3 class="events-compact-title">{{ event.title }}</h3>
                <span class="events-compact-date">{{ formatEventDate(event.startAt) }}</span>
              </div>
              <p class="events-compact-copy">{{ formatEventTimeRange(event.startAt, event.endAt) }} · {{ event.locationLabel }}</p>
            </article>
          </div>

          <div v-else class="events-empty-state events-empty-state--compact">
            <p class="events-empty-copy">Nothing soon in this filter set yet.</p>
          </div>
        </article>

        <!-- =========================
          3E. PAST EVENTS CARD
        ========================== -->
        <article
          class="events-card events-wide-card"
          :class="{ 'events-card--coming-soon': sectionStatus.pastEvents?.comingSoon }"
        >
          <div class="events-card-header">
            <div>
              <p class="events-card-kicker">Recaps</p>
              <h2 class="events-card-title">Past events</h2>
            </div>

            <button
              type="button"
              class="events-btn events-btn--secondary"
              @click="toggleShowPast"
            >
              {{ showPastEvents ? 'Hide' : 'Show' }}
            </button>
          </div>

          <div v-if="showPastEvents">
            <div v-if="pastEvents.length" class="events-past-grid">
              <article
                v-for="event in pastEvents"
                :key="event.id"
                class="events-past-item"
              >
                <div class="events-pill-row">
                  <span class="events-pill events-pill--status is-past">Past</span>
                  <span class="events-pill events-pill--platform">{{ event.platformLabel }}</span>
                </div>

                <h3 class="events-item-title">{{ event.title }}</h3>
                <p class="events-item-description">{{ event.description }}</p>

                <div class="events-inline-meta">
                  <span>{{ formatEventDate(event.startAt) }}</span>
                  <span>{{ event.host }}</span>
                  <span>{{ event.recapText }}</span>
                </div>
              </article>
            </div>

            <div v-else class="events-empty-state events-empty-state--compact">
              <p class="events-empty-copy">No past event recaps yet.</p>
            </div>
          </div>

          <div v-else class="events-empty-state events-empty-state--compact">
            <p class="events-empty-copy">Past events are hidden until you expand this section.</p>
          </div>
        </article>

        <!-- =========================
          3F. SUGGEST CARD
        ========================== -->
        <article
          class="events-card events-side-card"
          :class="{ 'events-card--coming-soon': sectionStatus.suggestEvent?.comingSoon }"
        >
          <div class="events-card-header">
            <div>
              <p class="events-card-kicker">Community</p>
              <h2 class="events-card-title">Run something</h2>
            </div>
          </div>

          <div class="events-suggest-card-body">
            <p class="events-card-description">
              Suggest a Discord hangout, stream session, challenge night, support meetup, or future community event.
            </p>

            <button
              type="button"
              class="events-btn events-btn--primary"
              @click="openSuggestEvent"
            >
              Suggest event
            </button>
          </div>
        </article>
      </section>

      <!-- =========================
        4. MODAL
      ========================== -->
      <div
        v-if="showSuggestModal"
        class="events-modal-overlay"
        @click.self="closeSuggestEvent"
      >
        <div class="events-modal">
          <button
            type="button"
            class="events-modal-close"
            @click="closeSuggestEvent"
            aria-label="Close suggest event modal"
          >
            ×
          </button>

          <p class="events-card-kicker">Suggest event</p>
          <h2 class="events-card-title">Help shape the schedule</h2>
          <p class="events-card-description">
            Later this can connect to your forum flow, a submission form, or an admin approval queue.
          </p>

          <div class="events-modal-panels">
            <div class="events-modal-panel">
              <span class="events-filter-label">Ideas</span>
              <ul class="events-modal-list">
                <li>Weekly community hangout</li>
                <li>Quest support meetup</li>
                <li>Twitch challenge night</li>
                <li>Beginner onboarding session</li>
              </ul>
            </div>

            <div class="events-modal-panel">
              <span class="events-filter-label">Next step</span>
              <p class="events-card-description">
                Once the layout feels right, this button can open a forum thread creator, event request form, or moderation workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script src="./Events.js"></script>
<style src="./Events.css"></style>