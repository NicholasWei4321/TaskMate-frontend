<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="brand-icon-large">✓</div>
          <h1>TaskMate</h1>
          <p class="text-muted">AI-Enhanced Task Management</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              required
              :disabled="authStore.loading"
            />
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
            <span v-else>Login</span>
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-muted">
            Don't have an account?
            <router-link to="/register" class="link-primary">Register</router-link>
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

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');

onMounted(() => {
  authStore.clearError();
});

const handleLogin = async () => {
  const success = await authStore.login(username.value, password.value);
  if (success) {
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
