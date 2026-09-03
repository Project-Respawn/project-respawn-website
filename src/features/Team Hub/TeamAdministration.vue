<template>
  <div class="team-admin">
    <header class="page-heading">
      <div><p class="eyebrow">ESPORTS</p><h1>Team Administration</h1><p>Create, inspect and manage every Project Respawn team.</p></div>
      <button type="button" :disabled="loading" @click="refreshTeams">{{ loading ? 'Refreshing…' : 'Refresh' }}</button>
    </header>

    <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <section class="panel">
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
      <form class="form-grid" @submit.prevent="saveTeam">
        <label>Name<input v-model.trim="editForm.name" required maxlength="100" /></label>
        <label>Status<select v-model="editForm.status"><option>ACTIVE</option><option>INACTIVE</option></select></label>
        <button :disabled="submitting">{{ submitting ? 'Saving…' : 'Save team' }}</button>
      </form>

      <div class="manager-card">
        <h3>Team Manager</h3>
        <p v-if="manager"><strong>{{ manager.displayName }}</strong><br /><small>Active manager membership</small></p>
        <p v-else>No Team Manager is assigned.</p>
        <form class="form-grid" @submit.prevent="assignManager">
          <label>{{ manager ? 'Replacement manager account email' : 'Manager account email' }}<input v-model.trim="managerEmail" type="email" autocomplete="off" required /></label>
          <button :disabled="submitting">{{ manager ? 'Replace manager' : 'Assign manager' }}</button>
          <button v-if="manager" type="button" class="danger" :disabled="submitting" @click="removeManager">Remove manager</button>
        </form>
        <p class="hint">The account must already exist, be enabled and have a confirmed email. Replacement is atomic: the current manager remains if assignment fails.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { createTeam, getTeamHub, listAdminTeams, loadBoundedPages, setTeamManager, updateTeam } from './teamHub.service.js';
import { activeManager, activeMemberCount, filterAdminTeams, normalizeAdminTeam, normalizeTeamSlug, replaceTeamInList } from './teamAdministration.viewModel.js';
import { managerAssignmentInput } from './teamHub.viewModel.js';

const teams = ref([]), selectedId = ref(''), context = ref(null), search = ref(''), statusFilter = ref('ALL');
const loading = ref(false), detailLoading = ref(false), submitting = ref(false), error = ref(''), notice = ref('');
const createForm = reactive({ name: '', slug: '', gameKey: 'LEAGUE_OF_LEGENDS' });
const editForm = reactive({ name: '', status: 'ACTIVE' });
const managerEmail = ref(''), slugEdited = ref(false);
const manager = computed(() => activeManager(context.value));
const filteredTeams = computed(() => filterAdminTeams(teams.value, search.value, statusFilter.value));

function message(reason, fallback) { return reason instanceof Error ? reason.message : fallback; }
function gameLabel(value) { return value === 'LEAGUE_OF_LEGENDS' ? 'League of Legends' : value; }
function formatDate(value) { return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'; }
function suggestSlug() { if (!slugEdited.value) createForm.slug = normalizeTeamSlug(createForm.name); }
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
  try { context.value = await getTeamHub({ teamId: team.id }); editForm.name = context.value.team.name; editForm.status = context.value.team.status; }
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
async function assignManager() {
  if (manager.value && !window.confirm(`Replace ${manager.value.displayName} as Team Manager?`)) return;
  await run(async () => { await setTeamManager(managerAssignmentInput(context.value.team, managerEmail.value)); managerEmail.value = ''; await selectTeam(context.value.team); }, manager.value ? 'Team Manager replaced.' : 'Team Manager assigned.');
}
async function removeManager() {
  if (!manager.value || !window.confirm(`Remove ${manager.value.displayName} as Team Manager? The team will temporarily have no manager.`)) return;
  await run(async () => { await setTeamManager({ teamId: context.value.team.id, targetMembershipId: manager.value.id, action: 'REVOKE', expectedRevision: context.value.team.membershipRevision }); await selectTeam(context.value.team); }, 'Team Manager removed.');
}

refreshTeams();
</script>

<style scoped>
.team-admin{padding:28px;color:#eef1f6}.page-heading,.section-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.page-heading{margin-bottom:24px}.page-heading h1,.section-heading h2{margin:0}.eyebrow{margin:0 0 5px;color:#a9ff38;font-size:.75rem;font-weight:800;letter-spacing:.12em}.panel{margin:18px 0;padding:20px;border:1px solid #303641;border-radius:12px;background:#11151c}.form-grid{display:flex;align-items:end;gap:12px;flex-wrap:wrap}.form-grid label{display:grid;gap:6px;min-width:210px}.form-grid input,.form-grid select,.form-grid button,.page-heading button,.section-heading input{min-height:42px;padding:8px 11px;color:#eef1f6;border:1px solid #48515f;border-radius:7px;background:#090c11}.form-grid button,.page-heading button{cursor:pointer;background:#6f35c5}.form-grid button:disabled,.page-heading button:disabled{cursor:not-allowed;opacity:.55}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border-bottom:1px solid #2b313a}td small{display:block;color:#9ca6b5}.selected{background:rgba(169,255,56,.06)}.notice{padding:12px;color:#cfff91;background:#172312}.error{padding:12px;color:#ffb0b0;background:#2c1518}.manager-card{margin-top:22px;padding-top:18px;border-top:1px solid #303641}.hint{color:#aab2bf;font-size:.88rem}.danger{background:#782d3b!important}@media(max-width:760px){.team-admin{padding:18px}.page-heading,.section-heading{display:grid}.form-grid{display:grid}.form-grid label{min-width:0}}
</style>
