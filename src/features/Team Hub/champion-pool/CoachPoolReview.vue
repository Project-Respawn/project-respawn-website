<template>
  <div class="team-workspace">
    <TeamHubSidebar />

    <main class="coach-review-page">
      <header class="review-header">
        <div>
          <span class="eyebrow">LEAGUE OF LEGENDS</span>
          <h1>{{ canEditAssessments ? 'Coach Review' : 'Competitive Overview' }}</h1>
          <p>{{ canEditAssessments ? 'Review Player-authored pools and save independent Coach assessments.' : 'Read-only Player pools and Coach assessments for team planning.' }}</p>
        </div>

        <div class="review-controls">
          <label>
            <span>Player</span>

            <select v-model="selectedPlayerId">
              <option
                v-for="player in players"
                :key="player.id"
                :value="player.id"
              >
                {{ player.name }} — {{ player.role }}
              </option>
            </select>
          </label>

          <label>
            <span>Patch</span>

            <select v-model="selectedPatch">
              <option :value="dataDragonVersion">
                {{ dataDragonVersion || 'Loading' }}
              </option>
            </select>
          </label>

          <span class="status-badge">
            {{ selectedPlayer.statusLabel }}
          </span>

          <span class="submitted-date">
            Submitted: {{ selectedPlayer.submittedAt }}
          </span>
        </div>
      </header>

      <div v-if="loading" class="state-panel">
        Loading League champions…
      </div>

      <div v-else-if="loadError" class="state-panel state-panel--error">
        <strong>Champion catalogue unavailable</strong>
        <p>{{ loadError }}</p>

        <button type="button" @click="loadChampions">
          Try again
        </button>
      </div>

      <template v-else>
        <section class="upper-workspace">
          <!-- Read-only player pool -->
          <article class="pool-panel">
            <div class="panel-heading">
              <div>
                <span class="eyebrow">PLAYER SUBMISSION</span>
                <h2>{{ selectedPlayer.name }}’s Champion Pool</h2>
              </div>

              <span class="read-only-badge">Read only</span>
            </div>

            <div class="tier-board">
              <div
                v-for="tier in tiers"
                :key="tier.id"
                class="tier-row"
                :class="`tier-row--${tier.id.toLowerCase()}`"
              >
                <div class="tier-label">
                  <strong>{{ tier.id }}</strong>
                  <span>{{ tier.label }}</span>
                </div>

                <div class="tier-champions">
                  <button
                    v-for="champion in championsForTier(tier.id)"
                    :key="champion.id"
                    type="button"
                    class="champion-tile"
                    :class="{
                      'champion-tile--selected':
                        selectedChampionId === champion.id,
                    }"
                    @click="selectReviewChampion(champion)"
                  >
                    <img
                      :src="getChampionImage(champion)"
                      :alt="champion.name"
                    />

                    <span>{{ champion.name }}</span>
                  </button>

                  <span
                    v-if="!championsForTier(tier.id).length"
                    class="empty-tier"
                  >
                    No champions
                  </span>
                </div>
              </div>
            </div>
          </article>

          <div class="review-column">
            <!-- Coach feedback -->
            <article class="review-panel">
              <div class="panel-heading">
                <div>
                  <span class="eyebrow">MANUAL FEEDBACK</span>
                  <h2>Coach Review</h2>
                </div>
              </div>

              <div v-if="selectedChampion" class="selected-review-champion">
                <img
                  :src="getChampionImage(selectedChampion)"
                  :alt="selectedChampion.name"
                />

                <div>
                  <strong>{{ selectedChampion.name }}</strong>

                  <span>
                    {{ selectedChampionTier }} —
                    {{ tierLabel(selectedChampionTier) }}
                  </span>
                  <small v-if="selectedPoolEntry">Player note: {{ selectedPoolEntry.playerNotes || 'None' }} · Updated {{ selectedPoolEntry.updatedAt || 'Unknown' }}</small>
                </div>
              </div>

              <div v-else class="select-prompt">
                Select a champion from the player’s pool.
              </div>

              <label class="form-field">
                <span>Coach ranking</span>
                <select v-model="reviewForm.coachTier" :disabled="!selectedChampion || !canEditAssessments">
                  <option value="">Not ranked</option><option v-for="tier in tiers" :key="tier.id" :value="tier.id">{{ tier.id }} — {{ tier.label }}</option>
                </select>
              </label>

              <label class="form-field">
                <span>Coach assessment</span>

                <select
                  v-model="reviewForm.assessment"
                  :disabled="!selectedChampion || !canEditAssessments"
                >
                  <option value="">Select assessment</option>
                  <option value="MATCH_APPROVED">
                    Match approved
                  </option>
                  <option value="SCRIMS_ONLY">
                    Scrims only
                  </option>
                  <option value="MORE_PRACTICE">
                    More practice required
                  </option>
                  <option value="NOT_APPROVED">
                    Not currently approved
                  </option>
                </select>
              </label>

              <label class="form-field">
                <span>Improvement suggestion</span>

                <textarea
                  v-model.trim="reviewForm.suggestion"
                  :disabled="!selectedChampion || !canEditAssessments"
                  maxlength="500"
                  placeholder="Enter your improvement suggestions…"
                />

                <small>
                  {{ reviewForm.suggestion.length }}/500
                </small>
              </label>

              <label class="form-field">
                <span>Private note</span>

                <textarea
                  v-model.trim="reviewForm.privateNote"
                  :disabled="!selectedChampion || !canEditAssessments"
                  maxlength="300"
                  placeholder="Visible to coaches only…"
                />

                <small>
                  {{ reviewForm.privateNote.length }}/300
                </small>
              </label>

              <div class="review-actions">
                <button
                  type="button"
                  class="secondary-button"
                  :disabled="!selectedChampion || !canEditAssessments || savingAssessment"
                  @click="saveChampionReview"
                >
                  Save Champion Note
                </button>
              </div>

            </article>

            <!-- Flex picks -->
            <article class="flex-panel">
              <div class="panel-heading">
                <div>
                  <span class="eyebrow">TEAM COVERAGE</span>
                  <h2>Current Flex Picks</h2>
                </div>
              </div>

              <div v-if="visibleFlexPicks.length" class="flex-list">
                <div
                  v-for="flexPick in visibleFlexPicks"
                  :key="flexPick.champion.id"
                  class="flex-pick"
                  :class="{
                    'flex-pick--selected-player':
                      flexPick.playerIds.includes(selectedPlayer.id),
                  }"
                >
                  <img
                    :src="getChampionImage(flexPick.champion)"
                    :alt="flexPick.champion.name"
                  />

                  <div class="flex-details">
                    <strong>{{ flexPick.champion.name }}</strong>

                    <span>
                      {{ flexPick.roles.join(' / ') }}
                    </span>

                    <small>
                      {{ flexPick.ratingSummary }}
                    </small>
                  </div>

                  <div class="flex-actions">
                    <span
                      class="flex-status"
                      :class="{
                        'flex-status--confirmed':
                          flexPick.status === 'CONFIRMED',
                      }"
                    >
                      {{
                        flexPick.status === 'CONFIRMED'
                          ? 'Confirmed Flex'
                          : 'Potential Flex'
                      }}
                    </span>

                    <button
                      v-if="flexPick.status !== 'CONFIRMED'"
                      type="button"
                      disabled
                      title="Flex decisions are outside the Team Hub MVP"
                      @click="confirmFlexPick(flexPick.champion.id)"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>

              <p v-else class="empty-message">
                No current flex-pick overlaps were found.
              </p>
            </article>
          </div>
        </section>

        <!-- Champion recommendations -->
        <section class="recommendation-section">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">PLAYER DEVELOPMENT</span>

              <h2>
                Recommend Champions for
                {{ selectedPlayer.name }} — {{ selectedPlayer.role }}
              </h2>
            </div>
          </div>

          <div class="recommendation-layout">
            <div class="recommendation-catalogue">
              <div class="recommendation-controls">
                <input
                  v-model.trim="recommendationSearch"
                  type="search"
                  placeholder="Search champions by name…"
                />

                <label class="toggle-control">
                  <input
                    v-model="recommendUnratedOnly"
                    type="checkbox"
                  />

                  <span>Unrated only</span>
                </label>
              </div>

              <div class="recommendation-grid">
                <button
                  v-for="champion in recommendationChampions"
                  :key="champion.id"
                  type="button"
                  class="recommendation-champion"
                  :class="{
                    'recommendation-champion--selected':
                      selectedRecommendationChampionId === champion.id,
                  }"
                  @click="selectRecommendationChampion(champion)"
                >
                  <img
                    :src="getChampionImage(champion)"
                    :alt="champion.name"
                  />

                  <span>{{ champion.name }}</span>

                  <span
                    v-if="selectedPlayer.ratings[champion.id]"
                    class="existing-tier"
                  >
                    {{ selectedPlayer.ratings[champion.id] }}
                  </span>

                  <span v-else class="add-marker">+</span>
                </button>
              </div>
            </div>

            <div class="recommendation-form-panel">
              <div
                v-if="selectedRecommendationChampion"
                class="recommendation-selection"
              >
                <img
                  :src="getChampionImage(selectedRecommendationChampion)"
                  :alt="selectedRecommendationChampion.name"
                />

                <div>
                  <strong>
                    {{ selectedRecommendationChampion.name }}
                  </strong>

                  <span>
                    {{
                      selectedPlayer.ratings[
                        selectedRecommendationChampion.id
                      ]
                        ? `Currently ${
                            selectedPlayer.ratings[
                              selectedRecommendationChampion.id
                            ]
                          } tier`
                        : 'Not currently rated'
                    }}
                  </span>
                </div>
              </div>

              <p v-else class="select-prompt">
                Select a champion to recommend.
              </p>

              <label class="form-field">
                <span>Reason for recommendation</span>

                <textarea
                  v-model.trim="recommendationForm.reason"
                  :disabled="!selectedRecommendationChampion"
                  maxlength="500"
                  placeholder="Explain why the player should practise this champion…"
                />
              </label>

              <div class="recommendation-fields">
                <label class="form-field">
                  <span>Priority</span>

                  <select
                    v-model="recommendationForm.priority"
                    :disabled="!selectedRecommendationChampion"
                  >
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="OPTIONAL">Optional</option>
                  </select>
                </label>

                <label class="form-field">
                  <span>Suggested target</span>

                  <select
                    v-model="recommendationForm.target"
                    :disabled="!selectedRecommendationChampion"
                  >
                    <option value="PRACTISING">
                      Begin practising
                    </option>
                    <option value="COMFORTABLE">
                      Become comfortable
                    </option>
                    <option value="MATCH_READY">
                      Work towards match ready
                    </option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                class="recommend-button"
                :disabled="!canSubmitRecommendation"
                disabled
                title="Recommendations are outside the Team Hub MVP"
                @click="recommendChampion"
              >
                Recommend Champion
              </button>
            </div>

            <div class="current-recommendations">
              <h3>Current recommendations</h3>

              <div
                v-for="recommendation in selectedPlayerRecommendations"
                :key="recommendation.id"
                class="recommendation-item"
              >
                <img
                  :src="getChampionImageById(recommendation.championId)"
                  alt=""
                />

                <div>
                  <strong>
                    {{ championName(recommendation.championId) }}
                  </strong>

                  <span>
                    {{ recommendationStatusLabel(recommendation.status) }}
                  </span>

                  <small>
                    Priority:
                    {{ formatLabel(recommendation.priority) }}
                  </small>
                </div>
              </div>

              <p
                v-if="!selectedPlayerRecommendations.length"
                class="empty-message"
              >
                No recommendations have been sent.
              </p>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import TeamHubSidebar from '../TeamHubSidebar.vue';

