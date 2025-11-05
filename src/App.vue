<template>
  <div id="app">
    <NavBar v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useSyncStore } from './stores/sync';
import NavBar from './components/NavBar.vue';

const router = useRouter();
const authStore = useAuthStore();
const syncStore = useSyncStore();

const transitionName = ref('slide-left');

// Define page order for determining slide direction
const pageOrder = {
  '/dashboard': 0,
  '/tasks': 1,
  '/lists': 2,
  '/sync': 3,
};

// Watch for route changes to determine transition direction
watch(
  () => router.currentRoute.value.path,
  (to, from) => {
    const toIndex = pageOrder[to] ?? 0;
    const fromIndex = pageOrder[from] ?? 0;

    // Determine slide direction based on page order
    transitionName.value = toIndex > fromIndex ? 'slide-left' : 'slide-right';
  }
);

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
  position: relative;
  overflow: hidden;
}

/* Slide Left Transition (moving forward) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Slide Right Transition (moving backward) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
