<template>
  <div class="team-workspace">
    <TeamHubSidebar />

    <main class="champion-pool-page">
      <section class="submission-bar">
        <div class="submission-details">
          <span>
            Last submitted:
            <strong>{{ formattedSubmissionDate }}</strong>
          </span>

          <span
            class="submission-status"
            :class="`submission-status--${submissionStatus.toLowerCase()}`"
          >
            {{ submissionStatusLabel }}
          </span>
        </div>

        <div class="submission-actions">
          <button
            v-if="submissionStatus === 'UNDER_REVIEW'"
            type="button"
            class="secondary-button"
            @click="withdrawSubmission"
          >
            Withdraw
          </button>

          <template v-else>
            <button
              type="button"
              class="secondary-button"
              :disabled="!isDirty"
              @click="saveDraft"
            >
              Save Draft
            </button>

            <button
              type="button"
              class="primary-button"
              @click="submitPool"
            >
              Submit
            </button>
          </template>
        </div>
      </section>

      <header class="page-heading">
        <div>
          <span class="page-eyebrow">LEAGUE OF LEGENDS</span>
          <h1>My Champion Pool</h1>

          <p>
            {{ playerName }} · {{ assignedRole }} ·
            Patch {{ dataDragonVersion || 'Loading' }}
          </p>
        </div>

        <span
          v-if="usingCachedCatalogue"
          class="catalogue-warning"
        >
          Using cached champion catalogue
        </span>
      </header>

      <div v-if="loading" class="loading-state">
        Loading League of Legends champions…
      </div>

      <div v-else-if="loadError" class="error-state">
        <strong>Champion catalogue unavailable</strong>
        <p>{{ loadError }}</p>

        <button
          type="button"
          class="secondary-button"
          @click="loadChampions"
        >
          Try Again
        </button>
      </div>

      <section v-else class="champion-workspace">
        <!-- Champion selection -->
        <div class="champion-selection-panel">
          <div class="panel-heading">
            <div>
              <span class="page-eyebrow">
                {{ assignedRole.toUpperCase() }} POOL
              </span>

              <h2>Choose {{ assignedRole }} Champions</h2>
            </div>
          </div>

          <label class="search-field">
            <span class="visually-hidden">Search champions</span>

            <input
              v-model.trim="searchTerm"
              type="search"
              placeholder="Search champions by name…"
            />
          </label>

          <div class="selection-controls">
            <label class="toggle-control">
              <input
                v-model="showUnratedOnly"
                type="checkbox"
              />

              <span>Unrated only</span>
            </label>

            <div class="champion-counts">
              <span>
                {{ unratedChampionCount }} available
              </span>

              <span>
                {{ ratedChampionCount }} rated
              </span>
            </div>
          </div>

          <div class="champion-grid">
            <button
              v-for="champion in filteredChampions"
              :key="champion.id"
              type="button"
              class="champion-card"
              :class="{
                'champion-card--selected':
                  selectedChampionId === champion.id,
                'champion-card--rated':
                  Boolean(ratings[champion.id]),
              }"
              :draggable="canEdit"
              @click="selectChampion(champion)"
              @dragstart="startChampionDrag(champion)"
            >
              <img
                :src="getChampionImage(champion)"
                :alt="champion.name"
              />

              <span class="champion-name">
                {{ champion.name }}
              </span>

              <span
                v-if="ratings[champion.id]"
                class="champion-rating"
              >
                {{ ratings[champion.id] }}
              </span>
            </button>
          </div>

          <div
            v-if="!filteredChampions.length"
            class="empty-search"
          >
            No champions match “{{ searchTerm }}”.
          </div>
        </div>

        <!-- Tier ratings -->
        <div class="tier-panel">
          <div class="panel-heading">
            <div>
              <span class="page-eyebrow">SELF ASSESSMENT</span>
              <h2>My Ratings</h2>
            </div>

            <span>{{ ratedChampionCount }} rated</span>
          </div>

          <div class="tier-board">
            <div
              v-for="tier in tiers"
              :key="tier.id"
              class="tier-row"
              :class="`tier-row--${tier.id.toLowerCase()}`"
              @dragover.prevent
              @drop="dropChampionIntoTier(tier.id)"
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
                  class="tier-champion"
                  :draggable="canEdit"
                  @click="selectChampion(champion)"
                  @dragstart="startChampionDrag(champion)"
                >
                  <img
                    :src="getChampionImage(champion)"
                    :alt="champion.name"
                  />

                  <span>{{ champion.name }}</span>
                </button>

                <span
                  v-if="!championsForTier(tier.id).length"
                  class="tier-placeholder"
                >
                  Drag champions here
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="selectedChampion"
            class="selected-champion"
          >
            <img
              :src="getChampionImage(selectedChampion)"
              :alt="selectedChampion.name"
            />

            <div class="selected-champion-details">
              <strong>{{ selectedChampion.name }}</strong>

              <span>
                {{
                  ratings[selectedChampion.id]
                    ? `Currently ${ratings[selectedChampion.id]} tier`
                    : 'Not yet rated'
                }}
              </span>
            </div>

            <div class="selected-tier-actions">
              <button
                v-for="tier in tiers"
                :key="tier.id"
                type="button"
                :disabled="!canEdit"
                :class="{
                  'tier-action--active':
                    ratings[selectedChampion.id] === tier.id,
                }"
                @click="rateSelectedChampion(tier.id)"
              >
                {{ tier.id }}
              </button>

              <button
                type="button"
                :disabled="!canEdit"
                @click="removeSelectedRating"
              >
                Remove
              </button>
            </div>
          </div>

          <div
            v-if="!canEdit"
            class="review-lock"
          >
            This champion pool is currently under review. Withdraw the
            submission before making changes.
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import TeamHubSidebar from '../TeamHubSidebar.vue';

