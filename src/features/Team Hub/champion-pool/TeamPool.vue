<template>
  <div class="team-workspace">
    <TeamHubSidebar />

    <main class="team-pool-page">
      <header class="page-header">
        <div>
          <span class="eyebrow">LEAGUE OF LEGENDS</span>
          <h1>Team Pool</h1>
          <p>Build resilient compositions from approved player champion pools.</p>
        </div>
        <button type="button" class="primary-button" @click="createNewComposition">
          New Composition
        </button>
      </header>

      <div v-if="loading" class="state-panel">Loading League champions...</div>
      <div v-else-if="loadError" class="state-panel state-panel--error">
        <strong>Champion catalogue unavailable</strong>
        <p>{{ loadError }}</p>
        <button type="button" @click="loadChampions">Try again</button>
      </div>

      <template v-else>
        <section class="coverage-section">
          <div class="section-heading">
            <div>
              <span class="eyebrow">APPROVED POOLS</span>
              <h2>Approved Pool Coverage</h2>
            </div>
            <span>Patch {{ dataDragonVersion }}</span>
          </div>

          <div class="coverage-grid">
            <article v-for="role in rolePools" :key="role.id" class="role-pool">
              <div class="role-heading">
                <strong>{{ role.label }}</strong>
                <span>{{ role.player }}</span>
              </div>
              <div v-for="tier in visibleCoverageTiers" :key="tier" class="coverage-tier">
                <span class="coverage-tier-label" :class="`coverage-tier-label--${tier.toLowerCase()}`">
                  {{ tier }}
                </span>
                <div class="coverage-champions">
                  <div v-for="entry in poolForTier(role, tier)" :key="entry.championId" class="coverage-champion">
                    <img :src="getChampionImageById(entry.championId)" :alt="championName(entry.championId)" />
                    <span v-if="isFlexChampion(entry.championId)" class="flex-badge">Flex</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="composition-workspace">
          <article class="builder-panel">
            <div class="section-heading">
              <div>
                <span class="eyebrow">COACH WORKSPACE</span>
                <h2>Composition Builder</h2>
              </div>
              <span class="draft-status" :class="`draft-status--${resilienceStatus.key}`">
                {{ resilienceStatus.label }}
              </span>
            </div>

            <p class="builder-introduction">
              Set the job each role must perform, then choose a priority pick and approved alternatives that preserve it.
            </p>

            <div class="composition-roles">
              <article v-for="role in rolePools" :key="role.id" class="composition-role">
                <div class="role-title-row">
                  <div>
                    <strong>{{ role.label }}</strong>
                    <span>{{ role.player }}</span>
                  </div>
                  <span class="active-pick-label">
                    Active: {{ championName(activeChampionId(role.id)) || 'Not selected' }}
                  </span>
                </div>

                <label class="compact-field purpose-field">
                  <span>Purpose</span>
                  <select v-model="currentComposition.roles[role.id].purpose" @change="markCompositionChanged">
                    <option value="">Choose purpose</option>
                    <option v-for="purpose in purposes" :key="purpose.id" :value="purpose.id">
                      {{ purpose.label }}
                    </option>
                  </select>
                  <small>{{ purposeDescription(currentComposition.roles[role.id].purpose) }}</small>
                </label>

                <div class="pick-grid">
                  <label class="pick-field pick-field--priority">
                    <span>Priority pick</span>
                    <div class="champion-select-row">
                      <img
                        v-if="currentComposition.roles[role.id].priorityPick"
                        :src="getChampionImageById(currentComposition.roles[role.id].priorityPick)"
                        :alt="championName(currentComposition.roles[role.id].priorityPick)"
                      />
                      <div v-else class="empty-champion">?</div>
                      <select
                        v-model="currentComposition.roles[role.id].priorityPick"
                        @change="onPriorityChanged(role.id)"
                      >
                        <option value="">Select priority</option>
                        <option
                          v-for="entry in availablePriorityEntries(role)"
                          :key="entry.championId"
                          :value="entry.championId"
                        >
                          {{ championName(entry.championId) }} - {{ entry.tier }}
                        </option>
                      </select>
                    </div>
                  </label>

                  <div class="secondary-field">
                    <span>Secondary picks</span>
                    <div class="secondary-selects">
                      <label v-for="index in 3" :key="index" class="secondary-select">
                        <img
                          v-if="currentComposition.roles[role.id].secondaryPicks[index - 1]"
                          :src="getChampionImageById(currentComposition.roles[role.id].secondaryPicks[index - 1])"
                          :alt="championName(currentComposition.roles[role.id].secondaryPicks[index - 1])"
                        />
                        <span v-else class="secondary-number">{{ index }}</span>
                        <select
                          v-model="currentComposition.roles[role.id].secondaryPicks[index - 1]"
                          @change="onSecondaryChanged(role.id)"
                        >
                          <option value="">{{ index === 1 ? 'Add alternative' : 'Optional' }}</option>
                          <option
                            v-for="entry in availableSecondaryEntries(role, index - 1)"
                            :key="entry.championId"
                            :value="entry.championId"
                          >
                            {{ championName(entry.championId) }} - {{ entry.tier }}
                          </option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                <label class="compact-field active-field">
                  <span>Test active pick</span>
                  <select v-model="currentComposition.roles[role.id].activePick" @change="markCompositionChanged">
                    <option value="">Use priority pick</option>
                    <option
                      v-for="championId in validSecondaryPicks(role.id)"
                      :key="championId"
                      :value="championId"
                    >
                      Replace with {{ championName(championId) }}
                    </option>
                  </select>
                  <small>Use this to test the composition when the priority pick is banned or taken.</small>
                </label>
              </article>
            </div>

            <label class="form-field">
              <span>Composition name</span>
              <input v-model.trim="currentComposition.name" type="text" maxlength="80" placeholder="Name this composition..." @input="markCompositionChanged" />
            </label>
            <label class="form-field">
              <span>Win condition and coaching notes</span>
              <textarea v-model.trim="currentComposition.notes" maxlength="1000" placeholder="Describe how the composition should play..." @input="markCompositionChanged"></textarea>
            </label>

            <div class="builder-actions">
              <button type="button" class="primary-button" :disabled="!canSaveComposition" @click="saveComposition">
                Save Composition
              </button>
              <button type="button" class="secondary-button" :disabled="!hasCompleteComposition" @click="duplicateComposition">
                Duplicate Variation
              </button>
            </div>
          </article>

          <article class="analysis-panel">
            <div class="section-heading">
              <div>
                <span class="eyebrow">TEAM HUB PRO</span>
                <h2>Composition Resilience</h2>
              </div>
              <span class="rules-badge">Rules based</span>
            </div>

            <div class="resilience-summary" :class="`resilience-summary--${resilienceStatus.key}`">
              <strong>{{ resilienceStatus.label }}</strong>
              <p>{{ resilienceStatus.explanation }}</p>
            </div>

            <div v-if="hasCompleteComposition" class="analysis-list">
              <article
                v-for="finding in compositionFindings"
                :key="finding.id"
                class="analysis-finding"
                :class="`analysis-finding--${finding.type}`"
              >
                <span class="finding-icon">{{ finding.type === 'strength' ? '✓' : '!' }}</span>
                <div>
                  <strong>{{ finding.title }}</strong>
                  <p>{{ finding.explanation }}</p>
                </div>
              </article>
            </div>
            <div v-else class="analysis-empty">
              Add a purpose and priority pick for every role to analyse the composition.
            </div>

            <details class="analysis-rules">
              <summary>View analysis rules</summary>
              <ul>
                <li>Active picks are used for the composition findings.</li>
                <li>Secondary picks are compared with the role's selected purpose.</li>
                <li>No AI or opponent prediction is used.</li>
                <li>The coach remains responsible for every selection.</li>
              </ul>
            </details>
          </article>
        </section>

        <section class="saved-section">
          <div class="section-heading">
            <div>
              <span class="eyebrow">TEAM LIBRARY</span>
              <h2>Saved Compositions</h2>
            </div>
            <span>{{ savedCompositions.length }} saved</span>
          </div>
          <div v-if="savedCompositions.length" class="saved-grid">
            <article v-for="composition in savedCompositions" :key="composition.id" class="saved-composition">
              <div class="saved-heading">
                <strong>{{ composition.name }}</strong>
                <span class="saved-status">{{ savedResilienceLabel(composition) }}</span>
              </div>
              <div class="saved-champions">
                <div v-for="role in rolePools" :key="role.id" class="saved-champion">
                  <img :src="getChampionImageById(savedActiveChampion(composition, role.id))" :alt="championName(savedActiveChampion(composition, role.id))" />
                  <small>{{ role.label }}</small>
                </div>
              </div>
              <p>{{ composition.notes || 'No coaching notes have been added.' }}</p>
              <div class="saved-actions">
                <button type="button" class="primary-button" @click="openComposition(composition)">Open</button>
                <button type="button" class="secondary-button" @click="duplicateSavedComposition(composition)">Duplicate</button>
              </div>
            </article>
          </div>
          <div v-else class="empty-saved">Save your first composition to add it to the team library.</div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import TeamHubSidebar from '../TeamHubSidebar.vue';
