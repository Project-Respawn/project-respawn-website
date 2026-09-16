<template>
  <main class="buff-page">
    <section class="hero">
      <div>
        <p class="eyebrow">PROJECT RESPAWN · SWG TOOLS</p>
        <h1>SWG Beyond Buff Builder</h1>
        <p class="subtitle">Build an Entertainer Inspiration buff, stay within the 20-point limit, and copy a request ready for in-game chat.</p>
      </div>
      <div class="points-card">
        <div class="points-top">
          <span>BUFF POINTS</span>
          <strong>{{ usedPoints }} / {{ TOTAL_POINTS }}</strong>
        </div>
        <div class="bar"><div class="bar-fill" :style="{ width: `${(usedPoints / TOTAL_POINTS) * 100}%` }"></div></div>
        <div class="remaining">{{ remainingPoints }} points remaining</div>
      </div>
    </section>

    <section class="builder-grid">
      <article v-for="category in categories" :key="category.id" class="panel">
        <div class="panel-heading">
          <h2>{{ category.label }}</h2>
          <span>{{ category.items.length }} buffs</span>
        </div>

        <div v-for="buff in category.items" :key="buff.id" class="buff-row">
          <div class="buff-info">
            <strong>{{ buff.name }}</strong>
            <small>{{ buff.cost }} {{ buff.cost === 1 ? 'point' : 'points' }} per selection</small>
          </div>

          <div class="controls" v-if="buff.max > 1">
            <button @click="decrement(buff.id)" :disabled="rank(buff.id) === 0" aria-label="Decrease">−</button>
            <span class="rank">{{ rank(buff.id) }}/{{ buff.max }}</span>
            <button @click="increment(buff)" :disabled="!canIncrement(buff)" aria-label="Increase">+</button>
          </div>

          <button
            v-else
            class="toggle"
            :class="{ selected: rank(buff.id) === 1 }"
            @click="toggle(buff)"
            :disabled="rank(buff.id) === 0 && !canIncrement(buff)"
          >
            {{ rank(buff.id) ? 'ADDED ✓' : `ADD · ${buff.cost}` }}
          </button>
        </div>
      </article>
    </section>

    <section class="summary">
      <div class="summary-heading">
        <div>
          <p class="eyebrow">YOUR BUFF</p>
          <h2>{{ selected.length ? `${selected.length} selections` : 'No buffs selected yet' }}</h2>
        </div>
        <button class="secondary" @click="reset" :disabled="!selected.length">Reset</button>
      </div>

      <div v-if="selected.length" class="chips">
        <span v-for="item in selected" :key="item.id">{{ item.name }} {{ rank(item.id) }}/{{ item.max }}</span>
      </div>

      <div class="output">
        <textarea readonly :value="requestText" aria-label="Buff request"></textarea>
        <div class="actions">
          <button class="secondary" @click="copyBuild" :disabled="!selected.length">{{ buildCopyLabel }}</button>
          <button class="primary" @click="copyRequest" :disabled="!selected.length">{{ requestCopyLabel }}</button>
        </div>
      </div>
    </section>

    <footer class="tool-footer">
      <strong>Project Respawn © 2026 · Unofficial SWG Beyond Community Tool</strong>
      <p>
        This is an unofficial community tool for Star Wars Galaxies: Beyond and is not affiliated with
        or endorsed by SWG Beyond, Lucasfilm, Disney, or Daybreak Game Company.
      </p>
      <p>
        Star Wars and related properties belong to their respective owners. Buff data has been verified
        in-game by the Project Respawn community.
      </p>
      <span>SWG Beyond Inspiration data · 20-point maximum</span>
    </footer>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { TOTAL_POINTS, categories, allBuffs } from './swgBeyondBuffs.js'

const selections = reactive({})
const requestCopyLabel = ref('Copy /tt Request')
const buildCopyLabel = ref('Copy Build')

for (const buff of allBuffs) selections[buff.id] = 0

const rank = (id) => selections[id] || 0

const usedPoints = computed(() =>
  allBuffs.reduce((total, buff) => total + rank(buff.id) * buff.cost, 0)
)

const remainingPoints = computed(() => TOTAL_POINTS - usedPoints.value)

const selected = computed(() => allBuffs.filter(buff => rank(buff.id) > 0))

function canIncrement(buff) {
  return rank(buff.id) < buff.max && usedPoints.value + buff.cost <= TOTAL_POINTS
}

function increment(buff) {
  if (canIncrement(buff)) selections[buff.id]++
}

function decrement(id) {
  if (rank(id) > 0) selections[id]--
}

function toggle(buff) {
  if (rank(buff.id)) selections[buff.id] = 0
  else if (canIncrement(buff)) selections[buff.id] = 1
}

function reset() {
  for (const buff of allBuffs) selections[buff.id] = 0
}

