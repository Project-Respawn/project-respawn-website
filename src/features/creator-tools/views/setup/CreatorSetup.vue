<template>
  <main class="creator-setup-page">
    <header class="setup-header"><p class="setup-eyebrow">Creator Tools</p><h1>Set up your creator workspace</h1><p>Complete each step once. Existing Workspace, Brand, and Twitch state is retained when you return.</p></header>
    <p v-if="loading" class="setup-state">Loading your creator setup…</p>
    <p v-if="error" class="setup-error" role="alert">{{ error }}</p>
    <p v-if="message" class="setup-success" role="status">{{ message }}</p>
    <div v-if="!loading" class="setup-steps">
      <section class="setup-card" :class="{ complete: workspace }">
        <div class="step-heading"><span>1</span><div><h2>Creator Workspace</h2><p>Your private boundary for creator tools and integrations.</p></div><strong>{{ workspace ? '✓ Ready' : 'Required' }}</strong></div>
        <p v-if="workspace" class="resolved-value">{{ workspace.name }}</p>
        <form v-else class="inline-form" @submit.prevent="createWorkspace"><input v-model.trim="workspaceName" maxlength="80" placeholder="Workspace name" required><button :disabled="saving">{{ saving ? 'Creating…' : 'Create Workspace' }}</button></form>
      </section>
      <section class="setup-card" :class="{ complete: selectedBrandId }">
        <div class="step-heading"><span>2</span><div><h2>Brand</h2><p>Select the Brand that will own your Twitch integration.</p></div><strong>{{ selectedBrandId ? '✓ Ready' : 'Required' }}</strong></div>
        <label v-if="brands.length" class="setup-field">Brand<select v-model="selectedBrandId" @change="refreshTwitchStatus"><option v-for="brand in brands" :key="brand.brandId" :value="brand.brandId">{{ brand.name }}</option></select></label>
        <form v-else-if="workspace" class="inline-form" @submit.prevent="createBrand"><input v-model.trim="brandName" maxlength="80" placeholder="Brand name" required><button :disabled="saving">{{ saving ? 'Creating…' : 'Create Brand' }}</button></form>
        <p v-else class="setup-muted">Complete the Workspace step first.</p>
      </section>
      <section class="setup-card" :class="{ complete: twitchConnected }">
        <div class="step-heading"><span>3</span><div><h2>Twitch</h2><p>Connect the primary channel used by your creator tools.</p></div><strong>{{ twitchConnected ? '✓ Connected' : 'Required' }}</strong></div>
        <p v-if="twitchConnected" class="resolved-value">{{ twitchAccountName || 'Twitch account connected' }}</p>
        <button v-else type="button" :disabled="connectingTwitch" @click="connectTwitch">{{ connectingTwitch ? 'Opening Twitch…' : 'Connect Twitch' }}</button>
      </section>
      <section class="setup-card" :class="{ complete: twitchConnected }"><div class="step-heading"><span>4</span><div><h2>Initial configuration</h2><p>Your Brand and Twitch connection establish secure defaults. Detailed controls remain in Integrations and Twitch tools.</p></div><strong>{{ twitchConnected ? '✓ Ready' : 'Waiting' }}</strong></div></section>
      <section class="setup-card"><div class="step-heading"><span>5</span><div><h2>Complete Setup</h2><p>Continue to the normal Creator Tools dashboard.</p></div></div><button type="button" :disabled="!twitchConnected" @click="$router.push({ name: 'CreatorDashboard' })">Open Creator Tools</button></section>
    </div>
  </main>
</template>

