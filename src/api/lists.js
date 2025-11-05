// TodoList API service
import apiClient from './client';

export const listsAPI = {
  async createList(owner, name, startTime, endTime, autoClearCompleted, recurrenceType) {
    const response = await apiClient.post('/TodoList/createList', {
      owner,
      name,
      startTime: startTime ? new Date(startTime).toISOString() : undefined,
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      autoClearCompleted,
      recurrenceType: recurrenceType || 'none',
    });
    return response.data;
  },

  async addListItem(list, item, itemDueDate) {
    const response = await apiClient.post('/TodoList/addListItem', {
      list,
      item,
      itemDueDate: itemDueDate ? new Date(itemDueDate).toISOString() : undefined,
    });
    return response.data;
  },

  async removeListItem(list, item) {
    const response = await apiClient.post('/TodoList/removeListItem', {
      list,
      item,
    });
    return response.data;
  },

  async markItemCompleted(list, item, completed) {
    const response = await apiClient.post('/TodoList/markItemCompleted', {
      list,
      item,
      completed,
    });
    return response.data;
  },

  async deleteList(list) {
    const response = await apiClient.post('/TodoList/deleteList', {
      list,
    });
    return response.data;
  },

  async clearCompletedItems(list) {
    const response = await apiClient.post('/TodoList/clearCompletedItems', {
      list,
    });
    return response.data;
  },

  async updateList(list, newName, newStartTime, newEndTime, newAutoClearCompleted, newRecurrenceType) {
    const response = await apiClient.post('/TodoList/updateList', {
      list,
      newName,
      newStartTime: newStartTime ? new Date(newStartTime).toISOString() : undefined,
      newEndTime: newEndTime ? new Date(newEndTime).toISOString() : undefined,
      newAutoClearCompleted,
      newRecurrenceType,
    });
    return response.data;
  },

  async updateListSettings(list, autoClearCompleted, recurrenceType) {
    const response = await apiClient.post('/TodoList/updateListSettings', {
      list,
      autoClearCompleted,
      recurrenceType,
    });
    return response.data;
  },

  async getListsForUser(user) {
    const response = await apiClient.post('/TodoList/getListsForUser', {
      user,
    });
    return response.data;
  },

  async getListByName(user, name) {
    const response = await apiClient.post('/TodoList/getListByName', {
      user,
      name,
    });
    return response.data;
  },

  async getActiveListsForUser(user) {
    const response = await apiClient.post('/TodoList/getActiveListsForUser', {
      user,
    });
    return response.data;
  },
};