const buildText = computed(() =>
  selected.value.map(buff => `${buff.name} (${rank(buff.id)}/${buff.max})`).join(', ')
)

const requestText = computed(() =>
  selected.value.length
    ? `/tt Could you buff me with ${buildText.value}, please?`
    : 'Select buffs above to create an in-game request.'
)

async function copy(text, labelRef, success) {
  try {
    await navigator.clipboard.writeText(text)
    labelRef.value = success
    setTimeout(() => (labelRef.value = labelRef === requestCopyLabel ? 'Copy /tt Request' : 'Copy Build'), 1400)
  } catch {
    labelRef.value = 'Copy failed'
  }
}

function copyRequest() {
  copy(requestText.value, requestCopyLabel, 'Copied ✓')
}

function copyBuild() {
  copy(`${buildText.value} — ${usedPoints.value}/${TOTAL_POINTS} points`, buildCopyLabel, 'Copied ✓')
}
</script>

<style scoped>
.buff-page{min-height:100vh;padding:48px clamp(18px,4vw,72px);background:radial-gradient(circle at 80% 0%,#1a2630 0,transparent 32%),#080d12;color:#edf3f6;font-family:Inter,system-ui,sans-serif}
.hero{max-width:1280px;margin:auto;display:grid;grid-template-columns:1.5fr .7fr;gap:32px;align-items:end}
.eyebrow{color:#d7a73d;letter-spacing:.15em;font-size:.76rem;font-weight:800;margin:0 0 8px}
h1{font-size:clamp(2.3rem,5vw,4.8rem);line-height:.95;margin:0;max-width:780px}
.subtitle{color:#9eabb4;max-width:700px;line-height:1.6}
.points-card,.panel,.summary{background:rgba(17,25,32,.92);border:1px solid #263641;border-radius:14px;box-shadow:0 18px 45px rgba(0,0,0,.22)}
.points-card{padding:22px}.points-top{display:flex;justify-content:space-between;color:#aeb9c0}.points-top strong{color:#fff;font-size:1.5rem}
.bar{height:8px;background:#27323a;border-radius:10px;margin:16px 0 9px;overflow:hidden}.bar-fill{height:100%;background:#d7a73d;transition:width .2s}.remaining{font-size:.85rem;color:#87959f}
.builder-grid{max-width:1280px;margin:34px auto;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.panel{overflow:hidden}.panel-heading{padding:18px 20px;border-bottom:1px solid #263641;display:flex;align-items:center;justify-content:space-between}.panel-heading h2{font-size:1rem;letter-spacing:.08em;margin:0}.panel-heading span{font-size:.75rem;color:#788892}
.buff-row{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:14px 18px;border-bottom:1px solid #1e2b33}.buff-row:last-child{border-bottom:0}.buff-info{display:flex;flex-direction:column;gap:3px}.buff-info small{color:#71808a}
.controls{display:flex;align-items:center;gap:10px}.controls button,.toggle{border:1px solid #344650;background:#111a20;color:#fff;border-radius:8px;cursor:pointer}.controls button{width:34px;height:34px;font-size:1.2rem}.rank{min-width:42px;text-align:center;font-variant-numeric:tabular-nums}.toggle{min-width:100px;padding:9px 12px;font-size:.72rem;font-weight:800;letter-spacing:.04em}.toggle.selected{border-color:#d7a73d;color:#f2c967;background:#211c11}
button:disabled{opacity:.28;cursor:not-allowed}
.summary{max-width:1280px;margin:0 auto;padding:24px}.summary-heading{display:flex;justify-content:space-between;align-items:center}.summary h2{margin:0}.chips{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}.chips span{background:#18242c;border:1px solid #2c3d47;border-radius:999px;padding:7px 11px;font-size:.82rem}
.output{margin-top:20px}.output textarea{width:100%;box-sizing:border-box;min-height:90px;resize:vertical;background:#070c10;color:#cbd6dc;border:1px solid #2c3c46;border-radius:10px;padding:14px;font:inherit;line-height:1.5}
.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:12px}.primary,.secondary{border-radius:9px;padding:11px 16px;font-weight:800;cursor:pointer}.primary{background:#d7a73d;color:#0c0c0c;border:1px solid #d7a73d}.secondary{background:transparent;color:#dce5e9;border:1px solid #3a4a54}
.tool-footer{max-width:900px;margin:26px auto 0;text-align:center;color:#60717b;font-size:.75rem;line-height:1.55}
.tool-footer strong{display:block;color:#8797a1;margin-bottom:7px}
.tool-footer p{margin:4px 0}
.tool-footer span{display:block;margin-top:8px;color:#52636d}
@media(max-width:820px){.hero,.builder-grid{grid-template-columns:1fr}.hero{align-items:stretch}.buff-page{padding-top:28px}.buff-row{padding:13px 14px}.summary-heading{align-items:flex-start}.actions{flex-direction:column}.actions button{width:100%}}
</style>
