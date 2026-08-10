<template>
  <div class="feature-teaser-shell" :class="`feature-teaser-shell--${variant}`">
    <article class="feature-teaser" :class="`feature-teaser--${status}`">
      <header class="feature-teaser__header">
        <div class="feature-teaser__heading">
          <span v-if="icon" class="feature-teaser__icon" aria-hidden="true">{{ icon }}</span>
          <div>
            <p v-if="eyebrow" class="feature-teaser__eyebrow">{{ eyebrow }}</p>
            <component :is="headingTag" class="feature-teaser__title">{{ title }}</component>
          </div>
        </div>
        <FeatureStatusBadge v-if="showStatusBadge" :status="status" />
      </header>

      <div class="feature-teaser__preview">
        <slot>
          <p class="feature-teaser__description">{{ description }}</p>
        </slot>
      </div>

      <router-link v-if="ctaLabel && ctaTo" class="feature-teaser__cta" :to="ctaTo">{{ ctaLabel }}</router-link>
      <button v-else-if="ctaLabel" class="feature-teaser__cta" type="button" @click="$emit('cta')">{{ ctaLabel }}</button>
    </article>
  </div>
</template>

<script setup>
import FeatureStatusBadge from '../FeatureStatusBadge/FeatureStatusBadge.vue'

defineEmits(['cta'])
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'coming-soon', validator: value => ['coming-soon', 'preview'].includes(value) },
  icon: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  ctaLabel: { type: String, default: '' },
  ctaTo: { type: [String, Object], default: '' },
  variant: { type: String, default: 'page', validator: value => ['page', 'card'].includes(value) },
  headingTag: { type: String, default: 'h1' },
  showStatusBadge: { type: Boolean, default: true },
})
</script>

<style scoped>
.feature-teaser-shell--page { padding:32px; }
.feature-teaser-shell--page .feature-teaser { max-width:760px; }
.feature-teaser { position:relative; padding:20px; overflow:hidden; border:1px solid rgba(164,139,255,.12); border-radius:20px; color:#f4f4f8; background:linear-gradient(135deg,rgba(15,20,38,.92),rgba(8,12,24,.96)); box-shadow:0 18px 50px rgba(0,0,0,.22); }
.feature-teaser-shell--page .feature-teaser { padding:40px; }
.feature-teaser__header { position:relative; z-index:4; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
.feature-teaser__heading { display:flex; align-items:center; gap:12px; min-width:0; }
.feature-teaser__icon { display:grid; place-items:center; flex:0 0 auto; width:42px; height:42px; border-radius:14px; background:rgba(143,107,255,.14); font-size:1.2rem; }
.feature-teaser__eyebrow { margin:0 0 8px; color:#b8a8ff; font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
.feature-teaser__title { margin:0; color:#fff; font-size:1.2rem; font-weight:800; }
.feature-teaser-shell--page .feature-teaser__title { font-size:clamp(2rem,5vw,3.4rem); }
.feature-teaser__preview { position:relative; z-index:1; min-height:76px; opacity:.42; filter:grayscale(.12); }
.feature-teaser__preview::before { content:""; position:absolute; inset:0; z-index:2; pointer-events:none; background:linear-gradient(135deg,rgba(109,255,139,0),rgba(109,255,139,.05) 35%,rgba(109,255,139,.14) 50%,rgba(109,255,139,.05) 65%,rgba(109,255,139,0)); }
.feature-teaser::after { content:"COMING SOON"; position:absolute; top:62%; left:50%; z-index:3; transform:translate(-50%,-50%) rotate(-24deg); pointer-events:none; white-space:nowrap; color:#6dff8b; font-size:1.05rem; font-weight:900; letter-spacing:.28em; text-transform:uppercase; text-shadow:0 0 6px rgba(109,255,139,.95),0 0 14px rgba(109,255,139,.8),0 0 28px rgba(109,255,139,.55); opacity:.95; }
.feature-teaser--preview::after { content:"PREVIEW"; color:#fde68a; text-shadow:0 0 6px rgba(245,158,11,.8),0 0 16px rgba(245,158,11,.55); }
.feature-teaser__description { margin:0; max-width:60ch; color:#cbd5e1; line-height:1.7; }
.feature-teaser__cta { position:relative; z-index:4; display:inline-flex; margin-top:18px; padding:10px 14px; border:1px solid rgba(255,255,255,.14); border-radius:10px; color:#fff; background:rgba(255,255,255,.06); font:inherit; font-weight:700; text-decoration:none; cursor:pointer; }
.feature-teaser__cta:focus-visible { outline:3px solid rgba(143,107,255,.5); outline-offset:2px; }
@media (max-width:640px) { .feature-teaser-shell--page { padding:14px; }.feature-teaser-shell--page .feature-teaser,.feature-teaser { padding:18px; }.feature-teaser__header { flex-direction:column; }.feature-teaser::after { font-size:.82rem; letter-spacing:.18em; } }
</style>
