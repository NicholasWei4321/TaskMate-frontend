<template>
  <div class="tasks-page container">
    <div class="page-header">
      <div>
        <h1>AI Prioritized Tasks</h1>
        <p class="text-muted">Manage your tasks with AI-powered priority scoring</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        ➕ Create Task
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
      <p>No tasks found. Create your first task to get started!</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Create Task
      </button>
    </div>

    <div v-else class="tasks-list">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task._id"
        :task="task"
        @complete="handleCompleteTask"
        @edit="handleEditTask"
        @snooze="handleSnoozeTask"
      />
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Create New Task</h2>
          <button @click="showCreateModal = false" class="close-btn">✕</button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTasksStore } from '../stores/tasks';
import TaskCard from '../components/tasks/TaskCard.vue';

const tasksStore = useTasksStore();

const currentFilter = ref('active');
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showSnoozeModal = ref(false);

const newTask = ref({
  name: '',
  description: '',
  dueDate: '',
});

const editingTask = ref({
  _id: '',
  name: '',
  description: '',
  dueDate: '',
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

const handleCreateTask = async () => {
  const result = await tasksStore.createTask(
    newTask.value.name,
    newTask.value.description,
    newTask.value.dueDate
  );

  if (result) {
    showCreateModal.value = false;
    newTask.value = { name: '', description: '', dueDate: '' };
  }
};

const handleEditTask = (task) => {
  editingTask.value = {
    _id: task._id,
    name: task.name,
    description: task.description,
    dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
  };
  showEditModal.value = true;
};

const handleUpdateTask = async () => {
  const result = await tasksStore.updateTask(
    editingTask.value._id,
    editingTask.value.name,
    editingTask.value.description,
    editingTask.value.dueDate
  );

  if (result) {
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
  await tasksStore.fetchTasks();
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
