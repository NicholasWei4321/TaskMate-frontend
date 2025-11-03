<template>
  <div class="lists-page container">
    <div class="page-header">
      <div>
        <h1>Todo Lists</h1>
        <p class="text-muted">Organize tasks into time-scoped collections</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        ➕ Create List
      </button>
    </div>

    <div v-if="listsStore.error" class="alert alert-error">
      {{ listsStore.error }}
    </div>

    <div v-if="listsStore.loading" class="loading-state">
      <span class="loading"></span>
      <span>Loading lists...</span>
    </div>

    <div v-else-if="listsStore.lists.length === 0" class="empty-state card">
      <p>No lists found. Create your first list to organize your tasks!</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Create List
      </button>
    </div>

    <div v-else class="lists-grid">
      <div
        v-for="list in listsStore.lists"
        :key="list._id"
        class="list-card card"
        @click="selectList(list)"
      >
        <div class="list-header">
          <h3>{{ list.name }}</h3>
          <span class="badge" :class="isListActive(list) ? 'badge-success' : 'badge-primary'">
            {{ isListActive(list) ? 'Active' : 'Archived' }}
          </span>
        </div>

        <div class="list-info">
          <div class="info-item">
            <span class="info-label">Items:</span>
            <span class="info-value">{{ list.items?.length || 0 }}</span>
          </div>

          <div v-if="list.startTime" class="info-item">
            <span class="info-label">Start:</span>
            <span class="info-value">{{ formatDate(list.startTime) }}</span>
          </div>

          <div v-if="list.endTime" class="info-item">
            <span class="info-label">End:</span>
            <span class="info-value">{{ formatDate(list.endTime) }}</span>
          </div>

          <div v-if="list.recurrenceType !== 'none'" class="info-item">
            <span class="info-label">Recurrence:</span>
            <span class="info-value">{{ list.recurrenceType }}</span>
          </div>
        </div>

        <div class="list-actions" @click.stop>
          <button @click="editList(list)" class="btn btn-sm btn-outline">
            Edit
          </button>
          <button @click="confirmDeleteList(list._id)" class="btn btn-sm btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Create List Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Create New List</h2>
          <button @click="showCreateModal = false" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="handleCreateList" class="list-form">
          <div class="form-group">
            <label for="listName">List Name *</label>
            <input
              id="listName"
              v-model="newList.name"
              type="text"
              placeholder="Enter list name"
              required
            />
          </div>

          <div class="form-group">
            <label for="startTime">Start Time (optional)</label>
            <input
              id="startTime"
              v-model="newList.startTime"
              type="datetime-local"
            />
          </div>

          <div class="form-group">
            <label for="endTime">End Time (optional)</label>
            <input
              id="endTime"
              v-model="newList.endTime"
              type="datetime-local"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="newList.autoClearCompleted"
                type="checkbox"
              />
              <span>Auto-clear completed items</span>
            </label>
          </div>

          <div class="form-group">
            <label for="recurrenceType">Recurrence Type</label>
            <select id="recurrenceType" v-model="newList.recurrenceType">
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="listsStore.loading">
              <span v-if="listsStore.loading" class="loading"></span>
              <span v-else>Create List</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- List Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content card modal-large" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedList?.name }}</h2>
          <button @click="showDetailModal = false" class="close-btn">✕</button>
        </div>

        <div v-if="selectedList" class="list-detail">
          <div class="list-meta">
            <div class="meta-item">
              <span class="meta-label">Items:</span>
              <span class="meta-value">{{ selectedList.items?.length || 0 }}</span>
            </div>
            <div v-if="selectedList.startTime" class="meta-item">
              <span class="meta-label">Start:</span>
              <span class="meta-value">{{ formatDate(selectedList.startTime) }}</span>
            </div>
            <div v-if="selectedList.endTime" class="meta-item">
              <span class="meta-label">End:</span>
              <span class="meta-value">{{ formatDate(selectedList.endTime) }}</span>
            </div>
          </div>

          <div class="add-item-section">
            <h3>Add Task to List</h3>
            <div class="add-item-form">
              <select v-model="selectedTaskId" class="task-select">
                <option value="">Select a task...</option>
                <option
                  v-for="task in availableTasks"
                  :key="task._id"
                  :value="task._id"
                >
                  {{ task.name }}
                </option>
              </select>
              <button
                @click="handleAddItem"
                class="btn btn-primary"
                :disabled="!selectedTaskId"
              >
                Add to List
              </button>
            </div>
          </div>

          <div class="list-items">
            <h3>List Items</h3>
            <div v-if="!selectedList.items || selectedList.items.length === 0" class="empty-items">
              <p class="text-muted">No items in this list yet.</p>
            </div>
            <div v-else class="items-grid">
              <div
                v-for="itemId in selectedList.items"
                :key="itemId"
                class="item-card"
              >
                <div class="item-info">
                  <span class="item-name">Task ID: {{ itemId }}</span>
                </div>
                <button
                  @click="handleRemoveItem(itemId)"
                  class="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useListsStore } from '../stores/lists';
