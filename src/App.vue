<template>
  <div id="app">
    <NavBar v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from './stores/auth';
import { useSyncStore } from './stores/sync';
import NavBar from './components/NavBar.vue';

const authStore = useAuthStore();
const syncStore = useSyncStore();

onMounted(async () => {
  // Try to restore session if token exists
  if (authStore.sessionToken) {
    await authStore.fetchCurrentUser();

    // If user is authenticated, initialize auto-sync
    if (authStore.isAuthenticated) {
      // Fetch sources first
      await syncStore.fetchSources();

      // Sync all sources on app load
      if (syncStore.sources.length > 0) {
        syncStore.syncAllSources();
      }

      // Start hourly auto-sync
      syncStore.startAutoSync();
    }
  }
});

onBeforeUnmount(() => {
  // Clean up auto-sync interval when app unmounts
  syncStore.stopAutoSync();
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
