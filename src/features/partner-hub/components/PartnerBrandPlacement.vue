<script setup>
import { ref } from 'vue';

// ============================================================
// PROPS
// ============================================================

const props = defineProps({
  partner: {
    type: Object,
    required: true,
  },
});

// ============================================================
// DEMO BRAND STATE
// ============================================================

const logoPreview = ref(props.partner.logo);
const fileInput = ref(null);

// ============================================================
// LOGO ACTIONS
// ============================================================

function openLogoUpload() {
  fileInput.value?.click();
}

function handleLogoUpload(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  // Demo-only local preview.
  // Backend/storage upload will be implemented later.
  logoPreview.value = URL.createObjectURL(file);
}
</script>

<template>
  <section class="partner-brand-placement">

    <!-- ======================================================
         PAGE HEADER
         ====================================================== -->

    <header class="partner-placement-page-header">

      <div>
        <span class="partner-placement-eyebrow">
          PARTNER HUB
        </span>

        <h1>
          Brand &amp; Placement
        </h1>

        <p>
          Manage your brand assets and preview how your brand
          appears across Project Respawn.
        </p>
      </div>

      <div class="partner-placement-status">
        <span class="partner-placement-status-label">
          Current placement
        </span>

        <strong>
          {{ partner.type }}
        </strong>

        <span class="partner-placement-active">
          ● Active
        </span>
      </div>

    </header>


    <!-- ======================================================
         BRAND ASSETS
         ====================================================== -->

    <div class="partner-brand-assets-panel">

      <div class="partner-brand-assets-header">

        <div>
          <span class="partner-section-eyebrow">
            YOUR BRAND
          </span>

          <h2>
            Brand Assets
          </h2>

          <p>
            This logo will be used across your Project Respawn
            partner placements.
          </p>
        </div>

        <span class="partner-demo-badge">
          Demo
        </span>

      </div>


      <!-- ====================================================
           LOGO MANAGEMENT
           ==================================================== -->

      <div class="partner-brand-assets-content">

        <div class="partner-logo-management">

          <span class="partner-field-label">
            Partner logo
          </span>

          <div class="partner-logo-upload-row">

            <div class="partner-logo-preview">

              <img
                v-if="logoPreview"
                :src="logoPreview"
                :alt="`${partner.name} logo`"
              />

              <span v-else>
                No logo
              </span>

            </div>


            <div class="partner-logo-upload-actions">

              <strong>
                {{ partner.name }}
              </strong>

              <p>
                Upload a transparent PNG or SVG for the best
                placement results.
              </p>

              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                class="partner-hidden-file-input"
                @change="handleLogoUpload"
              />

              <button
                type="button"
                class="partner-upload-button"
                @click="openLogoUpload"
              >
                Change logo
              </button>

            </div>

          </div>

        </div>


        <!-- ==================================================
             BRAND INFORMATION
             ================================================== -->

        <div class="partner-brand-information">

          <div class="partner-brand-field">

            <label for="partner-brand-name">
              Brand name
            </label>

            <input
              id="partner-brand-name"
              type="text"
              :value="partner.name"
              readonly
            />

          </div>


          <div class="partner-brand-field">

            <label for="partner-brand-tagline">
              Brand tagline
            </label>

            <input
              id="partner-brand-tagline"
              type="text"
              value="Building confidence through gaming"
              maxlength="80"
            />

            <small>
              Used on eligible featured placements.
            </small>

          </div>


          <div class="partner-brand-field">

            <label for="partner-brand-website">
              Website
            </label>

            <input
              id="partner-brand-website"
              type="url"
              placeholder="https://yourbrand.com"
            />

          </div>

        </div>

      </div>


      <!-- ====================================================
           INFO MESSAGE
           ==================================================== -->

      <div class="partner-brand-assets-note">

        <span aria-hidden="true">
          ✦
        </span>

        <p>
          Changes made here will be reflected in your placement
          previews below. Publishing and permanent asset storage
          will be added when the Partner Hub backend is connected.
        </p>

      </div>

    </div>

  </section>
</template>