import { useTasksStore } from '../stores/tasks';

const listsStore = useListsStore();
const tasksStore = useTasksStore();

const showCreateModal = ref(false);
const showDetailModal = ref(false);
const selectedList = ref(null);
const selectedTaskId = ref('');

const newList = ref({
  name: '',
  startTime: '',
  endTime: '',
  autoClearCompleted: false,
  recurrenceType: 'none',
});

const availableTasks = computed(() => {
  return tasksStore.tasks.filter(task => !task.completed);
});

const isListActive = (list) => {
  const now = new Date();
  const start = new Date(list.startTime);
  const end = new Date(list.endTime);
  return now >= start && now <= end;
};

const formatDate = (date) => {
  const d = new Date(date);
  // Check if it's a default date (epoch or far future)
  if (d.getFullYear() === 1970 || d.getFullYear() === 9999) {
    return 'Always';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const handleCreateList = async () => {
  const result = await listsStore.createList(
    newList.value.name,
    newList.value.startTime || undefined,
    newList.value.endTime || undefined,
    newList.value.autoClearCompleted,
    newList.value.recurrenceType
  );

  if (result) {
    showCreateModal.value = false;
    newList.value = {
      name: '',
      startTime: '',
      endTime: '',
      autoClearCompleted: false,
      recurrenceType: 'none',
    };
  }
};

const selectList = (list) => {
  selectedList.value = list;
  showDetailModal.value = true;
};

const editList = (list) => {
  // TODO: Implement edit functionality
  console.log('Edit list:', list);
};

const confirmDeleteList = async (listId) => {
  if (confirm('Are you sure you want to delete this list?')) {
    await listsStore.deleteList(listId);
  }
};

const handleAddItem = async () => {
  if (!selectedTaskId.value || !selectedList.value) return;

  const task = tasksStore.tasks.find(t => t._id === selectedTaskId.value);
  if (!task) return;

  const success = await listsStore.addListItem(
    selectedList.value._id,
    selectedTaskId.value,
    task.dueDate
  );

  if (success) {
    selectedTaskId.value = '';
    // Refresh the list
    await listsStore.fetchLists();
    selectedList.value = listsStore.lists.find(l => l._id === selectedList.value._id);
  }
};

const handleRemoveItem = async (itemId) => {
  if (!selectedList.value) return;

  const success = await listsStore.removeListItem(selectedList.value._id, itemId);

  if (success) {
    // Refresh the list
    await listsStore.fetchLists();
    selectedList.value = listsStore.lists.find(l => l._id === selectedList.value._id);
  }
};

onMounted(async () => {
  await Promise.all([
    listsStore.fetchLists(),
    tasksStore.fetchTasks(),
  ]);
});
</script>

<style scoped>
.lists-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-md);
}

.page-header h1 {
  margin-bottom: var(--spacing-sm);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.list-card {
  cursor: pointer;
  transition: all var(--transition-fast);
  border-left: 4px solid var(--color-primary);
}

.list-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.list-header h3 {
  margin-bottom: 0;
  font-size: var(--font-size-lg);
}

.list-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.info-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.info-value {
  color: var(--color-text-primary);
}

.list-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-md);
}

.modal-content {
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.modal-header h2 {
  margin-bottom: 0;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.list-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-normal);
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.list-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.meta-item {
  display: flex;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.meta-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.meta-value {
  color: var(--color-text-primary);
}

.add-item-section h3,
.list-items h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}

.add-item-form {
  display: flex;
  gap: var(--spacing-sm);
}

.task-select {
  flex: 1;
}

.empty-items {
  text-align: center;
  padding: var(--spacing-xl);
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.item-name {
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .lists-grid {
    grid-template-columns: 1fr;
  }

  .add-item-form {
    flex-direction: column;
  }
}
</style>
