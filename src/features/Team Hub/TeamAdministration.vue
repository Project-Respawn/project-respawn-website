<template>
  <div class="team-admin">
    <header class="page-heading">
      <div><p class="eyebrow">ESPORTS</p><h1>Team Administration</h1><p>Create, inspect and manage every Project Respawn team.</p></div>
      <button type="button" :disabled="loading" @click="refreshTeams">{{ loading ? 'Refreshing…' : 'Refresh' }}</button>
    </header>

    <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <section v-if="canPlatformAdmin" class="panel">
      <h2>Create team</h2>
      <form class="form-grid" @submit.prevent="submitCreate">
        <label>Name<input v-model.trim="createForm.name" required maxlength="100" @input="suggestSlug" /></label>
        <label>Slug<input v-model.trim="createForm.slug" required maxlength="48" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" @input="slugEdited = true" /></label>
        <label>Game<select v-model="createForm.gameKey"><option value="LEAGUE_OF_LEGENDS">League of Legends</option></select></label>
        <button :disabled="submitting || !createForm.name || !createForm.slug">{{ submitting ? 'Creating…' : 'Create team' }}</button>
      </form>
    </section>

    <section class="panel">
      <div class="section-heading"><h2>All teams</h2><div><select v-model="statusFilter" aria-label="Filter teams by status"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><input v-model.trim="search" type="search" placeholder="Search name or slug" aria-label="Search teams" /></div></div>
      <p v-if="loading">Loading teams…</p>
      <p v-else-if="!filteredTeams.length">{{ teams.length ? 'No teams match this search.' : 'No teams have been created.' }}</p>
      <div v-else class="table-wrap"><table><thead><tr><th>Team</th><th>Game</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>
        <tr v-for="team in filteredTeams" :key="team.id" :class="{ selected: selectedId === team.id }">
          <td><strong>{{ team.name }}</strong><small>{{ team.slug }}</small></td><td>{{ gameLabel(team.gameKey) }}</td><td>{{ team.status }}</td><td>{{ formatDate(team.updatedAt || team.createdAt) }}</td>
          <td><button type="button" @click="selectTeam(team)">Open</button></td>
        </tr>
      </tbody></table></div>
    </section>

    <section v-if="detailLoading" class="panel">Loading team details…</section>
    <section v-else-if="context" class="panel details">
      <div class="section-heading"><div><p class="eyebrow">SELECTED TEAM</p><h2>{{ context.team.name }}</h2><p>{{ context.team.slug }} · {{ context.team.status }} · {{ activeMemberCount(context) }} active members</p></div><RouterLink :to="`/team-hub/${context.team.slug}/manage`">Open operational Team Hub</RouterLink></div>
      <form v-if="context.capabilities.canAdministerTeam" class="form-grid" @submit.prevent="saveTeam">
        <label>Name<input v-model.trim="editForm.name" required maxlength="100" /></label>
        <label>Status<select v-model="editForm.status"><option>ACTIVE</option><option>INACTIVE</option></select></label>
        <button :disabled="submitting">{{ submitting ? 'Saving…' : 'Save team' }}</button>
      </form>

      <div v-if="context.capabilities.canAdministerTeam" class="settings-card">
        <h3>Team plan</h3>
        <p><strong>{{ context.team.entitlement?.expired ? 'Expired' : (context.team.entitlement?.isPro ? 'Pro' : 'Free') }}</strong><span v-if="context.team.entitlement?.expiresAt"> · expires {{ formatDate(context.team.entitlement.expiresAt) }}</span></p>
        <form class="form-grid" @submit.prevent="savePlan"><label class="toggle"><input v-model="planForm.pro" type="checkbox" /> Enable Pro</label><label>Optional expiry<input v-model="planForm.expiresAt" type="datetime-local" :disabled="!planForm.pro" /></label><button :disabled="submitting">{{ submitting ? 'Saving…' : 'Update plan' }}</button></form>
        <p v-if="context.team.planAdministration?.changedAt" class="hint">Last changed {{ formatDate(context.team.planAdministration.changedAt) }} by {{ context.team.planAdministration.changedBy }}</p>
      </div>

      <div v-if="context.capabilities.canManageBranding" class="settings-card">
        <h3>Team branding</h3>
        <div class="branding-row"><TeamLogo :src="logoPreview || context.team.logoUrl" :name="context.team.name" :size="96"/><div><input ref="logoInput" type="file" accept="image/png,.png" :disabled="submitting" @change="chooseLogo"/><p class="hint">PNG only, 2 MB maximum, 256–2048 pixels. Non-square images are contained within a square frame.</p><p v-if="logoMessage" :class="logoError ? 'error' : 'hint'">{{ logoMessage }}</p><button type="button" :disabled="submitting || !logoFile" @click="saveLogo">{{ submitting ? 'Uploading…' : (context.team.logoUrl ? 'Replace logo' : 'Upload logo') }}</button> <button v-if="context.team.logoUrl" type="button" class="danger" :disabled="submitting" @click="clearLogo">Remove logo</button></div></div>
      </div>

      <div v-if="context.capabilities.canAdministerTeam" class="manager-card">
        <h3>Team Manager</h3>
        <p v-if="manager"><strong>{{ manager.displayName }}</strong><br /><small>Active manager membership</small></p>
        <p v-else>No Team Manager is assigned.</p>
        <form class="form-grid" @submit.prevent="assignManager">
          <div class="account-search">
            <label :for="'manager-account-search'">{{ manager ? 'Find replacement manager' : 'Find manager account' }}</label>
            <input id="manager-account-search" v-model="managerQuery" type="search" autocomplete="off" maxlength="100" role="combobox" aria-autocomplete="list" aria-controls="manager-account-results" :aria-expanded="searchOpen" :aria-activedescendant="activeSearchIndex >= 0 ? `manager-result-${activeSearchIndex}` : undefined" placeholder="Search username or email" @focus="openSearchResults" @blur="closeSearchResults" @keydown.down.prevent="moveSearchSelection(1)" @keydown.up.prevent="moveSearchSelection(-1)" @keydown.enter.prevent="chooseActiveSearchResult" @keydown.esc="searchOpen = false" />
            <p v-if="managerSearching" class="hint" role="status">Searching accounts…</p>
            <p v-else-if="managerSearchError" class="error" role="alert">{{ managerSearchError }}</p>
            <p v-else-if="showNoAccountResults" class="hint" role="status">No matching accounts found.</p>
            <ul v-if="searchOpen && accountResults.length" id="manager-account-results" class="account-results" role="listbox">
              <li v-for="(account, index) in accountResults" :id="`manager-result-${index}`" :key="account.username" role="option" :aria-selected="activeSearchIndex === index" :class="{ active: activeSearchIndex === index, ineligible: !account.eligible }">
                <button type="button" :disabled="!account.eligible" @mousedown.prevent @click="selectAccount(account)"><strong>{{ account.displayName }}</strong><span>{{ account.email }} · {{ account.username }}</span><small v-if="!account.eligible">Account is disabled or unconfirmed</small></button>
              </li>
            </ul>
          </div>
          <div v-if="selectedAccount" class="selected-account" role="status"><span>Selected account</span><strong>{{ selectedAccount.displayName }}</strong><small>{{ selectedAccount.email }} · {{ selectedAccount.username }}</small><button type="button" @click="clearSelectedAccount">Clear</button></div>
          <button :disabled="submitting || !selectedAccount?.eligible">{{ manager ? 'Replace manager' : 'Assign manager' }}</button>
          <button v-if="manager" type="button" class="danger" :disabled="submitting" @click="removeManager">Remove manager</button>
        </form>
        <p class="hint">The account must already exist, be enabled and have a confirmed email. Replacement is atomic: the current manager remains if assignment fails.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { createTeam, getTeamHub, listAdminTeams, loadBoundedPages, removeTeamLogo, searchAssignableUsers, setTeamManager, setTeamPlan, updateTeam, uploadTeamLogo } from './teamHub.service.js';
