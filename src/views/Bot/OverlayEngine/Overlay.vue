<template>
  <div class="overlay">

    <div
      v-if="showDebug"
      class="debug-pill"
      :class="{ online: socketConnected, offline: !socketConnected }"
    >
      {{ socketConnected ? 'Overlay Connected' : 'Overlay Disconnected' }}
      <span v-if="broadcasterId">• {{ broadcasterId }}</span>
    </div>

    <transition name="alert">
      <AlertCard
        v-if="currentAlert"
        :alert="currentAlert"
      />
    </transition>

  </div>
</template>

<script src="./Overlay.js"></script>

<style scoped src="./Overlay.css"></style>