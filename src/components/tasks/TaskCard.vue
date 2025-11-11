<template>
  <div class="task-card card" :class="{ 'task-overdue': task.overdue && !task.completed }">
    <div class="task-header">
      <div class="task-info">
        <h3 class="task-name">{{ task.name }}</h3>
        <p v-if="task.description" class="task-description text-muted">
          {{ task.description }}
        </p>
      </div>
      <div v-if="showPriority" class="task-priority">
        <span v-if="task.overdue && !task.completed" class="priority-badge badge badge-error">
          Overdue
        </span>
        <span v-else class="priority-badge badge" :class="priorityClass">
          Priority #{{ priorityRank }}
        </span>
      </div>
    </div>

    <div class="task-meta">
      <div class="meta-item">
        <span class="meta-label">Due:</span>
        <span class="meta-value" :class="{ 'text-error': task.overdue && !task.completed }">
          {{ formatDate(task.dueDate) }}
        </span>
      </div>

      <div v-if="task.inferredEffortHours" class="meta-item">
        <span class="meta-label">Effort:</span>
        <span class="meta-value">{{ task.inferredEffortHours }}h</span>
      </div>

      <div v-if="task.inferredImportance" class="meta-item">
        <span class="meta-label">Importance:</span>
        <span class="meta-value">{{ task.inferredImportance }}/10</span>
      </div>

      <div v-if="task.inferredDifficulty" class="meta-item">
        <span class="meta-label">Difficulty:</span>
        <span class="meta-value">{{ task.inferredDifficulty }}/10</span>
      </div>
    </div>

    <div v-if="!task.completed" class="task-actions">
      <button
        @click="$emit('complete', task._id)"
        class="btn btn-sm btn-success"
      >
        Complete
      </button>
      <button
        @click="$emit('edit', task)"
        class="btn btn-sm btn-outline"
      >
        Edit
      </button>
      <button
        @click="$emit('snooze', task)"
        class="btn btn-sm btn-outline"
      >
        Snooze
      </button>
      <slot name="extra-actions"></slot>
    </div>
    <div v-else class="task-actions">
      <span class="badge badge-success">✓ Completed</span>
      <slot name="extra-actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  priorityRank: {
    type: Number,
    default: 0,
  },
  showPriority: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['complete', 'edit', 'snooze']);

const priorityClass = computed(() => {
  if (props.task.priorityScore > 500) return 'badge-error';
  if (props.task.priorityScore > 300) return 'badge-warning';
  return 'badge-primary';
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.task-card {
  position: relative;
  transition: all var(--transition-fast);
  border-left: 4px solid var(--color-primary);
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.task-card.task-overdue {
  border-left-color: var(--color-error);
  background-color: var(--color-error-light);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.task-description {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin-bottom: 0;
}

.task-priority {
  flex-shrink: 0;
}

.priority-badge {
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: #e8f0f5;
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

.task-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.task-completed-badge {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.text-error {
  color: var(--color-error);
  font-weight: var(--font-weight-semibold);
}
</style>
