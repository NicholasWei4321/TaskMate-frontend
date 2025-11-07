// Authentication store
import { defineStore } from 'pinia';
import { authAPI } from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    sessionToken: localStorage.getItem('sessionToken') || null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.sessionToken,
  },

  actions: {
    async register(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const result = await authAPI.register(username, password);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        // After successful registration, log in
        return await this.login(username, password);
      } catch (error) {
        this.error = error.message || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const result = await authAPI.login(username, password);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        this.sessionToken = result.sessionToken;
        localStorage.setItem('sessionToken', result.sessionToken);
        await this.fetchCurrentUser();
        return true;
      } catch (error) {
        this.error = error.message || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        if (this.sessionToken) {
          await authAPI.logout(this.sessionToken);
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.sessionToken = null;
        this.user = null;
        localStorage.removeItem('sessionToken');
      }
    },

    async fetchCurrentUser() {
      if (!this.sessionToken) return;
      try {
        const result = await authAPI.getCurrentUser(this.sessionToken);
        if (result.error) {
          this.logout();
        } else {
          this.user = result.user;
        }
      } catch (error) {
        console.error('Fetch user error:', error);
        this.logout();
      }
    },

    clearError() {
      this.error = null;
    },

    async storeCredential(credentialType, credentialValue) {
      try {
        const result = await authAPI.storeCredential(
          this.sessionToken,
          credentialType,
          credentialValue
        );
        return !result.error;
      } catch (error) {
        console.error('Store credential error:', error);
        return false;
      }
    },

    async retrieveCredential(credentialType) {
      try {
        const result = await authAPI.retrieveCredential(
          this.sessionToken,
          credentialType
        );
        return result.error ? null : result.credentialValue;
      } catch (error) {
        console.error('Retrieve credential error:', error);
        return null;
      }
    },

    async getCredentialTypes() {
      try {
        const result = await authAPI.getCredentialTypes(this.sessionToken);
        return result.error ? [] : result.types;
      } catch (error) {
        console.error('Get credential types error:', error);
        return [];
      }
    },

    async updateCredential(credentialType, newCredentialValue) {
      try {
        const result = await authAPI.updateCredential(
          this.sessionToken,
          credentialType,
          newCredentialValue
        );
        return !result.error;
      } catch (error) {
        console.error('Update credential error:', error);
        return false;
      }
    },

    async deleteCredential(credentialType) {
      try {
        const result = await authAPI.deleteCredential(
          this.sessionToken,
          credentialType
        );
        return !result.error;
      } catch (error) {
        console.error('Delete credential error:', error);
        return false;
      }
    },
  },
});
