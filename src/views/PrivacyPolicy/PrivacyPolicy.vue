<template>
  <div class="privacy-container mx-auto">
    <div class="tabs">
      <button @click="tab = 'privacy'">Privacy Policy</button>
      <button @click="tab = 'terms'">Terms of Use</button>
    </div>

    <PrivacyPolicy v-if="tab === 'privacy'" />
    <TermsOfUse v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PrivacyPolicy from './MainPrivacyPolicy.vue'
import TermsOfUse from './termsofuse.vue'

const tab = ref('privacy')
</script>
