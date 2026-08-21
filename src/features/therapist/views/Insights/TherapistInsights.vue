<script src="./TherapistInsights.js"></script>

<template>
  <section v-if="insights" class="therapist-insights-workspace">
    <header class="therapist-insights-workspace__header">
      <div>
        <span class="therapist-quest-workspace-header__client">{{ client.name }}</span>
        <h2>Between Session Insights</h2>
        <p>
          Review changes, engagement patterns and shared information to help
          prepare for your next session with {{ clientFirstName }}.
        </p>
      </div>

      <div class="therapist-insights-workspace__sharing">
        <span>♙ Client-controlled data</span>
        <button type="button" @click="$emit('request-access')">
          Request additional access →
        </button>
      </div>
    </header>

    <TherapistSinceLastSession :data="insights.sinceLastSession" />

    <section class="therapist-insights-grid therapist-insights-grid--two">
      <TherapistConfidenceTrend
        :data="insights.confidenceTrend"
        :selected-period="confidencePeriod"
        @update:selected-period="$emit('update:confidencePeriod', $event)"
      />
      <TherapistGoalProgress
        :goals="insights.goalProgress"
        :summary="insights.goalProgressSummary"
        @view-goals="$emit('navigate', 'quests')"
      />
    </section>

    <section class="therapist-insights-grid therapist-insights-grid--two">
      <TherapistInteractionBreakdown
        :data="insights.questTypeInsights"
        :selected-view="questView"
        :selected-period="questPeriod"
        @update:selected-view="$emit('update:questView', $event)"
        @update:selected-period="$emit('update:questPeriod', $event)"
      />
      <TherapistPatternSummary
        :patterns="insights.patterns"
        @view-details="$emit('navigate', 'activity')"
      />
    </section>

    <TherapistDiscussionTopics
      :topics="insights.discussionTopics"
      @view-activity="$emit('navigate', 'activity')"
    />

    <footer class="therapist-insights-workspace__footer">
      <span>i</span>
      <p>
        Insights are based on information shared through Project Respawn.
        They highlight observed activity and patterns and are not clinical
        conclusions, diagnoses or treatment recommendations.
      </p>
    </footer>
  </section>

  <section v-else class="therapist-workspace-placeholder">
    <div class="therapist-workspace-placeholder__icon">✧</div>
    <span class="therapist-workspace-placeholder__premium">THERAPIST PREMIUM</span>
    <h2>No Insights Available</h2>
    <p>
      There is not enough shared information for {{ client.name }} to display
      Insights yet.
    </p>
    <button
      type="button"
      class="therapist-quest-button therapist-quest-button--secondary"
      @click="$emit('navigate', 'activity')"
    >
      View Activity
    </button>
  </section>
</template>

<style src="./TherapistInsights.css"></style>
