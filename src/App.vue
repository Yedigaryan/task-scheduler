<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import { useStyles } from './composables/useStyles';

const styles = useStyles();
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: v-bind('styles.colors.gray50');
}

.main-content {
  min-height: 100vh;
}
</style>