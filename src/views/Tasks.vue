<template>
  <div class="tasks-page container">
    <div class="page-header">
      <div>
        <h1>Tasks</h1>
        <p class="text-muted">
          Manage your tasks with AI-powered priority scoring. Organize your tasks into to-do lists
          <router-link to="/lists" class="inline-link">here</router-link>.
        </p>
      </div>
      <button
        v-if="currentFilter === 'all' || currentFilter === 'active'"
        @click="openCreateModal"
        class="btn btn-primary create-task-btn"
      >
        <span class="btn-icon">+</span> Create Task
      </button>
    </div>

    <div v-if="tasksStore.error" class="alert alert-error">
      {{ tasksStore.error }}
    </div>

    <div class="tasks-filters">
      <button
        @click="currentFilter = 'all'"
        class="filter-btn"
        :class="{ active: currentFilter === 'all' }"
      >
        All Tasks ({{ tasksStore.tasks.length }})
      </button>
      <button
        @click="currentFilter = 'active'"
        class="filter-btn"
        :class="{ active: currentFilter === 'active' }"
      >
        Active ({{ tasksStore.prioritizedTasks.length }})
      </button>
      <button
        @click="currentFilter = 'completed'"
        class="filter-btn"
        :class="{ active: currentFilter === 'completed' }"
      >
        Completed ({{ tasksStore.completedTasks.length }})
      </button>
      <button
        @click="currentFilter = 'overdue'"
        class="filter-btn"
        :class="{ active: currentFilter === 'overdue' }"
      >
        Overdue ({{ tasksStore.overdueTasks.length }})
      </button>
    </div>

    <div v-if="tasksStore.loading" class="loading-state">
      <span class="loading"></span>
      <span>Loading tasks...</span>
    </div>

    <div v-else-if="filteredTasks.length === 0" class="empty-state card">
      <p v-if="currentFilter === 'completed'">No completed tasks yet.</p>
      <p v-else-if="currentFilter === 'overdue'">No overdue tasks. Great job staying on track!</p>
      <p v-else>No tasks found. Create your first task to get started!</p>
      <button
        v-if="currentFilter === 'all' || currentFilter === 'active'"
        @click="openCreateModal"
        class="btn btn-primary create-task-btn"
      >
        <span class="btn-icon">+</span> Create Task
      </button>
    </div>

    <div v-else class="tasks-list">
      <!-- Show sections for "All Tasks" filter -->
      <template v-if="currentFilter === 'all'">
        <div v-if="activeTasks.length > 0">
          <h2 class="section-header">Active Tasks</h2>
          <div class="tasks-section">
            <TaskCard
              v-for="(task, index) in activeTasks"
              :key="task._id"
              :task="task"
              :priority-rank="index + 1"
              @complete="handleCompleteTask"
              @edit="handleEditTask"
              @snooze="handleSnoozeTask"
            />
          </div>
        </div>

        <div v-if="completedTasksInAll.length > 0" :class="{ 'section-spacer': activeTasks.length > 0 }">
          <h2 class="section-header">Completed Tasks</h2>
          <div class="tasks-section">
            <TaskCard
              v-for="task in completedTasksInAll"
              :key="task._id"
              :task="task"
              :priority-rank="0"
              :show-priority="false"
              @complete="handleCompleteTask"
              @edit="handleEditTask"
              @snooze="handleSnoozeTask"
            />
          </div>
        </div>
      </template>

      <!-- For other filters, show regular list -->
      <template v-else>
        <TaskCard
          v-for="(task, index) in filteredTasks"
          :key="task._id"
          :task="task"
          :priority-rank="index + 1"
          :show-priority="currentFilter !== 'completed'"
          @complete="handleCompleteTask"
          @edit="handleEditTask"
          @snooze="handleSnoozeTask"
        />
      </template>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Create New Task</h2>
          <button @click="showCreateModal = false" class="close-btn">×</button>
        </div>

        <form @submit.prevent="handleCreateTask" class="task-form">
          <div class="form-group">
            <label for="taskName">Task Name *</label>
            <input
              id="taskName"
              v-model="newTask.name"
              type="text"
              placeholder="Enter task name"
              required
            />
          </div>

          <div class="form-group">
            <label for="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              v-model="newTask.description"
              rows="3"
              placeholder="Enter task description (helps AI determine priority)"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="taskDueDate">Due Date *</label>
            <input
              id="taskDueDate"
              v-model="newTask.dueDate"
              type="datetime-local"
              required
            />
          </div>

          <div class="form-group">
            <label>Add to Custom Lists (optional)</label>
            <div class="multi-select-container">
              <div
                v-for="list in customLists"
                :key="list._id"
                class="checkbox-item"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="list._id"
                    v-model="newTask.selectedLists"
                  />
                  <span>{{ list.name }}</span>
                </label>
              </div>
              <div v-if="customLists.length === 0" class="text-muted text-sm">
                No custom lists available. Tasks will be auto-added to Daily/Weekly/Monthly lists.
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="tasksStore.loading">
              <span v-if="tasksStore.loading" class="loading"></span>
              <span v-else>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Edit Task</h2>
          <button @click="showEditModal = false" class="close-btn">×</button>
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

          <div class="form-group">
            <label>Custom Lists</label>
            <div class="multi-select-container">
              <div
                v-for="list in customLists"
                :key="list._id"
                class="checkbox-item"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="list._id"
                    v-model="editingTask.selectedLists"
                  />
                  <span>{{ list.name }}</span>
                </label>
              </div>
              <div v-if="customLists.length === 0" class="text-muted text-sm">
                No custom lists available. Default lists (Daily/Weekly/Monthly) are auto-managed.
              </div>
            </div>
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
          <button @click="showSnoozeModal = false" class="close-btn">×</button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTasksStore } from '../stores/tasks';
