<script setup lang="ts">
import { computed, ref, watchEffect, watch } from 'vue';
import { listTasks, searchTasks, updateTask, type Task, type TaskStatus } from '../api/tasks';
import { listUsers, type UserLite } from '../api/users';
import { Search, User, Loading, Document } from '@element-plus/icons-vue';
import { useStyles } from '../composables/useStyles';
import draggable from 'vuedraggable';

const styles = useStyles();


const q = ref('');
const status = ref<TaskStatus | ''>('');
const assignee = ref<number | ''>('');
const users = ref<UserLite[]>([]);
const tasks = ref<Task[]>([]);
const loading = ref(false);

// Computed properties for filtered tasks
const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'));
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress'));
const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'));

// Draggable lists (must be mutable arrays)
const colPending = ref<Task[]>([]);
const colInProgress = ref<Task[]>([]);
const colCompleted = ref<Task[]>([]);

function syncColumns() {
  // Apply the same filter logic used for display
  const p = pendingTasks.value;
  const i = inProgressTasks.value;
  const c = completedTasks.value;
  colPending.value = [...p];
  colInProgress.value = [...i];
  colCompleted.value = [...c];
}

// Draggable shared group config to allow cross-column dropping even when lists are non-empty
const dndGroup = { name: 'tasks-group', pull: true, put: true } as const;

function onMove() {
  // Allow all moves; validation is handled post-drop in onDragChange
  return true;
}

async function onDragChange(targetStatus: TaskStatus, evt: any) {
  // evt contains information about added/removed/moved
  if (!evt || !evt.added) {
    return;
  }
  const movedTask: Task = evt.added.element;
  if (!movedTask || movedTask.status === targetStatus) return;
  try {
    // optimistic update: reflect status in master tasks
    const idx = tasks.value.findIndex(t => t.id === movedTask.id);
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], status: targetStatus } as Task;
    await updateTask(movedTask.id, { status: targetStatus });
  } catch (error) {
    // revert by re-fetching to avoid state drift
    await fetchTasks();
  }
}

async function fetchUsers() {
  try {
    users.value = await listUsers();
  } catch (error: any) {
    console.error('Failed to load users:', error);
    // Error handling is done by Axios interceptor
  }
}

async function fetchTasks() {
  try {
    loading.value = true;
    if (q.value && q.value.trim().length > 0) {
      tasks.value = await searchTasks(q.value.trim());
    } else {
      // Convert empty strings to undefined for proper API calls
      const statusParam = status.value === '' ? undefined : status.value as TaskStatus;
      const assigneeParam = assignee.value === '' ? undefined : assignee.value as number;

      tasks.value = await listTasks({
        status: statusParam,
        assignee: assigneeParam
      });
    }
  } catch (error: any) {
    console.error('Failed to load tasks:', error);
    // Error handling is done by Axios interceptor
  } finally {
    loading.value = false;
    syncColumns();
  }
}

void fetchUsers();
</script>

