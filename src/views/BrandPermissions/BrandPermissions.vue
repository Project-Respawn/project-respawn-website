<template>
  <main class="brand-permissions-page">
    <header>
      <p class="eyebrow">Brand workspace</p>
      <h1>Brand Permissions</h1>
      <p>Owners manage delegated access for their own brands. Global platform access is not granted here.</p>
    </header>

    <p v-if="error" class="state error">{{ error }}</p>
    <p v-else-if="loading" class="state">Loading brand access…</p>
    <p v-else-if="!brands.length" class="state">You do not currently own or help manage a brand.</p>

    <template v-else>
      <label class="field">
        <span>Brand</span>
        <select v-model="selectedBrandId" :disabled="saving" @change="selectBrand">
          <option v-for="brand in brands" :key="brand.brandId" :value="brand.brandId">{{ brand.name }}</option>
        </select>
      </label>

      <section v-if="details" class="card">
        <h2>{{ details.brand.name }}</h2>
        <p><strong>Brand Owner:</strong> {{ details.brand.ownerUserId || 'Not assigned — platform administration required.' }}</p>

        <div v-if="isPlatformOperator" class="owner-editor">
          <label class="field"><span>Change Brand Owner (Cognito user ID)</span><input v-model.trim="ownerUserId" :disabled="saving" /></label>
          <button :disabled="saving" @click="saveOwner">Update Owner</button>
        </div>

        <p v-else class="owner-note">Brand Owners have full access automatically. Ownership can only be changed by platform administration.</p>
      </section>

      <section v-if="details" class="grid">
        <form class="card" @submit.prevent="saveHelper">
          <h2>{{ helperForm.userId ? 'Update helper' : 'Add helper' }}</h2>
          <label class="field"><span>Helper Cognito user ID</span><input v-model.trim="helperForm.userId" required :disabled="saving" /></label>
          <label class="field"><span>Display name (optional)</span><input v-model.trim="helperForm.displayName" :disabled="saving" /></label>
          <label class="field"><span>Email (optional)</span><input v-model.trim="helperForm.email" type="email" :disabled="saving" /></label>
          <fieldset><legend>Brand permissions</legend>
            <label v-for="permissionKey in details.availablePermissionKeys" :key="permissionKey" class="check">
              <input type="checkbox" :checked="helperForm.permissionKeys.includes(permissionKey)" :disabled="saving" @change="togglePermission(permissionKey)" />
              {{ permissionKey }}
            </label>
          </fieldset>
          <button :disabled="saving">{{ saving ? 'Saving…' : 'Save helper' }}</button>
          <button type="button" class="secondary" :disabled="saving" @click="resetHelperForm">Reset</button>
        </form>

        <section class="card">
          <h2>Helpers</h2>
          <p v-if="!details.helpers.length" class="muted">No helpers have been assigned.</p>
          <article v-for="helper in details.helpers" :key="helper.userId" class="helper">
            <div><strong>{{ helper.displayName || helper.username || helper.userId }}</strong><small>{{ helper.userId }}</small>
              <div class="keys"><span v-for="key in helper.permissionKeys" :key="key">{{ key }}</span></div>
            </div>
            <div><button class="secondary" :disabled="saving" @click="editHelper(helper)">Edit</button><button class="danger" :disabled="saving" @click="removeHelper(helper.userId)">Remove</button></div>
          </article>
        </section>
      </section>
    </template>
    <p v-if="message" class="state success">{{ message }}</p>
  </main>
</template>

<script src="./BrandPermissions.js"></script>
<style src="./BrandPermissions.css"></style>
