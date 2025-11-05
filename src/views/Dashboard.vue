<template>
  <div class="dashboard container">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="text-muted">Welcome back! Here's your task overview</p>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card card">
        <div class="stat-icon" style="background-color: var(--color-primary-lighter);">
          <span style="color: var(--color-primary);">📋</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ tasksStore.prioritizedTasks.length }}</div>
          <div class="stat-label">Active Tasks</div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon" style="background-color: var(--color-warning-light);">
          <span style="color: var(--color-warning);">⚠️</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ tasksStore.overdueTasks.length }}</div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon" style="background-color: var(--color-success-light);">
          <span style="color: var(--color-success);">✓</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ tasksStore.completedTasks.length }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>

      <div class="stat-card card">
        <div class="stat-icon" style="background-color: var(--color-secondary-light); opacity: 0.3;">
          <span style="color: var(--color-secondary);">📂</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ listsStore.activeLists.length }}</div>
          <div class="stat-label">Active Lists</div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="priority-tasks">
        <div class="section-header">
          <h2>Top Priority Tasks</h2>
          <router-link to="/tasks" class="btn btn-sm btn-outline">View All</router-link>
        </div>

        <div v-if="tasksStore.loading" class="loading-state">
          <span class="loading"></span>
          <span>Loading tasks...</span>
        </div>

        <div v-else-if="tasksStore.prioritizedTasks.length === 0" class="empty-state card">
          <p>No active tasks. Create your first task to get started!</p>
          <router-link to="/tasks" class="btn btn-primary">Create Task</router-link>
        </div>

        <div v-else class="task-list">
          <TaskCard
            v-for="(task, index) in topPriorityTasks"
            :key="task._id"
            :task="task"
            :priority-rank="index + 1"
            @complete="handleCompleteTask"
            @edit="handleEditTask"
            @snooze="handleSnoozeTask"
          />
        </div>
      </div>

      <div class="recent-activity">
        <div class="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div class="quick-actions card">
          <router-link to="/tasks" class="quick-action-item">
            <span class="action-icon">➕</span>
            <div class="action-content">
              <div class="action-title">Create Task</div>
              <div class="action-description text-sm text-muted">Add a new AI-prioritized task</div>
            </div>
          </router-link>

          <router-link to="/lists" class="quick-action-item">
            <span class="action-icon">📝</span>
            <div class="action-content">
              <div class="action-title">Manage Lists</div>
              <div class="action-description text-sm text-muted">Organize tasks into lists</div>
            </div>
          </router-link>

          <router-link to="/sync" class="quick-action-item">
            <span class="action-icon">🔄</span>
            <div class="action-content">
              <div class="action-title">Sync Assignments</div>
              <div class="action-description text-sm text-muted">Import from Canvas or GitHub</div>
            </div>
          </router-link>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTasksStore } from '../stores/tasks';
import { useListsStore } from '../stores/lists';
import TaskCard from '../components/tasks/TaskCard.vue';

const router = useRouter();
const tasksStore = useTasksStore();
const listsStore = useListsStore();

const showEditModal = ref(false);
const showSnoozeModal = ref(false);

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

const topPriorityTasks = computed(() => {
  return tasksStore.prioritizedTasks.slice(0, 5);
});

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
    tasksStore.fetchTasks(),
    listsStore.fetchActiveLists(),
  ]);
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: var(--spacing-xl);
}

.dashboard-header h1 {
  margin-bottom: var(--spacing-sm);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.section-header h2 {
  margin-bottom: 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--color-border);
}

.quick-action-item:last-child {
  border-bottom: none;
}

.quick-action-item:hover {
  background-color: var(--color-bg-secondary);
}

.action-icon {
  font-size: var(--font-size-2xl);
}

.action-content {
  flex: 1;
}

.action-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
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
</style>
