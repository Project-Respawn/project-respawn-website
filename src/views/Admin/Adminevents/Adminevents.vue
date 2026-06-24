<template>
  <section class="admin-events-page">
    <header class="admin-events-hero">
      <div class="admin-events-hero-copy">
        <p class="admin-events-kicker">Admin Console</p>
        <h1 class="admin-events-title">Events Management</h1>
        <p class="admin-events-copy">
          Create and manage events, review community suggestions, control tags,
          and prepare ticket options before publishing.
        </p>
      </div>

      <div class="admin-events-hero-actions">
        <button class="admin-events-btn admin-events-btn--primary" @click="openCreateWizard">
          Create event
        </button>
        <button class="admin-events-btn admin-events-btn--secondary" @click="refreshAll">
          Refresh
        </button>
      </div>
    </header>

    <section class="admin-events-summary-grid">
      <article class="admin-events-summary-card">
        <p class="admin-events-summary-label">Upcoming</p>
        <h2 class="admin-events-summary-value">{{ summary.upcoming }}</h2>
      </article>

      <article class="admin-events-summary-card">
        <p class="admin-events-summary-label">Drafts</p>
        <h2 class="admin-events-summary-value">{{ summary.draft }}</h2>
      </article>

      <article class="admin-events-summary-card">
        <p class="admin-events-summary-label">Suggestions</p>
        <h2 class="admin-events-summary-value">{{ summary.pendingSuggestions }}</h2>
      </article>

      <article class="admin-events-summary-card">
        <p class="admin-events-summary-label">Tags</p>
        <h2 class="admin-events-summary-value">{{ summary.tags }}</h2>
      </article>
    </section>

    <section class="admin-events-grid">
      <article class="admin-events-card admin-events-card--wide">
        <div class="admin-events-card-header">
          <div>
            <p class="admin-events-card-kicker">Manage events</p>
            <h2 class="admin-events-card-title">Live event records</h2>
          </div>

          <div class="admin-events-inline-actions">
            <input
              v-model.trim="eventSearch"
              class="admin-events-search"
              type="search"
              placeholder="Search events"
            />
            <select v-model="eventStatusFilter" class="admin-events-select">
              <option value="all">All events</option>
              <option value="draft">Draft</option>
              <option value="live">Published</option>
              <option value="upcoming">Upcoming</option>
              <option value="live-now">Happening now</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>

        <div v-if="filteredEvents.length" class="admin-events-list">
          <article
            v-for="event in filteredEvents"
            :key="event.id"
            class="admin-events-list-item"
          >
            <div class="admin-events-list-main">
              <div class="admin-events-list-top">
                <h3 class="admin-events-list-title">{{ event.title }}</h3>

                <div class="admin-events-pill-row">
                  <span class="admin-events-pill">
                    {{ event.status || 'draft' }}
                  </span>
                  <span class="admin-events-pill admin-events-pill--subtle">
                    {{ getEventTimingLabel(event) }}
                  </span>
                </div>
              </div>

              <p class="admin-events-list-copy">
                {{ event.shortDescription || event.description || 'No short description yet.' }}
              </p>

              <div class="admin-events-meta-row">
                <span>{{ event.categorySummary || 'No category' }}</span>
                <span>{{ event.locationType || 'No location' }}</span>
                <span>{{ formatDateRange(event.startAt, event.endAt) }}</span>
              </div>
            </div>

            <div class="admin-events-list-actions">
              <button class="admin-events-btn admin-events-btn--ghost" @click="editEvent(event)">
                Edit
              </button>
              <button class="admin-events-btn admin-events-btn--ghost" @click="toggleFeatured(event)">
                {{ event.featured ? 'Unfeature' : 'Feature' }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="admin-events-empty">
          No events match your filters yet.
        </div>
      </article>

      <article class="admin-events-card">
        <div class="admin-events-card-header">
          <div>
            <p class="admin-events-card-kicker">Suggestions</p>
            <h2 class="admin-events-card-title">Pending review</h2>
          </div>
        </div>

        <div v-if="pendingSuggestions.length" class="admin-events-suggestion-list">
          <article
            v-for="suggestion in pendingSuggestions"
            :key="suggestion.id"
            class="admin-events-suggestion-item"
          >
            <div class="admin-events-suggestion-body">
              <h3 class="admin-events-suggestion-title">{{ suggestion.title }}</h3>
              <p class="admin-events-suggestion-copy">
                {{ suggestion.description || suggestion.notes || 'No suggestion text provided.' }}
              </p>
              <div class="admin-events-meta-row">
                <span>{{ suggestion.ownerDisplayName || suggestion.owner || 'Unknown user' }}</span>
                <span>{{ suggestion.category || 'No category' }}</span>
              </div>
            </div>

            <div class="admin-events-suggestion-actions">
              <button
                class="admin-events-btn admin-events-btn--primary"
                @click="approveSuggestionStart(suggestion)"
              >
                Review
              </button>
              <button
                class="admin-events-btn admin-events-btn--ghost"
                @click="rejectSuggestion(suggestion)"
              >
                Reject
              </button>
            </div>
          </article>
        </div>

        <div v-else class="admin-events-empty">
          No pending suggestions right now.
        </div>
      </article>

      <article class="admin-events-card">
        <div class="admin-events-card-header">
          <div>
            <p class="admin-events-card-kicker">Tag manager</p>
            <h2 class="admin-events-card-title">Event and host tags</h2>
          </div>
        </div>

        <form class="admin-events-tag-form" @submit.prevent="createTag">
          <input
            v-model.trim="newTag.name"
            class="admin-events-input"
            type="text"
            placeholder="Tag name"
          />

          <select v-model="newTag.type" class="admin-events-select">
            <option value="category">Category</option>
            <option value="location">Location</option>
            <option value="host">Host</option>
            <option value="general">General</option>
          </select>

          <label class="admin-events-checkbox">
            <input v-model="newTag.visibleOnEventCard" type="checkbox" />
            <span>Show on event cards</span>
          </label>

          <button class="admin-events-btn admin-events-btn--primary" type="submit">
            Add tag
          </button>
        </form>

        <div v-if="groupedTags.length" class="admin-events-tag-groups">
          <section
            v-for="group in groupedTags"
            :key="group.type"
            class="admin-events-tag-group"
          >
            <h3 class="admin-events-tag-group-title">{{ group.label }}</h3>
            <div class="admin-events-tag-list">
              <button
                v-for="tag in group.items"
                :key="tag.id"
                type="button"
                class="admin-events-tag-chip"
                @click="toggleTagActive(tag)"
              >
                {{ tag.name }}
              </button>
            </div>
          </section>
        </div>

        <div v-else class="admin-events-empty">
          No tags created yet.
        </div>
      </article>
    </section>

    <section
      v-if="wizardOpen"
      class="admin-events-wizard-overlay"
      @click.self="closeWizard"
    >
      <div class="admin-events-wizard">
        <div class="admin-events-wizard-main">
          <div class="admin-events-wizard-header">
            <div>
              <p class="admin-events-card-kicker">
                {{ wizardMode === 'suggestion' ? 'Suggestion review' : 'Create event' }}
              </p>
              <h2 class="admin-events-card-title">
                {{ wizardHeading }}
              </h2>
            </div>

            <button class="admin-events-close" @click="closeWizard">×</button>
          </div>

          <div class="admin-events-stepper">
            <button
              type="button"
              class="admin-events-step"
              :class="{ 'is-active': currentStep === 1 }"
              @click="goToStep(1)"
            >
              1. Basics
            </button>
            <button
              type="button"
              class="admin-events-step"
              :class="{ 'is-active': currentStep === 2 }"
              @click="goToStep(2)"
            >
              2. Details
            </button>
            <button
              type="button"
              class="admin-events-step"
              :class="{ 'is-active': currentStep === 3 }"
              @click="goToStep(3)"
            >
              3. Tickets
            </button>
          </div>

          <form class="admin-events-wizard-form" @submit.prevent="submitWizard">
            <section v-if="currentStep === 1" class="admin-events-step-panel">
              <div class="admin-events-field-grid">
                <label class="admin-events-field">
                  <span>Event name</span>
                  <input
                    v-model.trim="eventForm.title"
                    class="admin-events-input"
                    type="text"
                  />
                </label>

                <div class="admin-events-field">
                  <span>Host</span>

                  <input
                    v-model.trim="hostSearch"
                    class="admin-events-input"
                    type="search"
                    placeholder="Search streamer or trainer"
                  />

                  <select
                    v-model="eventForm.hostUserId"
                    class="admin-events-select"
                    @change="syncSelectedHost"
                  >
                    <option value="">Select host</option>
                    <option
                      v-for="host in filteredHostOptions"
                      :key="host.id"
                      :value="host.id"
                    >
                      {{ host.displayName }}<span v-if="host.primaryRoleLabel"> — {{ host.primaryRoleLabel }}</span>
                    </option>
                  </select>

                  <p
                    v-if="eventForm.hostDisplayName"
                    class="admin-events-field-help"
                  >
                    Selected host: {{ eventForm.hostDisplayName }}
                  </p>
                </div>

                <label class="admin-events-field">
                  <span>Format</span>
                  <select v-model="eventForm.locationType" class="admin-events-select">
                    <option value="online">Online</option>
                    <option value="in-person">In person</option>
                  </select>
                </label>

                <label class="admin-events-field admin-events-field--full">
                  <span>Short description</span>
                  <textarea
                    v-model.trim="eventForm.shortDescription"
                    class="admin-events-textarea admin-events-textarea--short"
                  ></textarea>
                </label>
              </div>

              <fieldset class="admin-events-choice-group">
                <legend class="admin-events-field-label">Categories</legend>

                <div class="admin-events-category-grid">
                  <label
                    v-for="option in categoryOptions"
                    :key="option.value"
                    class="admin-events-category-card"
                    :class="{ 'is-selected': eventForm.categories.includes(option.value) }"
                  >
                    <input
                      v-model="eventForm.categories"
                      class="admin-events-category-input"
                      type="checkbox"
                      :value="option.value"
                    />
                    <span class="admin-events-category-label">{{ option.label }}</span>
                  </label>
                </div>
              </fieldset>

              <div class="admin-events-tag-picker">
                <p class="admin-events-field-label">Assign tags</p>

                <div class="admin-events-tag-list">
                  <button
                    v-for="tag in tags"
                    :key="tag.id"
                    type="button"
                    class="admin-events-tag-chip"
                    :class="{ 'is-selected': eventForm.tagIds.includes(tag.id) }"
                    @click="toggleFormTag(tag.id)"
                  >
                    {{ tag.name }}
                  </button>
                </div>
              </div>
            </section>

            <section v-if="currentStep === 2" class="admin-events-step-panel">
              <div class="admin-events-field-grid">
                <label class="admin-events-field admin-events-field--full">
                  <span>Long description</span>
                  <textarea
                    v-model.trim="eventForm.longDescription"
                    class="admin-events-textarea admin-events-textarea--large"
                  ></textarea>
                </label>

                <label class="admin-events-field">
                  <span>Start at</span>
                  <input
                    v-model="eventForm.startAt"
                    class="admin-events-input"
                    type="datetime-local"
                  />
                </label>

                <label class="admin-events-field">
                  <span>End at</span>
                  <input
                    v-model="eventForm.endAt"
                    class="admin-events-input"
                    type="datetime-local"
                  />
                </label>

                <label class="admin-events-field">
                  <span>Publish status</span>
                  <select v-model="eventForm.status" class="admin-events-select">
                    <option value="draft">Draft</option>
                    <option value="live">Live</option>
                  </select>
                </label>

                <label class="admin-events-checkbox">
                  <input v-model="eventForm.featured" type="checkbox" />
                  <span>Featured event</span>
                </label>
              </div>
            </section>

            <section v-if="currentStep === 3" class="admin-events-step-panel">
              <div class="admin-events-ticket-mode">
                <button
                  type="button"
                  class="admin-events-mode-chip"
                  :class="{ 'is-active': eventForm.ticketMode === 'free' }"
                  @click="eventForm.ticketMode = 'free'"
                >
                  Free event
                </button>

                <button
                  type="button"
                  class="admin-events-mode-chip"
                  :class="{ 'is-active': eventForm.ticketMode === 'ticketed' }"
                  @click="eventForm.ticketMode = 'ticketed'"
                >
                  Ticketed
                </button>
              </div>

              <div
                v-if="eventForm.ticketMode === 'ticketed'"
                class="admin-events-ticket-builder"
              >
                <article
                  v-for="(ticket, index) in eventForm.ticketTiers"
                  :key="ticket.localId"
                  class="admin-events-ticket-card"
                >
                  <div class="admin-events-field-grid">
                    <label class="admin-events-field">
                      <span>Ticket name</span>
                      <input
                        v-model.trim="ticket.name"
                        class="admin-events-input"
                        type="text"
                      />
                    </label>

                    <label class="admin-events-field">
                      <span>Price</span>
                      <input
                        v-model.number="ticket.price"
                        class="admin-events-input"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </label>

                    <label class="admin-events-field">
                      <span>Quantity</span>
                      <input
                        v-model.number="ticket.quantityAvailable"
                        class="admin-events-input"
                        type="number"
                        min="0"
                      />
                    </label>

                    <label class="admin-events-field admin-events-field--full">
                      <span>What this ticket gives</span>
                      <textarea
                        v-model.trim="ticket.perks"
                        class="admin-events-textarea admin-events-textarea--short"
                      ></textarea>
                    </label>
                  </div>

                  <div class="admin-events-ticket-actions">
                    <button
                      type="button"
                      class="admin-events-btn admin-events-btn--ghost"
                      @click="removeTicketTier(index)"
                    >
                      Remove tier
                    </button>
                  </div>
                </article>

                <button
                  type="button"
                  class="admin-events-btn admin-events-btn--secondary"
                  @click="addTicketTier"
                >
                  Add ticket tier
                </button>
              </div>

              <div v-else class="admin-events-free-note">
                This event is free. No ticket tiers will be added.
              </div>
            </section>

            <div class="admin-events-wizard-actions">
              <button
                v-if="currentStep > 1"
                type="button"
                class="admin-events-btn admin-events-btn--ghost"
                @click="previousStep"
              >
                Back
              </button>

              <button
                v-if="currentStep < 3"
                type="button"
                class="admin-events-btn admin-events-btn--primary"
                @click="nextStep"
              >
                Continue
              </button>

              <button
                v-else
                type="submit"
                class="admin-events-btn admin-events-btn--primary"
                :disabled="saving"
              >
                {{ saving ? 'Saving...' : wizardSubmitLabel }}
              </button>
            </div>
          </form>
        </div>

        <aside
          v-if="wizardMode === 'suggestion' && selectedSuggestion"
          class="admin-events-wizard-side"
        >
          <div class="admin-events-card-header">
            <div>
              <p class="admin-events-card-kicker">Suggested event text</p>
              <h2 class="admin-events-card-title">Original submission</h2>
            </div>
          </div>

          <div class="admin-events-suggestion-panel">
            <h3 class="admin-events-suggestion-title">{{ selectedSuggestion.title }}</h3>
            <p class="admin-events-suggestion-copy">
              {{ selectedSuggestion.description || 'No main description supplied.' }}
            </p>

            <div
              v-if="selectedSuggestion.notes"
              class="admin-events-suggestion-block"
            >
              <p class="admin-events-suggestion-label">Extra notes</p>
              <p class="admin-events-suggestion-copy">{{ selectedSuggestion.notes }}</p>
            </div>

            <div class="admin-events-suggestion-block">
              <p class="admin-events-suggestion-label">Suggested by</p>
              <p class="admin-events-suggestion-copy">
                {{ selectedSuggestion.ownerDisplayName || selectedSuggestion.owner || 'Unknown member' }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </section>
</template>

<script src="./AdminEvents.js"></script>
<style src="./AdminEvents.css"></style>