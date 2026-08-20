<script src="./TherapistQuests.js"></script>

<template>
  <section class="therapist-quests-page">
    <!-- =====================================================
         DEMO NOTICE
    ====================================================== -->
    <transition name="therapist-quest-notice">
      <div
        v-if="notice"
        class="therapist-quest-notice"
        role="status"
        aria-live="polite"
      >
        {{ notice }}
      </div>
    </transition>

    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <header class="therapist-quests-page__header">
      <div>
        <span class="therapist-quests-page__eyebrow">
          CLIENT WORKSPACE
        </span>

        <h1>
          {{ selectedClient?.name ?? "Client" }}
        </h1>

        <p>
          Review client goals, activity, insights, reports and
          sharing permissions from one workspace.
        </p>
      </div>

      <div class="therapist-quests-page__header-actions">
        <button
          type="button"
          class="therapist-quest-button therapist-quest-button--secondary"
          @click="handleBrowseTemplates"
        >
          ◆ Browse Templates
        </button>

        <button
          type="button"
          class="therapist-quest-button therapist-quest-button--primary"
          @click="handleAssignQuest"
        >
          ＋ Assign Quest
        </button>
      </div>
    </header>

    <!-- =====================================================
         MAIN CLIENT WORKSPACE
    ====================================================== -->
    <div
      v-if="selectedClient"
      class="therapist-quests-layout"
    >
      <!-- ===================================================
           LEFT CLIENT CONTEXT
      ==================================================== -->
      <div class="therapist-quests-layout__client">
        <TherapistClientPanel
          :client="selectedClient"
          :clients="clients"
          :stats="clientPanelStats"
          @switch-client="handleClientSwitch"
          @assign="handleAssignQuest"
          @overview="handleClientOverview"
          @request-access="handleRequestAccess"
        />
      </div>

      <!-- ===================================================
           RIGHT WORKSPACE
      ==================================================== -->
      <main class="therapist-quests-layout__workspace">
        <!-- ===============================================
             WORKSPACE NAVIGATION
        ================================================ -->
        <TherapistClientWorkspaceNav
          :model-value="activeWorkspace"
          @update:model-value="handleWorkspaceChange"
        />

        <!-- =================================================
             QUESTS WORKSPACE
        ================================================== -->
        <template v-if="activeWorkspace === 'quests'">
          <section class="therapist-quest-workspace">
            <!-- HEADER -->
            <header class="therapist-quest-workspace-header">
              <div>
                <span
                  class="therapist-quest-workspace-header__client"
                >
                  {{ selectedClient.name }}
                </span>

                <h2>Quests</h2>

                <p>
                  Review current goals, progress, reflections and
                  quest history for this client.
                </p>
              </div>

              <div
                class="therapist-quest-workspace-header__actions"
              >
                <button
                  type="button"
                  class="therapist-quest-button therapist-quest-button--secondary"
                  @click="handleBrowseTemplates"
                >
                  ◆ Browse Templates
                </button>

                <button
                  type="button"
                  class="therapist-quest-button therapist-quest-button--primary"
                  @click="handleAssignQuest"
                >
                  ＋ Assign Quest
                </button>
              </div>
            </header>

            <!-- SUMMARY -->
            <section class="therapist-quest-summary-grid">
              <article
                v-for="card in summaryCards"
                :key="card.id"
                class="therapist-quest-summary-card"
                :class="
                  `therapist-quest-summary-card--${card.tone}`
                "
              >
                <div
                  class="therapist-quest-summary-card__icon"
                  :class="
                    `therapist-quest-summary-card__icon--${card.tone}`
                  "
                >
                  {{ card.icon }}
                </div>

                <div
                  class="therapist-quest-summary-card__content"
                >
                  <span>
                    {{ card.label }}
                  </span>

                  <strong>
                    {{ card.value }}
                  </strong>

                  <small>
                    {{ card.detail }}
                  </small>
                </div>
              </article>
            </section>

            <!-- MASTER / DETAIL -->
            <section class="therapist-quest-master-detail">
              <!-- QUEST LIST -->
              <div
                class="therapist-quest-master-detail__list"
              >
                <div class="therapist-quest-panel-heading">
                  <div>
                    <span>QUESTS</span>

                    <h3>
                      {{ selectedClientFirstName }}'s quest list
                    </h3>
                  </div>

                  <span class="therapist-quest-panel-count">
                    {{ clientQuests.length }}
                  </span>
                </div>

                <TherapistClientQuestList
                  :quests="clientQuests"
                  :selected-id="selectedQuestId"
                  @select="handleQuestSelect"
                />
              </div>

              <!-- QUEST DETAIL -->
              <div
                class="therapist-quest-master-detail__detail"
              >
                <div class="therapist-quest-panel-heading">
                  <div>
                    <span>
                      SELECTED QUEST
                    </span>

                    <h3>
                      Quest details
                    </h3>
                  </div>

                  <span
                    v-if="selectedQuest"
                    class="therapist-quest-panel-status"
                    :class="
                      `therapist-quest-panel-status--${selectedQuest.status}`
                    "
                  >
                    {{ selectedQuest.statusLabel }}
                  </span>
                </div>

                <TherapistClientQuestDetail
                  :quest="selectedQuest"
                  @action="handleQuestAction"
                />
              </div>
            </section>

            <!-- SHARING NOTE -->
            <section class="therapist-quest-footer-note">
              <div>
                <span
                  class="therapist-quest-footer-note__icon"
                >
                  ♙
                </span>

                <div>
                  <strong>
                    Client-controlled sharing
                  </strong>

                  <p>
                    {{ selectedClientFirstName }} controls what
                    activity, reflections and confidence information
                    is visible here.
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="therapist-quest-footer-note__action"
                @click="handleRequestAccess"
              >
                Request additional access →
              </button>
            </section>
          </section>
        </template>

        <!-- =================================================
             ACTIVITY WORKSPACE
        ================================================== -->
        <template
          v-else-if="activeWorkspace === 'activity'"
        >
          <section class="therapist-activity-workspace">
            <!-- HEADER -->
            <header class="therapist-activity-workspace__header">
              <div>
                <span
                  class="therapist-quest-workspace-header__client"
                >
                  {{ selectedClient.name }}
                </span>

                <h2>Activity</h2>

                <p>
                  Review shared activity, reflections, confidence
                  check-ins and discussion points between sessions.
                </p>
              </div>

              <div
                class="therapist-activity-workspace__sharing"
              >
                <span>
                  ♙ Client-controlled sharing
                </span>

                <button
                  type="button"
                  @click="handleRequestAccess"
                >
                  Request access →
                </button>
              </div>
            </header>

            <!-- ACTIVITY SUMMARY -->
            <TherapistClientActivitySummary
              :items="activitySummaryCards"
            />

            <!-- ACTIVITY FILTERS -->
            <TherapistClientActivityFilters
              :search="activitySearch"
              :active-filter="activityFilter"
              :date-range="activityDateRange"
              :filters="activityFilters"
              @update:search="activitySearch = $event"
              @update:active-filter="
                activityFilter = $event
              "
              @update:date-range="
                activityDateRange = $event
              "
            />

            <!-- ACTIVITY TIMELINE -->
            <section class="therapist-activity-main-panel">
              <div class="therapist-quest-panel-heading">
                <div>
                  <span>
                    ACTIVITY TIMELINE
                  </span>

                  <h3>
                    Since last session
                  </h3>
                </div>

                <span class="therapist-quest-panel-count">
                  {{ filteredActivity.length }}
                </span>
              </div>

              <TherapistClientActivityTimeline
                :grouped-activity="groupedActivity"
                @request-access="
                  handleActivityPermissionRequest
                "
              />
            </section>
          </section>
        </template>

        <!-- =================================================
             INSIGHTS PLACEHOLDER
        ================================================== -->
        <template
          v-else-if="activeWorkspace === 'insights'"
        >
          <section class="therapist-workspace-placeholder">
            <div
              class="therapist-workspace-placeholder__icon"
            >
              ✧
            </div>

            <span class="therapist-workspace-placeholder__premium">
              THERAPIST PREMIUM
            </span>

            <h2>
              Between Session Insights
            </h2>

            <p>
              Patterns and trends for
              {{ selectedClient.name }} will appear here.
            </p>

            <small>
              We will build this workspace next.
            </small>
          </section>
        </template>

        <!-- =================================================
             REPORTS PLACEHOLDER
        ================================================== -->
        <template
          v-else-if="activeWorkspace === 'reports'"
        >
          <section class="therapist-workspace-placeholder">
            <div
              class="therapist-workspace-placeholder__icon"
            >
              ▤
            </div>

            <span class="therapist-workspace-placeholder__premium">
              THERAPIST PREMIUM
            </span>

            <h2>
              Session Reports
            </h2>

            <p>
              Session preparation reports and previous reports for
              {{ selectedClient.name }} will appear here.
            </p>

            <small>
              We will build this workspace today.
            </small>
          </section>
        </template>

        <!-- =================================================
             SHARING PLACEHOLDER
        ================================================== -->
        <template
          v-else-if="activeWorkspace === 'sharing'"
        >
          <section class="therapist-workspace-placeholder">
            <div
              class="therapist-workspace-placeholder__icon"
            >
              ♙
            </div>

            <h2>
              Sharing & Permissions
            </h2>

            <p>
              Review what {{ selectedClient.name }} has chosen to
              share and request additional access where appropriate.
            </p>

            <button
              type="button"
              class="therapist-quest-button therapist-quest-button--secondary"
              @click="handleRequestAccess"
            >
              Request Additional Access
            </button>
          </section>
        </template>
      </main>
    </div>

    <!-- =====================================================
         NO CLIENTS
    ====================================================== -->
    <div
      v-else
      class="therapist-quests-empty"
    >
      <h2>
        No clients available
      </h2>

      <p>
        Connect a client before reviewing their workspace.
      </p>

      <RouterLink
        to="/therapist/clients"
        class="therapist-quest-button therapist-quest-button--primary"
      >
        View Clients
      </RouterLink>
    </div>
  </section>
</template>

<style src="./TherapistQuests.css"></style>