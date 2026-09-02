<template>
  <main class="team-hub-home">
    <header class="team-hub-header">
      <div>
        <span class="eyebrow">COMPETITIVE WORKSPACE</span>
        <h1>Team Hub</h1>

        <p>
          Manage your teams, competitions and competitive history.
        </p>
      </div>

      <div class="header-actions">
        <button v-if="canAdmin" type="button" class="button button--primary" @click="createNewTeam">
          Create Team
        </button>

        <button type="button" class="button button--secondary" disabled title="Invitations are outside the Team Hub MVP">
          Join with Invitation
        </button>
      </div>
    </header>

    <p v-if="loading" class="empty-state">Loading your teams…</p>
    <p v-else-if="errorMessage" class="empty-state">{{ errorMessage }}</p>
    <p v-else-if="!games.length" class="empty-state">No Team Hub access is currently assigned to this account.</p>

    <div v-if="games.length" class="team-hub-grid">
      <!-- Main team-selection area -->
      <div class="team-hub-main">
        <section class="team-selection">
          <div class="section-heading">
            <span class="eyebrow">YOUR ORGANISATIONS</span>
            <h2>Your Teams</h2>
          </div>

          <div class="game-selection">
            <h3>Select a game</h3>

            <div class="game-grid">
              <button
                v-for="game in games"
                :key="game.id"
                type="button"
                class="game-card"
                :class="{ 'game-card--active': selectedGameId === game.id }"
                @click="selectGame(game.id)"
              >
                <span class="game-icon">
                  {{ game.shortName }}
                </span>

                <span class="game-details">
                  <strong>{{ game.name }}</strong>

                  <span>
                    {{ game.teams.length }}
                    {{ game.teams.length === 1 ? 'team' : 'teams' }}
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div v-if="selectedGame" class="team-selector">
            <label for="team-selection">
              Select a team
            </label>

            <select
              id="team-selection"
              v-model="selectedTeamId"
              class="team-select"
            >
              <option
                v-for="team in selectedGame.teams"
                :key="team.id"
                :value="team.id"
              >
                {{ team.name }}
              </option>
            </select>
          </div>

          <article v-if="selectedTeam" class="selected-team">
            <div class="team-logo-container">
              <img
                :src="logoUrl"
                :alt="`${selectedTeam.name} logo`"
                class="team-logo"
              />
            </div>

            <div class="selected-team-content">
              <div class="selected-team-heading">
                <div>
                  <h3>{{ selectedTeam.name }}</h3>

                  <span class="game-name">
                    {{ selectedGame.name }}
                  </span>
                </div>

                <div class="team-badges">
                  <span class="badge">
                    {{ selectedTeam.userRole }}
                  </span>

                  <span
                    v-if="selectedTeam.plan"
                    class="badge badge--premium"
                  >
                    {{ selectedTeam.plan }}
                  </span>
                </div>
              </div>

              <div class="team-facts">
                <span>
                  {{ selectedTeam.players }} players
                </span>

                <span>
                  {{ selectedTeam.coaches }}
                  {{ selectedTeam.coaches === 1 ? 'coach' : 'coaches' }}
                </span>

                <span>
                  Champion pools:
                  <strong>
                    {{ selectedTeam.poolSubmissions }}
                    of {{ selectedTeam.players }} submitted
                  </strong>
                </span>
              </div>

              <div class="team-actions">
                <button
                  type="button"
                  class="button button--primary"
                  @click="openSelectedTeam"
                >
                  Open Team Workspace
                </button>

                <RouterLink
                  :to="selectedTeam.publicProfilePath"
                  class="text-link"
                >
                  View Public Profile
                </RouterLink>
              </div>
            </div>
          </article>
        </section>

        <section class="tournament-section">
          <div class="section-heading">
            <span class="eyebrow">SELECTED TEAM</span>
            <h2>Current Tournaments</h2>
          </div>

          <article
            v-if="selectedTournament"
            class="tournament-card"
          >
            <div class="tournament-icon">
              🏆
            </div>

            <div class="tournament-details">
              <h3>{{ selectedTournament.name }}</h3>

              <div class="tournament-facts">
                <span>{{ selectedTournament.date }}</span>

                <span class="status-badge">
                  {{ selectedTournament.status }}
                </span>

                <span>{{ selectedTournament.nextFixture }}</span>
              </div>
            </div>

            <RouterLink
              :to="selectedTournament.path"
              class="button button--secondary"
            >
              View Tournament
            </RouterLink>
          </article>

          <div v-else class="empty-state">
            This team is not currently registered for a tournament.
          </div>
        </section>
      </div>

      <!-- Competitive history -->
      <aside class="history-panel">
        <div class="history-heading">
          <span class="eyebrow">TEAM ACTIVITY</span>
          <h2>Competitive History</h2>
        </div>

        <div class="history-filters">
          <button
            v-for="filter in historyFilters"
            :key="filter.id"
            type="button"
            class="history-filter"
            :class="{
              'history-filter--active': selectedHistoryFilter === filter.id,
            }"
            @click="selectedHistoryFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="history-list">
          <article
            v-for="entry in filteredHistory"
            :key="entry.id"
            class="history-entry"
          >
            <div class="history-marker">
              {{ entry.icon }}
            </div>

            <div class="history-content">
              <time>{{ entry.date }}</time>
              <h3>{{ entry.title }}</h3>
              <p>{{ entry.description }}</p>
            </div>
          </article>
        </div>

        <div v-if="!filteredHistory.length" class="history-empty">
          No activity exists for this category yet.
        </div>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import logoUrl from '../../assets/logo.png';
