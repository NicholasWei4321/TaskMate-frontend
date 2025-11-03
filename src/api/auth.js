// Authentication API service
import apiClient from './client';

export const authAPI = {
  async register(username, password) {
    const response = await apiClient.post('/UserAuthentication/register', {
      username,
      password,
    });
    return response.data;
  },

  async login(username, password) {
    const response = await apiClient.post('/UserAuthentication/login', {
      username,
      password,
    });
    return response.data;
  },

  async logout(sessionToken) {
    const response = await apiClient.post('/UserAuthentication/logout', {
      sessionToken,
    });
    return response.data;
  },

  async getCurrentUser(sessionToken) {
    const response = await apiClient.post('/UserAuthentication/getCurrentUser', {
      sessionToken,
    });
    return response.data;
  },

  async storeCredential(sessionToken, credentialType, credentialValue) {
    const response = await apiClient.post('/UserAuthentication/storeCredential', {
      sessionToken,
      credentialType,
      credentialValue,
    });
    return response.data;
  },

  async retrieveCredential(sessionToken, credentialType) {
    const response = await apiClient.post('/UserAuthentication/retrieveCredential', {
      sessionToken,
      credentialType,
    });
    return response.data;
  },

  async getCredentialTypes(sessionToken) {
    const response = await apiClient.post('/UserAuthentication/getCredentialTypes', {
      sessionToken,
    });
    return response.data;
  },

  async updateCredential(sessionToken, credentialType, newCredentialValue) {
    const response = await apiClient.post('/UserAuthentication/updateCredential', {
      sessionToken,
      credentialType,
      newCredentialValue,
    });
    return response.data;
  },

  async deleteCredential(sessionToken, credentialType) {
    const response = await apiClient.post('/UserAuthentication/deleteCredential', {
      sessionToken,
      credentialType,
    });
    return response.data;
  },
};