import { championImageUrl, loadChampionCatalogue } from './dataDragon.service.js';

const route = useRoute();
const champions = ref([]);
const dataDragonVersion = ref('');
const loading = ref(true);
const loadError = ref('');
const savedCompositions = ref([]);
const visibleCoverageTiers = ['S', 'A', 'B'];

const purposes = [
  { id: 'engage', label: 'Engage', description: 'Starts fights reliably.' },
  { id: 'frontline', label: 'Front line', description: 'Absorbs pressure for the team.' },
  { id: 'peel', label: 'Peel', description: 'Protects priority carries.' },
  { id: 'disengage', label: 'Disengage', description: 'Resets or escapes fights.' },
  { id: 'backlineAccess', label: 'Backline access', description: 'Threatens priority enemy targets.' },
  { id: 'physicalDamage', label: 'Physical damage', description: 'Provides a meaningful physical threat.' },
  { id: 'magicDamage', label: 'Magic damage', description: 'Provides a meaningful magic threat.' },
];

const rolePools = [
  { id: 'TOP', label: 'Top', player: 'Jordan', pool: [{ championId: 'Ornn', tier: 'S' }, { championId: 'Aurora', tier: 'A' }, { championId: 'Gragas', tier: 'B' }, { championId: 'Renekton', tier: 'B' }, { championId: 'Kled', tier: 'A' }] },
  { id: 'JUNGLE', label: 'Jungle', player: 'Sam', pool: [{ championId: 'Vi', tier: 'S' }, { championId: 'Sejuani', tier: 'A' }, { championId: 'Gragas', tier: 'A' }, { championId: 'Taliyah', tier: 'B' }, { championId: 'Nocturne', tier: 'B' }] },
  { id: 'MID', label: 'Mid', player: 'Alex', pool: [{ championId: 'Orianna', tier: 'S' }, { championId: 'Ahri', tier: 'A' }, { championId: 'Aurora', tier: 'A' }, { championId: 'Viktor', tier: 'B' }, { championId: 'Syndra', tier: 'B' }] },
  { id: 'ADC', label: 'ADC', player: 'Taylor', pool: [{ championId: 'Jinx', tier: 'S' }, { championId: 'Kaisa', tier: 'A' }, { championId: 'Ezreal', tier: 'B' }, { championId: 'Smolder', tier: 'A' }, { championId: 'Xayah', tier: 'B' }] },
  { id: 'SUPPORT', label: 'Support', player: 'Morgan', pool: [{ championId: 'Braum', tier: 'S' }, { championId: 'Rakan', tier: 'A' }, { championId: 'Nautilus', tier: 'A' }, { championId: 'Gragas', tier: 'B' }, { championId: 'Thresh', tier: 'B' }] },
];

