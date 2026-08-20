<template>
  <main class="legal-centre">
    <header class="legal-hero">
      <p class="legal-eyebrow">Project Respawn</p>
      <h1>Legal & Privacy Centre</h1>
      <p class="legal-intro">
        Clear information about how Project Respawn uses your data and the rules
        that apply when you use our website, apps, creator tools and services.
      </p>

      <div class="legal-switcher" role="tablist" aria-label="Legal documents">
        <button
          id="privacy-tab"
          type="button"
          role="tab"
          :aria-selected="activeDocument === 'privacy'"
          aria-controls="privacy-panel"
          :class="{ active: activeDocument === 'privacy' }"
          @click="activeDocument = 'privacy'"
        >
          Privacy Policy
        </button>

        <button
          id="terms-tab"
          type="button"
          role="tab"
          :aria-selected="activeDocument === 'terms'"
          aria-controls="terms-panel"
          :class="{ active: activeDocument === 'terms' }"
          @click="activeDocument = 'terms'"
        >
          Terms & Conditions
        </button>
      </div>
    </header>

    <section
      v-if="activeDocument === 'privacy'"
      id="privacy-panel"
      role="tabpanel"
      aria-labelledby="privacy-tab"
    >
      <PrivacyPolicyContent />
    </section>

    <section
      v-else
      id="terms-panel"
      role="tabpanel"
      aria-labelledby="terms-tab"
    >
      <TermsConditionsContent />
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import PrivacyPolicyContent from './PrivacyPolicyContent.vue'
import TermsConditionsContent from './TermsConditionsContent.vue'

const activeDocument = ref('privacy')
</script>

<style>
/* =========================================================
   PROJECT RESPAWN — LEGAL & PRIVACY CENTRE
   ========================================================= */

.legal-centre {
    width: min(1200px, calc(100% - 40px));
    margin: 0 auto;
    padding: 64px 0 100px;
}


/* =========================================================
   HERO
   ========================================================= */

.legal-hero {
    max-width: 900px;
    margin: 0 auto 40px;
    text-align: center;
}

.legal-eyebrow {
    margin: 0 0 12px;

    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;

    opacity: 0.65;
}

.legal-hero h1 {
    margin: 0;

    font-size: clamp(2.4rem, 5vw, 4.5rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
}

.legal-intro {
    max-width: 720px;
    margin: 20px auto 0;

    font-size: 1.08rem;
    line-height: 1.75;

    opacity: 0.78;
}


/* =========================================================
   PRIVACY / TERMS SWITCHER
   ========================================================= */

.legal-switcher {
    display: inline-flex;
    justify-content: center;
    gap: 6px;

    margin-top: 30px;
    padding: 6px;

    border: 1px solid rgba(127, 127, 127, 0.22);
    border-radius: 16px;

    background: rgba(127, 127, 127, 0.06);
}

.legal-switcher button {
    min-width: 150px;

    border: 0;
    border-radius: 11px;

    padding: 12px 20px;

    font: inherit;
    font-weight: 750;

    cursor: pointer;

    color: inherit;
    background: transparent;

    transition:
        transform 0.18s ease,
        background 0.18s ease,
        box-shadow 0.18s ease;
}

.legal-switcher button:hover {
    transform: translateY(-1px);
    background: rgba(127, 127, 127, 0.08);
}

.legal-switcher button.active {
    background: rgba(127, 127, 127, 0.18);

    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.06);
}


/* =========================================================
   OVERVIEW CARDS
   ========================================================= */

.legal-overview-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));

    max-width: 1050px;

    gap: 16px;

    margin: 35px auto 24px;
}

.legal-card {
    padding: 24px 20px;

    text-align: center;

    border: 1px solid rgba(127, 127, 127, 0.18);
    border-radius: 18px;

    background: rgba(127, 127, 127, 0.045);

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;
}

.legal-card:hover {
    transform: translateY(-3px);

    border-color: rgba(127, 127, 127, 0.3);

    box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.06);
}

.legal-card strong {
    display: block;

    margin-bottom: 10px;

    font-size: 1.02rem;
}

.legal-card p {
    margin: 0;

    font-size: 0.94rem;
    line-height: 1.65;

    opacity: 0.76;
}


/* =========================================================
   COMMUNITY PRIVACY MESSAGE
   ========================================================= */

.legal-callout {
    max-width: 900px;

    margin: 26px auto 38px;
    padding: 26px 30px;

    text-align: center;

    border: 1px solid rgba(127, 127, 127, 0.2);
    border-radius: 18px;

    background: rgba(127, 127, 127, 0.045);
}

.legal-callout h2 {
    margin: 0 0 10px;

    font-size: 1.45rem;
}

.legal-callout p {
    max-width: 760px;

    margin: 0 auto;

    line-height: 1.75;

    opacity: 0.82;
}


/* =========================================================
   TOPIC SELECTOR
   ========================================================= */

/*
   This centres the "Which part..." / "What do you want..."
   prompt because it is the paragraph immediately before
   .legal-chips.
*/

p:has(+ .legal-chips) {
    margin-top: 38px;

    text-align: center;

    font-size: 1.05rem;
}

.legal-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    gap: 10px;

    max-width: 950px;

    margin: 18px auto 22px;
}

.legal-chip {
    border: 1px solid rgba(127, 127, 127, 0.24);
    border-radius: 999px;

    padding: 10px 16px;

    font: inherit;
    font-size: 0.92rem;
    font-weight: 700;

    color: inherit;
    background: transparent;

    cursor: pointer;

    transition:
        background 0.18s ease,
        transform 0.18s ease,
        border-color 0.18s ease;
}