import {
  championImageUrl,
  loadChampionCatalogue,
} from './dataDragon.service.js';
import { getTeamHub, listTeamChampionPools, loadBoundedPages, upsertCoachAssessment } from '../teamHub.service.js';

const TIERS = [
  { id: 'S', label: 'Signature' },
  { id: 'A', label: 'Match Ready' },
  { id: 'B', label: 'Comfortable' },
  { id: 'C', label: 'Practising' },
  { id: 'D', label: 'Not Ready' },
];

const route = useRoute();

const tiers = TIERS;
const champions = ref([]);
const dataDragonVersion = ref('');
const loading = ref(true);
const loadError = ref('');
const teamContext = ref(null);
const savingAssessment = ref(false);
const canEditAssessments = computed(() => teamContext.value?.capabilities?.canEditCoachAssessments === true);

const selectedPlayerId = ref('');
const selectedPatch = ref('');
const selectedChampionId = ref(null);
const selectedRecommendationChampionId = ref(null);

const overallFeedback = ref('');
const recommendationSearch = ref('');
const recommendUnratedOnly = ref(true);

const reviewForm = reactive({
  coachTier: '',
  assessment: '',
  suggestion: '',
  privateNote: '',
});

const recommendationForm = reactive({
  reason: '',
  priority: 'NORMAL',
  target: 'PRACTISING',
});

