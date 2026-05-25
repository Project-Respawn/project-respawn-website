<template>
  <div id="app">
    <Header v-if="!$route.meta.hideLayout" />
    <div class="app-content">
      <BotSidebar v-if="$route.meta.showBotSidebar" />
      <main>
        <router-view />
      </main>
    </div>
    <Footer v-if="!$route.meta.hideLayout" />
  </div>
</template>

<script setup>
  import Header from './components/Header/Header.vue'
  import Footer from './components/Footer/Footer.vue'
  import BotSidebar from './components/BotSidebar/BotSidebar.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  display: flex;
  flex: 1;
}

main {
  flex: 1;
  width: 100%;
}
</style>