import {
  championImageUrl,
  loadChampionCatalogue,
} from './dataDragon.service.js';
import { deleteMyChampionPoolEntry, getTeamHub, listMyChampionPool, loadBoundedPages, upsertMyChampionPoolEntry } from '../teamHub.service.js';
import { indexRoleIndependentPool, isTeamHubDenied } from '../teamHub.viewModel.js';

const TIERS = [
  { id: 'S', label: 'Signature' },
  { id: 'A', label: 'Match Ready' },
  { id: 'B', label: 'Comfortable' },
  { id: 'C', label: 'Practising' },
  { id: 'D', label: 'Not Ready' },
];

const route = useRoute();

const playerName = ref('You');
const assignedRole = ref('Unassigned');
const teamId = ref('');
const originalChampionIds = ref(new Set());
const storedEntries = ref({});

const champions = ref([]);
const dataDragonVersion = ref('');
const loading = ref(true);
const loadError = ref('');
const usingCachedCatalogue = ref(false);

const searchTerm = ref('');
const showUnratedOnly = ref(false);
const selectedChampionId = ref(null);
const draggedChampionId = ref(null);

const ratings = ref({});
const submissionStatus = ref('DRAFT');
const lastSubmittedAt = ref(null);
const isDirty = ref(false);

const tiers = TIERS;

const teamSlug = computed(() => {
  return route.params.teamSlug || 'project-respawn';
});

const selectedChampion = computed(() => {
  return champions.value.find(
    (champion) => champion.id === selectedChampionId.value,
  );
});

const ratedChampionCount = computed(() => {
  return Object.keys(ratings.value).length;
});

const unratedChampionCount = computed(() => {
  return champions.value.length - ratedChampionCount.value;
});

const canEdit = computed(() => {
  return submissionStatus.value !== 'UNDER_REVIEW';
});

const filteredChampions = computed(() => {
  const search = searchTerm.value.toLowerCase();

  return champions.value.filter((champion) => {
    const matchesSearch =
      !search ||
      champion.name.toLowerCase().includes(search);

    const matchesRatingFilter =
      !showUnratedOnly.value ||
      !ratings.value[champion.id];

    return matchesSearch && matchesRatingFilter;
  });
});

const submissionStatusLabel = computed(() => {
  const labels = {
    DRAFT: 'Draft',
    UNDER_REVIEW: 'Under Review',
    CHANGES_REQUESTED: 'Changes Requested',
    APPROVED: 'Approved',
  };

  return labels[submissionStatus.value] ?? 'Draft';
});

const formattedSubmissionDate = computed(() => {
  if (!lastSubmittedAt.value) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(lastSubmittedAt.value));
});

onMounted(async () => {
  await loadChampions();
  try {
    const context = await getTeamHub({ teamSlug: teamSlug.value });
    teamId.value = context.team.id;
    const mine = context.members.find((member) => member.role === 'PLAYER' && member.status === 'ACTIVE');
    const slot = context.roster.find((entry) => entry.membershipId === mine?.id && entry.status === 'ACTIVE');
    assignedRole.value = slot?.gameRoleKey || 'Unassigned';
    const pool = await loadBoundedPages((nextToken) => listMyChampionPool(teamId.value, { limit: 50, ...(nextToken ? { nextToken } : {}) }));
    if (!pool.complete) throw new Error('Team Hub data limit exceeded');
    const entries = pool.items;
    storedEntries.value = indexRoleIndependentPool(entries);
    ratings.value = Object.fromEntries(entries.map((entry) => [entry.championId, entry.comfortLevel]));
    originalChampionIds.value = new Set(entries.map((entry) => entry.championId));
  } catch (error) {
    if (isTeamHubDenied(error)) {
      teamId.value = '';
      ratings.value = {};
      storedEntries.value = {};
      originalChampionIds.value = new Set();
    }
    loadError.value = error instanceof Error ? error.message : 'Unable to load your champion pool.';
  }
});

