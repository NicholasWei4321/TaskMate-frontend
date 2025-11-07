<template>
  <div class="list-detail-page container">
    <div v-if="listsStore.loading || tasksStore.loading" class="loading-state">
      <span class="loading"></span>
      <span>Loading list...</span>
    </div>

    <div v-else-if="!currentList" class="error-state card">
      <p>List not found</p>
      <router-link to="/lists" class="btn btn-primary">Back to Lists</router-link>
    </div>

    <div v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <router-link to="/lists" class="back-link">← Back to Lists</router-link>
          <h1>{{ currentList.name }}</h1>
          <div class="list-meta-info">
            <span class="meta-badge">
              {{ currentList.items?.length || 0 }} task{{ currentList.items?.length === 1 ? '' : 's' }}
            </span>
            <span class="meta-badge">
              {{ formatDate(currentList.startTime) }} - {{ formatDate(currentList.endTime) }}
            </span>
            <span v-if="currentList.recurrenceType !== 'none'" class="meta-badge badge-primary">
              {{ currentList.recurrenceType }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="showAddTasksModal = true" class="btn btn-outline">
            ➕ Add Tasks
          </button>
          <button
            v-if="currentList.items && currentList.items.length > 0"
            @click="handleClearAllTasks"
            class="btn btn-danger"
          >
            Clear All
          </button>
          <button @click="handleEditList" class="btn btn-primary">
            Edit List
          </button>
        </div>
      </div>

      <!-- Tasks Display -->
      <div v-if="listTasks.length === 0" class="empty-state card">
        <p class="text-ui">No tasks in this list yet.</p>
        <button @click="showAddTasksModal = true" class="btn btn-primary">
          Add Tasks
        </button>
      </div>

      <div v-else class="tasks-list">
        <!-- Active Tasks Section -->
        <div v-if="activeListTasks.length > 0">
          <h2 class="section-header">Active Tasks</h2>
          <div class="tasks-section">
            <TaskCard
              v-for="(task, index) in activeListTasks"
              :key="task._id"
              :task="task"
              :priority-rank="index + 1"
              @complete="handleCompleteTask"
              @edit="handleEditTask"
              @snooze="handleSnoozeTask"
            >
              <template #extra-actions>
                <button
                  @click="handleRemoveFromList(task._id)"
                  class="btn btn-sm btn-outline"
                  title="Remove from list"
                >
                  Remove from List
                </button>
              </template>
            </TaskCard>
          </div>
        </div>

        <!-- Completed Tasks Section -->
        <div v-if="completedListTasks.length > 0" :class="{ 'section-spacer': activeListTasks.length > 0 }">
          <h2 class="section-header">Completed Tasks</h2>
          <div class="tasks-section">
            <TaskCard
              v-for="task in completedListTasks"
              :key="task._id"
              :task="task"
              :priority-rank="0"
              :show-priority="false"
              @complete="handleCompleteTask"
              @edit="handleEditTask"
              @snooze="handleSnoozeTask"
            >
              <template #extra-actions>
                <button
                  @click="handleRemoveFromList(task._id)"
                  class="btn btn-sm btn-outline"
                  title="Remove from list"
                >
                  Remove from List
                </button>
              </template>
            </TaskCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Tasks Modal -->
    <div v-if="showAddTasksModal" class="modal-overlay" @click="showAddTasksModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Add Tasks to {{ currentList?.name }}</h2>
          <button @click="showAddTasksModal = false" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="add-item-form">
            <select v-model="selectedTaskIds" multiple size="8" class="task-multi-select">
              <option
                v-for="task in availableTasksFiltered"
                :key="task._id"
                :value="task._id"
              >
                {{ task.name }}
              </option>
            </select>
          </div>
          <p v-if="availableTasksFiltered.length === 0" class="text-muted text-sm">
            No tasks available to add.
          </p>
          <p v-else class="text-muted text-sm">
            Hold Cmd (Mac) or Ctrl (Windows) to select multiple tasks
          </p>
        </div>

        <div class="modal-actions">
          <button @click="showAddTasksModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button
            @click="handleAddTasks"
            class="btn btn-primary"
            :disabled="selectedTaskIds.length === 0"
          >
            Add Selected ({{ selectedTaskIds.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Edit Task</h2>
          <button @click="showEditModal = false" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="handleUpdateTask" class="task-form">
          <div class="form-group">
            <label for="editTaskName">Task Name *</label>
            <input
              id="editTaskName"
              v-model="editingTask.name"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label for="editTaskDescription">Description</label>
            <textarea
              id="editTaskDescription"
              v-model="editingTask.description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="editTaskDueDate">Due Date *</label>
            <input
              id="editTaskDueDate"
              v-model="editingTask.dueDate"
              type="datetime-local"
              required
            />
          </div>

          <div class="form-group">
            <label for="editTaskEffort">Estimated Effort (hours)</label>
            <input
              id="editTaskEffort"
              v-model.number="editingTask.inferredEffortHours"
              type="number"
              min="0.5"
              max="40"
              step="0.5"
              placeholder="0.5 - 40 hours"
            />
          </div>

          <div class="form-group">
            <label for="editTaskImportance">Importance (1-10)</label>
            <input
              id="editTaskImportance"
              v-model.number="editingTask.inferredImportance"
              type="number"
              min="1"
              max="10"
              step="1"
              placeholder="1 - 10"
            />
          </div>

          <div class="form-group">
            <label for="editTaskDifficulty">Difficulty (1-10)</label>
            <input
              id="editTaskDifficulty"
              v-model.number="editingTask.inferredDifficulty"
              type="number"
              min="1"
              max="10"
              step="1"
              placeholder="1 - 10"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="tasksStore.loading">
              <span v-if="tasksStore.loading" class="loading"></span>
              <span v-else>Update Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Snooze Task Modal -->
    <div v-if="showSnoozeModal" class="modal-overlay" @click="showSnoozeModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Snooze Task</h2>
          <button @click="showSnoozeModal = false" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="handleSnoozeTaskSubmit" class="task-form">
          <div class="form-group">
            <label for="snoozeDate">New Due Date *</label>
            <input
              id="snoozeDate"
              v-model="snoozeDate"
              type="datetime-local"
              required
            />
          </div>

          <div class="quick-snooze">
            <p class="text-sm text-muted">Quick snooze:</p>
            <div class="quick-snooze-buttons">
              <button type="button" @click="quickSnooze(1)" class="btn btn-sm btn-outline">
                +1 Day
              </button>
              <button type="button" @click="quickSnooze(3)" class="btn btn-sm btn-outline">
                +3 Days
              </button>
              <button type="button" @click="quickSnooze(7)" class="btn btn-sm btn-outline">
                +1 Week
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showSnoozeModal = false" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="tasksStore.loading">
              <span v-if="tasksStore.loading" class="loading"></span>
              <span v-else>Snooze Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit List Modal -->
    <div v-if="showEditListModal" class="modal-overlay" @click="showEditListModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Edit List</h2>
          <button @click="showEditListModal = false" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="handleUpdateList" class="task-form">
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
            <button type="button" @click="showEditListModal = false" class="btn btn-outline">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useListsStore } from '../stores/lists';
import { useTasksStore } from '../stores/tasks';
import TaskCard from '../components/tasks/TaskCard.vue';

const route = useRoute();
const router = useRouter();
const listsStore = useListsStore();
const tasksStore = useTasksStore();

const showAddTasksModal = ref(false);
const showEditModal = ref(false);
const showEditListModal = ref(false);
const showSnoozeModal = ref(false);
const selectedTaskIds = ref([]);

const editingTask = ref({
  _id: '',
  name: '',
  description: '',
  dueDate: '',
  inferredEffortHours: null,
  inferredImportance: null,
  inferredDifficulty: null,
});

const snoozeTaskId = ref('');
const snoozeDate = ref('');

const editingList = ref({
  _id: '',
  name: '',
  startTime: '',
  endTime: '',
  autoClearCompleted: false,
  recurrenceType: 'none',
});

const currentList = computed(() => {
  return listsStore.lists.find(l => l._id === route.params.id);
});

const listTasks = computed(() => {
  if (!currentList.value || !currentList.value.items) return [];

  // Get task IDs from list items
  const taskIds = currentList.value.items.map(item => item.id);

  // Find corresponding tasks from tasksStore
  return tasksStore.tasks.filter(task => taskIds.includes(task._id));
});

const activeListTasks = computed(() => {
  return listTasks.value
    .filter(task => !task.completed)
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
});

const completedListTasks = computed(() => {
  return listTasks.value
    .filter(task => task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
});

const availableTasks = computed(() => {
  return tasksStore.tasks.filter(task => !task.completed);
});

const availableTasksFiltered = computed(() => {
  if (!currentList.value) return availableTasks.value;

  // Get IDs of tasks already in the list
  const tasksInList = new Set(
    (currentList.value.items || []).map(item => item.id)
  );

  // Filter out tasks that are already in the list
  return availableTasks.value.filter(task => !tasksInList.has(task._id));
});

const formatDate = (date) => {
  if (!date) return '--';
  const d = new Date(date);
  const timestamp = d.getTime();

  // Check if it's a default date (epoch or far future)
  if (timestamp === 0 || d.getFullYear() === 1970 || d.getFullYear() === 9999) {
    return '--';
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isDefaultDate = (date) => {
  if (!date) return true;
  const d = new Date(date);
  const timestamp = d.getTime();
  // Check if it's epoch (0) or year 1970 or 9999
  return timestamp === 0 || d.getFullYear() === 1970 || d.getFullYear() === 9999;
};

const handleEditList = () => {
  if (!currentList.value) return;

  // For default dates, leave the input empty instead of showing 1970/9999
  const startTime = isDefaultDate(currentList.value.startTime) ? '' : new Date(currentList.value.startTime).toISOString().slice(0, 16);
  const endTime = isDefaultDate(currentList.value.endTime) ? '' : new Date(currentList.value.endTime).toISOString().slice(0, 16);

  editingList.value = {
    _id: currentList.value._id,
    name: currentList.value.name,
    startTime,
    endTime,
    autoClearCompleted: currentList.value.autoClearCompleted,
    recurrenceType: currentList.value.recurrenceType,
  };
  showEditListModal.value = true;
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
    showEditListModal.value = false;
    await listsStore.fetchLists();
  }
};

const handleAddTasks = async () => {
  if (selectedTaskIds.value.length === 0 || !currentList.value) return;

  // Add all selected tasks
  for (const taskId of selectedTaskIds.value) {
    const task = tasksStore.tasks.find(t => t._id === taskId);
    if (task) {
      await listsStore.addListItem(
        currentList.value._id,
        taskId,
        task.dueDate
      );
    }
  }

  // Clear selection and refresh
  selectedTaskIds.value = [];
  showAddTasksModal.value = false;
  await listsStore.fetchLists();
};

const handleRemoveFromList = async (taskId) => {
  if (!currentList.value) return;

  if (confirm('Remove this task from the list?')) {
    await listsStore.removeListItem(currentList.value._id, taskId);
    await listsStore.fetchLists();
  }
};

const handleClearAllTasks = async () => {
  if (!currentList.value) return;

  if (!confirm(`Are you sure you want to remove all ${currentList.value.items.length} task(s) from "${currentList.value.name}"?`)) {
    return;
  }

  // Remove all items one by one
  const itemIds = currentList.value.items.map(item => item.id);
  for (const itemId of itemIds) {
    await listsStore.removeListItem(currentList.value._id, itemId);
  }

  // Refresh
  await listsStore.fetchLists();
};

const handleCompleteTask = async (taskId) => {
  await tasksStore.completeTask(taskId);
};

const handleEditTask = (task) => {
  editingTask.value = {
    _id: task._id,
    name: task.name,
    description: task.description,
    dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
    inferredEffortHours: task.inferredEffortHours,
    inferredImportance: task.inferredImportance,
    inferredDifficulty: task.inferredDifficulty,
  };
  showEditModal.value = true;
};

const handleUpdateTask = async () => {
  const result = await tasksStore.updateTask(
    editingTask.value._id,
    editingTask.value.name,
    editingTask.value.description,
    editingTask.value.dueDate,
    editingTask.value.inferredEffortHours,
    editingTask.value.inferredImportance,
    editingTask.value.inferredDifficulty
  );

  if (result) {
    showEditModal.value = false;
  }
};

const handleSnoozeTask = (taskId) => {
  snoozeTaskId.value = taskId;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  snoozeDate.value = tomorrow.toISOString().slice(0, 16);
  showSnoozeModal.value = true;
};

const handleSnoozeTaskSubmit = async () => {
  const result = await tasksStore.snoozeTask(snoozeTaskId.value, snoozeDate.value);
  if (result) {
    showSnoozeModal.value = false;
  }
};

const quickSnooze = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  snoozeDate.value = date.toISOString().slice(0, 16);
};

onMounted(async () => {
  await Promise.all([
    listsStore.fetchLists(),
    tasksStore.fetchTasks(),
  ]);
});
</script>

<style scoped>
.list-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.header-content {
  flex: 1;
}

.back-link {
  display: inline-block;
  color: var(--color-primary);
  text-decoration: none;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.back-link:hover {
  text-decoration: underline;
}

.page-header h1 {
  margin-bottom: var(--spacing-sm);
}

.list-meta-info {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.meta-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.badge-primary {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
}

.error-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-header {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-border);
}

.tasks-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-spacer {
  margin-top: var(--spacing-xl);
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

.modal-body {
  margin-bottom: var(--spacing-lg);
}

.task-form {
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

.add-item-form {
  margin-bottom: var(--spacing-sm);
}

.task-multi-select {
  width: 100%;
  min-height: 200px;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--font-size-base);
}

.task-multi-select option {
  padding: var(--spacing-xs);
}

.quick-snooze {
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.quick-snooze p {
  margin-bottom: var(--spacing-sm);
}

.quick-snooze-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