import TeamLogo from './TeamLogo.vue';
import { validateTeamLogoFile } from './teamBranding.js';
import { useAuth } from '../../composables/useAuth.js';
import { activeManager, activeMemberCount, filterAdminTeams, nextAccountSearchIndex, normalizeAdminTeam, normalizeAssignableUser, normalizeTeamSlug, replaceTeamInList } from './teamAdministration.viewModel.js';
import { managerAssignmentInput } from './teamHub.viewModel.js';

const teams = ref([]), selectedId = ref(''), context = ref(null), search = ref(''), statusFilter = ref('ALL');
const { isAdmin, isSuperAdmin } = useAuth();
const canPlatformAdmin = computed(() => isAdmin.value || isSuperAdmin.value);
const loading = ref(false), detailLoading = ref(false), submitting = ref(false), error = ref(''), notice = ref('');
const createForm = reactive({ name: '', slug: '', gameKey: 'LEAGUE_OF_LEGENDS' });
const editForm = reactive({ name: '', status: 'ACTIVE' });
const planForm = reactive({ pro: false, expiresAt: '' });
const logoFile = ref(null), logoPreview = ref(''), logoMessage = ref(''), logoError = ref(false), logoInput = ref(null);
const managerQuery = ref(''), accountResults = ref([]), selectedAccount = ref(null), managerSearching = ref(false), managerSearchError = ref(''), searchOpen = ref(false), activeSearchIndex = ref(-1), slugEdited = ref(false);
let searchTimer, searchRequest = 0;
const manager = computed(() => activeManager(context.value));
const filteredTeams = computed(() => filterAdminTeams(teams.value, search.value, statusFilter.value));

