// AI Prioritized Tasks API service
import apiClient from './client';

export const tasksAPI = {
  async createTask(owner, name, description, dueDate) {
    const response = await apiClient.post('/AIPrioritizedTask/createTask', {
      owner,
      name,
      description,
      dueDate: new Date(dueDate).toISOString(),
    });
    return response.data;
  },

  async updateTask(task, newName, newDescription, newDueDate) {
    const response = await apiClient.post('/AIPrioritizedTask/updateTask', {
      task,
      newName,
      newDescription,
      newDueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
    });
    return response.data;
  },

  async snoozeTask(task, newDueDate) {
    const response = await apiClient.post('/AIPrioritizedTask/snoozeTask', {
      task,
      newDueDate: new Date(newDueDate).toISOString(),
    });
    return response.data;
  },

  async completeTask(task) {
    const response = await apiClient.post('/AIPrioritizedTask/completeTask', {
      task,
    });
    return response.data;
  },

  async getTask(task) {
    const response = await apiClient.post('/AIPrioritizedTask/getTask', {
      task,
    });
    return response.data;
  },

  async getTasksByOwner(owner) {
    const response = await apiClient.post('/AIPrioritizedTask/getTasksByOwner', {
      owner,
    });
    return response.data;
  },

  async getPrioritizedTasks(owner) {
    const response = await apiClient.post('/AIPrioritizedTask/getPrioritizedTasks', {
      owner,
    });
    return response.data;
  },
};
