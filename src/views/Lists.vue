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

          <div class="info-item">
            <span class="info-label">Start:</span>
            <span class="info-value">{{ formatDate(list.startTime) }}</span>
          </div>

          <div class="info-item">
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

          <div class="form-group">
            <label>Add Tasks (optional)</label>
            <div class="multi-select-container">
              <div
                v-for="task in availableTasks"
                :key="task._id"
                class="checkbox-item"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="task._id"
                    v-model="newList.selectedTasks"
                  />
                  <span>{{ task.name }}</span>
                </label>
              </div>
              <div v-if="availableTasks.length === 0" class="text-muted text-sm">
                No active tasks available. Create tasks first.
              </div>
            </div>
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

    <!-- Edit List Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Edit List</h2>
          <button @click="showEditModal = false" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="handleUpdateList" class="list-form">
          <div class="form-group">
            <label for="editListName">List Name *</label>
            <input
              id="editListName"
              v-model="editingList.name"
              type="text"
              placeholder="Enter list name"
              required
            />
          </div>

          <div class="form-group">
            <label for="editStartTime">Start Time (optional)</label>
            <input
              id="editStartTime"
              v-model="editingList.startTime"
              type="datetime-local"
            />
          </div>

          <div class="form-group">
            <label for="editEndTime">End Time (optional)</label>
            <input
              id="editEndTime"
              v-model="editingList.endTime"
              type="datetime-local"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="editingList.autoClearCompleted"
                type="checkbox"
              />
              <span>Auto-clear completed items</span>
            </label>
          </div>

          <div class="form-group">
            <label for="editRecurrenceType">Recurrence Type</label>
            <select id="editRecurrenceType" v-model="editingList.recurrenceType">
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="listsStore.loading">
              <span v-if="listsStore.loading" class="loading"></span>
              <span v-else>Update List</span>
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
            <div class="meta-item">
              <span class="meta-label">Start:</span>
              <span class="meta-value">{{ formatDate(selectedList.startTime) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">End:</span>
              <span class="meta-value">{{ formatDate(selectedList.endTime) }}</span>
            </div>
          </div>

          <div class="add-item-section">
            <h3>Add Task(s) to List</h3>
            <div class="add-item-form">
              <select v-model="selectedTaskIds" multiple size="5" class="task-multi-select">
                <option
                  v-for="task in availableTasksFiltered"
                  :key="task._id"
                  :value="task._id"
                >
                  {{ task.name }}
                </option>
              </select>
              <button
                @click="handleAddItems"
                class="btn btn-primary"
                :disabled="selectedTaskIds.length === 0"
              >
                Add Selected ({{ selectedTaskIds.length }})
              </button>
            </div>
            <p v-if="availableTasksFiltered.length === 0" class="text-muted text-sm">
              No tasks available to add.
            </p>
            <p v-else class="text-muted text-sm">
              Hold Cmd (Mac) or Ctrl (Windows) to select multiple tasks
            </p>
          </div>

          <div class="list-items">
            <div class="list-items-header">
              <h3>List Items</h3>
              <div v-if="selectedList.items && selectedList.items.length > 0" class="list-actions-buttons">
                <button @click="handleClearAllTasks" class="btn btn-sm btn-danger">
                  Clear All Tasks
                </button>
              </div>
            </div>
            <div v-if="!selectedList.items || selectedList.items.length === 0" class="empty-items">
              <p class="text-muted">No items in this list yet.</p>
            </div>
            <div v-else class="items-grid">
              <div
                v-for="item in selectedList.items"
                :key="item.id"
                class="item-card"
              >
                <div class="item-info">
                  <span class="item-name">{{ getTaskName(item.id) }}</span>
                  <span v-if="item.completed" class="badge badge-success">✓ Completed</span>
                </div>
                <button
                  @click="handleRemoveItem(item.id)"
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
import { useRouter } from 'vue-router';
import { useListsStore } from '../stores/lists';
import { useTasksStore } from '../stores/tasks';

const router = useRouter();
const listsStore = useListsStore();
const tasksStore = useTasksStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const selectedList = ref(null);
const selectedTaskIds = ref([]);

const newList = ref({
  name: '',
  startTime: '',
  endTime: '',
  autoClearCompleted: false,
  recurrenceType: 'none',
  selectedTasks: [],
});

const editingList = ref({
  _id: '',
  name: '',
  startTime: '',
  endTime: '',
  autoClearCompleted: false,
  recurrenceType: 'none',
});

const availableTasks = computed(() => {
  return tasksStore.tasks.filter(task => !task.completed);
});

const availableTasksFiltered = computed(() => {
  if (!selectedList.value) return availableTasks.value;

  // Get IDs of tasks already in the list
  const tasksInList = new Set(
    (selectedList.value.items || []).map(item => item.id)
  );

  // Filter out tasks that are already in the list
  return availableTasks.value.filter(task => !tasksInList.has(task._id));
});

const isListActive = (list) => {
  const now = new Date();
  const start = new Date(list.startTime);
  const end = new Date(list.endTime);
  return now >= start && now <= end;
};

const formatDate = (date) => {
  if (!date) return '--';
  const d = new Date(date);
  const timestamp = d.getTime();

  // Check if it's a default date (epoch or far future)
  // Unix epoch: 0 (Jan 1, 1970 00:00:00 UTC)
  // Max date: Dec 31, 9999
  if (timestamp === 0 || d.getFullYear() === 1970 || d.getFullYear() === 9999) {
    return '--';
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
    // Add selected tasks to the newly created list
    if (newList.value.selectedTasks.length > 0) {
      const listId = result.list;
      for (const taskId of newList.value.selectedTasks) {
        const task = tasksStore.tasks.find(t => t._id === taskId);
        if (task) {
          await listsStore.addListItem(listId, taskId, task.dueDate);
        }
      }
      await listsStore.fetchLists();
    }

    showCreateModal.value = false;
    newList.value = {
      name: '',
      startTime: '',
      endTime: '',
      autoClearCompleted: false,
      recurrenceType: 'none',
      selectedTasks: [],
    };
  }
};

const selectList = (list) => {
  // Navigate to the full page view instead of showing modal
  router.push(`/lists/${list._id}`);
};

const isDefaultDate = (date) => {
  if (!date) return true;
  const d = new Date(date);
  const timestamp = d.getTime();
  // Check if it's epoch (0) or year 1970 or 9999
  return timestamp === 0 || d.getFullYear() === 1970 || d.getFullYear() === 9999;
};

const editList = (list) => {
  // For default dates, leave the input empty instead of showing 1970/9999
  const startTime = isDefaultDate(list.startTime) ? '' : new Date(list.startTime).toISOString().slice(0, 16);
  const endTime = isDefaultDate(list.endTime) ? '' : new Date(list.endTime).toISOString().slice(0, 16);

  editingList.value = {
    _id: list._id,
    name: list.name,
    startTime,
    endTime,
    autoClearCompleted: list.autoClearCompleted,
    recurrenceType: list.recurrenceType,
  };
  showEditModal.value = true;
};

const handleUpdateList = async () => {
  const result = await listsStore.updateList(
    editingList.value._id,
    editingList.value.name,
    editingList.value.startTime || undefined,
    editingList.value.endTime || undefined,
    editingList.value.autoClearCompleted,
    editingList.value.recurrenceType
  );

  if (result) {
    showEditModal.value = false;
  }
};

const getTaskName = (taskId) => {
  const task = tasksStore.tasks.find(t => t._id === taskId);
  return task ? task.name : `Task ${taskId}`;
};

const confirmDeleteList = async (listId) => {
  if (confirm('Are you sure you want to delete this list?')) {
    await listsStore.deleteList(listId);
  }
};

const handleAddItems = async () => {
  if (selectedTaskIds.value.length === 0 || !selectedList.value) return;

  // Add all selected tasks
  for (const taskId of selectedTaskIds.value) {
    const task = tasksStore.tasks.find(t => t._id === taskId);
    if (task) {
      await listsStore.addListItem(
        selectedList.value._id,
        taskId,
        task.dueDate
      );
    }
  }

  // Clear selection and refresh
  selectedTaskIds.value = [];
  await listsStore.fetchLists();
  selectedList.value = listsStore.lists.find(l => l._id === selectedList.value._id);
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

const handleClearAllTasks = async () => {
  if (!selectedList.value) return;

  if (!confirm(`Are you sure you want to remove all ${selectedList.value.items.length} task(s) from "${selectedList.value.name}"?`)) {
    return;
  }

  // Remove all items one by one
  const itemIds = selectedList.value.items.map(item => item.id);
  for (const itemId of itemIds) {
    await listsStore.removeListItem(selectedList.value._id, itemId);
  }

  // Refresh the list
  await listsStore.fetchLists();
  selectedList.value = listsStore.lists.find(l => l._id === selectedList.value._id);
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

.list-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.list-items-header h3 {
  margin-bottom: 0;
}

.list-actions-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.add-item-form {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.task-select {
  flex: 1;
}

.task-multi-select {
  flex: 1;
  min-height: 120px;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--font-size-base);
}

.task-multi-select option {
  padding: var(--spacing-xs);
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

.multi-select-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
}

.checkbox-item {
  padding: var(--spacing-xs) var(--spacing-sm);
}

.checkbox-item:hover {
  background-color: var(--color-white);
  border-radius: var(--radius-sm);
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
