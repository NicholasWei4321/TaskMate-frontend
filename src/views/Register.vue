<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="brand-icon-large">✓</div>
          <h1>Create Account</h1>
          <p class="text-muted">Join TaskMate to get started</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Choose a username"
              required
              :disabled="authStore.loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Choose a password (min 6 characters)"
              required
              :disabled="authStore.loading"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              :disabled="authStore.loading"
            />
          </div>

          <div v-if="localError" class="alert alert-error">
            {{ localError }}
          </div>

          <div v-if="authStore.error" class="alert alert-error">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading" class="loading"></span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-muted">
            Already have an account?
            <router-link to="/login" class="link-primary">Login</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useListsStore } from '../stores/lists';

const router = useRouter();
const authStore = useAuthStore();
const listsStore = useListsStore();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const localError = ref('');

onMounted(() => {
  authStore.clearError();
  localError.value = '';
});

const createDefaultLists = async () => {
  const now = new Date();

  // Daily To-dos: Today from 00:00 to 23:59
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  await listsStore.createList(
    'Daily To-dos',
    todayStart.toISOString(),
    todayEnd.toISOString(),
    true, // auto-clear completed
    'daily'
  );

  // Weekly To-dos: Current week (Monday to Sunday)
  const weekStart = new Date(now);
  const dayOfWeek = weekStart.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday
  weekEnd.setHours(23, 59, 59, 999);

  await listsStore.createList(
    'Weekly To-dos',
    weekStart.toISOString(),
    weekEnd.toISOString(),
    true, // auto-clear completed
    'weekly'
  );

  // Monthly To-dos: Current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
  monthEnd.setHours(23, 59, 59, 999);

  await listsStore.createList(
    'Monthly To-dos',
    monthStart.toISOString(),
    monthEnd.toISOString(),
    true, // auto-clear completed
    'monthly'
  );
};

const handleRegister = async () => {
  localError.value = '';

  if (password.value.length < 6) {
    localError.value = 'Password must be at least 6 characters long';
    return;
  }

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match';
    return;
  }

  const success = await authStore.register(username.value, password.value);
  if (success) {
    // Create default lists for new user
    await createDefaultLists();
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-lighter) 0%, var(--color-secondary-light) 100%);
  padding: var(--spacing-md);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  box-shadow: var(--shadow-xl);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.brand-icon-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: var(--color-primary);
  color: var(--color-white);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-md);
}

.auth-header h1 {
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.auth-footer {
  margin-top: var(--spacing-lg);
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.link-primary {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}
</style>
