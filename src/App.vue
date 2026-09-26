<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div id="app-shell">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>