<template>
  <el-container class="task-board-container">
    <el-main class="task-board-main">
      <div class="task-board-wrapper">
        <!-- Header Section -->
        <el-card class="task-board-header-card" shadow="hover">
          <template #header>
            <div class="task-board-header">
              <h1 class="task-board-title">Task Board</h1>
              <p class="task-board-subtitle">Manage and track your tasks efficiently</p>
            </div>
          </template>
        </el-card>

        <!-- Filters Section -->
        <el-card class="filters-card" shadow="hover">
          <template #header>
            <div class="filters-header">
              <h3 class="filters-title">Filters & Search</h3>
            </div>
          </template>

          <div class="filters-grid">
            <el-form-item label="Search Tasks">
              <el-input v-model="q" placeholder="Search by title or description..." clearable @input="fetchTasks"
                class="full-width">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Status Filter">
              <el-select v-model="status" placeholder="All statuses" clearable @change="fetchTasks" class="full-width">
                <el-option label="All statuses" value="" />
                <el-option label="Pending" value="pending" />
                <el-option label="In Progress" value="in_progress" />
                <el-option label="Completed" value="completed" />
              </el-select>
            </el-form-item>

            <el-form-item label="Assignee Filter">
              <el-select v-model="assignee" placeholder="All assignees" clearable @change="fetchTasks"
                class="full-width">
                <el-option label="All assignees" value="" />
                <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
              </el-select>
            </el-form-item>
          </div>
        </el-card>

        <!-- Task Board -->
        <div class="task-board-columns">
          <!-- Pending Column -->
          <el-card class="task-column" shadow="hover">
            <template #header>
              <div class="column-header">
                <h3 class="column-title pending">Pending</h3>
                <el-tag type="warning" size="small">{{ colPending.length }}</el-tag>
              </div>
            </template>

            <div v-if="loading" class="loading-section">
              <el-icon class="loading-icon">
                <Loading />
              </el-icon>
              <p class="loading-text">Loading tasks...</p>
            </div>

            <div v-else>
              <draggable v-model="colPending" item-key="id" :group="dndGroup" :ghost-class="'drag-ghost'"
                :animation="150" :move="onMove" @change="(evt: any) => onDragChange('pending', evt)" class="task-cards">
                <template #item="{ element }">
                  <div class="task-card pending-card">
                    <h4 class="task-title">{{ element.title }}</h4>
                    <p v-if="element.description" class="task-description">{{ element.description }}</p>
                    <div class="task-details">
                      <div class="task-detail-item">
                        <el-icon class="task-detail-icon">
                          <User />
                        </el-icon>
                        <span>{{ element.assignee?.name || 'Unassigned' }}</span>
                      </div>
                      <div class="task-detail-item">
                        <span>{{ new Date(element.startAt).toLocaleDateString() }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </el-card>

          <!-- In Progress Column -->
          <el-card class="task-column" shadow="hover">
            <template #header>
              <div class="column-header">
                <h3 class="column-title in-progress">In Progress</h3>
                <el-tag type="primary" size="small">{{ colInProgress.length }}</el-tag>
              </div>
            </template>

            <div v-if="loading" class="loading-section">
              <el-icon class="loading-icon">
                <Loading />
              </el-icon>
              <p class="loading-text">Loading tasks...</p>
            </div>

            <div v-else>
              <draggable v-model="colInProgress" item-key="id" :group="dndGroup" :ghost-class="'drag-ghost'"
                :animation="150" :move="onMove" @change="(evt: any) => onDragChange('in_progress', evt)"
                class="task-cards">
                <template #item="{ element }">
                  <div class="task-card in-progress-card">
                    <h4 class="task-title">{{ element.title }}</h4>
                    <p v-if="element.description" class="task-description">{{ element.description }}</p>
                    <div class="task-details">
                      <div class="task-detail-item">
                        <el-icon class="task-detail-icon">
                          <User />
                        </el-icon>
                        <span>{{ element.assignee?.name || 'Unassigned' }}</span>
                      </div>
                      <div class="task-detail-item">
                        <span>{{ new Date(element.startAt).toLocaleDateString() }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </el-card>

          <!-- Completed Column -->
          <el-card class="task-column" shadow="hover">
            <template #header>
              <div class="column-header">
                <h3 class="column-title completed">Completed</h3>
                <el-tag type="success" size="small">{{ colCompleted.length }}</el-tag>
              </div>
            </template>

            <div v-if="loading" class="loading-section">
              <el-icon class="loading-icon">
                <Loading />
              </el-icon>
              <p class="loading-text">Loading tasks...</p>
            </div>

            <draggable v-else v-model="colCompleted" item-key="id" :group="dndGroup" :ghost-class="'drag-ghost'"
              :animation="150" :move="onMove" @change="(evt: any) => onDragChange('completed', evt)" class="task-cards">
              <template #item="{ element }">
                <div class="task-card completed-card">
                  <h4 class="task-title">{{ element.title }}</h4>
                  <p v-if="element.description" class="task-description">{{ element.description }}</p>
                  <div class="task-details">
                    <div class="task-detail-item">
                      <el-icon class="task-detail-icon">
                        <User />
                      </el-icon>
                      <span>{{ element.assignee?.name || 'Unassigned' }}</span>
                    </div>
                    <div class="task-detail-item">
                      <span>{{ new Date(element.endAt).toLocaleDateString() }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </el-card>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.task-board-container {
  min-height: 100vh;
  background: v-bind('styles.gradients.primaryPurple');
}

.task-board-main {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.25rem;
}

.task-board-wrapper {
  width: 100%;
  max-width: 80rem;
  padding: 1.25rem;
}

.task-board-header-card,
.filters-card {
  border-radius: v-bind('styles.borderRadius.xxl');
  overflow: hidden;
  box-shadow: v-bind('styles.shadows.xxl');
  margin-bottom: 1.5rem;
}

.task-board-header {
  text-align: center;
  padding: 1.25rem 0;
}

.task-board-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: v-bind('styles.colors.primary');
  margin-bottom: 0.5rem;
}

.task-board-subtitle {
  color: v-bind('styles.colors.gray600');
  font-size: 1.125rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('styles.colors.primary');
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.full-width {
  width: 100%;
}

.task-board-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .task-board-columns {
    grid-template-columns: repeat(3, 1fr);
  }
}

.task-column {
  border-radius: v-bind('styles.borderRadius.lg');
  overflow: hidden;
  box-shadow: v-bind('styles.shadows.lg');
  transition: all 0.3s;
}

.task-column:hover {
  box-shadow: v-bind('styles.shadows.xl');
  transform: translateY(-0.125rem);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.column-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.column-title.pending {
  color: #f59e0b;
}

.column-title.in-progress {
  color: #3b82f6;
}

.column-title.completed {
  color: #10b981;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-icon {
  font-size: 2.5rem;
  color: v-bind('styles.colors.primary');
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 0.75rem;
  color: v-bind('styles.colors.gray600');
  font-size: 0.875rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.drag-ghost {
  opacity: 0.6;
}

.task-card {
  border-radius: v-bind('styles.borderRadius.lg');
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  animation: slideInUp 0.6s ease-out;
}

.task-card:hover {
  transform: translateY(-0.125rem);
  box-shadow: v-bind('styles.shadows.md');
}

.task-card:nth-child(1) {
  animation-delay: 0.1s;
}

.task-card:nth-child(2) {
  animation-delay: 0.2s;
}

.task-card:nth-child(3) {
  animation-delay: 0.3s;
}

.task-card:nth-child(4) {
  animation-delay: 0.4s;
}

.task-card:nth-child(5) {
  animation-delay: 0.5s;
}

.task-card:nth-child(6) {
  animation-delay: 0.6s;
}

.pending-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
}

.in-progress-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #3b82f6;
}

.completed-card {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: v-bind('styles.colors.gray800');
  margin: 0 0 0.5rem 0;
  line-height: 1.25;
}

.task-description {
  color: v-bind('styles.colors.gray600');
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.task-detail-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: v-bind('styles.colors.gray600');
  font-size: 0.75rem;
}

.task-detail-icon {
  color: v-bind('styles.colors.primary');
  font-size: 0.875rem;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
