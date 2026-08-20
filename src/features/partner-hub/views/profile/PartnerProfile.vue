<script setup>
import { computed, ref } from 'vue';

import PartnerSidebar from '../../components/PartnerSidebar.vue';
import { partner } from '../../data/partnerDemoData.js';

import '../../styles/partner-hub.css';
import '../../styles/partner-profile.css';

// ============================================================
// DEMO STATE
// ============================================================

const selectedPlacement = ref('featured');
const logoPreview = ref(partner.logo);
const fileInput = ref(null);

const brandName = ref(partner.name);
const tagline = ref('Building confidence through gaming');
const website = ref('https://ravens-gaming.com');

const currentPlacement = 'featured';
const protectedCategory = 'Gaming & Community';

// ============================================================
// PLACEMENT OPTIONS
// ============================================================

const placementOptions = [
  {
    id: 'partner',
    label: 'Partner',
  },
  {
    id: 'main',
    label: 'Main Partner',
  },
  {
    id: 'featured',
    label: 'Featured Partner',
  },
];

// ============================================================
// MAIN PARTNER DEMO SLOTS
// ============================================================

const mainPartnerSlots = [
  {
    id: 1,
    category: 'Gaming & Community',
    brand: 'Ravens Community Gaming',
    logo: partner.logo,
    occupied: true,
  },
  {
    id: 2,
    category: 'Fitness & Wellbeing',
    brand: 'Available',
    logo: null,
    occupied: false,
  },
  {
    id: 3,
    category: 'Technology',
    brand: 'Available',
    logo: null,
    occupied: false,
  },
  {
    id: 4,
    category: 'Lifestyle',
    brand: 'Available',
    logo: null,
    occupied: false,
  },
];

// ============================================================
// STANDARD PARTNER CAROUSEL DEMO
// ============================================================

const standardPartners = [
  {
    id: 1,
    name: 'Community Partner',
  },
  {
    id: 2,
    name: 'Fitness Partner',
  },
  {
    id: 3,
    name: brandName,
    isCurrentPartner: true,
  },
  {
    id: 4,
    name: 'Technology Partner',
  },
  {
    id: 5,
    name: 'Lifestyle Partner',
  },
];

// ============================================================
// COMPUTED
// ============================================================

const selectedPlacementLabel = computed(() => {
  return placementOptions.find(
    (option) => option.id === selectedPlacement.value
  )?.label;
});

// ============================================================
// DEMO LOGO UPLOAD
// ============================================================

function openLogoUpload() {
  fileInput.value?.click();
}

function handleLogoUpload(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  logoPreview.value = URL.createObjectURL(file);
}
</script>