import { useListsStore } from '../stores/lists';
import TaskCard from '../components/tasks/TaskCard.vue';

const tasksStore = useTasksStore();
const listsStore = useListsStore();

const currentFilter = ref('active');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showSnoozeModal = ref(false);

const newTask = ref({
  name: '',
  description: '',
  dueDate: '',
  selectedLists: [],
});

const editingTask = ref({
  _id: '',
  name: '',
  description: '',
  dueDate: '',
  inferredEffortHours: null,
  inferredImportance: null,
  inferredDifficulty: null,
  selectedLists: [],
  originalLists: [], // Track original lists for comparison
});

const snoozeTaskId = ref('');
const snoozeDate = ref('');

const filteredTasks = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return tasksStore.prioritizedTasks;
    case 'completed':
      return tasksStore.completedTasks;
    case 'overdue':
      return tasksStore.overdueTasks;
    default:
      return tasksStore.tasks;
  }
});

const activeTasks = computed(() => {
  return tasksStore.prioritizedTasks;
});

const completedTasksInAll = computed(() => {
  return tasksStore.completedTasks;
});

const customLists = computed(() => {
  // Filter out default lists (Daily/Weekly/Monthly To-dos)
  return listsStore.lists.filter(list =>
    !['Daily To-dos', 'Weekly To-dos', 'Monthly To-dos'].includes(list.name)
  );
});

const getDefaultDueDate = () => {
  const today = new Date();
  // Get the local date and set to 11:59 PM in local time
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T23:59`; // Format for datetime-local input
};

const openCreateModal = () => {
  newTask.value.dueDate = getDefaultDueDate();
  showCreateModal.value = true;
};

const handleCreateTask = async () => {
  const result = await tasksStore.createTask(
    newTask.value.name,
    newTask.value.description,
    newTask.value.dueDate
  );

  if (result) {
    const taskId = result; // result is already the task ID (string), not an object
    const taskDueDate = new Date(newTask.value.dueDate);

    // Auto-add to default Daily/Weekly/Monthly lists if applicable
    const defaultLists = listsStore.lists.filter(list =>
      ['Daily To-dos', 'Weekly To-dos', 'Monthly To-dos'].includes(list.name)
    );

    for (const list of defaultLists) {
      const listStart = new Date(list.startTime);
      const listEnd = new Date(list.endTime);

      // Check if task due date falls within the list's time range
      if (taskDueDate >= listStart && taskDueDate <= listEnd) {
        await listsStore.addListItem(list._id, taskId, newTask.value.dueDate);
      }
    }

    // Add task to selected custom lists
    if (newTask.value.selectedLists.length > 0) {
      for (const listId of newTask.value.selectedLists) {
        await listsStore.addListItem(listId, taskId, newTask.value.dueDate);
      }
    }

    // Refresh lists to ensure newly added items are in the store
    await listsStore.fetchLists();

    // Refresh tasks to ensure newly created task is in the store
    await tasksStore.fetchTasks();

    showCreateModal.value = false;
    newTask.value = { name: '', description: '', dueDate: '', selectedLists: [] };
  }
};

const handleEditTask = (task) => {
  // Find which custom lists contain this task
  const listsContainingTask = listsStore.lists
    .filter(list => !['Daily To-dos', 'Weekly To-dos', 'Monthly To-dos'].includes(list.name))
    .filter(list => list.items && list.items.some(item => item.taskId === task._id))
    .map(list => list._id);

  editingTask.value = {
    _id: task._id,
    name: task.name,
    description: task.description,
    dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
    inferredEffortHours: task.inferredEffortHours,
    inferredImportance: task.inferredImportance,
    inferredDifficulty: task.inferredDifficulty,
    selectedLists: [...listsContainingTask], // Current list membership
    originalLists: [...listsContainingTask], // Store original for comparison
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
    const taskId = editingTask.value._id;
    const originalLists = editingTask.value.originalLists;
    const selectedLists = editingTask.value.selectedLists;

    // Find lists to add (in selectedLists but not in originalLists)
    const listsToAdd = selectedLists.filter(listId => !originalLists.includes(listId));

    // Find lists to remove (in originalLists but not in selectedLists)
    const listsToRemove = originalLists.filter(listId => !selectedLists.includes(listId));

    // Add task to new lists
    for (const listId of listsToAdd) {
      await listsStore.addListItem(listId, taskId, editingTask.value.dueDate);
    }

    // Remove task from old lists
    for (const listId of listsToRemove) {
      await listsStore.removeListItem(listId, taskId);
    }

    // Refresh lists if any changes were made
    if (listsToAdd.length > 0 || listsToRemove.length > 0) {
      await listsStore.fetchLists();
    }

    showEditModal.value = false;
  }
};

const handleCompleteTask = async (taskId) => {
  await tasksStore.completeTask(taskId);
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
    tasksStore.fetchTasks(),
    listsStore.fetchLists(),
  ]);
});
</script>

<style scoped>
.tasks-page {
  max-width: 1000px;
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

.inline-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
}

.inline-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.create-task-btn .btn-icon {
  color: var(--color-white);
  filter: none;
}

.tasks-filters {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-white);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
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

.multi-select-container {
  max-height: 150px;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .modal-content {
    margin: var(--spacing-md);
  }
}
</style>