.legal-chip:hover {
    transform: translateY(-1px);

    background: rgba(127, 127, 127, 0.08);
}

.legal-chip.active {
    background: rgba(127, 127, 127, 0.17);

    border-color: rgba(127, 127, 127, 0.4);
}


/* =========================================================
   SELECTED TOPIC SUMMARY
   ========================================================= */

.legal-summary {
    max-width: 850px;

    margin: 0 auto 45px;
    padding: 28px 32px;

    text-align: center;

    border: 1px solid rgba(127, 127, 127, 0.2);
    border-radius: 18px;

    background: rgba(127, 127, 127, 0.045);
}

.legal-summary h2 {
    margin: 0 0 10px;

    font-size: 1.4rem;
}

.legal-summary p {
    max-width: 720px;

    margin: 0 auto;

    line-height: 1.75;

    opacity: 0.82;
}

.legal-summary ul {
    display: inline-block;

    margin: 18px auto 0;
    padding-left: 22px;

    text-align: left;
}

.legal-summary li {
    margin: 6px 0;

    line-height: 1.6;
}


/* =========================================================
   FULL LEGAL AREA
   ========================================================= */

.legal-layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 820px);

    justify-content: center;
    align-items: start;

    gap: 28px;

    max-width: 1100px;

    margin: 0 auto;
}


/* =========================================================
   TABLE OF CONTENTS
   ========================================================= */

.legal-toc {
    position: sticky;
    top: 24px;

    padding: 20px;

    border: 1px solid rgba(127, 127, 127, 0.18);
    border-radius: 16px;

    background: rgba(127, 127, 127, 0.035);
}

.legal-toc strong {
    display: block;

    margin-bottom: 12px;

    font-size: 0.9rem;
    letter-spacing: 0.03em;
}

.legal-toc a {
    display: block;

    padding: 6px 0;

    color: inherit;

    text-decoration: none;

    font-size: 0.88rem;
    line-height: 1.35;

    opacity: 0.66;

    transition:
        opacity 0.15s ease,
        transform 0.15s ease;
}

.legal-toc a:hover {
    transform: translateX(2px);

    opacity: 1;
}


/* =========================================================
   LEGAL DOCUMENT
   ========================================================= */

.legal-document {
    width: 100%;

    padding: clamp(28px, 5vw, 50px);

    border: 1px solid rgba(127, 127, 127, 0.18);
    border-radius: 20px;

    background: rgba(127, 127, 127, 0.035);
}


/*
   Main document heading is centred.
*/

.legal-document > h2:first-child {
    margin: 0;

    text-align: center;

    font-size: clamp(1.9rem, 3vw, 2.6rem);
    letter-spacing: -0.02em;
}


/*
   "Last updated" line
*/

.legal-document > .legal-muted {
    margin: 10px 0 40px;

    text-align: center;

    font-size: 0.9rem;

    opacity: 0.6;
}


/*
   Legal sections remain LEFT ALIGNED.

   This is deliberate. Large amounts of centred legal text
   are much harder to read.
*/

.legal-document h3 {
    scroll-margin-top: 30px;

    margin: 44px 0 14px;

    font-size: 1.35rem;
    line-height: 1.3;
}

.legal-document h4 {
    margin: 30px 0 10px;

    font-size: 1.05rem;
}

.legal-document p {
    margin: 0 0 16px;

    line-height: 1.78;

    opacity: 0.88;
}

.legal-document ul {
    margin: 12px 0 22px;

    padding-left: 24px;
}

.legal-document li {
    padding-left: 3px;

    line-height: 1.72;

    opacity: 0.88;
}

.legal-document li + li {
    margin-top: 7px;
}


/* =========================================================
   NOTES / IMPORTANT INFORMATION
   ========================================================= */

.legal-note {
    margin: 22px 0;

    padding: 18px 20px;

    border-left: 4px solid currentColor;
    border-radius: 0 12px 12px 0;

    background: rgba(127, 127, 127, 0.07);

    line-height: 1.7;
}


/* =========================================================
   ACCESSIBILITY
   ========================================================= */

.legal-switcher button:focus-visible,
.legal-chip:focus-visible,
.legal-toc a:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
}


/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 950px) {

    .legal-overview-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .legal-layout {
        grid-template-columns: 1fr;

        max-width: 820px;
    }

    .legal-toc {
        position: static;

        display: flex;
        flex-wrap: wrap;

        justify-content: center;

        gap: 6px 16px;

        text-align: center;
    }

    .legal-toc strong {
        width: 100%;
    }

    .legal-toc a {
        display: inline-block;
    }
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 600px) {

    .legal-centre {
        width: min(100% - 20px, 1200px);

        padding: 35px 0 70px;
    }

    .legal-hero h1 {
        font-size: 2.35rem;
    }

    .legal-overview-grid {
        grid-template-columns: 1fr;
    }

    .legal-switcher {
        display: flex;

        width: 100%;
    }

    .legal-switcher button {
        flex: 1;

        min-width: 0;

        padding: 11px 8px;

        font-size: 0.88rem;
    }

    .legal-callout,
    .legal-summary {
        padding: 22px 18px;
    }

    .legal-document {
        padding: 26px 20px;

        border-radius: 16px;
    }

    .legal-document h3 {
        margin-top: 36px;

        font-size: 1.22rem;
    }

    .legal-toc {
        padding: 18px 14px;
    }
}
</style>