<template>
  <div class="partner-hub">

    <!-- ======================================================
         SHARED PARTNER HUB SIDEBAR
         ====================================================== -->

    <PartnerSidebar />

    <!-- ======================================================
         BRAND & PLACEMENT PAGE
         ====================================================== -->

    <main class="partner-profile-page">

      <!-- ====================================================
           PAGE HEADER
           ==================================================== -->

      <header class="partner-profile-header">

        <div>
          <span class="partner-profile-eyebrow">
            PARTNER HUB
          </span>

          <h1>
            Brand &amp; Placement
          </h1>

          <p>
            Manage your brand assets and preview exactly how your
            organisation can appear across Project Respawn.
          </p>
        </div>

        <RouterLink
          :to="partner.publicProfileUrl"
          class="partner-outline-button"
        >
          View public profile ↗
        </RouterLink>

      </header>


      <!-- ====================================================
           MAIN PAGE GRID
           ==================================================== -->

      <div class="partner-profile-grid">

        <!-- ==================================================
             LEFT COLUMN
             ================================================== -->

        <div class="partner-profile-left">

          <!-- ================================================
               SECTION 1 — YOUR BRAND
               ================================================ -->

          <section class="partner-profile-panel">

            <div class="partner-profile-panel-header">
              <div>
                <span class="partner-profile-step">
                  1. YOUR BRAND
                </span>

                <h2>
                  Brand Assets
                </h2>
              </div>
            </div>

            <div class="partner-brand-editor">

              <!-- Logo -->

              <div class="partner-profile-logo-area">

                <div class="partner-profile-logo-preview">
                  <img
                    :src="logoPreview"
                    :alt="`${brandName} logo`"
                  />
                </div>

                <input
                  ref="fileInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  class="partner-hidden-file-input"
                  @change="handleLogoUpload"
                />

                <button
                  type="button"
                  class="partner-profile-change-logo"
                  @click="openLogoUpload"
                >
                  Change logo
                </button>

                <span class="partner-profile-logo-status">
                  ● Logo ready
                </span>

              </div>

              <!-- Fields -->

              <div class="partner-profile-fields">

                <label>
                  <span>Brand name</span>

                  <input
                    v-model="brandName"
                    type="text"
                  />
                </label>

                <label>
                  <span>Tagline</span>

                  <input
                    v-model="tagline"
                    type="text"
                    maxlength="80"
                  />
                </label>

                <label>
                  <span>Website</span>

                  <input
                    v-model="website"
                    type="url"
                  />
                </label>

              </div>

            </div>

          </section>


          <!-- ================================================
               SECTION 2 — CURRENT PLACEMENT
               ================================================ -->

          <section class="partner-profile-panel">

            <div class="partner-profile-panel-header">
              <div>
                <span class="partner-profile-step">
                  2. YOUR PLACEMENT
                </span>

                <h2>
                  Current Partnership
                </h2>
              </div>
            </div>

            <div class="partner-current-placement">

              <div class="partner-current-placement-top">

                <span class="partner-current-placement-badge">
                  FEATURED PARTNER
                </span>

                <span class="partner-current-placement-active">
                  ● Active
                </span>

              </div>

              <div class="partner-current-category">

                <span>
                  Protected category
                </span>

                <strong>
                  {{ protectedCategory }}
                </strong>

                <small>
                  ✓ Category protected
                </small>

              </div>

              <div class="partner-current-placement-details">

                <div>
                  <span>Active until</span>
                  <strong>30 Nov 2026</strong>
                </div>

                <div>
                  <span>Billing</span>
                  <strong>Monthly</strong>
                </div>

              </div>

              <p class="partner-launch-pricing-note">
                Launch pricing is currently active. Partner placement
                pricing and availability may change as the programme
                develops.
              </p>

            </div>

          </section>

        </div>


        <!-- ==================================================
             RIGHT COLUMN
             ================================================== -->

        <section class="partner-placement-preview-panel">

          <!-- ================================================
               SECTION 3 — PREVIEW SELECTOR
               ================================================ -->

          <div class="partner-placement-preview-header">

            <div>
              <span class="partner-profile-step">
                3. PREVIEW YOUR PLACEMENT
              </span>

              <h2>
                See how your brand appears
              </h2>
            </div>

            <span class="partner-preview-label">
              LIVE DEMO
            </span>

          </div>


          <!-- Placement Tabs -->

          <div
            class="partner-placement-tabs"
            role="tablist"
            aria-label="Preview partner placement"
          >

            <button
              v-for="option in placementOptions"
              :key="option.id"
              type="button"
              class="partner-placement-tab"
              :class="{
                'partner-placement-tab-active':
                  selectedPlacement === option.id,
              }"
              @click="selectedPlacement = option.id"
            >
              {{ option.label }}
            </button>

          </div>


          <!-- ================================================
               STANDARD PARTNER PREVIEW
               ================================================ -->

          <div
            v-if="selectedPlacement === 'partner'"
            class="partner-placement-preview-content"
          >

            <div class="partner-preview-title-row">
              <div>
                <span>PARTNER CAROUSEL</span>

                <strong>
                  Standard Partner Preview
                </strong>
              </div>

              <span class="partner-preview-availability">
                Standard placement
              </span>
            </div>

            <div class="partner-standard-preview">

              <button
                type="button"
                class="partner-carousel-arrow"
                aria-label="Previous partners"
              >
                ‹
              </button>

              <div class="partner-standard-carousel">

                <div
                  v-for="item in standardPartners"
                  :key="item.id"
                  class="partner-standard-logo-card"
                  :class="{
                    'partner-standard-logo-current':
                      item.isCurrentPartner,
                  }"
                >

                  <template v-if="item.isCurrentPartner">
                    <img
                      :src="logoPreview"
                      :alt="brandName"
                    />

                    <span>
                      {{ brandName }}
                    </span>
                  </template>

                  <template v-else>
                    <div class="partner-demo-logo-placeholder">
                      {{ item.name.charAt(0) }}
                    </div>

                    <span>
                      {{ item.name }}
                    </span>
                  </template>

                </div>

              </div>

              <button
                type="button"
                class="partner-carousel-arrow"
                aria-label="Next partners"
              >
                ›
              </button>

            </div>

            <p class="partner-preview-description">
              Standard partners appear in the scrolling Project Respawn
              partner carousel alongside other approved brands.
            </p>

          </div>


          <!-- ================================================
               MAIN PARTNER PREVIEW
               ================================================ -->

          <div
            v-else-if="selectedPlacement === 'main'"
            class="partner-placement-preview-content"
          >

            <div class="partner-preview-title-row">

              <div>
                <span>MAIN PARTNERS</span>

                <strong>
                  Premium Vertical Placement
                </strong>
              </div>

              <span class="partner-preview-availability">
                4 positions
              </span>

            </div>


            <div class="partner-main-preview">

              <article
                v-for="slot in mainPartnerSlots"
                :key="slot.id"
                class="partner-main-slot"
                :class="{
                  'partner-main-slot-current':
                    slot.category === protectedCategory,
                  'partner-main-slot-available':
                    !slot.occupied,
                }"
              >

                <div class="partner-main-slot-logo">

                  <img
                    v-if="slot.category === protectedCategory"
                    :src="logoPreview"
                    :alt="brandName"
                  />

                  <span v-else>
                    {{ slot.occupied ? 'LOGO' : '+' }}
                  </span>

                </div>

                <div class="partner-main-slot-copy">

                  <span>
                    {{ slot.category }}
                  </span>

                  <strong>
                    {{
                      slot.category === protectedCategory
                        ? brandName
                        : slot.brand
                    }}
                  </strong>

                </div>

                <span
                  v-if="slot.category === protectedCategory"
                  class="partner-category-protected"
                >
                  Category protected
                </span>

                <span
                  v-else-if="!slot.occupied"
                  class="partner-slot-available"
                >
                  Available
                </span>

              </article>

            </div>


            <div class="partner-exclusivity-message">

              <span aria-hidden="true">
                ◆
              </span>

              <div>
                <strong>
                  Category exclusivity
                </strong>

                <p>
                  Only one Main Partner from each protected commercial
                  category can hold a Main Partner position at a time.
                </p>
              </div>

            </div>

          </div>


          <!-- ================================================
               FEATURED PARTNER PREVIEW
               ================================================ -->

          <div
            v-else
            class="partner-placement-preview-content"
          >

            <div class="partner-preview-title-row">

              <div>
                <span>FEATURED PARTNER</span>

                <strong>
                  Premium Featured Placement
                </strong>
              </div>

              <span class="partner-featured-preview-badge">
                FEATURED
              </span>

            </div>


            <div class="partner-featured-preview">

              <div class="partner-featured-preview-glow" />

              <div class="partner-featured-preview-logo">
                <img
                  :src="logoPreview"
                  :alt="brandName"
                />
              </div>

              <div class="partner-featured-preview-copy">

                <span class="partner-featured-category">
                  {{ protectedCategory }}
                </span>

                <h3>
                  {{ brandName }}
                </h3>

                <p>
                  {{ tagline }}
                </p>

                <button
                  type="button"
                  class="partner-featured-preview-button"
                >
                  Learn More
                </button>

              </div>

              <div class="partner-featured-exclusive">

                <span>
                  EXCLUSIVE CATEGORY
                </span>

                <strong>
                  {{ protectedCategory }}
                </strong>

              </div>

            </div>


            <div class="partner-featured-preview-stats">

              <div>
                <strong>14,200</strong>
                <span>Impressions</span>
              </div>

              <div>
                <strong>1,120</strong>
                <span>Profile Visits</span>
              </div>

              <div>
                <strong>7.9%</strong>
                <span>Click Rate</span>
              </div>

            </div>


            <div class="partner-exclusivity-message">

              <span aria-hidden="true">
                ◆
              </span>

              <div>
                <strong>
                  Featured category protection
                </strong>

                <p>
                  A competing brand cannot hold the Featured Partner
                  position within your protected commercial category
                  while your placement is active.
                </p>
              </div>

            </div>

          </div>


          <!-- ================================================
               PREVIEW FOOTER
               ================================================ -->

          <footer class="partner-preview-footer">

            <div>
              <span>
                Previewing
              </span>

              <strong>
                {{ selectedPlacementLabel }}
              </strong>
            </div>

            <button
              type="button"
              class="partner-preview-options-button"
            >
              View pricing &amp; availability
            </button>

          </footer>

        </section>

      </div>

    </main>

  </div>
</template>