const teamSlug = computed(() => {
  return route.params.teamSlug || 'project-respawn';
});

const players = ref([]);

const championReviews = ref({});
const recommendations = ref([]);
const flexDecisions = ref({});

const selectedPlayer = computed(() => {
  return (
    players.value.find(
      (player) => player.id === selectedPlayerId.value,
    ) ?? players.value[0]
  );
});

const selectedChampion = computed(() => {
  return championById(selectedChampionId.value);
});

const selectedChampionTier = computed(() => {
  if (!selectedChampion.value) {
    return '';
  }

  return (
    selectedPlayer.value.ratings[selectedChampion.value.id] ?? ''
  );
});
const selectedPoolEntry = computed(() => selectedPlayer.value?.entries?.find((entry) => entry.championId === selectedChampionId.value) || null);

const selectedRecommendationChampion = computed(() => {
  return championById(selectedRecommendationChampionId.value);
});

const recommendationChampions = computed(() => {
  const search = recommendationSearch.value.toLowerCase();

  return champions.value.filter((champion) => {
    const matchesSearch =
      !search ||
      champion.name.toLowerCase().includes(search);

    const matchesUnrated =
      !recommendUnratedOnly.value ||
      !selectedPlayer.value.ratings[champion.id];

    return matchesSearch && matchesUnrated;
  });
});

