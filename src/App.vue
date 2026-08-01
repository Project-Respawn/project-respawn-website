<template>
  <div id="app">
    <Header v-if="!hidePublicLayout" />
    <div>
      <main>
        <router-view />
      </main>
    </div>
    <Footer v-if="!hidePublicLayout" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import Header from './components/Header/Header.vue'
  import Footer from './components/Footer/Footer.vue'

  const route = useRoute()

  const hidePublicLayout = computed(() => {
    if (route.path.startsWith('/dashboard')) {
      return true
    }

    return Boolean(route.meta?.hideLayout)
  })
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  width: 100%;
}
</style>