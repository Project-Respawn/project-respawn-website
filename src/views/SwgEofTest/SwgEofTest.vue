<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { downloadRequest, downloadInstaller } from '../../api/swgDownloads.js'
import { useAccessContext } from '../../composables/useAccessContext.js'
import { swgEofRelease as release, canDownload } from '../../config/swgEofRelease.js'

const { accessContext } = useAccessContext()
const isBetaTester = computed(() => accessContext.value.groups.includes('BetaMember'))
const ready = canDownload(release)
const route = useRoute()
const deviceId = computed(() => typeof route.query.device === 'string' && /^[a-f0-9]{32}$/.test(route.query.device) ? route.query.device : '')
const installerCode = ref('')
const downloadBusy = ref(false)
const downloadError = ref('')
const approved = ref(false)
async function getInstaller() {
  downloadBusy.value = true; downloadError.value = ''
  try { await downloadInstaller() } catch (error) { downloadError.value = error.message }
  finally { downloadBusy.value = false }
}
async function approveInstaller() {
  downloadBusy.value = true; downloadError.value = ''
  try {
    await downloadRequest('devices/approve', { deviceId: deviceId.value, code: installerCode.value.trim().toUpperCase() })
    approved.value = true
  } catch (error) { downloadError.value = error.message }
  finally { downloadBusy.value = false }
}
let previousTitle
onMounted(() => {
  previousTitle = document.title
  document.title = 'SWG · Echoes of the Fallen Test | Project Respawn'
})
onUnmounted(() => { document.title = previousTitle })
</script>

