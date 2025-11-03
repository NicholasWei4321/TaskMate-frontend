<template>
  <div id="app">
    <NavBar v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import NavBar from './components/NavBar.vue';

const authStore = useAuthStore();

onMounted(async () => {
  // Try to restore session if token exists
  if (authStore.sessionToken) {
    await authStore.fetchCurrentUser();
  }
});
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--spacing-lg);
}
</style>