const selectedPlayerRecommendations = computed(() => {
  return recommendations.value.filter(
    (recommendation) =>
      recommendation.playerId === selectedPlayer.value.id,
  );
});

const canSubmitRecommendation = computed(() => {
  return Boolean(
    selectedRecommendationChampion.value &&
      recommendationForm.reason.trim(),
  );
});

const flexPicks = computed(() => {
  const championUsage = new Map();

  for (const player of players.value) {
    for (const [championId, tier] of Object.entries(player.ratings)) {
      if (!['S', 'A', 'B'].includes(tier)) {
        continue;
      }

      if (!championUsage.has(championId)) {
        championUsage.set(championId, []);
      }

      championUsage.get(championId).push({
        playerId: player.id,
        playerName: player.name,
        role: player.role,
        tier,
      });
    }
  }

  return [...championUsage.entries()]
    .filter(([, usage]) => usage.length >= 2)
    .map(([championId, usage]) => ({
      champion: championById(championId),
      playerIds: usage.map((entry) => entry.playerId),
      roles: [...new Set(usage.map((entry) => entry.role))],
      ratingSummary: usage
        .map((entry) => `${entry.role} ${entry.tier}`)
        .join(' · '),
      status:
        flexDecisions.value[championId] === 'CONFIRMED'
          ? 'CONFIRMED'
          : 'POTENTIAL',
    }))
    .filter((entry) => entry.champion);
});

const visibleFlexPicks = computed(() => {
  return [...flexPicks.value].sort((first, second) => {
    const firstIncludesPlayer = first.playerIds.includes(
      selectedPlayer.value.id,
    );

    const secondIncludesPlayer = second.playerIds.includes(
      selectedPlayer.value.id,
    );

    return Number(secondIncludesPlayer) - Number(firstIncludesPlayer);
  });
});

watch(selectedPlayerId, () => {
  selectedChampionId.value = null;
  selectedRecommendationChampionId.value = null;
  overallFeedback.value = '';
  resetReviewForm();
  resetRecommendationForm();
});

