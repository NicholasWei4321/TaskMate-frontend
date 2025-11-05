// Tasks store
import { defineStore } from 'pinia';
import { tasksAPI } from '../api/tasks';
import { useAuthStore } from './auth';

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),

  getters: {
    prioritizedTasks: (state) => {
      return state.tasks
        .filter(task => !task.completed)
        .sort((a, b) => b.priorityScore - a.priorityScore);
    },
    completedTasks: (state) => {
      return state.tasks.filter(task => task.completed);
    },
    overdueTasks: (state) => {
      return state.tasks.filter(task => task.overdue && !task.completed);
    },
  },

  actions: {
    async createTask(name, description, dueDate) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await tasksAPI.createTask(
          authStore.user,
          name,
          description,
          dueDate
        );
        if (result.error) {
          this.error = result.error;
          return null;
        }
        await this.fetchTasks();
        return result.task;
      } catch (error) {
        this.error = error.message || 'Failed to create task';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateTask(taskId, newName, newDescription, newDueDate, newEffort, newImportance, newDifficulty) {
      this.loading = true;
      this.error = null;
      try {
        const result = await tasksAPI.updateTask(
          taskId,
          newName,
          newDescription,
          newDueDate,
          newEffort,
          newImportance,
          newDifficulty
        );
        if (result.error) {
          this.error = result.error;
          return null;
        }
        await this.fetchTasks();
        return result.task;
      } catch (error) {
        this.error = error.message || 'Failed to update task';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async snoozeTask(taskId, newDueDate) {
      this.loading = true;
      this.error = null;
      try {
        const result = await tasksAPI.snoozeTask(taskId, newDueDate);
        if (result.error) {
          this.error = result.error;
          return null;
        }
        await this.fetchTasks();
        return result.task;
      } catch (error) {
        this.error = error.message || 'Failed to snooze task';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async completeTask(taskId) {
      this.loading = true;
      this.error = null;
      try {
        const result = await tasksAPI.completeTask(taskId);
        if (result.error) {
          this.error = result.error;
          return null;
        }
        await this.fetchTasks();
        return result.task;
      } catch (error) {
        this.error = error.message || 'Failed to complete task';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchTasks() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await tasksAPI.getTasksByOwner(authStore.user);
        if (result.error) {
          this.error = result.error;
          this.tasks = [];
        } else {
          this.tasks = result.tasks || [];
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch tasks';
        this.tasks = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchPrioritizedTasks() {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const result = await tasksAPI.getPrioritizedTasks(authStore.user);
        if (result.error) {
          this.error = result.error;
          this.tasks = [];
        } else {
          this.tasks = result.tasks || [];
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch prioritized tasks';
        this.tasks = [];
      } finally {
        this.loading = false;
      }
    },
  },
});
