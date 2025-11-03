<template>
  <div class="sync-page container">
    <div class="page-header">
      <div>
        <h1>External Assignment Sync</h1>
        <p class="text-muted">Connect and sync assignments from external platforms</p>
      </div>
      <button @click="showConnectModal = true" class="btn btn-primary">
        ➕ Connect Source
      </button>
    </div>

    <div v-if="syncStore.error" class="alert alert-error">
      {{ syncStore.error }}
    </div>

    <div v-if="syncStore.loading" class="loading-state">
      <span class="loading"></span>
      <span>Loading sources...</span>
    </div>

    <div v-else-if="syncStore.sources.length === 0" class="empty-state card">
      <div class="empty-icon">🔄</div>
      <h2>No Sources Connected</h2>
      <p class="text-muted">
        Connect external platforms like Canvas or GitHub to automatically import assignments
      </p>
      <button @click="showConnectModal = true" class="btn btn-primary">
        Connect Your First Source
      </button>
    </div>

    <div v-else class="sources-list">
      <div
        v-for="source in syncStore.sources"
        :key="source._id"
        class="source-card card"
      >
        <div class="source-header">
          <div class="source-info">
            <div class="source-icon">
              {{ getSourceIcon(source.sourceType) }}
            </div>
            <div>
              <h3>{{ source.sourceName }}</h3>
              <p class="text-sm text-muted">{{ source.sourceType }}</p>
            </div>
          </div>
          <span class="badge badge-success">Connected</span>
        </div>

        <div class="source-meta">
          <div class="meta-item">
            <span class="meta-label">Last Synced:</span>
            <span class="meta-value">
              {{ formatDate(source.lastSuccessfulPoll) || 'Never' }}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Base URL:</span>
            <span class="meta-value">{{ source.connectionDetails?.baseUrl || 'N/A' }}</span>
          </div>
        </div>

        <div class="source-actions">
          <button
            @click="handleSync(source._id)"
            class="btn btn-primary"
            :disabled="syncStore.syncing"
          >
            <span v-if="syncStore.syncing" class="loading"></span>
            <span v-else>🔄 Sync Now</span>
          </button>
          <button
            @click="confirmDisconnect(source._id)"
            class="btn btn-outline btn-danger"
            :disabled="syncStore.syncing"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>

    <!-- Connect Source Modal -->
    <div v-if="showConnectModal" class="modal-overlay" @click="showConnectModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Connect External Source</h2>
          <button @click="showConnectModal = false" class="close-btn">✕</button>
        </div>

        <form @submit.prevent="handleConnect" class="connect-form">
          <div class="form-group">
            <label for="sourceType">Platform *</label>
            <select id="sourceType" v-model="newSource.sourceType" required>
              <option value="">Select a platform...</option>
              <option value="Canvas">Canvas LMS</option>
              <option value="GitHub">GitHub Classroom</option>
              <option value="Gradescope">Gradescope</option>
            </select>
          </div>

          <div class="form-group">
            <label for="sourceName">Display Name *</label>
            <input
              id="sourceName"
              v-model="newSource.sourceName"
              type="text"
              placeholder="e.g., 6.104 Canvas"
              required
            />
          </div>

          <div class="form-group">
            <label for="baseUrl">Base URL *</label>
            <input
              id="baseUrl"
              v-model="newSource.details.baseUrl"
              type="url"
              placeholder="https://canvas.instructure.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="apiToken">API Token *</label>
            <input
              id="apiToken"
              v-model="newSource.details.apiToken"
              type="password"
              placeholder="Enter your API token"
              required
            />
            <p class="text-sm text-muted">
              Find your API token in your platform's settings
            </p>
          </div>

          <div class="help-section">
            <details>
              <summary class="text-sm">How to get Canvas API token?</summary>
              <div class="help-content text-sm text-muted">
                <ol>
                  <li>Log into your Canvas account</li>
                  <li>Go to Account → Settings</li>
                  <li>Scroll to "Approved Integrations"</li>
                  <li>Click "+ New Access Token"</li>
                  <li>Set purpose and expiry, then generate</li>
                  <li>Copy the token and paste it above</li>
                </ol>
              </div>
            </details>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showConnectModal = false" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="syncStore.loading">
              <span v-if="syncStore.loading" class="loading"></span>
              <span v-else>Connect</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sync Progress Modal -->
    <div v-if="syncStore.syncing" class="modal-overlay">
      <div class="modal-content card sync-progress">
        <div class="sync-animation">
          <div class="sync-icon loading"></div>
        </div>
        <h2 class="text-center">Syncing Assignments...</h2>
        <p class="text-center text-muted">
          Please wait while we fetch and import your assignments
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSyncStore } from '../stores/sync';

const syncStore = useSyncStore();

const showConnectModal = ref(false);

const newSource = ref({
  sourceType: '',
  sourceName: '',
  details: {
    baseUrl: '',
    apiToken: '',
  },
});

const getSourceIcon = (sourceType) => {
  const icons = {
    Canvas: '📚',
    GitHub: '💻',
    Gradescope: '📝',
  };
  return icons[sourceType] || '🔗';
};

const formatDate = (date) => {
  if (!date) return 'Never';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const handleConnect = async () => {
  const result = await syncStore.connectSource(
    newSource.value.sourceType,
    newSource.value.sourceName,
    newSource.value.details
  );

  if (result) {
    showConnectModal.value = false;
    newSource.value = {
      sourceType: '',
      sourceName: '',
      details: {
        baseUrl: '',
        apiToken: '',
      },
    };
  }
};

const handleSync = async (sourceId) => {
  const success = await syncStore.syncSource(sourceId);
  if (success) {
    alert('Sync completed successfully!');
  }
};

const confirmDisconnect = async (sourceId) => {
  if (confirm('Are you sure you want to disconnect this source? All synced assignment mappings will be removed.')) {
    await syncStore.disconnectSource(sourceId);
  }
};

onMounted(async () => {
  await syncStore.fetchSources();
});
</script>

<style scoped>
.sync-page {
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
  padding: var(--spacing-3xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.empty-state h2 {
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-xl);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.source-card {
  border-left: 4px solid var(--color-success);
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.source-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.source-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-success-light);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-2xl);
}

.source-info h3 {
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-lg);
}

.source-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.meta-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.meta-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.source-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
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

.connect-form {
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

.help-section {
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.help-section summary {
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.help-content {
  margin-top: var(--spacing-md);
}

.help-content ol {
  margin-left: var(--spacing-lg);
  line-height: var(--line-height-relaxed);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.sync-progress {
  text-align: center;
}

.sync-animation {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.sync-icon {
  width: 4rem;
  height: 4rem;
  border-width: 4px;
}

.btn-danger {
  color: var(--color-error);
  border-color: var(--color-error);
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-error-light);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .source-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .source-actions {
    width: 100%;
  }

  .source-actions button {
    flex: 1;
  }
}
</style>
