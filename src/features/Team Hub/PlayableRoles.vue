<template>
  <section>
    <h2>My playable roles</h2>
    <p>Choose one primary role and up to two secondary roles. Your coach or team manager assigns the starting five.</p>
    <form @submit.prevent="save">
      <label>Primary role
        <select v-model="primaryRole" required><option disabled value="">Choose a role</option><option v-for="role in roles" :key="role">{{ role }}</option></select>
      </label>
      <fieldset><legend>Secondary roles (up to two)</legend>
        <label v-for="role in roles.filter(value => value !== primaryRole)" :key="role"><input v-model="secondaryRoles" type="checkbox" :value="role" :disabled="saving || (!secondaryRoles.includes(role) && secondaryRoles.length >= 2)" />{{ role }}</label>
      </fieldset>
      <button :disabled="saving || !primaryRole">{{ saving ? 'Saving…' : 'Save my roles' }}</button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p><p v-if="saved" role="status">Roles saved. Your starting position has not changed.</p>
  </section>
</template>
<script setup>
import {ref, watch} from 'vue';
import {setMyPlayableRoles} from './teamHub.service.js';
const props = defineProps({teamId: {type: String, required: true}, membership: {type: Object, required: true}, expectedRevision: {type: Number, required: true}});
const emit = defineEmits(['saved']);
const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const primaryRole = ref(props.membership.primaryRole || '');
const secondaryRoles = ref([...(props.membership.secondaryRoles || [])]);
const saving = ref(false), saved = ref(false), error = ref('');
watch(primaryRole, role => {secondaryRoles.value = secondaryRoles.value.filter(value => value !== role); saved.value = false;});
async function save() {
  if (saving.value) return;
  saving.value = true; error.value = ''; saved.value = false;
  try {await setMyPlayableRoles({teamId: props.teamId, primaryRole: primaryRole.value, secondaryRoles: [...secondaryRoles.value], expectedRevision: props.expectedRevision}); saved.value = true; emit('saved');}
  catch (reason) {error.value = reason instanceof Error ? reason.message : 'Unable to save roles.';}
  finally {saving.value = false;}
}
</script>
<style scoped>
form,fieldset{display:flex;gap:12px;flex-wrap:wrap}label{display:flex;gap:6px;align-items:center}select,button{padding:10px}section{margin-top:28px}
</style>