import { useAuth } from '../../composables/useAuth.js';
import { createTeam, listMyTeams, loadBoundedPages } from './teamHub.service.js';
import { canShowAdminControls } from './teamHub.viewModel.js';

const router = useRouter();
const { isAdmin, isSuperAdmin } = useAuth();
const canAdmin = computed(() => canShowAdminControls({ isAdmin: isAdmin.value, isSuperAdmin: isSuperAdmin.value }));
const games = ref([]);
const history = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const historyFilters = [
  { id: 'all', label: 'All' },
  { id: 'tournament', label: 'Tournaments' },
  { id: 'roster', label: 'Roster' },
  { id: 'achievement', label: 'Achievements' },
];

const selectedGameId = ref(null);
const selectedTeamId = ref(null);
const selectedHistoryFilter = ref('all');

const selectedGame = computed(() => {
  return games.value.find((game) => game.id === selectedGameId.value);
});

const selectedTeam = computed(() => {
  return selectedGame.value?.teams.find(
    (team) => team.id === selectedTeamId.value,
  );
});

const selectedTournament = computed(() => {
  return selectedTeam.value?.tournament ?? null;
});

const filteredHistory = computed(() => {
  if (selectedHistoryFilter.value === 'all') {
    return history.value;
  }

  return history.value.filter(
    (entry) => entry.type === selectedHistoryFilter.value,
  );
});

function selectGame(gameId) {
  selectedGameId.value = gameId;

  const game = games.value.find((entry) => entry.id === gameId);

  selectedTeamId.value = game?.teams[0]?.id ?? null;
}

function openSelectedTeam() {
  if (!selectedTeam.value) {
    return;
  }

  const destination = ['ADMIN', 'MANAGER'].includes(selectedTeam.value.userRole)
    ? 'manage'
    : selectedTeam.value.userRole === 'COACH' ? 'coach-review' : 'champion-pool';
  router.push(`/team-hub/${selectedTeam.value.slug}/${destination}`);
}

onMounted(async () => {
  await refreshTeams();
});

async function refreshTeams() {
  try {
    const activePage = await loadBoundedPages((nextToken) => listMyTeams({ status: 'ACTIVE', limit: 50, ...(nextToken ? { nextToken } : {}) }));
    const inactivePage = canAdmin.value ? await loadBoundedPages((nextToken) => listMyTeams({ status: 'INACTIVE', limit: 50, ...(nextToken ? { nextToken } : {}) })) : { items: [], complete: true };
    if (!activePage.complete || !inactivePage.complete) throw new Error('Team Hub data limit exceeded');
    const teams = [...activePage.items, ...inactivePage.items];
    const leagueTeams = teams.filter((team) => team.gameKey === 'LEAGUE_OF_LEGENDS').map((team) => ({
      ...team, userRole: team.role, plan: null, players: 0, coaches: 0, poolSubmissions: 0,
      publicProfilePath: `/team-hub/${team.slug}`, tournament: null,
    }));
    games.value = leagueTeams.length ? [{ id: 'league-of-legends', name: 'League of Legends', shortName: 'LoL', teams: leagueTeams }] : [];
    selectedGameId.value = games.value[0]?.id ?? null;
    selectedTeamId.value = games.value[0]?.teams[0]?.id ?? null;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load Team Hub.';
  } finally {
    loading.value = false;
  }
}

async function createNewTeam() {
  const name = window.prompt('Team name');
  if (!name) return;
  const slug = window.prompt('Unique team slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  if (!slug) return;
  try {
    await createTeam({ name, slug, gameKey: 'LEAGUE_OF_LEGENDS' });
    await refreshTeams();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to create team.';
  }
}
</script>

<style scoped>
.team-hub-home {
  min-height: calc(100vh - var(--header-height, 72px));
  padding: 32px clamp(20px, 4vw, 64px);
  color: #f7f8fb;
  background:
    radial-gradient(
      circle at 0% 15%,
      rgba(124, 45, 255, 0.14),
      transparent 28%
    ),
    radial-gradient(
      circle at 100% 0%,
      rgba(169, 255, 56, 0.08),
      transparent 25%
    ),
    #07090d;
}

.team-hub-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}

.team-hub-header h1,
.section-heading h2,
.history-heading h2 {
  margin: 0;
}

.team-hub-header h1 {
  font-size: clamp(2rem, 3vw, 2.8rem);
}

.team-hub-header p {
  margin: 8px 0 0;
  color: #a9b0bc;
}

.eyebrow {
  display: block;
  margin-bottom: 7px;
  color: #a9ff38;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.13em;
}