<script>
import { generateClient } from 'aws-amplify/data';
import { refreshAccessContext } from '@/composables/useAccessContext.js';
import { consumeTwitchReturnTarget, getTwitchConnectionStatus, parseTwitchOAuthReturn, startTwitchConnection } from '@/features/creator-tools/services/twitchConnection.js';
const client = generateClient();
export default {
  name: 'CreatorSetup',
  data: () => ({ loading: true, saving: false, connectingTwitch: false, error: '', message: '', currentUserId: '', workspaces: [], brands: [], selectedBrandId: '', workspaceName: '', brandName: '', twitchConnected: false, twitchAccountName: '' }),
  computed: { workspace() { return this.workspaces[0] || null; } },
  async mounted() {
    const oauthReturn = parseTwitchOAuthReturn(window.location);
    if (oauthReturn.isReturn) consumeTwitchReturnTarget();
    await this.refreshSetupState();
    if (oauthReturn.connected && !this.twitchConnected) {
      for (let attempt = 0; attempt < 3 && !this.twitchConnected; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await this.refreshTwitchStatus();
      }
    }
    if (oauthReturn.error) this.error = `Twitch connection failed: ${oauthReturn.error}`;
    else if (oauthReturn.connected && this.twitchConnected) this.message = 'Twitch Connected ✓';
    if (oauthReturn.isReturn) this.$router.replace({ name: 'CreatorSetup' });
  },
  methods: {
    slugify(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); },
    applyAccess(access) { this.currentUserId = access?.userId || ''; this.workspaces = Array.isArray(access?.workspaces) ? access.workspaces : []; this.brands = Array.isArray(access?.brands) ? access.brands : []; if (!this.brands.some((brand) => brand.brandId === this.selectedBrandId)) this.selectedBrandId = this.brands[0]?.brandId || ''; },
    async refreshSetupState() { this.loading = true; this.error = ''; console.info('[Twitch status diagnostic] CreatorSetup.refreshSetupState start', { selectedBrandId: this.selectedBrandId || null, workspaceIdPresent: Boolean(this.workspace?.id) }); try { this.applyAccess(await refreshAccessContext({ force: true })); console.info('[Twitch status diagnostic] CreatorSetup access applied', { selectedBrandId: this.selectedBrandId || null, workspaceIdPresent: Boolean(this.workspace?.id) }); await this.refreshTwitchStatus(); console.info('[Twitch status diagnostic] CreatorSetup.refreshSetupState applied', { connectionStatus: this.twitchConnected ? 'CONNECTED' : null, twitchLogin: this.twitchAccountName || null, selectedBrandId: this.selectedBrandId || null, workspaceIdPresent: Boolean(this.workspace?.id) }); } catch (error) { console.error('[Twitch status diagnostic] CreatorSetup.refreshSetupState error', { name: error?.name || 'Error', message: error?.message || 'Unknown error', selectedBrandId: this.selectedBrandId || null, workspaceIdPresent: Boolean(this.workspace?.id) }); this.error = error?.message || 'Could not load creator setup.'; } finally { this.loading = false; } },
    async createWorkspace() { this.saving = true; this.error = ''; try { const response = await client.mutations.createCreatorWorkspace({ name: this.workspaceName.trim() }); if (response?.errors?.length) throw new Error(response.errors[0].message); this.workspaceName = ''; this.applyAccess(await refreshAccessContext({ force: true })); } catch (error) { this.error = error?.message || 'Could not create Creator Workspace.'; } finally { this.saving = false; } },
    async createBrand() { const name = this.brandName.trim(); const slug = this.slugify(name); this.saving = true; this.error = ''; try { const response = await client.mutations.createManagedBrand({ name, slug, ownerUserId: this.currentUserId }); if (response?.errors?.length || !response?.data?.brandId) throw new Error(response?.errors?.[0]?.message || 'Could not create Brand.'); this.brandName = ''; this.applyAccess(await refreshAccessContext({ force: true })); this.selectedBrandId = response.data.brandId; } catch (error) { this.error = error?.message || 'Could not create Brand.'; } finally { this.saving = false; } },
    async refreshTwitchStatus() { this.twitchConnected = false; this.twitchAccountName = ''; if (!this.selectedBrandId) return; try { const status = await getTwitchConnectionStatus(client, this.selectedBrandId); this.twitchConnected = status.connected; this.twitchAccountName = status.accountName; console.info('[Twitch status diagnostic] CreatorSetup.refreshTwitchStatus applied', { connectionStatus: status.integration?.connectionStatus || null, twitchLogin: status.integration?.twitchLogin || null, selectedBrandId: this.selectedBrandId || null, workspaceIdPresent: Boolean(status.integration?.workspaceId) }); } catch (error) { console.error('[Twitch status diagnostic] CreatorSetup.refreshTwitchStatus error', { name: error?.name || 'Error', message: error?.message || 'Unknown error', selectedBrandId: this.selectedBrandId || null, workspaceIdPresent: Boolean(this.workspace?.id) }); this.error = error?.message || 'Could not load Twitch status.'; } },
    async connectTwitch() { this.connectingTwitch = true; this.error = ''; try { await startTwitchConnection({ client, brandId: this.selectedBrandId, workspaceId: this.workspace?.id || '', returnTarget: 'setup', navigate: (url) => window.location.assign(url) }); } catch (error) { this.error = error?.message || 'Could not start Twitch connection.'; } finally { this.connectingTwitch = false; } },
  },
};
</script>
<style scoped src="./CreatorSetup.css"></style>