const emptyTraits = { engage: 0, frontline: 0, peel: 0, disengage: 0, backlineAccess: 0, physicalDamage: 0, magicDamage: 0 };
const championTraits = {
  Ornn: { engage: 3, frontline: 3, peel: 2, disengage: 1, backlineAccess: 1, physicalDamage: 1, magicDamage: 1 },
  Aurora: { engage: 2, frontline: 0, peel: 0, disengage: 2, backlineAccess: 2, physicalDamage: 0, magicDamage: 3 },
  Gragas: { engage: 3, frontline: 2, peel: 2, disengage: 3, backlineAccess: 2, physicalDamage: 0, magicDamage: 3 },
  Renekton: { engage: 1, frontline: 2, peel: 0, disengage: 0, backlineAccess: 2, physicalDamage: 3, magicDamage: 0 },
  Kled: { engage: 3, frontline: 2, peel: 0, disengage: 0, backlineAccess: 3, physicalDamage: 3, magicDamage: 0 },
  Vi: { engage: 3, frontline: 1, peel: 0, disengage: 0, backlineAccess: 3, physicalDamage: 3, magicDamage: 0 },
  Sejuani: { engage: 3, frontline: 3, peel: 2, disengage: 1, backlineAccess: 2, physicalDamage: 0, magicDamage: 2 },
  Taliyah: { engage: 1, frontline: 0, peel: 2, disengage: 3, backlineAccess: 1, physicalDamage: 0, magicDamage: 3 },
  Nocturne: { engage: 2, frontline: 1, peel: 0, disengage: 0, backlineAccess: 3, physicalDamage: 3, magicDamage: 0 },
  Orianna: { engage: 2, frontline: 0, peel: 2, disengage: 1, backlineAccess: 1, physicalDamage: 0, magicDamage: 3 },
  Ahri: { engage: 2, frontline: 0, peel: 1, disengage: 2, backlineAccess: 2, physicalDamage: 0, magicDamage: 3 },
  Viktor: { engage: 1, frontline: 0, peel: 1, disengage: 2, backlineAccess: 0, physicalDamage: 0, magicDamage: 3 },
  Syndra: { engage: 1, frontline: 0, peel: 2, disengage: 1, backlineAccess: 2, physicalDamage: 0, magicDamage: 3 },
  Jinx: { engage: 0, frontline: 0, peel: 0, disengage: 1, backlineAccess: 0, physicalDamage: 3, magicDamage: 0 },
  Kaisa: { engage: 0, frontline: 0, peel: 0, disengage: 1, backlineAccess: 3, physicalDamage: 2, magicDamage: 2 },
  Ezreal: { engage: 0, frontline: 0, peel: 0, disengage: 2, backlineAccess: 1, physicalDamage: 3, magicDamage: 1 },
  Smolder: { engage: 0, frontline: 0, peel: 0, disengage: 1, backlineAccess: 0, physicalDamage: 2, magicDamage: 2 },
  Xayah: { engage: 0, frontline: 0, peel: 1, disengage: 3, backlineAccess: 0, physicalDamage: 3, magicDamage: 0 },
  Braum: { engage: 1, frontline: 2, peel: 3, disengage: 2, backlineAccess: 0, physicalDamage: 1, magicDamage: 1 },
  Rakan: { engage: 3, frontline: 1, peel: 2, disengage: 3, backlineAccess: 3, physicalDamage: 0, magicDamage: 1 },
  Nautilus: { engage: 3, frontline: 3, peel: 2, disengage: 0, backlineAccess: 2, physicalDamage: 1, magicDamage: 1 },
  Thresh: { engage: 2, frontline: 1, peel: 3, disengage: 2, backlineAccess: 1, physicalDamage: 1, magicDamage: 1 },
};