<template>
  <div v-if="isBetaTester" class="eof-page">
    <div class="eof-shell">
      <section v-if="deviceId" class="eof-section" aria-labelledby="installer-approval">
        <h2 id="installer-approval">Authorise your launcher or installer</h2>
        <p>Only approve this if you just opened Project Respawn Setup or the test launcher on your own computer. Enter the eight-character code displayed there.</p>
        <p v-if="approved" role="status">Access authorised. Return to your launcher or Setup to continue.</p>
        <form v-else @submit.prevent="approveInstaller">
          <label for="installer-code">Code shown in your launcher or Setup</label>
          <input id="installer-code" v-model="installerCode" class="form-control my-3" autocomplete="off" maxlength="8" pattern="[A-Fa-f0-9]{8}" required />
          <button class="btn btn-primary" :disabled="downloadBusy || !release.downloadApiBase">{{ downloadBusy ? 'Checking…' : 'Authorise access' }}</button>
        </form>
      </section>
      <p v-if="downloadError" role="alert" class="pt-3">{{ downloadError }}</p>
      <section class="eof-hero" aria-labelledby="eof-title">
        <RouterLink to="/" class="eof-back">← Project Respawn</RouterLink>
        <p class="eof-eyebrow">Star Wars Galaxies · Private playtest</p>
        <h1 id="eof-title">Echoes of<br><span>the Fallen.</span></h1>
        <p class="eof-lead">A new chapter. A familiar galaxy.<br>Help us test the next step, together.</p>
        <p class="eof-description">The Project Respawn SWG test client installs in its own directory. Everything you need is included — no other SWG installation required.</p>
        <div class="eof-tags"><span>Windows client</span><span>Standalone installation</span><span>Invited testers</span></div>
      </section>

      <section class="eof-download" aria-labelledby="download-title">
        <div>
          <p class="eof-kicker">Your way into the playtest</p>
          <h2 id="download-title">One download.<br>Setup does the rest.</h2>
          <p>Run the small installer and choose your install folder. Setup downloads, verifies and installs the complete client, then opens the Project Respawn launcher.</p>
          <p class="eof-status"><span aria-hidden="true">●</span> {{ ready ? 'Launcher and city preview available' : 'Private release being prepared' }}</p>
          <button v-if="ready" type="button" :disabled="downloadBusy" class="btn btn-primary eof-cta" @click="getInstaller">{{ downloadBusy ? 'Preparing secure download…' : 'Download Windows Setup' }} <span aria-hidden="true">↓</span></button>
          <button v-else type="button" class="btn btn-primary eof-cta" disabled aria-describedby="release-status">Download coming soon</button>
          <p id="release-status" class="eof-small">{{ ready ? 'Sign in from the desktop launcher using website approval. Your test account is assigned automatically. Start the server, wait for Ready, then select Play.' : 'The installer is built. Downloads will open here once hosting and tester access are ready.' }}</p>
          <p class="eof-small">Setup: {{ (release.installerBytes / 1024).toFixed(1) }} KiB · Client download: 8.18 GB · Allow 24 GiB free space</p>
        </div>
        <aside class="eof-checklist" aria-label="What is included">
          <p class="eof-kicker">Built for a straightforward setup</p>
          <ul>
            <li><strong>Your own test installation</strong><span>Separate client, settings and launcher.</span></li>
            <li><strong>Automatic client download</strong><span>Progress, download speed and time remaining.</span></li>
            <li><strong>Verified before installation</strong><span>SHA-256 checks protect against incomplete or corrupted downloads.</span></li>
            <li><strong>Pick up where you left off</strong><span>Retries and resumable downloads where supported.</span></li>
          </ul>
        </aside>
      </section>

      <section class="eof-section" aria-labelledby="steps-title">
        <p class="eof-kicker">When your invitation arrives</p>
        <h2 id="steps-title">From download to launch.</h2>
        <ol class="eof-steps">
          <li><span class="eof-number">01</span><h3>Get Setup</h3><p>Download the Windows installer from this page and run it.</p></li>
          <li><span class="eof-number">02</span><h3>Let it install</h3><p>Choose your dedicated folder. Setup handles the client files and bundled runtimes automatically.</p></li>
          <li><span class="eof-number">03</span><h3>Join the test</h3><p>Open the launcher, approve its website sign-in code, and use your automatically assigned test account.</p></li>
        </ol>
      </section>

      <section class="eof-scope" aria-labelledby="scope-title">
        <div><p class="eof-kicker">A focused first step</p><h2 id="scope-title">Small test.<br>Useful feedback.</h2></div>
        <div><p>This first release focuses on the Stage 1 Solo Big Battle lifecycle: enter the test, complete an objective, reset and replay.</p><p>It is an early development playtest. A stock-asset city prototype is included inside the instance. Later battle systems are not part of this test. Your organiser will provide the test instructions and access details.</p></div>
      </section>

      <section class="eof-section eof-faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Before you begin.</h2>
        <details><summary>Do I need another copy of SWG installed?</summary><p>No. This package includes its own complete client and installs into a dedicated Project Respawn directory.</p></details>
        <details><summary>Do I need to extract a large archive?</summary><p>No. Download and run Setup.exe. It handles the client packages, verification and installation for you.</p></details>
        <details><summary>What if my download stops?</summary><p>Run Setup again with the same install directory. It reuses verified downloads and resumes partial chunks where the download host supports it.</p></details>
        <details><summary>Can anyone join the server?</summary><p>This area requires the Beta Member role on your Project Respawn account. Your organiser assigns that role. Approving the launcher assigns one of eight available game accounts. One Solo Big Battle encounter is available at a time.</p></details>
        <details><summary>Will this replace my existing SWG installation?</summary><p>No. Choose a dedicated Project Respawn folder. The installer does not import or depend on another SWG installation.</p></details>
        <details v-if="ready"><summary>Release details and installer checksum</summary><p>Version {{ release.version }}</p><p class="eof-small">Installer SHA-256</p><code>{{ release.sha256 }}</code></details>
      </section>
      <div class="eof-end"><p>Your past is just the tutorial.<br><strong>Your real game starts now.</strong></p><RouterLink to="/contact">Need a hand? Contact Project Respawn →</RouterLink></div>
    </div>
  </div>
  <section v-else class="container py-5" aria-labelledby="beta-access-title">
    <h1 id="beta-access-title">Beta tester access required</h1>
    <p>Ask your organiser to assign the Beta Member role to your Project Respawn account.</p>
    <RouterLink to="/">Return to Project Respawn</RouterLink>
  </section>
</template>