function message(reason, fallback) { return reason instanceof Error ? reason.message : fallback; }
function gameLabel(value) { return value === 'LEAGUE_OF_LEGENDS' ? 'League of Legends' : value; }
function formatDate(value) { return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
function suggestSlug() { if (!slugEdited.value) createForm.slug = normalizeTeamSlug(createForm.name); }
const showNoAccountResults = computed(() => managerQuery.value.trim().length >= 2 && !managerSearching.value && !managerSearchError.value && searchOpen.value && !accountResults.value.length);
function clearSelectedAccount() { selectedAccount.value = null; }
function selectAccount(account) { if (!account.eligible) return; selectedAccount.value = account; searchOpen.value = false; activeSearchIndex.value = -1; managerSearchError.value = ''; }
function openSearchResults() { if (managerQuery.value.trim().length >= 2) searchOpen.value = true; }
function closeSearchResults() { setTimeout(() => { searchOpen.value = false; }, 0); }
function moveSearchSelection(direction) { searchOpen.value = true; activeSearchIndex.value = nextAccountSearchIndex(activeSearchIndex.value, direction, accountResults.value.length); }
function chooseActiveSearchResult() { const account = accountResults.value[activeSearchIndex.value]; if (account) selectAccount(account); }
function resetManagerSearch() { managerQuery.value = ''; accountResults.value = []; selectedAccount.value = null; managerSearchError.value = ''; searchOpen.value = false; }
watch(managerQuery, (value) => {
  selectedAccount.value = null; managerSearchError.value = ''; accountResults.value = []; activeSearchIndex.value = -1; searchOpen.value = false;
  clearTimeout(searchTimer); const query = value.trim(); const request = ++searchRequest;
  if (query.length < 2) { managerSearching.value = false; return; }
  managerSearching.value = true;
  searchTimer = setTimeout(async () => {
    try { const result = await searchAssignableUsers(query); if (request !== searchRequest) return; accountResults.value = (result?.items || []).map(normalizeAssignableUser); searchOpen.value = true; }
    catch (reason) { if (request === searchRequest) managerSearchError.value = message(reason, 'Unable to search accounts.'); }
    finally { if (request === searchRequest) managerSearching.value = false; }
  }, 300);
});
onBeforeUnmount(() => { clearTimeout(searchTimer); searchRequest += 1; });
async function run(action, success) { if (submitting.value) return; submitting.value = true; error.value = ''; notice.value = ''; try { await action(); notice.value = success; } catch (reason) { error.value = message(reason, 'Team administration request failed'); } finally { submitting.value = false; } }

async function refreshTeams(preferredId = selectedId.value) {
  loading.value = true; error.value = '';
  try {
    const [active, inactive] = await Promise.all(['ACTIVE', 'INACTIVE'].map((status) => loadBoundedPages((nextToken) => listAdminTeams({ status, limit: 50, ...(nextToken ? { nextToken } : {}) }))));
    if (!active.complete || !inactive.complete) throw new Error('Team Hub data limit exceeded');
    teams.value = [...active.items, ...inactive.items].map(normalizeAdminTeam).sort((a, b) => a.name.localeCompare(b.name));
    const selected = teams.value.find((team) => team.id === preferredId) || teams.value[0];
    if (selected) await selectTeam(selected); else { selectedId.value = ''; context.value = null; }
  } catch (reason) { error.value = message(reason, 'Unable to load teams.'); }
  finally { loading.value = false; }
}

async function selectTeam(team) {
  selectedId.value = team.id; detailLoading.value = true; error.value = '';
  try { context.value = await getTeamHub({ teamId: team.id }); editForm.name = context.value.team.name; editForm.status = context.value.team.status; planForm.pro = context.value.team.entitlement?.storedPlan === 'PRO'; planForm.expiresAt = context.value.team.entitlement?.expiresAt ? new Date(context.value.team.entitlement.expiresAt).toISOString().slice(0,16) : ''; clearLogoSelection(); }
  catch (reason) { context.value = null; error.value = message(reason, 'Unable to load team details.'); }
  finally { detailLoading.value = false; }
}

async function submitCreate() {
  await run(async () => {
    const created = await createTeam({ name: createForm.name, slug: normalizeTeamSlug(createForm.slug), gameKey: createForm.gameKey });
    teams.value = replaceTeamInList(teams.value, created);
    createForm.name = ''; createForm.slug = ''; slugEdited.value = false;
    await refreshTeams(created.id);
  }, 'Team created and opened.');
}
async function saveTeam() { await run(async () => { const updated = await updateTeam({ teamId: context.value.team.id, name: editForm.name, status: editForm.status }); teams.value = replaceTeamInList(teams.value, { ...teams.value.find((team) => team.id === updated.id), ...updated }); await selectTeam(updated); }, 'Team details saved.'); }
async function savePlan() { const verb=planForm.pro?'enable Pro for':'disable Pro for'; if(!window.confirm(`Confirm you want to ${verb} ${context.value.team.name}?`))return; await run(async()=>{await setTeamPlan(context.value.team.id,{plan:planForm.pro?'PRO':'FREE',expiresAt:planForm.pro&&planForm.expiresAt?new Date(planForm.expiresAt).toISOString():null,expectedRevision:context.value.team.settingsRevision});await selectTeam(context.value.team);},`Team plan updated to ${planForm.pro?'Pro':'Free'}.`); }
function clearLogoSelection(){if(logoPreview.value)URL.revokeObjectURL(logoPreview.value);logoFile.value=null;logoPreview.value='';logoMessage.value='';logoError.value=false;if(logoInput.value)logoInput.value.value='';}
async function chooseLogo(event){clearLogoSelection();const file=event.target.files?.[0];if(!file)return;try{const info=await validateTeamLogoFile(file);logoFile.value=file;logoPreview.value=URL.createObjectURL(file);logoMessage.value=info.square?`${info.width} × ${info.height} PNG ready.`:`${info.width} × ${info.height} PNG ready; it will be contained in a square frame.`;}catch(reason){logoError.value=true;logoMessage.value=message(reason,'Invalid PNG.');}}
async function saveLogo(){if(!logoFile.value)return;await run(async()=>{await uploadTeamLogo(context.value.team.id,logoFile.value,context.value.team.settingsRevision);await selectTeam(context.value.team);},'Team logo updated.');}
async function clearLogo(){if(!window.confirm(`Remove the logo for ${context.value.team.name}?`))return;await run(async()=>{await removeTeamLogo(context.value.team.id,{expectedRevision:context.value.team.settingsRevision});await selectTeam(context.value.team);},'Team logo removed.');}
async function assignManager() {
  if (!selectedAccount.value?.eligible) return;
  if (manager.value && !window.confirm(`Replace ${manager.value.displayName} as Team Manager?`)) return;
  await run(async () => { await setTeamManager(managerAssignmentInput(context.value.team, selectedAccount.value.email)); resetManagerSearch(); await selectTeam(context.value.team); }, manager.value ? 'Team Manager replaced.' : 'Team Manager assigned.');
}
async function removeManager() {
  if (!manager.value || !window.confirm(`Remove ${manager.value.displayName} as Team Manager? The team will temporarily have no manager.`)) return;
  await run(async () => { await setTeamManager({ teamId: context.value.team.id, targetMembershipId: manager.value.id, action: 'REVOKE', expectedRevision: context.value.team.membershipRevision }); await selectTeam(context.value.team); }, 'Team Manager removed.');
}

refreshTeams();
</script>

<style scoped>
.team-admin{padding:28px;color:#eef1f6}.page-heading,.section-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.page-heading{margin-bottom:24px}.page-heading h1,.section-heading h2{margin:0}.eyebrow{margin:0 0 5px;color:#a9ff38;font-size:.75rem;font-weight:800;letter-spacing:.12em}.panel{margin:18px 0;padding:20px;border:1px solid #303641;border-radius:12px;background:#11151c}.form-grid{display:flex;align-items:end;gap:12px;flex-wrap:wrap}.form-grid label{display:grid;gap:6px;min-width:210px}.form-grid input,.form-grid select,.form-grid button,.page-heading button,.section-heading input{min-height:42px;padding:8px 11px;color:#eef1f6;border:1px solid #48515f;border-radius:7px;background:#090c11}.form-grid button,.page-heading button{cursor:pointer;background:#6f35c5}.form-grid button:disabled,.page-heading button:disabled{cursor:not-allowed;opacity:.55}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border-bottom:1px solid #2b313a}td small{display:block;color:#9ca6b5}.selected{background:rgba(169,255,56,.06)}.notice{padding:12px;color:#cfff91;background:#172312}.error{padding:12px;color:#ffb0b0;background:#2c1518}.manager-card{margin-top:22px;padding-top:18px;border-top:1px solid #303641}.hint{color:#aab2bf;font-size:.88rem}.danger{background:#782d3b!important}.account-search{position:relative;min-width:min(430px,100%)}.account-search>label{display:block;margin-bottom:6px}.account-search>input{width:100%}.account-results{position:absolute;z-index:5;right:0;left:0;margin:4px 0 0;padding:4px;list-style:none;border:1px solid #48515f;border-radius:7px;background:#11151c;box-shadow:0 10px 30px #0008}.account-results li button{display:grid;width:100%;padding:10px;text-align:left;border:0;background:transparent}.account-results li.active button{background:#263044}.account-results li.ineligible{opacity:.6}.account-results span,.selected-account span,.selected-account small{display:block;color:#aab2bf}.selected-account{display:grid;gap:3px;padding:10px;border:1px solid #48515f;border-radius:7px}.selected-account button{justify-self:start;min-height:auto;margin-top:4px;padding:4px 8px}@media(max-width:760px){.team-admin{padding:18px}.page-heading,.section-heading{display:grid}.form-grid{display:grid}.form-grid label{min-width:0}}
.settings-card{margin-top:22px;padding-top:18px;border-top:1px solid #303641}.branding-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.toggle{display:flex!important;align-items:center;gap:8px;min-width:auto!important}
</style>