onMounted(async () => {
  await loadChampions();
  try {
    const context = await getTeamHub({ teamSlug: teamSlug.value });
    teamContext.value = context;
    const pool = await loadBoundedPages((nextToken) => listTeamChampionPools(context.team.id, { limit: 50, ...(nextToken ? { nextToken } : {}) }));
    if (!pool.complete) throw new Error('Team Hub data limit exceeded');
    const entries = pool.items;
    championReviews.value = Object.fromEntries(entries.filter((entry) => entry.coachTier || entry.coachAssessment || entry.coachRecommendation).map((entry) => [`${entry.membershipId}:${entry.championId}`, { coachTier: entry.coachTier || '', assessment: entry.coachAssessment || '', suggestion: entry.coachRecommendation || '', privateNote: '' }]));
    const slots = new Map(context.roster.map((slot) => [slot.membershipId, slot.gameRoleKey]));
    players.value = context.members.filter((member) => member.role === 'PLAYER' && member.status === 'ACTIVE').map((member) => ({
      id: member.id,
      name: member.displayName,
      role: slots.get(member.id) || 'Unassigned',
      status: 'ACTIVE',
      statusLabel: 'Active',
      submittedAt: entries.filter((entry) => entry.membershipId === member.id).map((entry) => entry.updatedAt).filter(Boolean).sort().at(-1) || 'Missing submission',
      ratings: Object.fromEntries(entries.filter((entry) => entry.membershipId === member.id).map((entry) => [entry.championId, entry.comfortLevel])),
      entries: entries.filter((entry) => entry.membershipId === member.id),
    }));
    selectedPlayerId.value = players.value.some((player) => player.id === route.query.player) ? route.query.player : (players.value[0]?.id || '');
    if (!players.value.length) loadError.value = 'No active players are assigned to this team.';
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unable to load team champion pools.';
  }
});

async function loadChampions() {
  loading.value = true;
  loadError.value = '';

  try {
    const catalogue = await loadChampionCatalogue();

    champions.value = catalogue.champions;
    dataDragonVersion.value = catalogue.version;
    selectedPatch.value = catalogue.version;
  } catch (error) {
    loadError.value =
      error instanceof Error
        ? error.message
        : 'Unable to load champions.';
  } finally {
    loading.value = false;
  }
}

function championById(championId) {
  return champions.value.find(
    (champion) => champion.id === championId,
  );
}

function championName(championId) {
  return championById(championId)?.name ?? championId;
}

function getChampionImage(champion) {
  return championImageUrl(
    dataDragonVersion.value,
    champion,
  );
}

function getChampionImageById(championId) {
  const champion = championById(championId);

  return champion ? getChampionImage(champion) : '';
}

function championsForTier(tierId) {
  return champions.value.filter(
    (champion) =>
      selectedPlayer.value.ratings[champion.id] === tierId,
  );
}

function tierLabel(tierId) {
  return tiers.find((tier) => tier.id === tierId)?.label ?? '';
}

function selectReviewChampion(champion) {
  selectedChampionId.value = champion.id;

  const key = reviewKey(
    selectedPlayer.value.id,
    champion.id,
  );

  const savedReview = championReviews.value[key];

  reviewForm.assessment = savedReview?.assessment ?? '';
  reviewForm.coachTier = savedReview?.coachTier ?? '';
  reviewForm.suggestion = savedReview?.suggestion ?? '';
  reviewForm.privateNote = savedReview?.privateNote ?? '';
}

async function saveChampionReview() {
  if (!selectedChampion.value || !canEditAssessments.value || savingAssessment.value) {
    return;
  }

  const key = reviewKey(
    selectedPlayer.value.id,
    selectedChampion.value.id,
  );

  savingAssessment.value = true;
  try {
    await upsertCoachAssessment({ teamId: teamContext.value.team.id, membershipId: selectedPlayer.value.id, championId: selectedChampion.value.id, payload: { coachTier: reviewForm.coachTier || null, coachAssessment: reviewForm.assessment, coachRecommendation: `${reviewForm.suggestion}${reviewForm.privateNote ? `\nPrivate: ${reviewForm.privateNote}` : ''}`, coachPriorityPractice: reviewForm.assessment === 'MORE_PRACTICE' } });
  championReviews.value = {
    ...championReviews.value,

    [key]: {
      playerId: selectedPlayer.value.id,
      championId: selectedChampion.value.id,
      assessment: reviewForm.assessment,
      coachTier: reviewForm.coachTier,
      suggestion: reviewForm.suggestion,
      privateNote: reviewForm.privateNote,
      updatedAt: new Date().toISOString(),
    },
  };
  } catch (error) { loadError.value = error instanceof Error ? error.message : 'Unable to save Coach assessment.'; }
  finally { savingAssessment.value = false; }
}

