<template>
  <main class="buff-page">
    <!-- HERO -->
    <section class="hero">
      <div>
        <p class="eyebrow">PROJECT RESPAWN · SWG TOOLS</p>

        <h1>SWG Beyond Buff Builder</h1>

        <p class="subtitle">
          Build an Entertainer Inspiration buff, stay within the 20-point
          limit, and copy a request ready for in-game chat.
        </p>
      </div>

      <div class="points-card">
        <div class="points-top">
          <span>BUFF POINTS</span>
          <strong>{{ usedPoints }} / {{ TOTAL_POINTS }}</strong>
        </div>

        <div class="bar">
          <div
            class="bar-fill"
            :style="{
              width: `${Math.min(
                (usedPoints / TOTAL_POINTS) * 100,
                100
              )}%`
            }"
          ></div>
        </div>

        <div class="remaining">
          {{ remainingPoints }} points remaining
        </div>
      </div>
    </section>

    <!-- BUFF BUILDER -->
    <section class="builder-grid">
      <!-- LEFT COLUMN -->
      <div class="builder-column">
        <article
          v-for="category in leftCategories"
          :key="category.id"
          class="panel"
        >
          <div class="panel-heading">
            <h2>{{ category.label }}</h2>

            <span>
              {{ category.items.length }}
              {{ category.items.length === 1 ? 'buff' : 'buffs' }}
            </span>
          </div>

          <div
            v-for="buff in category.items"
            :key="buff.id"
            class="buff-row"
          >
            <div class="buff-info">
              <strong>{{ buff.name }}</strong>

              <small>
                {{ buff.cost }}
                {{ buff.cost === 1 ? 'point' : 'points' }}
                per selection
              </small>
            </div>

            <div
              v-if="buff.max > 1"
              class="controls"
            >
              <button
                type="button"
                @click="decrement(buff.id)"
                :disabled="rank(buff.id) === 0"
                :aria-label="`Decrease ${buff.name}`"
              >
                −
              </button>

              <span class="rank">
                {{ rank(buff.id) }}/{{ buff.max }}
              </span>

              <button
                type="button"
                @click="increment(buff)"
                :disabled="!canIncrement(buff)"
                :aria-label="`Increase ${buff.name}`"
              >
                +
              </button>
            </div>

            <button
              v-else
              type="button"
              class="toggle"
              :class="{ selected: rank(buff.id) === 1 }"
              @click="toggle(buff)"
              :disabled="
                rank(buff.id) === 0 &&
                !canIncrement(buff)
              "
            >
              {{
                rank(buff.id)
                  ? 'ADDED ✓'
                  : `ADD · ${buff.cost}`
              }}
            </button>
          </div>
        </article>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="builder-column">
        <article
          v-for="category in rightCategories"
          :key="category.id"
          class="panel"
        >
          <div class="panel-heading">
            <h2>{{ category.label }}</h2>

            <span>
              {{ category.items.length }}
              {{ category.items.length === 1 ? 'buff' : 'buffs' }}
            </span>
          </div>

          <div
            v-for="buff in category.items"
            :key="buff.id"
            class="buff-row"
          >
            <div class="buff-info">
              <strong>{{ buff.name }}</strong>

              <small>
                {{ buff.cost }}
                {{ buff.cost === 1 ? 'point' : 'points' }}
                per selection
              </small>
            </div>

            <div
              v-if="buff.max > 1"
              class="controls"
            >
              <button
                type="button"
                @click="decrement(buff.id)"
                :disabled="rank(buff.id) === 0"
                :aria-label="`Decrease ${buff.name}`"
              >
                −
              </button>

              <span class="rank">
                {{ rank(buff.id) }}/{{ buff.max }}
              </span>

              <button
                type="button"
                @click="increment(buff)"
                :disabled="!canIncrement(buff)"
                :aria-label="`Increase ${buff.name}`"
              >
                +
              </button>
            </div>

            <button
              v-else
              type="button"
              class="toggle"
              :class="{ selected: rank(buff.id) === 1 }"
              @click="toggle(buff)"
              :disabled="
                rank(buff.id) === 0 &&
                !canIncrement(buff)
              "
            >
              {{
                rank(buff.id)
                  ? 'ADDED ✓'
                  : `ADD · ${buff.cost}`
              }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- SUMMARY -->
    <section class="summary">
      <div class="summary-heading">
        <div>
          <p class="eyebrow">YOUR BUFF</p>

          <h2>
            {{
              selected.length
                ? `${selected.length} selections`
                : 'No buffs selected yet'
            }}
          </h2>
        </div>

        <button
          type="button"
          class="secondary"
          @click="reset"
          :disabled="!selected.length"
        >
          Reset
        </button>
      </div>

      <div
        v-if="selected.length"
        class="chips"
      >
        <span
          v-for="item in selected"
          :key="item.id"
        >
          {{ item.name }}
          {{ rank(item.id) }}/{{ item.max }}
        </span>
      </div>

      <div class="output">
        <textarea
          readonly
          :value="requestText"
          aria-label="Buff request"
        ></textarea>

        <div class="actions">
          <button
            type="button"
            class="secondary"
            @click="copyBuild"
            :disabled="!selected.length"
          >
            {{ buildCopyLabel }}
          </button>

          <button
            type="button"
            class="primary"
            @click="copyRequest"
            :disabled="!selected.length"
          >
            {{ requestCopyLabel }}
          </button>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="tool-footer">
      <strong>
        Project Respawn © 2026 · Unofficial SWG Beyond Community Tool
      </strong>

      <p>
        This is an unofficial community tool for Star Wars Galaxies:
        Beyond and is not affiliated with or endorsed by SWG Beyond,
        Lucasfilm, Disney, or Daybreak Game Company.
      </p>

      <p>
        Star Wars and related properties belong to their respective
        owners. Buff data has been verified in-game by the Project
        Respawn community.
      </p>

      <span>
        SWG Beyond Inspiration data · 20-point maximum
      </span>
    </footer>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import {
  TOTAL_POINTS,
  categories,
  allBuffs
} from './swgBeyondBuffs.js'

/* =========================================================
   SELECTION STATE
   ========================================================= */

const selections = reactive({})

const requestCopyLabel = ref('Copy /tt Request')
const buildCopyLabel = ref('Copy Build')

for (const buff of allBuffs) {
  selections[buff.id] = 0
}

const rank = (id) => selections[id] || 0

/* =========================================================
   CATEGORY LAYOUT
   ========================================================= */

/*
  The builder uses two independent columns.

  Resistances and Trade are deliberately placed together
  in the SECOND / RIGHT column.

  Trade will sit directly underneath Resistances without
  being affected by the height of panels in the left column.
*/

function categoryKey(category) {
  return `${category.id || ''} ${category.label || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function isResistanceCategory(category) {
  return categoryKey(category).includes('resistance')
}

function isTradeCategory(category) {
  return categoryKey(category).includes('trade')
}

/*
  Find Resistances and Trade.
*/

const resistanceCategory = computed(() =>
  categories.find(isResistanceCategory)
)

const tradeCategory = computed(() =>
  categories.find(isTradeCategory)
)

/*
  Everything except Resistances and Trade.
*/

const otherCategories = computed(() =>
  categories.filter(
    category =>
      !isResistanceCategory(category) &&
      !isTradeCategory(category)
  )
)

/*
  FIRST / LEFT COLUMN

  Contains the alternating normal categories.
*/

const leftCategories = computed(() => {
  const left = []

  otherCategories.value.forEach((category, index) => {
    if (index % 2 === 0) {
      left.push(category)
    }
  })

  return left
})

/*
  SECOND / RIGHT COLUMN

  Contains the remaining normal categories followed by:

  1. Resistances
  2. Trade

  Because the right column is an independent vertical stack,
  Trade will appear immediately underneath Resistances.
*/

const rightCategories = computed(() => {
  const right = []

  otherCategories.value.forEach((category, index) => {
    if (index % 2 !== 0) {
      right.push(category)
    }
  })

  if (resistanceCategory.value) {
    right.push(resistanceCategory.value)
  }

  if (tradeCategory.value) {
    right.push(tradeCategory.value)
  }

  return right
})
/* =========================================================
   POINT CALCULATIONS
   ========================================================= */

const usedPoints = computed(() =>
  allBuffs.reduce(
    (total, buff) =>
      total + rank(buff.id) * buff.cost,
    0
  )
)

const remainingPoints = computed(() =>
  Math.max(
    TOTAL_POINTS - usedPoints.value,
    0
  )
)

const selected = computed(() =>
  allBuffs.filter(
    buff => rank(buff.id) > 0
  )
)

/* =========================================================
   BUFF CONTROLS
   ========================================================= */

function canIncrement(buff) {
  return (
    rank(buff.id) < buff.max &&
    usedPoints.value + buff.cost <= TOTAL_POINTS
  )
}

function increment(buff) {
  if (canIncrement(buff)) {
    selections[buff.id]++
  }
}

function decrement(id) {
  if (rank(id) > 0) {
    selections[id]--
  }
}

function toggle(buff) {
  if (rank(buff.id)) {
    selections[buff.id] = 0
    return
  }

  if (canIncrement(buff)) {
    selections[buff.id] = 1
  }
}

function reset() {
  for (const buff of allBuffs) {
    selections[buff.id] = 0
  }
}

/* =========================================================
   OUTPUT
   ========================================================= */

const buildText = computed(() =>
  selected.value
    .map(
      buff =>
        `${buff.name} (${rank(buff.id)}/${buff.max})`
    )
    .join(', ')
)

const requestText = computed(() =>
  selected.value.length
    ? `/tt Could you buff me with ${buildText.value}, please?`
    : 'Select buffs above to create an in-game request.'
)

/* =========================================================
   COPY FUNCTIONS
   ========================================================= */

async function copy(
  text,
  labelRef,
  success,
  defaultLabel
) {
  try {
    await navigator.clipboard.writeText(text)

    labelRef.value = success

    setTimeout(() => {
      labelRef.value = defaultLabel
    }, 1400)
  } catch {
    labelRef.value = 'Copy failed'

    setTimeout(() => {
      labelRef.value = defaultLabel
    }, 1400)
  }
}

function copyRequest() {
  copy(
    requestText.value,
    requestCopyLabel,
    'Copied ✓',
    'Copy /tt Request'
  )
}

function copyBuild() {
  copy(
    `${buildText.value} — ${usedPoints.value}/${TOTAL_POINTS} points`,
    buildCopyLabel,
    'Copied ✓',
    'Copy Build'
  )
}
</script>

<style scoped>
/* =========================================================
   PAGE
   ========================================================= */

.buff-page {
  min-height: 100vh;
  padding: 48px clamp(18px, 4vw, 72px);
  background:
    radial-gradient(
      circle at 80% 0%,
      #1a2630 0,
      transparent 32%
    ),
    #080d12;
  color: #edf3f6;
  font-family: Inter, system-ui, sans-serif;
}

/* =========================================================
   HERO
   ========================================================= */

.hero {
  max-width: 1280px;
  margin: auto;
  display: grid;
  grid-template-columns: 1.5fr 0.7fr;
  gap: 32px;
  align-items: end;
}

.eyebrow {
  color: #d7a73d;
  letter-spacing: 0.15em;
  font-size: 0.76rem;
  font-weight: 800;
  margin: 0 0 8px;
}

h1 {
  font-size: clamp(2.3rem, 5vw, 4.8rem);
  line-height: 0.95;
  margin: 0;
  max-width: 780px;
}

.subtitle {
  color: #9eabb4;
  max-width: 700px;
  line-height: 1.6;
}

/* =========================================================
   SHARED CARDS
   ========================================================= */

.points-card,
.panel,
.summary {
  background: rgba(17, 25, 32, 0.92);
  border: 1px solid #263641;
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
}

/* =========================================================
   POINT COUNTER
   ========================================================= */

.points-card {
  padding: 22px;
}

.points-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: #aeb9c0;
}

.points-top strong {
  color: #fff;
  font-size: 1.5rem;
}

.bar {
  height: 8px;
  background: #27323a;
  border-radius: 10px;
  margin: 16px 0 9px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #d7a73d;
  transition: width 0.2s ease;
}

.remaining {
  font-size: 0.85rem;
  color: #87959f;
}

/* =========================================================
   BUILDER LAYOUT
   ========================================================= */

.builder-grid {
  max-width: 1280px;
  margin: 34px auto;
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

/*
  Important:
  Each side is now its own vertical stack.

  The height of a panel in one column therefore has no
  effect on the position of panels in the other column.
*/

.builder-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.panel {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.panel-heading {
  padding: 18px 20px;
  border-bottom: 1px solid #263641;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-heading h2 {
  font-size: 1rem;
  letter-spacing: 0.08em;
  margin: 0;
}

.panel-heading span {
  font-size: 0.75rem;
  color: #788892;
  white-space: nowrap;
}

/* =========================================================
   BUFF ROWS
   ========================================================= */

.buff-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #1e2b33;
}

.buff-row:last-child {
  border-bottom: 0;
}

.buff-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.buff-info strong {
  line-height: 1.3;
}

.buff-info small {
  color: #71808a;
  line-height: 1.4;
}

/* =========================================================
   CONTROLS
   ========================================================= */

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.controls button,
.toggle {
  border: 1px solid #344650;
  background: #111a20;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.controls button {
  width: 34px;
  height: 34px;
  font-size: 1.2rem;
}

.controls button:not(:disabled):hover,
.toggle:not(:disabled):hover {
  border-color: #607581;
}

.rank {
  min-width: 42px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.toggle {
  min-width: 100px;
  padding: 9px 12px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.toggle.selected {
  border-color: #d7a73d;
  color: #f2c967;
  background: #211c11;
}

button:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

/* =========================================================
   SUMMARY
   ========================================================= */

.summary {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}

.summary-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.summary h2 {
  margin: 0;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}

.chips span {
  background: #18242c;
  border: 1px solid #2c3d47;
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 0.82rem;
}

/* =========================================================
   OUTPUT
   ========================================================= */

.output {
  margin-top: 20px;
}

.output textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 90px;
  resize: vertical;
  background: #070c10;
  color: #cbd6dc;
  border: 1px solid #2c3c46;
  border-radius: 10px;
  padding: 14px;
  font: inherit;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

/* =========================================================
   BUTTONS
   ========================================================= */

.primary,
.secondary {
  border-radius: 9px;
  padding: 11px 16px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.primary {
  background: #d7a73d;
  color: #0c0c0c;
  border: 1px solid #d7a73d;
}

.primary:not(:disabled):hover {
  background: #e4b94f;
  border-color: #e4b94f;
}

.secondary {
  background: transparent;
  color: #dce5e9;
  border: 1px solid #3a4a54;
}

.secondary:not(:disabled):hover {
  border-color: #607581;
  background: #111a20;
}

/* =========================================================
   FOOTER
   ========================================================= */

.tool-footer {
  max-width: 900px;
  margin: 26px auto 0;
  text-align: center;
  color: #60717b;
  font-size: 0.75rem;
  line-height: 1.55;
}

.tool-footer strong {
  display: block;
  color: #8797a1;
  margin-bottom: 7px;
}

.tool-footer p {
  margin: 4px 0;
}

.tool-footer span {
  display: block;
  margin-top: 8px;
  color: #52636d;
}

/* =========================================================
   TABLET / MOBILE
   ========================================================= */

@media (max-width: 820px) {
  .buff-page {
    padding-top: 28px;
  }

  .hero {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .builder-grid {
    grid-template-columns: 1fr;
  }

  .buff-row {
    padding: 13px 14px;
  }

  .summary-heading {
    align-items: flex-start;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }
}

/* =========================================================
   SMALL MOBILE
   ========================================================= */

@media (max-width: 520px) {
  .buff-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero {
    gap: 20px;
  }

  h1 {
    font-size: clamp(2rem, 12vw, 3rem);
  }

  .points-card {
    padding: 18px;
  }

  .panel-heading {
    padding: 16px;
  }

  .buff-row {
    gap: 10px;
  }

  .buff-info small {
    font-size: 0.72rem;
  }

  .controls {
    gap: 6px;
  }

  .controls button {
    width: 32px;
    height: 32px;
  }

  .rank {
    min-width: 36px;
    font-size: 0.85rem;
  }

  .toggle {
    min-width: 88px;
    padding: 8px 9px;
    font-size: 0.68rem;
  }

  .summary {
    padding: 18px;
  }
}
</style>