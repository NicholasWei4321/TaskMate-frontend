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

      <!-- Error Alert -->
      <div v-if="listsStore.error" class="alert alert-error">
        <div class="alert-content">
          <span>{{ listsStore.error }}</span>
          <button @click="listsStore.error = null" class="close-btn">✕</button>
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
                  class="btn btn-sm btn-outline btn-outline-danger"
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
                  class="btn btn-sm btn-outline btn-outline-danger"
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
          <div v-if="editListError" class="alert alert-error" style="margin-bottom: var(--spacing-md);">
            <div class="alert-content">
              <span>{{ editListError }}</span>
              <button type="button" @click="editListError = null" class="close-btn">✕</button>
            </div>
          </div>

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
              @focus="handleEditStartTimeFocus"
            />
          </div>

          <div class="form-group">
            <label for="editEndTime">End Time (optional)</label>
            <input
              id="editEndTime"
              v-model="editingList.endTime"
              type="datetime-local"
              @focus="handleEditEndTimeFocus"
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

    <!-- Clear All Confirmation Modal -->
    <div v-if="showClearAllModal" class="modal-overlay" @click="showClearAllModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Clear All Tasks</h2>
          <button @click="showClearAllModal = false" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to remove all {{ currentList?.items?.length || 0 }} task(s) from "{{ currentList?.name }}"?</p>
          <p class="text-muted text-sm">This action cannot be undone.</p>
        </div>

        <div class="modal-actions">
          <button @click="showClearAllModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button @click="handleClearAllConfirmed" class="btn btn-danger" :disabled="listsStore.loading">
            <span v-if="listsStore.loading" class="loading"></span>
            <span v-else>Clear All</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Remove Task Confirmation Modal -->
    <div v-if="showRemoveTaskModal" class="modal-overlay" @click="showRemoveTaskModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Remove Task from List</h2>
          <button @click="showRemoveTaskModal = false" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to remove "{{ taskToRemove?.name }}" from "{{ currentList?.name }}"?</p>
          <p class="text-muted text-sm">This will only remove it from the list, not delete the task.</p>
        </div>

        <div class="modal-actions">
          <button @click="showRemoveTaskModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button @click="handleRemoveTaskConfirmed" class="btn btn-danger" :disabled="listsStore.loading">
            <span v-if="listsStore.loading" class="loading"></span>
            <span v-else>Remove from List</span>
          </button>
        </div>
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
const showClearAllModal = ref(false);
const showRemoveTaskModal = ref(false);
const selectedTaskIds = ref([]);
const taskToRemove = ref(null);

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
const snoozeTaskDueDate = ref(null);

const editingList = ref({
  _id: '',
  name: '',
  startTime: '',
  endTime: '',
  autoClearCompleted: false,
  recurrenceType: 'none',
});

const editListError = ref(null);

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

// Helper function to convert UTC date to local datetime string for datetime-local input
const toLocalDateTimeString = (utcDate) => {
  const date = new Date(utcDate);
  // Get local time components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to get default start time (today at 12:00 AM)
const getDefaultStartTime = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return toLocalDateTimeString(date);
};

// Helper function to get default end time (today at 11:59 PM)
const getDefaultEndTime = () => {
  const date = new Date();
  date.setHours(23, 59, 0, 0);
  return toLocalDateTimeString(date);
};

