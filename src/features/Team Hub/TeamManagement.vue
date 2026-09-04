<template>
  <main class="team-management">
    <RouterLink to="/team-hub">← Team Hub</RouterLink>
    <p v-if="loading">Loading team…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else-if="context">
      <h1>{{ context.team.name }} management</h1>
      <p>Platform administrator: {{ context.isPlatformAdmin ? 'Yes' : 'No' }} · Team role: {{ context.teamRole || 'None' }}</p>

      <section>
        <h2>Team overview</h2>
        <p>{{ context.team.name }} · {{ context.team.status }}</p>
        <form v-if="context.capabilities.canAdministerTeam" @submit.prevent="saveTeam"><input v-model.trim="teamName" required /><select v-model="teamStatus"><option>ACTIVE</option><option>INACTIVE</option></select><button>Save team</button></form>
      </section>

      <section v-if="context.capabilities.canAdministerTeam">
        <h2>Team manager</h2>
        <form @submit.prevent="assignManager">
          <input v-model.trim="managerEmail" type="email" autocomplete="off" required placeholder="Manager account email" />
          <button :disabled="submitting">{{ submitting ? 'Assigning…' : 'Assign or replace manager' }}</button>
        </form>
        <p v-for="manager in activeManagers" :key="manager.id">{{ manager.displayName }} <button :disabled="submitting" @click="revokeManager(manager)">Revoke manager</button></p>
      </section>

      <section v-if="context.capabilities.canManageMembers">
        <h2>Coach and players</h2>
        <form @submit.prevent="saveMember">
          <select v-model="memberRole"><option>COACH</option><option>PLAYER</option></select>
          <div class="account-search">
            <input v-model="memberQuery" type="search" autocomplete="off" maxlength="100" role="combobox" aria-autocomplete="list" aria-controls="member-account-results" :aria-expanded="searchOpen" :aria-activedescendant="activeSearchIndex >= 0 ? `member-result-${activeSearchIndex}` : undefined" placeholder="Search username or email" @focus="openSearchResults" @blur="closeSearchResults" @keydown.down.prevent="moveSearchSelection(1)" @keydown.up.prevent="moveSearchSelection(-1)" @keydown.enter.prevent="chooseActiveSearchResult" @keydown.esc="searchOpen = false" />
            <p v-if="memberSearching">Searching accounts…</p><p v-else-if="memberSearchError" class="error">{{ memberSearchError }}</p><p v-else-if="showNoAccountResults">No matching accounts found.</p>
            <ul v-if="searchOpen && accountResults.length" id="member-account-results" class="account-results" role="listbox"><li v-for="(account,index) in accountResults" :id="`member-result-${index}`" :key="account.username" role="option" :aria-selected="activeSearchIndex === index" :class="{ active: activeSearchIndex === index, ineligible: !account.eligible }"><button type="button" :disabled="!account.eligible" @mousedown.prevent @click="selectAccount(account)"><strong>{{ account.displayName }}</strong><span>{{ account.email }} · {{ account.username }}</span><small v-if="!account.eligible">Account is disabled or unconfirmed</small></button></li></ul>
          </div>
          <div v-if="selectedAccount" class="selected-account"><strong>{{ selectedAccount.displayName }}</strong><small>{{ selectedAccount.email }} · {{ selectedAccount.username }}</small><button type="button" @click="clearSelectedAccount">Clear</button></div>
          <button :disabled="submitting || !selectedAccount?.eligible">{{ submitting ? 'Assigning…' : (memberRole === 'COACH' && activeCoach ? 'Replace coach' : 'Assign member') }}</button>
        </form>
      </section>

      <section v-if="context.capabilities.canManageRoster">
        <h2>Starting roster</h2>
        <form @submit.prevent="assignSlot">
          <select v-model="rosterMembershipId" required><option value="" disabled>Player</option><option v-for="member in activePlayers" :key="member.id" :value="member.id">{{ member.displayName }}</option></select>
          <select v-model="gameRole"><option v-for="role in roles" :key="role">{{ role }}</option></select>
          <select v-model="slotType"><option>STARTER</option><option>SUBSTITUTE</option></select>
          <button :disabled="submitting">Assign slot</button>
        </form>
        <ul><li v-for="slot in startingRoster" :key="slot.id">{{ slot.gameRoleKey }} — {{ memberName(slot.membershipId) }} <RouterLink :to="`/team-hub/${route.params.teamSlug}/coach-review?player=${encodeURIComponent(slot.membershipId)}`">View champion pool</RouterLink> <button :disabled="submitting" @click="removeSlot(slot)">Remove</button></li></ul>
      </section>

      <section v-if="context.capabilities.canManageRoster">
        <h2>Substitutes</h2>
        <ul><li v-for="slot in substituteRoster" :key="slot.id">{{ slot.gameRoleKey }} — {{ memberName(slot.membershipId) }} <RouterLink :to="playerPoolLink(slot.membershipId)">View champion pool</RouterLink> <button :disabled="submitting" @click="removeSlot(slot)">Remove</button></li></ul>
        <p v-if="!substituteRoster.length">No substitutes assigned.</p>
      </section>

      <section v-if="context.capabilities.canManageMembers">
        <h2>Active and inactive members</h2>
        <ul><li v-for="member in context.members" :key="member.id">{{ member.displayName }} — {{ member.role }} — {{ member.status }} <RouterLink v-if="member.role === 'PLAYER' && member.status === 'ACTIVE'" :to="playerPoolLink(member.id)">View champion pool</RouterLink> <button v-if="['COACH','PLAYER'].includes(member.role) && member.status === 'ACTIVE'" :disabled="submitting" @click="revokeMember(member)">Revoke</button></li></ul>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getTeamHub, manageTeamMember, searchAssignableUsers, setTeamManager, setTeamRosterSlot, updateTeam } from './teamHub.service.js';
