<template>
  <section class="staff-section" aria-labelledby="staff-title">
    <header><p class="eyebrow">COACHING &amp; SUPPORT</p><h2 id="staff-title">Team staff</h2><p>Manage your coaching team separately from the player lineup.</p></header>
    <p class="availability" role="status">Head Coach uses the existing Coach role and can be assigned now. Additional staff positions and configurable permissions need the backend upgrade before assignments can be saved.</p>
    <div class="staff-grid">
      <article v-for="spot in spots" :key="spot.id" class="staff-card" :class="{ vacant: !spot.member, 'manager-card': spot.role === 'MANAGER' }">
        <span class="category">{{ spot.category }}</span><h3>{{ spot.label }}</h3>
        <p class="person">{{ spot.member?.displayName || 'Not assigned' }}</p>
        <template v-if="spot.role === 'COACH'">
          <p class="description">The current Coach role includes Coach Review access.</p>
          <form v-if="canManage" @submit.prevent="assignCoach">
            <label>Existing account email<input v-model.trim="email" type="email" required autocomplete="off" :disabled="submitting" /></label>
            <button :disabled="submitting || !email">{{ spot.member ? 'Replace Head Coach' : 'Assign Head Coach' }}</button>
          </form>
          <button v-if="canManage && spot.member" type="button" class="revoke" :disabled="submitting" @click="$emit('revoke', spot.member)">Revoke team access</button>
          <p v-if="!canManage" class="description">Assignment is restricted to authorised team management.</p>
        </template>
        <template v-else-if="spot.role === 'MANAGER'"><p class="description">Manager assignments are managed in Settings by an administrator.</p><button v-if="canAdminister" type="button" @click="$emit('settings')">Manage Manager</button></template>
        <template v-else><p class="description">Separate staff assignment and permissions are awaiting backend support.</p><button type="button" disabled>Assignment unavailable</button></template>
      </article>
    </div>
    <section class="permission-summary"><h3>Staff permissions</h3><p>The planned permission system gives the Manager full control and ownership transfer. Head Coach can manage staff access but cannot remove or replace the Manager. Admins retain team oversight, deletion and Manager replacement.</p><p>Permission editing is not enabled on the current API. Removing a member revokes team access and benefits; their personal pool is retained.</p></section>
  </section>
</template>
<script setup>
import {computed,ref} from 'vue';
import {staffPositions,gameProfiles} from '../../../domains/team-hub/structure/catalog.mjs';
const props=defineProps({members:{type:Array,required:true},gameKey:{type:String,required:true},canManage:Boolean,canAdminister:Boolean,submitting:Boolean});
const emit=defineEmits(['assign-coach','revoke','settings']);
const email=ref('');
const spots=computed(()=>staffPositions.flatMap(position=>{
  const role=position.key==='HEAD_COACH'?'COACH':position.key==='TEAM_MANAGER'?'MANAGER':null;
  const member=role?props.members.find(m=>m.status==='ACTIVE'&&m.role===role):null;
  const slots=position.capacityPerSpecialty?(gameProfiles[props.gameKey]?.positions||[]):Array.from({length:position.capacity},(_,i)=>({key:String(i+1),label:position.capacity>1?String(i+1):''}));
  return slots.map(slot=>({id:position.key+':'+slot.key,label:position.label+(slot.label?' - '+slot.label:''),category:position.category,role,member}));
}));
function assignCoach(){if(props.canManage&&!props.submitting&&email.value)emit('assign-coach',email.value);}
</script>
<style scoped>
.manager-card{grid-column:1 / -1;border-color:#607b43}.manager-card .category{color:#b6f36b}
.staff-section{color:#edf1f7}.eyebrow,.category{text-transform:uppercase;letter-spacing:.12em;font-size:10px;color:#a1a9b7}h2{font-size:22px;margin:6px 0}header>p:last-child,.description,.permission-summary p{color:#a1a9b7;font-size:13px;line-height:1.6}.availability{padding:16px 18px;border:1px solid #655338;background:#282218;border-radius:10px;color:#ecd2a7;font-size:13px;line-height:1.6;margin:22px 0}.staff-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.staff-card{background:#14171d;border:1px solid #353c48;border-radius:12px;padding:22px;display:flex;flex-direction:column;align-items:flex-start}.vacant{border-style:dashed}h3{font-size:16px;margin:8px 0}.person{font-size:18px;margin:10px 0;overflow-wrap:anywhere}.description{margin:8px 0 18px}.staff-card form{width:100%;margin-top:auto}label{display:grid;gap:7px;font-size:12px;color:#c0c7d3}input{box-sizing:border-box;width:100%;background:#0d1016;border:1px solid #343b47;border-radius:7px;color:#edf1f7;padding:11px;font:inherit}button{border:1px solid #45523b;border-radius:7px;padding:10px 14px;background:#b6f36b;color:#19230f;font:inherit;font-size:12px;cursor:pointer;margin-top:12px}button:disabled{background:#202630;border-color:#343b47;color:#99a2b0;cursor:not-allowed}.revoke{background:transparent;color:#f29da2;border-color:#774047}.permission-summary{background:#14171d;border:1px solid #292e38;border-radius:12px;padding:22px;margin-top:24px}:is(button,input):focus-visible{outline:2px solid #b6f36b;outline-offset:3px}@media(max-width:1000px){.staff-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.staff-grid{grid-template-columns:1fr}}
</style>
