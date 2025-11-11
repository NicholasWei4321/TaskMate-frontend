// External Assignment Sync API service
import apiClient from './client';

export const syncAPI = {
  async connectSource(owner, sourceType, sourceName, details) {
    const response = await apiClient.post('/ExternalAssignmentSync/connectSource', {
      owner,
      sourceType,
      sourceName,
      details,
    });
    return response.data;
  },

  async disconnectSource(sourceAccount) {
    const response = await apiClient.post('/ExternalAssignmentSync/disconnectSource', {
      sourceAccount,
    });
    return response.data;
  },

  async pollExternalSource(sourceAccount) {
    const response = await apiClient.post('/ExternalAssignmentSync/pollExternalSource', {
      sourceAccount,
    });
    return response.data;
  },

  async identifyChanges(sourceAccount, rawExternalAssignments) {
    const response = await apiClient.post('/ExternalAssignmentSync/identifyChanges', {
      sourceAccount,
      rawExternalAssignments,
    });
    return response.data;
  },

  async recordInternalSync(sourceAccount, externalId, internalId, externalModificationTimestamp) {
    const response = await apiClient.post('/ExternalAssignmentSync/recordInternalSync', {
      sourceAccount,
      externalId,
      internalId,
      externalModificationTimestamp,
    });
    return response.data;
  },

  async getSourcesForUser(user) {
    const response = await apiClient.post('/ExternalAssignmentSync/getSourcesForUser', {
      user,
    });
    return response.data;
  },

  async getMappedInternalId(externalId, sourceAccount) {
    const response = await apiClient.post('/ExternalAssignmentSync/getMappedInternalId', {
      externalId,
      sourceAccount,
    });
    return response.data;
  },

  async getAssignmentsForSource(sourceAccount) {
    const response = await apiClient.post('/ExternalAssignmentSync/getAssignmentsForSource', {
      sourceAccount,
    });
    return response.data;
  },
};
