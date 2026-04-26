<template>
  
  <section class="container">
    <div class="col-md-12 d-flex justify-content-center my-4">
      <div class="privacy-policy-toolbar">
        <button type="button" class="btn btn-secondary" @click="tab = 'privacy'">Privacy Policy</button>
        <button type="button" class="btn btn-secondary" @click="tab = 'terms'">Terms of Use</button>
      </div>
    </div>
  </section>

  <div class="privacy-container mx-auto">
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

<style scoped src="./PrivacyPolicy.css"></style>
