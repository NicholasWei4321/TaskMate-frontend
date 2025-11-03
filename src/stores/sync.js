// External Assignment Sync store
import { defineStore } from 'pinia';
import { syncAPI } from '../api/sync';
import { useAuthStore } from './auth';
import { useTasksStore } from './tasks';

export const useSyncStore = defineStore('sync', {
  state: () => ({
    sources: [],
    syncing: false,
    loading: false,
    error: null,
  }),

  actions: {
    async connectSource(sourceType, sourceName, details) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await syncAPI.connectSource(
          authStore.user,
          sourceType,
          sourceName,
          details
        );
        if (result.error) {
          this.error = result.error;
          return null;
        }
        await this.fetchSources();
        return result.sourceAccount;
      } catch (error) {
        this.error = error.message || 'Failed to connect source';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async disconnectSource(sourceAccountId) {
      this.loading = true;
      this.error = null;
      try {
        const result = await syncAPI.disconnectSource(sourceAccountId);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        await this.fetchSources();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to disconnect source';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async syncSource(sourceAccountId) {
      this.syncing = true;
      this.error = null;
      const authStore = useAuthStore();
      const tasksStore = useTasksStore();

      try {
        // Poll external source for assignments
        const pollResult = await syncAPI.pollExternalSource(sourceAccountId);
        if (pollResult.error) {
          this.error = pollResult.error;
          return false;
        }

        const rawAssignments = pollResult.rawExternalAssignments || [];

        // Identify changes
        const changesResult = await syncAPI.identifyChanges(
          sourceAccountId,
          rawAssignments
        );
        if (changesResult.error) {
          this.error = changesResult.error;
          return false;
        }

        const assignmentsToProcess = changesResult.assignmentsToProcess || [];

        // Process each assignment
        for (const assignment of assignmentsToProcess) {
          if (assignment.existingInternalId) {
            // Update existing task
            await tasksStore.updateTask(
              assignment.existingInternalId,
              assignment.details.name,
              assignment.details.description,
              assignment.details.dueDate
            );
          } else {
            // Create new task
            const newTask = await tasksStore.createTask(
              assignment.details.name,
              assignment.details.description || '',
              assignment.details.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            if (newTask) {
              // Record the sync
              await syncAPI.recordInternalSync(
                sourceAccountId,
                assignment.externalId,
                newTask._id,
                assignment.externalModificationTimestamp
              );
            }
          }
        }

        await this.fetchSources();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to sync source';
        return false;
      } finally {
        this.syncing = false;
      }
    },

    async fetchSources() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await syncAPI.getSourcesForUser(authStore.user);
        if (result.error) {
          this.error = result.error;
          this.sources = [];
        } else {
          this.sources = result.sources || [];
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch sources';
        this.sources = [];
      } finally {
        this.loading = false;
      }
    },

    async getAssignmentsForSource(sourceAccountId) {
      try {
        const result = await syncAPI.getAssignmentsForSource(sourceAccountId);
        return result.error ? [] : result.assignments || [];
      } catch (error) {
        console.error('Get assignments error:', error);
        return [];
      }
    },
  },
});
