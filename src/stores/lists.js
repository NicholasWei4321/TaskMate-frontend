// Lists store
import { defineStore } from 'pinia';
import { listsAPI } from '../api/lists';
import { useAuthStore } from './auth';

export const useListsStore = defineStore('lists', {
  state: () => ({
    lists: [],
    currentList: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeLists: (state) => {
      const now = new Date();
      return state.lists.filter(list => {
        const start = new Date(list.startTime);
        const end = new Date(list.endTime);
        return now >= start && now <= end;
      });
    },
  },

  actions: {
    async createList(name, startTime, endTime, autoClearCompleted, recurrenceType) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await listsAPI.createList(
          authStore.user,
          name,
          startTime,
          endTime,
          autoClearCompleted,
          recurrenceType
        );
        if (result.error) {
          this.error = result.error;
          return null;
        }
        await this.fetchLists();
        return result.list;
      } catch (error) {
        this.error = error.message || 'Failed to create list';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async addListItem(listId, itemId, itemDueDate) {
      this.loading = true;
      this.error = null;
      try {
        const result = await listsAPI.addListItem(listId, itemId, itemDueDate);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        await this.fetchLists();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to add item to list';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async removeListItem(listId, itemId) {
      this.loading = true;
      this.error = null;
      try {
        const result = await listsAPI.removeListItem(listId, itemId);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        await this.fetchLists();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to remove item from list';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async markItemCompleted(listId, itemId, completed) {
      this.loading = true;
      this.error = null;
      try {
        const result = await listsAPI.markItemCompleted(listId, itemId, completed);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        await this.fetchLists();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to mark item as completed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteList(listId) {
      this.loading = true;
      this.error = null;
      try {
        const result = await listsAPI.deleteList(listId);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        await this.fetchLists();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to delete list';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async clearCompletedItems(listId) {
      this.loading = true;
      this.error = null;
      try {
        const result = await listsAPI.clearCompletedItems(listId);
        if (result.error) {
          this.error = result.error;
          return false;
        }
        await this.fetchLists();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to clear completed items';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateList(listId, newName, newStartTime, newEndTime, newAutoClearCompleted, newRecurrenceType) {
      this.loading = true;
      this.error = null;
      try {
        const result = await listsAPI.updateList(
          listId,
          newName,
          newStartTime,
          newEndTime,
          newAutoClearCompleted,
          newRecurrenceType
        );
        if (result.error) {
          this.error = result.error;
          return null;
        }
        await this.fetchLists();
        return result.list;
      } catch (error) {
        this.error = error.message || 'Failed to update list';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateListSettings(listId, autoClearCompleted, recurrenceType) {
      this.loading = true;
      this.error = null;
      try {
        const result = await listsAPI.updateListSettings(
          listId,
          autoClearCompleted,
          recurrenceType
        );
        if (result.error) {
          this.error = result.error;
          return false;
        }
        await this.fetchLists();
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to update list settings';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchLists() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await listsAPI.getListsForUser(authStore.user);
        if (result.error) {
          this.error = result.error;
          this.lists = [];
        } else {
          this.lists = result.lists || [];
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch lists';
        this.lists = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchListByName(name) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await listsAPI.getListByName(authStore.user, name);
        if (result.error) {
          this.error = result.error;
          this.currentList = null;
        } else {
          this.currentList = result.list;
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch list';
        this.currentList = null;
      } finally {
        this.loading = false;
      }
    },

    async fetchActiveLists() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await listsAPI.getActiveListsForUser(authStore.user);
        if (result.error) {
          this.error = result.error;
          this.lists = [];
        } else {
          this.lists = result.lists || [];
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch active lists';
        this.lists = [];
      } finally {
        this.loading = false;
      }
    },
  },
});