const currentComposition = reactive(newComposition());
const teamSlug = computed(() => route.params.teamSlug || 'project-respawn');
const activeChampionIds = computed(() => rolePools.map((role) => activeChampionId(role.id)).filter(Boolean));
const hasCompleteComposition = computed(() => rolePools.every((role) => {
  const slot = currentComposition.roles[role.id];
  return Boolean(slot?.purpose && slot?.priorityPick);
}));
const canSaveComposition = computed(() => hasCompleteComposition.value && Boolean(currentComposition.name.trim()));
const selectedTraits = computed(() => activeChampionIds.value.reduce((totals, id) => {
  const traits = championTraits[id] || emptyTraits;
  Object.keys(totals).forEach((trait) => { totals[trait] += traits[trait] || 0; });
  return totals;
}, { ...emptyTraits }));
const flexChampionIds = computed(() => {
  const counts = new Map();
  rolePools.forEach((role) => role.pool.forEach((entry) => {
    const roles = counts.get(entry.championId) || new Set();
    roles.add(role.id);
    counts.set(entry.championId, roles);
  }));
  return new Set([...counts.entries()].filter(([, roles]) => roles.size > 1).map(([id]) => id));
});
const compromisedRoles = computed(() => rolePools.filter((role) => {
  const slot = currentComposition.roles[role.id];
  const active = activeChampionId(role.id);
  return slot.purpose && active && (championTraits[active]?.[slot.purpose] || 0) < 2;
}));
const adaptedRoles = computed(() => rolePools.filter((role) => Boolean(currentComposition.roles[role.id].activePick)));
const resilienceStatus = computed(() => {
  if (!hasCompleteComposition.value) return { key: 'incomplete', label: 'Incomplete', explanation: 'Complete every role before testing alternatives.' };
  if (compromisedRoles.value.length) return { key: 'compromised', label: 'Compromised', explanation: `${compromisedRoles.value.map((role) => role.label).join(', ')} no longer fully covers its selected purpose.` };
  if (adaptedRoles.value.length) return { key: 'adapted', label: 'Adapted', explanation: `${adaptedRoles.value.map((role) => role.label).join(', ')} is using a secondary pick while preserving the plan.` };
  return { key: 'preferred', label: 'Preferred', explanation: 'Every role is using its priority pick and covering its intended purpose.' };
});

