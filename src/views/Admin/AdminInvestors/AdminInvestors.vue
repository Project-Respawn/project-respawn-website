<template>
  <section class="admin-investors">
    <header><div><p>Investor relations</p><h1>Investor Access</h1><span>Control account-linked access to the private investor data room.</span></div><button @click="showGrant=true">Grant access</button></header>
    <p v-if="message" class="notice">{{ message }}</p>
    <div class="panel"><label class="search">Search investors <input v-model="search" type="search" placeholder="Name, email or organisation"></label>
      <div v-if="loading" class="empty">Loading investor access…</div>
      <div v-else-if="!filtered.length" class="empty">No investor access records found.</div>
      <div v-else class="table-wrap"><table><thead><tr><th>Investor</th><th>Organisation</th><th>Access</th><th>NDA</th><th>Status</th><th>Granted</th><th>Expiry</th><th>Granted by</th><th>Actions</th></tr></thead>
        <tbody><tr v-for="item in filtered" :key="item.id"><td><strong>{{ item.name }}</strong><small>{{ item.email }}</small></td><td>{{ item.organisation || '—' }}</td><td><select :value="item.accessLevel" @change="confirmUpdate(item,{accessLevel:$event.target.value},'Change access level?')"><option v-for="level in levels" :key="level">{{ level }}</option></select></td><td><select :value="item.ndaStatus" @change="confirmUpdate(item,{ndaStatus:$event.target.value},'Change NDA status?')"><option v-for="status in ndaStatuses" :key="status">{{ status }}</option></select></td><td><span :class="['status',item.isActive?'active':'revoked']">{{ item.isActive ? 'Active' : 'Revoked' }}</span></td><td>{{ date(item.grantedAt) }}</td><td><input type="date" :value="dateInput(item.expiresAt)" @change="confirmUpdate(item,{expiresAt:$event.target.value?new Date(`${$event.target.value}T23:59:59.999Z`).toISOString():null,clearExpiry:!$event.target.value},'Change expiry date?')"></td><td>{{ item.grantedBy }}</td><td><button class="small" @click="confirmUpdate(item,{isActive:!item.isActive},item.isActive?'Revoke investor access?':'Reactivate investor access?')">{{ item.isActive?'Revoke':'Reactivate' }}</button></td></tr></tbody>
      </table></div>
    </div>

    <div v-if="showGrant" class="modal-backdrop"><form class="modal" @submit.prevent="lookupAccount"><h2>Grant investor access</h2><label>Project Respawn account email<input v-model.trim="grant.email" type="email" required></label><button type="submit" :disabled="lookingUp">{{ lookingUp?'Searching…':'Find account' }}</button>
      <template v-if="account"><div class="account"><strong>{{ account.name }}</strong><span>{{ account.email }}</span><small>Linked by Cognito sub {{ account.cognitoSub }}</small></div><label>Name<input v-model.trim="grant.name" required></label><label>Organisation<input v-model.trim="grant.organisation"></label><label>Access level<select v-model="grant.accessLevel"><option v-for="level in levels" :key="level">{{ level }}</option></select></label><label>NDA status<select v-model="grant.ndaStatus"><option v-for="status in ndaStatuses" :key="status">{{ status }}</option></select></label><label>Expiry date<input v-model="grant.expiresAt" type="date"></label><button type="button" @click="confirmGrant">Grant access</button></template>
      <button type="button" class="secondary" @click="closeGrant">Cancel</button></form></div>
    <div v-if="pending" class="modal-backdrop"><div class="modal"><h2>{{ pending.title }}</h2><p>This changes access to confidential investor material and will be audited.</p><div class="modal-actions"><button class="secondary" @click="pending=null">Cancel</button><button @click="applyPending">Confirm</button></div></div></div>
  </section>
</template>

<script>
import { generateClient } from 'aws-amplify/data';
const client=generateClient();
export default {name:'AdminInvestors',data:()=>({items:[],loading:true,search:'',message:'',showGrant:false,lookingUp:false,account:null,pending:null,levels:['PRE_NDA','NDA','DILIGENCE'],ndaStatuses:['NOT_REQUIRED','NOT_SIGNED','SIGNED'],grant:{email:'',name:'',organisation:'',accessLevel:'PRE_NDA',ndaStatus:'NOT_SIGNED',expiresAt:''}}),computed:{filtered(){const q=this.search.toLowerCase();return this.items.filter(x=>`${x.name} ${x.email} ${x.organisation||''}`.toLowerCase().includes(q))}},async mounted(){await this.load()},methods:{
  async call(operation,args){const result=await operation(args);if(result.errors?.length)throw new Error(result.errors[0].message);return result.data},
  async load(){this.loading=true;try{this.items=await this.call(client.queries.listInvestorAccess)||[]}catch(e){this.message=e.message}finally{this.loading=false}},
  date(v){return v?new Intl.DateTimeFormat('en-GB',{dateStyle:'medium'}).format(new Date(v)):'—'},dateInput(v){return v?String(v).slice(0,10):''},
  async lookupAccount(){this.lookingUp=true;this.account=null;try{this.account=await this.call(client.queries.findInvestorAccountByEmail,{email:this.grant.email});if(!this.account)throw new Error('No account found for that email');this.grant.name=this.account.name}catch(e){this.message=e.message}finally{this.lookingUp=false}},
  confirmGrant(){this.pending={title:'Grant investor access?',grant:true}},confirmUpdate(item,changes,title){this.pending={title,item,changes}},
  async applyPending(){const pending=this.pending;this.pending=null;try{if(pending.grant){const expiresAt=this.grant.expiresAt?new Date(`${this.grant.expiresAt}T23:59:59.999Z`).toISOString():null;await this.call(client.mutations.grantInvestorAccess,{...this.grant,cognitoSub:this.account.cognitoSub,email:this.account.email,expiresAt});this.closeGrant()}else await this.call(client.mutations.updateInvestorAccess,{investorAccessId:pending.item.id,...pending.changes});await this.load();this.message='Investor access updated.'}catch(e){this.message=e.message}},
  closeGrant(){this.showGrant=false;this.account=null;this.grant={email:'',name:'',organisation:'',accessLevel:'PRE_NDA',ndaStatus:'NOT_SIGNED',expiresAt:''}}
}};
</script>
<style scoped src="./AdminInvestors.css"></style>
