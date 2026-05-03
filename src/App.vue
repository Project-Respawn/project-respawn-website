<template>
  <div id="app">
    <Header v-if="!$route.meta.hideLayout" />
    <main>
      <router-view />
    </main>
    <Footer v-if="!$route.meta.hideLayout" />
  </div>
</template>

<script setup>
  import Header from './components/Header/Header.vue'
  import Footer from './components/Footer/Footer.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>