.header-actions,
.team-actions,
.tournament-facts,
.team-facts,
.team-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.button--primary {
  color: #071000;
  background: #a9ff38;
}

.button--secondary {
  color: #f4f6fa;
  border-color: rgba(169, 255, 56, 0.45);
  background: transparent;
}

.team-hub-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(310px, 0.9fr);
  gap: 24px;
  align-items: stretch;
}

.team-hub-main {
  min-width: 0;
}

.section-heading,
.history-heading {
  margin-bottom: 16px;
}

.game-selection h3,
.team-selector label {
  display: block;
  margin: 0 0 12px;
  font-size: 0.95rem;
  font-weight: 700;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.game-card {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 84px;
  padding: 16px;
  color: #f7f8fb;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 11px;
  background: rgba(14, 17, 23, 0.92);
  cursor: pointer;
}

.game-card--active {
  border-color: #9d4cff;
  background: rgba(125, 50, 255, 0.08);
  box-shadow: 0 0 24px rgba(125, 50, 255, 0.12);
}

.game-icon {
  display: grid;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  place-items: center;
  color: #a9ff38;
  font-weight: 800;
}

.game-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.game-details span {
  color: #b99aff;
  font-size: 0.86rem;
}

.team-selector {
  margin-bottom: 16px;
}

.team-select {
  width: 100%;
  min-height: 50px;
  padding: 0 15px;
  color: #f7f8fb;
  border: 1px solid #8d45e8;
  border-radius: 9px;
  background: #0c0f14;
  font: inherit;
}

.selected-team,
.tournament-card,
.history-panel {
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 13px;
  background: rgba(13, 16, 22, 0.94);
}

.selected-team {
  display: flex;
  gap: 20px;
  padding: 22px;
  border-color: rgba(139, 61, 255, 0.45);
}

.team-logo-container {
  display: grid;
  flex: 0 0 112px;
  width: 112px;
  height: 112px;
  place-items: center;
  border: 1px solid rgba(139, 61, 255, 0.55);
  border-radius: 11px;
}

.team-logo {
  width: 82%;
  height: 82%;
  object-fit: contain;
}

.selected-team-content {
  flex: 1;
  min-width: 0;
}

.selected-team-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}

.selected-team-heading h3 {
  margin: 0 0 7px;
}

.game-name {
  color: #c39bff;
}

.badge,
.status-badge {
  display: inline-flex;
  width: fit-content;
  padding: 5px 9px;
  border-radius: 999px;
  color: #d9dde5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.76rem;
}

.badge--premium {
  color: #c39bff;
  border-color: rgba(139, 61, 255, 0.4);
}

.team-facts {
  margin-bottom: 18px;
  color: #b5bdc8;
}

.team-facts strong {
  color: #c39bff;
}

.text-link {
  color: #c39bff;
  text-decoration: none;
}

.tournament-section {
  margin-top: 28px;
}

.tournament-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px;
}

.tournament-icon {
  display: grid;
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 50%;
  background: rgba(139, 61, 255, 0.14);
  font-size: 1.7rem;
}

.tournament-details {
  flex: 1;
}

.tournament-details h3 {
  margin: 0 0 11px;
}

.tournament-facts {
  color: #b4bdca;
  font-size: 0.88rem;
}

.status-badge {
  color: #a9ff38;
  border-color: rgba(169, 255, 56, 0.35);
}

.empty-state {
  padding: 28px;
  color: #9ca5b3;
  text-align: center;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 13px;
}

.history-panel {
  min-height: 100%;
  padding: 24px;
}

.history-filters {
  display: flex;
  gap: 7px;
  margin-bottom: 26px;
  flex-wrap: wrap;
}

.history-filter {
  padding: 7px 10px;
  color: #aeb6c2;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
}

.history-filter--active {
  color: #c49dff;
  border-color: #8d45e8;
  background: rgba(139, 61, 255, 0.08);
}

.history-list {
  position: relative;
}

.history-list::before {
  position: absolute;
  top: 22px;
  bottom: 22px;
  left: 21px;
  width: 2px;
  content: '';
  background: linear-gradient(#8d45e8, rgba(141, 69, 232, 0.1));
}

.history-entry {
  position: relative;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 15px;
  padding-bottom: 28px;
}

.history-marker {
  z-index: 1;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid #8d45e8;
  border-radius: 50%;
  background: #0d1016;
}

.history-content time {
  color: #c39bff;
  font-size: 0.78rem;
}

.history-content h3 {
  margin: 5px 0;
  font-size: 1rem;
}

.history-content p {
  margin: 0;
  color: #aeb6c2;
  font-size: 0.88rem;
  line-height: 1.45;
}

.history-empty {
  color: #9ca5b3;
  text-align: center;
}

@media (max-width: 1050px) {
  .team-hub-grid {
    grid-template-columns: 1fr;
  }

  .history-panel {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .team-hub-home {
    padding: 22px 16px;
  }

  .team-hub-header,
  .selected-team-heading,
  .tournament-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .game-grid {
    grid-template-columns: 1fr;
  }

  .selected-team {
    flex-direction: column;
  }

  .team-logo-container {
    width: 88px;
    height: 88px;
  }
}
</style>