function approvePool() {
  selectedPlayer.value.status = 'APPROVED';
  selectedPlayer.value.statusLabel = 'Approved';

}

function requestChanges() {
  if (!overallFeedback.value.trim()) {
    return;
  }

  selectedPlayer.value.status = 'CHANGES_REQUESTED';
  selectedPlayer.value.statusLabel = 'Changes Requested';
  selectedPlayer.value.overallFeedback =
    overallFeedback.value.trim();

}

function confirmFlexPick(championId) {
  flexDecisions.value = {
    ...flexDecisions.value,
    [championId]: 'CONFIRMED',
  };

}

function selectRecommendationChampion(champion) {
  selectedRecommendationChampionId.value = champion.id;
  resetRecommendationForm();
}

function recommendChampion() {
  if (!canSubmitRecommendation.value) {
    return;
  }

  recommendations.value = [
    ...recommendations.value,

    {
      id: crypto.randomUUID(),
      playerId: selectedPlayer.value.id,
      championId: selectedRecommendationChampion.value.id,
      reason: recommendationForm.reason.trim(),
      priority: recommendationForm.priority,
      target: recommendationForm.target,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  ];


  selectedRecommendationChampionId.value = null;
  resetRecommendationForm();
}

function recommendationStatusLabel(status) {
  const labels = {
    PENDING: 'Pending',
    ADDED: 'Added to pool',
    DECLINED: 'Not now',
  };

  return labels[status] ?? status;
}

function formatLabel(value) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function reviewKey(playerId, championId) {
  return `${playerId}:${championId}`;
}

function resetReviewForm() {
  reviewForm.coachTier = '';
  reviewForm.assessment = '';
  reviewForm.suggestion = '';
  reviewForm.privateNote = '';
}

function resetRecommendationForm() {
  recommendationForm.reason = '';
  recommendationForm.priority = 'NORMAL';
  recommendationForm.target = 'PRACTISING';
}

</script>

<style scoped>
.team-workspace {
  display: flex;
  min-height: calc(100vh - var(--header-height, 72px));
  color: #f5f7fa;
  background: #07090d;
}

.coach-review-page {
  flex: 1;
  min-width: 0;
  padding: 20px;
}

.review-header {
  margin-bottom: 16px;
}

.review-header h1,
.panel-heading h2 {
  margin: 0;
}

.eyebrow {
  display: block;
  margin-bottom: 6px;
  color: #a9ff38;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.review-controls {
  display: flex;
  align-items: end;
  gap: 12px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.review-controls label,
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.review-controls label > span,
.form-field > span {
  color: #939dab;
  font-size: 0.73rem;
}

select,
input,
textarea {
  color: #f5f7fa;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 7px;
  background: #101319;
  font: inherit;
}

select,
input {
  min-height: 40px;
  padding: 0 11px;
}

textarea {
  min-height: 76px;
  padding: 10px;
  resize: vertical;
}

.status-badge,
.read-only-badge,
.flex-status {
  padding: 6px 9px;
  color: #c39bff;
  border: 1px solid rgba(139, 61, 255, 0.45);
  border-radius: 7px;
  background: rgba(139, 61, 255, 0.08);
  font-size: 0.73rem;
}

.submitted-date {
  padding-bottom: 10px;
  color: #a8b0bc;
  font-size: 0.8rem;
}

.upper-workspace {
  display: grid;
  grid-template-columns: minmax(520px, 1.25fr) minmax(390px, 0.75fr);
  gap: 14px;
}

.pool-panel,
.review-panel,
.flex-panel,
.recommendation-section {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  background: #0d1015;
}

.review-column {
  display: grid;
  align-content: start;
  gap: 12px;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.tier-board {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tier-row {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  min-height: 91px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tier-row:last-child {
  border-bottom: 0;
}

.tier-label {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #080a0d;
}

.tier-label span {
  font-size: 0.58rem;
}

.tier-row--s .tier-label {
  background: #ff777c;
}

.tier-row--a .tier-label {
  background: #ffb96f;
}

.tier-row--b .tier-label {
  background: #ffe27a;
}

.tier-row--c .tier-label {
  background: #f3fc72;
}

.tier-row--d .tier-label {
  background: #a9ef6d;
}

.tier-champions {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px;
  flex-wrap: wrap;
}

.champion-tile,
.recommendation-champion {
  position: relative;
  overflow: hidden;
  width: 62px;
  padding: 0;
  color: #f5f7fa;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #151922;
  cursor: pointer;
}

.champion-tile--selected,
.recommendation-champion--selected {
  border-color: #a9ff38;
}

.champion-tile img,
.recommendation-champion img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.champion-tile span,
.recommendation-champion > span:first-of-type {
  display: block;
  overflow: hidden;
  padding: 4px 2px;
  font-size: 0.62rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-tier,
.empty-message,
.select-prompt {
  color: #78818e;
  font-size: 0.78rem;
}

.selected-review-champion,
.recommendation-selection {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}

.selected-review-champion img,
.recommendation-selection img,
.flex-pick img,
.recommendation-item img {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
}

.selected-review-champion strong,
.selected-review-champion span,
.recommendation-selection strong,
.recommendation-selection span {
  display: block;
}

.selected-review-champion span,
.recommendation-selection span {
  margin-top: 3px;
  color: #a9ff38;
  font-size: 0.73rem;
}

.form-field {
  margin-bottom: 11px;
}

.form-field small {
  color: #727b88;
  text-align: right;
}

.review-actions,
.approval-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-bottom: 13px;
}

.primary-button,
.secondary-button,
.recommend-button,
.flex-actions button {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 7px;
  cursor: pointer;
}

.primary-button {
  color: #071000;
  border-color: #a9ff38;
  background: #a9ff38;
}

.secondary-button,
.flex-actions button {
  color: #f5f7fa;
  background: transparent;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.flex-list {
  display: grid;
  gap: 7px;
}

.flex-pick {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;
}

.flex-pick--selected-player {
  border-color: rgba(139, 61, 255, 0.4);
  background: rgba(139, 61, 255, 0.05);
}

.flex-details strong,
.flex-details span,
.flex-details small {
  display: block;
}

.flex-details span {
  color: #c39bff;
  font-size: 0.73rem;
}

.flex-details small {
  color: #89929f;
}

.flex-actions {
  display: grid;
  justify-items: end;
  gap: 5px;
}

.flex-status--confirmed {
  color: #a9ff38;
  border-color: rgba(169, 255, 56, 0.35);
}

.recommendation-section {
  margin-top: 14px;
}

.recommendation-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.65fr) minmax(250px, 0.6fr);
  gap: 13px;
}

.recommendation-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 11px;
}

.recommendation-controls input {
  flex: 1;
  border-color: #8142d3;
}

.toggle-control {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #a7b0bd;
  font-size: 0.76rem;
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
  gap: 7px;
}

.existing-tier,
.add-marker {
  position: absolute;
  top: 3px;
  right: 3px;
  display: grid !important;
  width: 20px;
  height: 20px;
  place-items: center;
  padding: 0 !important;
  color: #080a0d;
  border-radius: 50%;
  background: #a9ff38;
  font-size: 0.65rem;
  font-weight: 700;
}

.add-marker {
  color: #ffffff;
  background: #7d36d6;
}

.recommendation-form-panel,
.current-recommendations {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 9px;
  background: #101319;
}

.recommendation-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.recommend-button {
  width: 100%;
  color: #ffffff;
  border-color: #7830d4;
  background: #7830d4;
}

.current-recommendations h3 {
  margin-top: 0;
}

.recommendation-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.recommendation-item strong,
.recommendation-item span,
.recommendation-item small {
  display: block;
}

.recommendation-item span {
  color: #c39bff;
  font-size: 0.72rem;
}

.recommendation-item small {
  color: #818b98;
}

.state-panel {
  padding: 40px;
  text-align: center;
}

.state-panel--error {
  color: #ff9c9c;
}

@media (max-width: 1250px) {
  .upper-workspace,
  .recommendation-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 800px) {
  .team-workspace {
    display: block;
  }

  .coach-review-page {
    padding: 12px;
  }

  .tier-row {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .recommendation-controls,
  .approval-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
