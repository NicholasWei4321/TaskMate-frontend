<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <div class="navbar-brand">
        <router-link to="/dashboard" class="brand-link">
          <span class="brand-icon">✓</span>
          <span class="brand-name">TaskMate</span>
        </router-link>
      </div>

      <div class="navbar-menu">
        <router-link to="/dashboard" class="nav-link" active-class="active">
          Dashboard
        </router-link>
        <router-link to="/tasks" class="nav-link" active-class="active">
          Tasks
        </router-link>
        <router-link to="/lists" class="nav-link" active-class="active">
          To-do Lists
        </router-link>
        <router-link to="/sync" class="nav-link" active-class="active">
          Sync
        </router-link>
      </div>

      <div class="navbar-actions">
        <button @click="handleLogout" class="btn btn-outline btn-sm">
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background-color: var(--color-white);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-decoration: none;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: var(--color-primary);
  color: var(--color-white);
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
}

.brand-name {
  color: var(--color-text-primary);
}

.navbar-menu {
  display: flex;
  gap: var(--spacing-md);
}

.nav-link {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-secondary);
  background-color: var(--color-secondary-light);
}

.nav-link.active {
  color: var(--feldgrau);
  background-color: var(--color-secondary-light);
  font-weight: var(--font-weight-semibold);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .navbar-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .navbar-menu {
    width: 100%;
    justify-content: center;
  }
}
</style>
