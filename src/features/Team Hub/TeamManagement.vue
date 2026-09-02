<template>
  <main class="team-management">
    <RouterLink to="/team-hub">← Team Hub</RouterLink>
    <p v-if="loading">Loading team…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <template v-else-if="context">
      <h1>{{ context.team.name }} management</h1>
      <p>Your team role: {{ context.myRole }}</p>

      <section v-if="context.myRole === 'ADMIN'">
        <h2>Team details</h2>
        <form @submit.prevent="saveTeam"><input v-model.trim="teamName" required /><select v-model="teamStatus"><option>ACTIVE</option><option>INACTIVE</option></select><button>Save team</button></form>
        <h2>Team manager</h2>
        <form @submit.prevent="assignManager">
          <input v-model.trim="managerEmail" type="email" autocomplete="off" required placeholder="Manager account email" />
          <button :disabled="submitting">{{ submitting ? 'Assigning…' : 'Assign or replace manager' }}</button>
        </form>
        <p v-for="manager in activeManagers" :key="manager.id">{{ manager.displayName }} <button :disabled="submitting" @click="revokeManager(manager)">Revoke manager</button></p>
      </section>

      <section v-if="context.myRole === 'MANAGER'">
        <h2>Members</h2>
        <form @submit.prevent="saveMember">
          <label>{{ memberRole === 'COACH' ? 'Coach account email' : 'Player account email' }}<input v-model.trim="memberEmail" type="email" autocomplete="off" required /></label>
          <select v-model="memberRole"><option>COACH</option><option>PLAYER</option></select>
          <button :disabled="submitting">{{ submitting ? 'Assigning…' : 'Assign member' }}</button>
        </form>
        <ul><li v-for="member in context.members" :key="member.id">{{ member.displayName }} — {{ member.role }} — {{ member.status }} <button v-if="['COACH','PLAYER'].includes(member.role) && member.status === 'ACTIVE'" :disabled="submitting" @click="revokeMember(member)">Revoke</button></li></ul>

        <h2>League roster</h2>
        <form @submit.prevent="assignSlot">
          <select v-model="rosterMembershipId" required><option value="" disabled>Player</option><option v-for="member in activePlayers" :key="member.id" :value="member.id">{{ member.displayName }}</option></select>
          <select v-model="gameRole"><option v-for="role in roles" :key="role">{{ role }}</option></select>
          <select v-model="slotType"><option>STARTER</option><option>SUBSTITUTE</option></select>
          <button :disabled="submitting">Assign slot</button>
        </form>
        <ul><li v-for="slot in context.roster" :key="slot.id">{{ slot.gameRoleKey }} — {{ slot.slotType }} — {{ memberName(slot.membershipId) }} <button :disabled="submitting" @click="removeSlot(slot)">Remove</button></li></ul>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getTeamHub, manageTeamMember, setTeamManager, setTeamRosterSlot, updateTeam } from './teamHub.service.js';
import { isTeamHubConflict, managerAssignmentInput, memberAssignmentInput, revocationInput } from './teamHub.viewModel.js';

const route = useRoute();
const loading = ref(true), error = ref(''), context = ref(null);
const managerEmail = ref(''), memberEmail = ref(''), memberRole = ref('PLAYER');
const teamName = ref(''), teamStatus = ref('ACTIVE');
const rosterMembershipId = ref(''), gameRole = ref('TOP'), slotType = ref('STARTER');
const submitting = ref(false);
const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const activePlayers = computed(() => context.value?.members.filter((member) => member.role === 'PLAYER' && member.status === 'ACTIVE') || []);
const activeManagers = computed(() => context.value?.members.filter((member) => member.role === 'MANAGER' && member.status === 'ACTIVE') || []);

async function refresh() { loading.value = true; error.value = ''; try { context.value = await getTeamHub({ teamSlug: route.params.teamSlug }); teamName.value = context.value.team.name; teamStatus.value = context.value.team.status; } catch (reason) { context.value = null; error.value = reason instanceof Error ? reason.message : 'Team Hub access denied'; } finally { loading.value = false; } }
async function run(action, onSuccess) { if (submitting.value) return; submitting.value = true; try { await action(); if (onSuccess) onSuccess(); await refresh(); } catch (reason) { const conflict = isTeamHubConflict(reason); await refresh(); error.value = conflict ? 'The team changed. The latest roster is shown; review it and retry your change.' : (reason instanceof Error ? reason.message : 'Team update failed'); } finally { submitting.value = false; } }
const assignManager = () => run(() => setTeamManager(managerAssignmentInput(context.value.team, managerEmail.value)), () => { managerEmail.value = ''; });
const saveTeam = () => run(() => updateTeam({ teamId: context.value.team.id, name: teamName.value, status: teamStatus.value }));
const revokeManager = (manager) => run(() => setTeamManager({ teamId: context.value.team.id, targetMembershipId: manager.id, action: 'REVOKE', expectedRevision: context.value.team.membershipRevision }));
const saveMember = () => run(() => manageTeamMember(memberAssignmentInput(context.value.team, memberEmail.value, memberRole.value)), () => { memberEmail.value = ''; });
const revokeMember = (member) => run(() => manageTeamMember(revocationInput(context.value.team, member)));
const assignSlot = () => run(() => setTeamRosterSlot({ teamId: context.value.team.id, membershipId: rosterMembershipId.value, gameRoleKey: gameRole.value, slotType: slotType.value, action: 'ASSIGN', expectedRevision: context.value.team.rosterRevision }));
const removeSlot = (slot) => run(() => setTeamRosterSlot({ teamId: context.value.team.id, membershipId: slot.membershipId, gameRoleKey: slot.gameRoleKey, slotType: slot.slotType, action: 'REMOVE', expectedRevision: context.value.team.rosterRevision }));
const memberName = (membershipId) => context.value?.members.find((member) => member.id === membershipId)?.displayName || 'Player';
onMounted(refresh);
</script>

<style scoped>
.team-management { min-height: 100vh; padding: 32px; color: #f4f6fa; background: #07090d; }
section { max-width: 900px; margin: 24px 0; padding: 20px; border: 1px solid #333; border-radius: 10px; }
form { display: flex; gap: 10px; flex-wrap: wrap; } input, select, button { padding: 10px; } li { margin: 8px 0; } .error { color: #ff8c8c; }
</style>