const compositionFindings = computed(() => {
  if (!hasCompleteComposition.value) return [];
  const traits = selectedTraits.value;
  const findings = [];
  addThresholdFinding(findings, 'engage', traits.engage, 6, 4, 'Strong engage', 'Limited engage', 'The team has multiple reliable ways to begin fights.', 'The team has few reliable tools for beginning fights.');
  addThresholdFinding(findings, 'frontline', traits.frontline, 5, 3, 'Strong front line', 'Limited front line', 'The team has durable front-line coverage.', 'The team may struggle to absorb sustained pressure.');
  addThresholdFinding(findings, 'peel', traits.peel, 5, 3, 'Good peel', 'Limited peel', 'Priority carries have reliable protection.', 'Priority carries have limited protection against divers.');
  findings.push(traits.physicalDamage >= 3 && traits.magicDamage >= 3
    ? { id: 'damage', type: 'strength', title: 'Balanced damage', explanation: 'The composition presents meaningful physical and magic threats.' }
    : { id: 'damage', type: 'limitation', title: traits.physicalDamage > traits.magicDamage ? 'Physical-damage heavy' : 'Magic-damage heavy', explanation: 'Opponents may be able to optimise defensive itemisation.' });
  addThresholdFinding(findings, 'disengage', traits.disengage, 4, 4, 'Reliable disengage', 'Limited disengage', 'The team has tools to reset fights.', 'The team may need to commit fully once a fight begins.');
  addThresholdFinding(findings, 'backline', traits.backlineAccess, 5, 5, 'Good backline access', 'Moderate backline access', 'The team can threaten priority enemy targets.', 'The team may rely on one route to reach priority targets.');
  return findings;
});

onMounted(async () => { restoreCompositions(); await loadChampions(); });

async function loadChampions() {
  loading.value = true;
  loadError.value = '';
  try {
    const catalogue = await loadChampionCatalogue();
    champions.value = catalogue.champions;
    dataDragonVersion.value = catalogue.version;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unable to load champions.';
  } finally { loading.value = false; }
}