async function loadChampions() {
  loading.value = true;
  loadError.value = '';

  try {
    const catalogue = await loadChampionCatalogue();

    champions.value = catalogue.champions;
    dataDragonVersion.value = catalogue.version;
    usingCachedCatalogue.value =
      Boolean(catalogue.usingCachedData);
  } catch (error) {
    loadError.value =
      error instanceof Error
        ? error.message
        : 'Unable to load champions.';
  } finally {
    loading.value = false;
  }
}

function getChampionImage(champion) {
  return championImageUrl(
    dataDragonVersion.value,
    champion,
  );
}

function selectChampion(champion) {
  selectedChampionId.value = champion.id;
}

function startChampionDrag(champion) {
  if (!canEdit.value) {
    return;
  }

  draggedChampionId.value = champion.id;
  selectedChampionId.value = champion.id;
}

function dropChampionIntoTier(tierId) {
  if (!canEdit.value || !draggedChampionId.value) {
    return;
  }

  setChampionRating(draggedChampionId.value, tierId);
  draggedChampionId.value = null;
}

function rateSelectedChampion(tierId) {
  if (!canEdit.value || !selectedChampionId.value) {
    return;
  }

  setChampionRating(selectedChampionId.value, tierId);
}

function setChampionRating(championId, tierId) {
  ratings.value = {
    ...ratings.value,
    [championId]: tierId,
  };

  markAsChanged();
}

function removeSelectedRating() {
  if (!canEdit.value || !selectedChampionId.value) {
    return;
  }

  const updatedRatings = { ...ratings.value };

  delete updatedRatings[selectedChampionId.value];

  ratings.value = updatedRatings;
  markAsChanged();
}

function championsForTier(tierId) {
  return champions.value.filter(
    (champion) => ratings.value[champion.id] === tierId,
  );
}

function markAsChanged() {
  isDirty.value = true;

  if (
    submissionStatus.value === 'APPROVED' ||
    submissionStatus.value === 'CHANGES_REQUESTED'
  ) {
    submissionStatus.value = 'DRAFT';
  }
}

async function saveDraft() {
  await persistPool();
}

async function submitPool() {
  await persistPool();
}

function withdrawSubmission() {
  submissionStatus.value = 'DRAFT';
}

async function persistPool() {
  if (!teamId.value) return;
  try {
    await Promise.all(Object.entries(ratings.value).map(([championId, comfortLevel]) => upsertMyChampionPoolEntry({
      teamId: teamId.value, championId, gameRoleKey: assignedRole.value === 'Unassigned' ? null : assignedRole.value,
      comfortLevel, priority: 'NORMAL', competitiveReady: ['S', 'A'].includes(comfortLevel),
    })));
    await Promise.all([...originalChampionIds.value].filter((id) => !ratings.value[id]).map((championId) => deleteMyChampionPoolEntry({
      teamId: teamId.value, championId, gameRoleKey: storedEntries.value[championId]?.gameRoleKey || null,
    })));
    originalChampionIds.value = new Set(Object.keys(ratings.value));
    isDirty.value = false;
    submissionStatus.value = 'DRAFT';
  } catch (error) {
    if (isTeamHubDenied(error)) {
      teamId.value = '';
      ratings.value = {};
      storedEntries.value = {};
      originalChampionIds.value = new Set();
    }
    loadError.value = error instanceof Error ? error.message : 'Unable to save your champion pool.';
  }
}
</script>

<style scoped>
.team-workspace {
  display: flex;
  min-height: calc(100vh - var(--header-height, 72px));
  color: #f6f7fa;
  background: #07090d;
}

.champion-pool-page {
  flex: 1;
  min-width: 0;
  padding: 18px;
}

.submission-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  min-height: 54px;
  padding: 9px 14px;
  margin-bottom: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  background: #0e1117;
}

.submission-details,
.submission-actions,
.selection-controls,
.champion-counts,
.selected-tier-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.submission-details {
  color: #aeb6c2;
  font-size: 0.84rem;
}

.submission-details strong {
  color: #f4f6f9;
}

.submission-status {
  padding: 5px 9px;
  border-radius: 7px;
  color: #bfc6d0;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.submission-status--under_review {
  color: #c39bff;
  border-color: rgba(139, 61, 255, 0.5);
  background: rgba(139, 61, 255, 0.09);
}

.submission-status--approved {
  color: #a9ff38;
  border-color: rgba(169, 255, 56, 0.4);
  background: rgba(169, 255, 56, 0.08);
}

.primary-button,
.secondary-button,
.selected-tier-actions button {
  min-height: 38px;
  padding: 0 14px;
  color: #f6f7fa;
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
}

