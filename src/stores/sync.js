// External Assignment Sync store
import { defineStore } from 'pinia';
import { syncAPI } from '../api/sync';
import { useAuthStore } from './auth';
import { useTasksStore } from './tasks';
import { useListsStore } from './lists';

export const useSyncStore = defineStore('sync', {
  state: () => ({
    sources: [],
    syncingSourceId: null, // Track which source is currently syncing (null if none)
    loading: false,
    error: null,
    autoSyncInterval: null,
  }),

  getters: {
    // Computed getter for backwards compatibility
    syncing: (state) => state.syncingSourceId !== null,
    syncingSourceName: (state) => {
      if (!state.syncingSourceId) return null;
      const source = state.sources.find(s => s._id === state.syncingSourceId);
      return source?.sourceName || null;
    },
  },

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

        // Sync immediately after connecting a new source
        if (result.sourceAccount) {
          await this.syncSource(result.sourceAccount);
        }

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
      this.syncingSourceId = sourceAccountId;
      this.error = null;
      const authStore = useAuthStore();
      const tasksStore = useTasksStore();
      const listsStore = useListsStore();

      try {
        // Fetch lists to ensure we have the latest default lists
        await listsStore.fetchLists();

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
            // Update existing task - pass undefined for parameters we don't want to update
            await tasksStore.updateTask(
              assignment.existingInternalId,
              assignment.details.name,
              assignment.details.description,
              assignment.details.dueDate,
              undefined, // newEffort
              undefined, // newImportance
              undefined  // newDifficulty
            );
          } else {
            // Create new task
            const newTask = await tasksStore.createTask(
              assignment.details.name,
              assignment.details.description || '',
              assignment.details.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            if (newTask) {
              const taskId = newTask; // newTask is the task ID string
              const taskDueDate = new Date(assignment.details.dueDate);
              const now = new Date();

              // Only add to default lists if task is upcoming (not overdue)
              if (taskDueDate >= now) {
                // Get default lists
                const defaultLists = listsStore.lists.filter(list =>
                  ['Daily To-dos', 'Weekly To-dos', 'Monthly To-dos'].includes(list.name)
                );

                // Check each default list and add if due date falls within range
                for (const list of defaultLists) {
                  const listStart = new Date(list.startTime);
                  const listEnd = new Date(list.endTime);

                  // Check if task due date falls within the list's time range
                  if (taskDueDate >= listStart && taskDueDate <= listEnd) {
                    await listsStore.addListItem(list._id, taskId, assignment.details.dueDate);
                  }
                }
              }

              // Record the sync
              await syncAPI.recordInternalSync(
                sourceAccountId,
                assignment.externalId,
                taskId,
                assignment.externalModificationTimestamp
              );
            }
          }
        }

        // Refresh lists to update the UI with newly added items
        await listsStore.fetchLists();
        await this.fetchSources();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to sync source';
        return false;
      } finally {
        this.syncingSourceId = null;
      }
    },

    async fetchSources() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();

      // Don't fetch if user is not logged in
      if (!authStore.user) {
        this.loading = false;
        this.sources = [];
        return;
      }

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

    async syncAllSources() {
      // Sync all connected sources silently in the background
      if (this.sources.length === 0) return;

      for (const source of this.sources) {
        try {
          await this.syncSource(source._id);
        } catch (error) {
          console.error(`Failed to sync source ${source.sourceName}:`, error);
          // Continue with other sources even if one fails
        }
      }
    },

    startAutoSync() {
      // Clear any existing interval
      if (this.autoSyncInterval) {
        clearInterval(this.autoSyncInterval);
      }

      // Sync all sources every hour (3600000 ms)
      this.autoSyncInterval = setInterval(() => {
        this.syncAllSources();
      }, 3600000); // 1 hour
    },

    stopAutoSync() {
      if (this.autoSyncInterval) {
        clearInterval(this.autoSyncInterval);
        this.autoSyncInterval = null;
      }
    },
  },
});