function makeRoleSlot(purpose = '', priorityPick = '', secondaryPicks = []) {
  return { purpose, priorityPick, secondaryPicks: [...secondaryPicks, '', '', ''].slice(0, 3), activePick: '' };
}
function newComposition() {
  return {
    id: crypto.randomUUID(),
    name: 'Standard Front-to-Back',
    notes: 'Play through coordinated engages and a strong front line. Protect Jinx and Orianna during team fights.',
    status: 'Draft',
    roles: {
      TOP: makeRoleSlot('frontline', 'Ornn', ['Gragas', 'Renekton']),
      JUNGLE: makeRoleSlot('backlineAccess', 'Vi', ['Nocturne', 'Gragas']),
      MID: makeRoleSlot('magicDamage', 'Orianna', ['Viktor', 'Ahri']),
      ADC: makeRoleSlot('physicalDamage', 'Jinx', ['Xayah', 'Ezreal']),
      SUPPORT: makeRoleSlot('peel', 'Braum', ['Thresh', 'Rakan']),
    },
  };
}
function blankComposition() {
  return { id: crypto.randomUUID(), name: '', notes: '', status: 'Draft', roles: Object.fromEntries(rolePools.map((role) => [role.id, makeRoleSlot()])) };
}
function createNewComposition() { replaceCurrentComposition(blankComposition()); }
function replaceCurrentComposition(composition) {
  const normalised = normaliseComposition(composition);
  Object.keys(currentComposition).forEach((key) => delete currentComposition[key]);
  Object.assign(currentComposition, normalised);
}
function normaliseComposition(composition) {
  const source = cloneComposition(composition);
  const roles = Object.fromEntries(rolePools.map((role) => {
    const existing = source.roles?.[role.id];
    if (!existing) {
      return [role.id, makeRoleSlot('', source.champions?.[role.id] || '')];
    }
    const slot = makeRoleSlot(
      existing.purpose || '',
      existing.priorityPick || '',
      Array.isArray(existing.secondaryPicks) ? existing.secondaryPicks : [],
    );
    slot.activePick = slot.secondaryPicks.includes(existing.activePick)
      ? existing.activePick
      : '';
    return [role.id, slot];
  }));
  delete source.champions;
  return { ...source, roles };
}
function markCompositionChanged() { currentComposition.status = 'Draft'; }
function onPriorityChanged(roleId) {
  const slot = currentComposition.roles[roleId];
  slot.secondaryPicks = slot.secondaryPicks.map((id) => id === slot.priorityPick ? '' : id);
  if (slot.activePick === slot.priorityPick) slot.activePick = '';
  markCompositionChanged();
}
function onSecondaryChanged(roleId) {
  const slot = currentComposition.roles[roleId];
  const seen = new Set();
  slot.secondaryPicks = slot.secondaryPicks.map((id) => {
    if (!id || id === slot.priorityPick || seen.has(id)) return '';
    seen.add(id);
    return id;
  });
  if (slot.activePick && !slot.secondaryPicks.includes(slot.activePick)) slot.activePick = '';
  markCompositionChanged();
}
function activeChampionId(roleId) {
  const slot = currentComposition.roles[roleId];
  return slot?.activePick || slot?.priorityPick || '';
}
function validSecondaryPicks(roleId) { return currentComposition.roles[roleId].secondaryPicks.filter(Boolean); }
function availablePriorityEntries(role) { return role.pool.filter((entry) => !validSecondaryPicks(role.id).includes(entry.championId)); }
function availableSecondaryEntries(role, currentIndex) {
  const slot = currentComposition.roles[role.id];
  return role.pool.filter((entry) => entry.championId !== slot.priorityPick && !slot.secondaryPicks.some((id, index) => index !== currentIndex && id === entry.championId));
}
function purposeDescription(id) { return purposes.find((purpose) => purpose.id === id)?.description || 'Choose the responsibility this role must preserve.'; }
function addThresholdFinding(list, id, value, strengthAt, limitationBelow, strengthTitle, limitationTitle, strengthText, limitationText) {
  if (value >= strengthAt) list.push({ id, type: 'strength', title: strengthTitle, explanation: strengthText });
  else if (value < limitationBelow) list.push({ id, type: 'limitation', title: limitationTitle, explanation: limitationText });
}
function saveComposition() {
  if (!canSaveComposition.value) return;
  const saved = cloneComposition(currentComposition);
  const index = savedCompositions.value.findIndex((item) => item.id === saved.id);
  if (index >= 0) savedCompositions.value.splice(index, 1, saved); else savedCompositions.value.unshift(saved);
  persistCompositions();
}
function duplicateComposition() {
  const copy = cloneComposition(currentComposition);
  copy.id = crypto.randomUUID();
  copy.name = `${copy.name} - Variation`;
  replaceCurrentComposition(copy);
}
function duplicateSavedComposition(composition) {
  const copy = normaliseComposition(composition);
  copy.id = crypto.randomUUID();
  copy.name = `${copy.name} - Copy`;
  replaceCurrentComposition(copy);
}
function openComposition(composition) { replaceCurrentComposition(composition); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function cloneComposition(composition) { return JSON.parse(JSON.stringify(composition)); }
function savedActiveChampion(composition, roleId) { const normalised = normaliseComposition(composition); return normalised.roles[roleId].activePick || normalised.roles[roleId].priorityPick; }
function savedResilienceLabel(composition) { const normalised = normaliseComposition(composition); return Object.values(normalised.roles).some((slot) => slot.activePick) ? 'Adapted' : 'Preferred'; }
function poolForTier(role, tier) { return role.pool.filter((entry) => entry.tier === tier); }
function isFlexChampion(id) { return flexChampionIds.value.has(id); }
function championById(id) { return champions.value.find((champion) => champion.id === id); }
function championName(id) { return id ? (championById(id)?.name || id) : ''; }
function getChampionImageById(id) { const champion = championById(id); return champion ? championImageUrl(dataDragonVersion.value, champion) : ''; }
function storageKey() { return `respawn:team-compositions:${teamSlug.value}`; }
function persistCompositions() { localStorage.setItem(storageKey(), JSON.stringify(savedCompositions.value)); }
function restoreCompositions() {
  const stored = localStorage.getItem(storageKey());
  if (!stored) return;
  try { savedCompositions.value = JSON.parse(stored).map(normaliseComposition); }
  catch { localStorage.removeItem(storageKey()); }
}
</script>

<style scoped>
.team-workspace { display: flex; min-height: calc(100vh - var(--header-height, 72px)); color: #f4f6f9; background: #07090d; }
.team-pool-page { flex: 1; min-width: 0; padding: 22px; }
.page-header, .section-heading, .builder-actions, .saved-actions, .saved-heading, .role-title-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; }
.page-header { margin-bottom: 20px; }
.page-header h1, .section-heading h2 { margin: 0; }
.page-header p, .builder-introduction { margin: 6px 0 0; color: #9ba4b1; }
.builder-introduction { margin-bottom: 15px; line-height: 1.5; }
.eyebrow { display: block; margin-bottom: 6px; color: #a9ff38; font-size: .68rem; font-weight: 700; letter-spacing: .12em; }
.primary-button, .secondary-button { min-height: 40px; padding: 0 15px; border: 1px solid rgba(255,255,255,.16); border-radius: 7px; font: inherit; cursor: pointer; }
.primary-button { color: #071000; border-color: #a9ff38; background: #a9ff38; font-weight: 700; }
.secondary-button { color: #f4f6f9; background: transparent; }
button:disabled { opacity: .45; cursor: not-allowed; }
.coverage-section, .builder-panel, .analysis-panel, .saved-section { padding: 16px; border: 1px solid rgba(255,255,255,.1); border-radius: 11px; background: #0d1015; }
.section-heading { margin-bottom: 14px; }
.section-heading > span { color: #929caa; font-size: .8rem; }
.coverage-grid { display: grid; grid-template-columns: repeat(5,minmax(150px,1fr)); gap: 10px; }
.role-pool, .composition-role, .saved-composition { padding: 11px; border: 1px solid rgba(255,255,255,.09); border-radius: 8px; background: #101319; }
.role-heading { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.role-heading span, .role-title-row span { color: #9aa3b0; font-size: .75rem; }
.coverage-tier { display: grid; grid-template-columns: 25px minmax(0,1fr); gap: 6px; align-items: start; margin-bottom: 7px; }
.coverage-tier-label { display: grid; width: 24px; height: 24px; place-items: center; color: #080a0d; font-size: .7rem; font-weight: 800; }
.coverage-tier-label--s { background: #ff7479; } .coverage-tier-label--a { background: #ffb66a; } .coverage-tier-label--b { background: #ffe171; }
.coverage-champions { display: flex; gap: 5px; flex-wrap: wrap; }
.coverage-champion { position: relative; }
.coverage-champion img { display: block; width: 37px; height: 37px; border-radius: 4px; object-fit: cover; }
.flex-badge { position: absolute; right: 1px; bottom: 1px; padding: 1px 3px; color: #fff; border-radius: 3px; background: #7631cc; font-size: .48rem; }
.composition-workspace { display: grid; grid-template-columns: minmax(600px,1.35fr) minmax(360px,.65fr); gap: 14px; margin-top: 14px; align-items: start; }
.draft-status, .rules-badge, .saved-status { padding: 5px 8px; color: #c39bff; border: 1px solid rgba(139,61,255,.4); border-radius: 999px; background: rgba(139,61,255,.08); font-size: .7rem; }
.draft-status--preferred { color: #a9ff38; border-color: rgba(169,255,56,.4); } .draft-status--adapted { color: #ffcf5a; border-color: rgba(255,207,90,.4); } .draft-status--compromised { color: #ff7c7c; border-color: rgba(255,124,124,.4); }
.composition-roles { display: grid; gap: 10px; margin-bottom: 15px; }
.composition-role { padding: 13px; }
.role-title-row { padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,.08); }
.role-title-row strong, .role-title-row span { display: block; }
.role-title-row div span { margin-top: 3px; }
.active-pick-label { color: #a9ff38 !important; }
.compact-field, .pick-field, .secondary-field { display: grid; gap: 6px; }
.compact-field > span, .pick-field > span, .secondary-field > span, .form-field > span { color: #929caa; font-size: .74rem; }
.compact-field small { color: #77818f; font-size: .68rem; }
.purpose-field { margin: 11px 0; }
.pick-grid { display: grid; grid-template-columns: minmax(220px,.8fr) minmax(320px,1.2fr); gap: 12px; }
.champion-select-row, .secondary-select { display: grid; grid-template-columns: 44px minmax(0,1fr); gap: 7px; align-items: center; }
.champion-select-row img, .empty-champion, .secondary-select img, .secondary-number { width: 44px; height: 44px; border-radius: 6px; }
.champion-select-row img, .secondary-select img { object-fit: cover; }
.empty-champion, .secondary-number { display: grid; place-items: center; color: #747d89; background: #171b23; }
.secondary-selects { display: grid; gap: 6px; }
.active-field { margin-top: 11px; padding-top: 11px; border-top: 1px solid rgba(255,255,255,.08); }
select, input, textarea { width: 100%; color: #f4f6f9; border: 1px solid rgba(255,255,255,.14); border-radius: 7px; background: #0d1015; font: inherit; }
select, input { min-height: 40px; padding: 0 10px; }
textarea { min-height: 100px; padding: 10px; resize: vertical; }
.form-field { display: grid; gap: 6px; margin-bottom: 12px; }
.builder-actions, .saved-actions { justify-content: flex-start; }
.resilience-summary { margin-bottom: 10px; padding: 13px; border-left: 3px solid #7e8795; border-radius: 6px; background: #101319; }
.resilience-summary strong { display: block; margin-bottom: 4px; }
.resilience-summary p { margin: 0; color: #9ba4b1; line-height: 1.45; }
.resilience-summary--preferred { border-color: #a9ff38; } .resilience-summary--adapted { border-color: #ffcf5a; } .resilience-summary--compromised { border-color: #ff7479; }
.analysis-finding { display: grid; grid-template-columns: 34px minmax(0,1fr); gap: 10px; padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
.analysis-finding:last-child { border-bottom: 0; }
.finding-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; }
.analysis-finding--strength .finding-icon { color: #071000; background: #a9ff38; } .analysis-finding--limitation .finding-icon { color: #191000; background: #ffb448; }
.analysis-finding strong { color: #a9ff38; } .analysis-finding--limitation strong { color: #ffb448; }
.analysis-finding p { margin: 5px 0 0; color: #a4adba; line-height: 1.45; }
.analysis-empty, .empty-saved, .state-panel { padding: 35px; color: #87919e; text-align: center; }
.analysis-rules { margin-top: 14px; color: #b889ff; } .analysis-rules li { margin: 7px 0; color: #929caa; }
.saved-section { margin-top: 14px; }
.saved-grid { display: grid; grid-template-columns: repeat(3,minmax(220px,1fr)); gap: 11px; }
.saved-champions { display: flex; gap: 7px; margin: 12px 0; }
.saved-champion { min-width: 0; text-align: center; }
.saved-champion img { display: block; width: 43px; height: 43px; border-radius: 5px; object-fit: cover; }
.saved-champion small { display: block; margin-top: 3px; color: #7f8996; font-size: .58rem; }
.saved-composition p { min-height: 42px; color: #8d97a5; font-size: .78rem; }
.state-panel--error { color: #ff9999; }
@media (max-width: 1250px) { .coverage-grid { grid-template-columns: repeat(2,minmax(170px,1fr)); } .composition-workspace { grid-template-columns: 1fr; } }
@media (max-width: 800px) { .team-workspace { display: block; } .team-pool-page { padding: 13px; } .page-header { align-items: flex-start; flex-direction: column; } .coverage-grid, .saved-grid, .pick-grid { grid-template-columns: 1fr; } .active-pick-label { text-align: right; } }
</style>