const handleEditList = () => {
  if (!currentList.value) return;

  // Clear any previous errors
  editListError.value = null;

  // For default dates, leave empty; otherwise format in local timezone
  let startTime = '';
  let endTime = '';

  if (!isDefaultDate(currentList.value.startTime)) {
    startTime = toLocalDateTimeString(currentList.value.startTime);
  }

  if (!isDefaultDate(currentList.value.endTime)) {
    endTime = toLocalDateTimeString(currentList.value.endTime);
  }

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

// Set default start time when user focuses on the start time input in edit modal
const handleEditStartTimeFocus = () => {
  if (!editingList.value.startTime) {
    editingList.value.startTime = getDefaultStartTime();
  }
};

// Set default end time when user focuses on the end time input in edit modal
const handleEditEndTimeFocus = () => {
  if (!editingList.value.endTime) {
    editingList.value.endTime = getDefaultEndTime();
  }
};

const handleUpdateList = async () => {
  // Clear previous error
  editListError.value = null;

  await listsStore.updateList(
    editingList.value._id,
    editingList.value.name,
    editingList.value.startTime || undefined,
    editingList.value.endTime || undefined,
    editingList.value.autoClearCompleted,
    editingList.value.recurrenceType
  );

  // Check for errors and display in modal
  if (listsStore.error) {
    editListError.value = listsStore.error;
    listsStore.error = null; // Clear from store to prevent showing on page
  } else {
    // Close modal and refresh if no error
    showEditListModal.value = false;
    await listsStore.fetchLists();
  }
};

const handleAddTasks = async () => {
  if (selectedTaskIds.value.length === 0 || !currentList.value) return;

  let failedCount = 0;
  let successCount = 0;

  // Attempt to add all selected tasks
  for (const taskId of selectedTaskIds.value) {
    const task = tasksStore.tasks.find(t => t._id === taskId);
    if (task) {
      const success = await listsStore.addListItem(
        currentList.value._id,
        taskId,
        task.dueDate
      );

      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
    }
  }

  // Clear the individual error from the store
  listsStore.error = null;

  // Build error message if some tasks failed
  let errorMessage = null;
  if (failedCount > 0) {
    errorMessage = `${failedCount} task(s) could not be added because their due dates do not fall within this list's time range (${formatDate(currentList.value.startTime)} - ${formatDate(currentList.value.endTime)}).`;
  }

  // Clear selection and close modal
  selectedTaskIds.value = [];
  showAddTasksModal.value = false;

  // Refresh the list to show successfully added tasks
  await listsStore.fetchLists();

  // Set error after fetching (so it doesn't get cleared by fetchLists)
  if (errorMessage) {
    listsStore.error = errorMessage;
  }
};

const handleRemoveFromList = (taskId) => {
  if (!currentList.value) return;

  const task = currentList.value.items.find(item => item.id === taskId);
  taskToRemove.value = task;
  showRemoveTaskModal.value = true;
};

const handleRemoveTaskConfirmed = async () => {
  if (!currentList.value || !taskToRemove.value) return;

  await listsStore.removeListItem(currentList.value._id, taskToRemove.value.id);

  // Close modal and refresh
  showRemoveTaskModal.value = false;
  taskToRemove.value = null;
  await listsStore.fetchLists();
};

const handleClearAllTasks = () => {
  if (!currentList.value) return;
  showClearAllModal.value = true;
};

const handleClearAllConfirmed = async () => {
  if (!currentList.value) return;

  // Remove all items in parallel
  const itemIds = currentList.value.items.map(item => item.id);
  await Promise.all(
    itemIds.map(itemId => listsStore.removeListItem(currentList.value._id, itemId))
  );

  // Close modal and refresh
  showClearAllModal.value = false;
  await listsStore.fetchLists();
};

const handleCompleteTask = async (taskId) => {
  await tasksStore.completeTask(taskId);
};

const handleEditTask = (task) => {
  // Format the date for datetime-local input while preserving local timezone
  const taskDate = new Date(task.dueDate);
  const year = taskDate.getFullYear();
  const month = String(taskDate.getMonth() + 1).padStart(2, '0');
  const day = String(taskDate.getDate()).padStart(2, '0');
  const hours = String(taskDate.getHours()).padStart(2, '0');
  const minutes = String(taskDate.getMinutes()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

  editingTask.value = {
    _id: task._id,
    name: task.name,
    description: task.description,
    dueDate: formattedDate,
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

const handleSnoozeTask = (task) => {
  snoozeTaskId.value = task._id;
  snoozeTaskDueDate.value = new Date(task.dueDate); // Store original due date
  // Set default to current due date + 24 hours
  const currentDueDate = new Date(task.dueDate);
  currentDueDate.setHours(currentDueDate.getHours() + 24);
  const year = currentDueDate.getFullYear();
  const month = String(currentDueDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDueDate.getDate()).padStart(2, '0');
  const hours = String(currentDueDate.getHours()).padStart(2, '0');
  const minutes = String(currentDueDate.getMinutes()).padStart(2, '0');
  snoozeDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  showSnoozeModal.value = true;
};

const handleSnoozeTaskSubmit = async () => {
  const result = await tasksStore.snoozeTask(snoozeTaskId.value, snoozeDate.value);
  if (result) {
    showSnoozeModal.value = false;
  }
};

const quickSnooze = (days) => {
  // Use the original due date and add the specified number of days
  const date = new Date(snoozeTaskDueDate.value);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  snoozeDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin-bottom: var(--spacing-lg);
}

.modal-body p {
  margin-bottom: var(--spacing-sm);
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

/* Alert Styles */
.alert {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  border-left: 4px solid;
  font-family: var(--font-family-headings);
}

.alert-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: var(--spacing-md);
}

.alert-error {
  background-color: var(--color-error-light);
  border-color: var(--color-error);
  color: var(--color-error);
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