.primary-button {
  color: #071000;
  border-color: #a9ff38;
  background: #a9ff38;
  font-weight: 700;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin: 0 8px 18px;
}

.page-heading h1,
.panel-heading h2 {
  margin: 0;
}

.page-heading p {
  margin: 6px 0 0;
  color: #969fac;
}

.page-eyebrow {
  display: block;
  margin-bottom: 6px;
  color: #a9ff38;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.catalogue-warning {
  color: #ffc66d;
  font-size: 0.8rem;
}

.loading-state,
.error-state {
  padding: 42px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: #0e1117;
}

.error-state {
  color: #ff9b9b;
}

.champion-workspace {
  display: grid;
  grid-template-columns: minmax(390px, 0.95fr) minmax(520px, 1.05fr);
  gap: 12px;
}

.champion-selection-panel,
.tier-panel {
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  background: #0d1015;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.panel-heading > span {
  color: #9aa3af;
  font-size: 0.8rem;
}

.search-field input {
  width: 100%;
  min-height: 44px;
  padding: 0 13px;
  color: #f6f7fa;
  border: 1px solid #8142d3;
  border-radius: 7px;
  outline: none;
  background: #101319;
  font: inherit;
}

.search-field input:focus {
  border-color: #a9ff38;
}

.selection-controls {
  justify-content: space-between;
  margin: 11px 0 14px;
}

.toggle-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c0c6cf;
  font-size: 0.82rem;
}

.champion-counts {
  color: #a9ff38;
  font-size: 0.78rem;
}

.champion-counts span:last-child {
  color: #c39bff;
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 8px;
}

.champion-card,
.tier-champion {
  position: relative;
  overflow: hidden;
  padding: 0;
  color: #eef1f5;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #151922;
  cursor: pointer;
}

.champion-card:hover,
.champion-card--selected {
  border-color: #a9ff38;
}

.champion-card--rated {
  opacity: 0.75;
}

.champion-card img,
.tier-champion img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.champion-name,
.tier-champion span {
  display: block;
  overflow: hidden;
  padding: 5px 3px;
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.champion-rating {
  position: absolute;
  top: 4px;
  right: 4px;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  color: #071000;
  border-radius: 50%;
  background: #a9ff38;
  font-size: 0.7rem;
  font-weight: 800;
}

.tier-board {
  border: 1px solid rgba(255, 255, 255, 0.11);
}

.tier-row {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  min-height: 104px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}

.tier-row:last-child {
  border-bottom: 0;
}

.tier-label {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #07090d;
  text-align: center;
}

.tier-label strong {
  font-size: 1.3rem;
}

.tier-label span {
  font-size: 0.6rem;
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
  background: #f6ff73;
}

.tier-row--d .tier-label {
  background: #a9f46c;
}

.tier-champions {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  min-width: 0;
  padding: 9px;
  flex-wrap: wrap;
}

.tier-champion {
  width: 66px;
  flex: 0 0 66px;
}

.tier-placeholder {
  margin: auto;
  color: #5f6875;
  font-size: 0.78rem;
}

.selected-champion {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 11px;
  border: 1px solid rgba(139, 61, 255, 0.28);
  border-radius: 9px;
  background: rgba(139, 61, 255, 0.06);
}

.selected-champion > img {
  width: 44px;
  height: 44px;
  border-radius: 6px;
}

.selected-champion-details {
  min-width: 110px;
}

.selected-champion-details strong,
.selected-champion-details span {
  display: block;
}

.selected-champion-details span {
  margin-top: 3px;
  color: #919aa7;
  font-size: 0.73rem;
}

.selected-tier-actions {
  margin-left: auto;
}

.selected-tier-actions button {
  min-width: 34px;
  min-height: 34px;
  padding: 0 9px;
}

.selected-tier-actions .tier-action--active {
  color: #071000;
  border-color: #a9ff38;
  background: #a9ff38;
}

.review-lock {
  margin-top: 12px;
  padding: 10px;
  color: #c39bff;
  border: 1px solid rgba(139, 61, 255, 0.3);
  border-radius: 8px;
  background: rgba(139, 61, 255, 0.07);
  font-size: 0.8rem;
}

.empty-search {
  padding: 30px;
  color: #9099a6;
  text-align: center;
}

.visually-hidden {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .champion-workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 800px) {
  .team-workspace {
    display: block;
  }

  .champion-pool-page {
    padding: 12px;
  }

  .submission-bar,
  .page-heading,
  .selected-champion {
    align-items: flex-start;
    flex-direction: column;
  }

  .selected-tier-actions {
    margin-left: 0;
  }

  .champion-grid {
    grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
  }

  .tier-row {
    grid-template-columns: 58px minmax(0, 1fr);
  }
}
</style>
