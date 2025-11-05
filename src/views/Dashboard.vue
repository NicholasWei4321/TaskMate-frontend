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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTasksStore } from '../stores/tasks';
import { useListsStore } from '../stores/lists';
import TaskCard from '../components/tasks/TaskCard.vue';

const tasksStore = useTasksStore();
const listsStore = useListsStore();

const topPriorityTasks = computed(() => {
  return tasksStore.prioritizedTasks.slice(0, 5);
});

const handleCompleteTask = async (taskId) => {
  await tasksStore.completeTask(taskId);
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
</style>