import { isTeamHubConflict, managerAssignmentInput, memberAssignmentInput, revocationInput } from './teamHub.viewModel.js';
import { nextAccountSearchIndex, normalizeAssignableUser } from './teamAdministration.viewModel.js';

const route = useRoute();
const loading = ref(true), error = ref(''), context = ref(null);
const managerEmail = ref(''), memberRole = ref('COACH');
const memberQuery = ref(''), accountResults = ref([]), selectedAccount = ref(null), memberSearching = ref(false), memberSearchError = ref(''), searchOpen = ref(false), activeSearchIndex = ref(-1);
let searchTimer, searchRequest = 0;
const teamName = ref(''), teamStatus = ref('ACTIVE');
const rosterMembershipId = ref(''), gameRole = ref('TOP'), slotType = ref('STARTER');
const submitting = ref(false);
const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const activePlayers = computed(() => context.value?.members.filter((member) => member.role === 'PLAYER' && member.status === 'ACTIVE') || []);
const activeManagers = computed(() => context.value?.members.filter((member) => member.role === 'MANAGER' && member.status === 'ACTIVE') || []);
const activeCoach = computed(() => context.value?.members.find((member) => member.role === 'COACH' && member.status === 'ACTIVE') || null);
const startingRoster = computed(() => context.value?.roster.filter((slot) => slot.slotType === 'STARTER') || []);
const substituteRoster = computed(() => context.value?.roster.filter((slot) => slot.slotType === 'SUBSTITUTE') || []);
const showNoAccountResults = computed(() => memberQuery.value.trim().length >= 2 && !memberSearching.value && !memberSearchError.value && searchOpen.value && !accountResults.value.length);