<style scoped>
.eof-page{color:#f3f7ff;background:radial-gradient(circle at top left,rgba(168,85,247,.16),transparent 32%),radial-gradient(circle at top right,rgba(45,212,191,.1),transparent 28%),linear-gradient(180deg,#171f3d,#11182f 42%,#0d1428)}
.eof-shell{width:min(1120px,calc(100% - 2rem));margin:auto}.eof-hero{padding:4rem 0 3.5rem;max-width:820px}.eof-back{display:inline-block;margin-bottom:2rem;color:#bfcce0;font-size:.9rem}.eof-eyebrow{color:#8ef0d0;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.12em}.eof-hero h1{font-size:clamp(3.3rem,8vw,6rem);line-height:.98;letter-spacing:-.045em;color:white;margin:1rem 0 1.5rem}.eof-hero h1 span{color:#a78bfa}.eof-page p{color:#bfcae0;line-height:1.7}.eof-page .eof-lead{font-size:1.4rem;color:#f3f7ff}.eof-description{max-width:650px}.eof-tags{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.5rem}.eof-tags span{border:1px solid #a78bfa44;border-radius:99px;padding:.4rem .85rem;color:#d5ccf1;font-size:.8rem}.eof-download{display:grid;grid-template-columns:1.15fr 1fr;gap:3rem;padding:2.5rem;border:1px solid #a78bfa50;border-radius:var(--radius,12px);background:linear-gradient(130deg,#a78bfa12,#8ef0d008);box-shadow:0 16px 55px #0003}.eof-page h2{color:#f3f7ff;font-size:clamp(1.7rem,3vw,2.3rem);letter-spacing:-.03em;line-height:1.15;margin-bottom:1.2rem}.eof-page .eof-kicker{color:#a78bfa;letter-spacing:.1em;text-transform:uppercase;font-size:.75rem;font-weight:700}.eof-page .eof-status{color:#8ef0d0;font-size:.9rem;margin-top:1.6rem}.eof-cta{display:flex;justify-content:space-between;align-items:center;width:100%;padding:1rem 1.3rem;font-weight:700}.eof-cta:disabled{opacity:1;background:#29354b!important;border-color:#52627b!important;color:#cbd5e1!important;cursor:not-allowed}.eof-page .eof-small{font-size:.82rem;margin-top:.8rem;margin-bottom:.5rem}.eof-checklist{border-left:1px solid #a78bfa30;padding-left:2.5rem}.eof-checklist ul{list-style:none;padding:0;margin:0}.eof-checklist li{padding:1rem 0;border-bottom:1px solid #a78bfa20}.eof-checklist strong,.eof-checklist span{display:block}.eof-checklist strong{color:#f3f7ff}.eof-checklist span{font-size:.92rem;color:#bfcae0;margin-top:.35rem}.eof-section{padding:4rem 0}.eof-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;padding:0;margin:2rem 0 0;list-style:none}.eof-number{font-size:2rem;color:#a78bfa}.eof-steps h3{font-size:1.2rem;color:#f3f7ff;margin:1rem 0 .7rem}.eof-steps p{font-size:.95rem}.eof-scope{display:grid;grid-template-columns:1fr 1.6fr;gap:3rem;border-block:1px solid #a78bfa30;padding:2.5rem 0}.eof-faq details{border-bottom:1px solid #a78bfa30;padding:1.1rem 0}.eof-faq summary{cursor:pointer;font-weight:600;color:#f3f7ff}.eof-faq details p{margin:1rem 0 .3rem;max-width:850px}.eof-faq code{display:block;overflow-wrap:anywhere;color:#8ef0d0}.eof-end{padding:0 0 3rem;display:flex;justify-content:space-between;gap:2rem;align-items:center}.eof-end strong{color:#a78bfa}.eof-page a:focus-visible,.eof-page summary:focus-visible{outline:2px solid var(--accent);outline-offset:5px}
@media(max-width:720px){.eof-hero{padding-top:2.5rem}.eof-download,.eof-scope,.eof-steps{grid-template-columns:1fr;gap:1.5rem}.eof-download{padding:1.5rem}.eof-checklist{border-left:0;border-top:1px solid #a78bfa30;padding:1.5rem 0 0}.eof-end{flex-direction:column;align-items:flex-start}.eof-section{padding:3rem 0}}
</style>