async function refresh() { loading.value = true; error.value = ''; try { context.value = await getTeamHub({ teamSlug: route.params.teamSlug }); teamName.value = context.value.team.name; teamStatus.value = context.value.team.status; } catch (reason) { context.value = null; error.value = reason instanceof Error ? reason.message : 'Team Hub access denied'; } finally { loading.value = false; } }
async function run(action, onSuccess) { if (submitting.value) return; submitting.value = true; try { await action(); if (onSuccess) onSuccess(); await refresh(); } catch (reason) { const conflict = isTeamHubConflict(reason); await refresh(); error.value = conflict ? 'The team changed. The latest roster is shown; review it and retry your change.' : (reason instanceof Error ? reason.message : 'Team update failed'); } finally { submitting.value = false; } }
const assignManager = () => run(() => setTeamManager(managerAssignmentInput(context.value.team, managerEmail.value)), () => { managerEmail.value = ''; });
const saveTeam = () => run(() => updateTeam({ teamId: context.value.team.id, name: teamName.value, status: teamStatus.value }));
const revokeManager = (manager) => run(() => setTeamManager({ teamId: context.value.team.id, targetMembershipId: manager.id, action: 'REVOKE', expectedRevision: context.value.team.membershipRevision }));
function clearSelectedAccount() { selectedAccount.value = null; }
function selectAccount(account) { if (!account.eligible) return; selectedAccount.value = account; searchOpen.value = false; activeSearchIndex.value = -1; }
function openSearchResults() { if (memberQuery.value.trim().length >= 2) searchOpen.value = true; }
function closeSearchResults() { setTimeout(() => { searchOpen.value = false; }, 0); }
function moveSearchSelection(direction) { searchOpen.value = true; activeSearchIndex.value = nextAccountSearchIndex(activeSearchIndex.value, direction, accountResults.value.length); }
function chooseActiveSearchResult() { const account = accountResults.value[activeSearchIndex.value]; if (account) selectAccount(account); }
watch(memberQuery, (value) => {
  selectedAccount.value = null; accountResults.value = []; memberSearchError.value = ''; activeSearchIndex.value = -1; searchOpen.value = false;
  clearTimeout(searchTimer); const query = value.trim(); const request = ++searchRequest;
  if (query.length < 2) { memberSearching.value = false; return; }
  memberSearching.value = true;
  searchTimer = setTimeout(async () => { try { const result = await searchAssignableUsers(query, context.value.team.id); if (request !== searchRequest) return; accountResults.value = (result?.items || []).slice(0, 10).map(normalizeAssignableUser); searchOpen.value = true; } catch (reason) { if (request === searchRequest) memberSearchError.value = reason instanceof Error ? reason.message : 'Unable to search accounts.'; } finally { if (request === searchRequest) memberSearching.value = false; } }, 300);
});
const saveMember = async () => { if (!selectedAccount.value?.eligible) return; if (memberRole.value === 'COACH' && activeCoach.value && !window.confirm(`Replace ${activeCoach.value.displayName} as Coach?`)) return; const email = selectedAccount.value.email; await run(() => manageTeamMember(memberAssignmentInput(context.value.team, email, memberRole.value)), () => { memberQuery.value = ''; clearSelectedAccount(); }); };
const revokeMember = (member) => run(() => manageTeamMember(revocationInput(context.value.team, member)));
const assignSlot = () => run(() => setTeamRosterSlot({ teamId: context.value.team.id, membershipId: rosterMembershipId.value, gameRoleKey: gameRole.value, slotType: slotType.value, action: 'ASSIGN', expectedRevision: context.value.team.rosterRevision }));
const removeSlot = (slot) => run(() => setTeamRosterSlot({ teamId: context.value.team.id, membershipId: slot.membershipId, gameRoleKey: slot.gameRoleKey, slotType: slot.slotType, action: 'REMOVE', expectedRevision: context.value.team.rosterRevision }));
const memberName = (membershipId) => context.value?.members.find((member) => member.id === membershipId)?.displayName || 'Player';
const playerPoolLink = (membershipId) => `/team-hub/${route.params.teamSlug}/coach-review?player=${encodeURIComponent(membershipId)}`;
onBeforeUnmount(() => { clearTimeout(searchTimer); searchRequest += 1; });
onMounted(refresh);
</script>

<style scoped>
.team-management { min-height: 100vh; padding: 32px; color: #f4f6fa; background: #07090d; }
section { max-width: 900px; margin: 24px 0; padding: 20px; border: 1px solid #333; border-radius: 10px; }
form { display: flex; gap: 10px; flex-wrap: wrap; } input, select, button { padding: 10px; } li { margin: 8px 0; } .error { color: #ff8c8c; }
.account-search{position:relative;min-width:min(430px,100%)}.account-search>input{width:100%}.account-results{position:absolute;z-index:5;right:0;left:0;margin:4px 0;padding:4px;list-style:none;border:1px solid #48515f;background:#11151c}.account-results button{display:grid;width:100%;text-align:left}.account-results span,.selected-account small{display:block}.account-results li.active button{background:#263044}.account-results li.ineligible{opacity:.6}.selected-account{display:grid;gap:3px;padding:8px;border:1px solid #48515f}
</style>
