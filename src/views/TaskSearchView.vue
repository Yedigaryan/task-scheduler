<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { searchTasks, listTasks, type Task, type TaskStatus } from '../api/tasks';
import { listUsers, type UserLite } from '../api/users';
import { Search, Refresh, User, Calendar, Clock, View, Edit } from '@element-plus/icons-vue';
import { useStyles } from '../composables/useStyles';

const styles = useStyles();

const router = useRouter();
const loading = ref(false);
const searchQuery = ref('');
const searchResults = ref<Task[]>([]);
const allTasks = ref<Task[]>([]);
const users = ref<UserLite[]>([]);
const selectedStatus = ref<TaskStatus | ''>('');
const selectedAssignee = ref<number | ''>('');
const dateRange = ref<[Date, Date] | null>(null);

// Computed properties
const filteredTasks = computed(() => {
  let filtered = searchResults.value.length > 0 ? searchResults.value : allTasks.value;
  
  if (selectedStatus.value) {
    filtered = filtered.filter(task => task.status === selectedStatus.value);
  }
  
  if (selectedAssignee.value) {
    filtered = filtered.filter(task => task.assignee.id === selectedAssignee.value);
  }
  
  if (dateRange.value) {
    const [startDate, endDate] = dateRange.value;
    filtered = filtered.filter(task => {
      const taskStart = new Date(task.startAt);
      const taskEnd = new Date(task.endAt);
      return taskStart >= startDate && taskEnd <= endDate;
    });
  }
  
  return filtered;
});

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' }
];

const assigneeOptions = computed(() => [
  { label: 'All Assignees', value: '' },
  ...users.value.map(user => ({
    label: `${user.name} (${user.username})`,
    value: user.id
  }))
]);

// Methods
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  try {
    loading.value = true;
    searchResults.value = await searchTasks(searchQuery.value.trim());
  } catch (error) {
    console.error('Search error:', error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  selectedStatus.value = '';
  selectedAssignee.value = '';
  dateRange.value = null;
};

const loadAllTasks = async () => {
  try {
    loading.value = true;
    allTasks.value = await listTasks();
  } catch (error) {
    console.error('Error loading tasks:', error);
  } finally {
    loading.value = false;
  }
};

const loadUsers = async () => {
  try {
    users.value = await listUsers();
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

const viewTask = (task: Task) => {
  router.push(`/tasks/${task.id}`);
};

const editTask = (task: Task) => {
  router.push(`/tasks/${task.id}/edit`);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'primary';
    case 'completed': return 'success';
    default: return 'info';
  }
};

const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    default: return status;
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([loadAllTasks(), loadUsers()]);
});
</script>

<template>
  <el-container class="search-container">
    <el-main class="search-main">
      <div class="search-wrapper">
        <!-- Header Section -->
        <el-card class="search-header-card" shadow="hover">
          <template #header>
            <div class="search-header">
              <h2 class="search-title">Task Search & Filter</h2>
              <p class="search-subtitle">Find and filter tasks by various criteria</p>
            </div>
</template>

          <!-- Search Bar -->
          <div class="search-bar-section">
            <div class="search-bar-container">
              <div class="search-input-wrapper">
                <el-input
                  v-model="searchQuery"
                  placeholder="Search tasks by title, description, or assignee..."
                  size="large"
                  clearable
                  @keyup.enter="performSearch"
                  @clear="performSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="search-buttons">
                <el-button 
                  type="primary" 
                  size="large" 
                  :loading="loading"
                  @click="performSearch"
                  class="search-button"
                >
                  <el-icon><Search /></el-icon>
                  Search
                </el-button>
                <el-button 
                  size="large" 
                  @click="clearSearch"
                  class="clear-button"
                >
                  <el-icon><Refresh /></el-icon>
                  Clear
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Filters Section -->
        <el-card class="filters-card" shadow="hover">
          <template #header>
            <div class="filters-header">
              <h3 class="filters-title">Filters</h3>
              <el-button 
                type="text" 
                @click="clearSearch"
                :disabled="!selectedStatus && !selectedAssignee && !dateRange"
              >
                Clear All Filters
              </el-button>
            </div>
          </template>
          
          <div class="filters-grid">
            <el-form-item label="Status">
              <el-select
                v-model="selectedStatus"
                placeholder="Filter by status"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Assignee">
              <el-select
                v-model="selectedAssignee"
                placeholder="Filter by assignee"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="option in assigneeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Date Range">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="to"
                start-placeholder="Start date"
                end-placeholder="End date"
                class="full-width"
                clearable
              />
            </el-form-item>
          </div>
        </el-card>

        <!-- Results Section -->
        <el-card class="results-card" shadow="hover">
          <template #header>
            <div class="results-header">
              <h3 class="results-title">Search Results</h3>
              <div class="results-tags">
                <el-tag v-if="searchQuery" type="info" size="small">
                  Search: "{{ searchQuery }}"
                </el-tag>
                <el-tag type="primary" size="small">
                  {{ filteredTasks.length }} task{{ filteredTasks.length !== 1 ? 's' : '' }} found
                </el-tag>
              </div>
            </div>
          </template>

          <!-- Loading State -->
          <div v-if="loading" class="loading-section">
            <el-skeleton :rows="5" animated />
          </div>

          <!-- Empty State -->
          <el-empty 
            v-else-if="filteredTasks.length === 0" 
            description="No tasks found"
            :image-size="120"
          >
            <template #description>
              <p>No tasks match your search criteria</p>
              <el-button type="primary" @click="clearSearch">
                Clear filters and try again
              </el-button>
            </template>
          </el-empty>

          <!-- Task Cards -->
          <div v-else class="task-cards-grid">
            <el-card 
              v-for="task in filteredTasks" 
              :key="task.id" 
              class="task-card"
              shadow="hover"
              @click="viewTask(task)"
            >
              <template #header>
                <div class="task-card-header">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <el-tag 
                    :type="getStatusColor(task.status)" 
                    size="small"
                    effect="light"
                  >
                    {{ getStatusText(task.status) }}
                  </el-tag>
                </div>
              </template>
              
              <div class="task-card-content">
                <p v-if="task.description" class="task-description">
                  {{ task.description }}
                </p>
                
                <div class="task-details">
                  <div class="task-detail-item">
                    <el-icon class="task-detail-icon"><User /></el-icon>
                    <span>{{ task.assignee.name }}</span>
                  </div>
                  <div class="task-detail-item">
                    <el-icon class="task-detail-icon"><Calendar /></el-icon>
                    <span>{{ formatDate(task.startAt) }}</span>
                  </div>
                  <div class="task-detail-item">
                    <el-icon class="task-detail-icon"><Clock /></el-icon>
                    <span>{{ formatDate(task.endAt) }}</span>
                  </div>
                </div>
              </div>
              
              <template #footer>
                <div class="task-card-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click.stop="viewTask(task)"
                    class="action-button"
                  >
                    <el-icon><View /></el-icon>
                    View
                  </el-button>
                  <el-button 
                    type="default" 
                    size="small" 
                    @click.stop="editTask(task)"
                    class="action-button"
                  >
                    <el-icon><Edit /></el-icon>
                    Edit
                  </el-button>
                </div>
              </template>
            </el-card>
          </div>
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.search-container {
  min-height: 100vh;
  background: v-bind('styles.gradients.primaryPurple');
}

.search-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.search-wrapper {
  width: 100%;
  max-width: 72rem;
  padding: 1.25rem;
}

.search-header-card,
.filters-card,
.results-card {
  border-radius: v-bind('styles.borderRadius.xxl');
  overflow: hidden;
  box-shadow: v-bind('styles.shadows.xxl');
  margin-bottom: 1.5rem;
}

.search-header {
  text-align: center;
  padding: 1.25rem 0;
}

.search-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: v-bind('styles.colors.primary');
  margin-bottom: 0.5rem;
}

.search-subtitle {
  color: v-bind('styles.colors.gray600');
}

.search-bar-section {
  padding: 1.25rem 0;
}

.search-bar-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 768px) {
  .search-bar-container {
    flex-direction: row;
  }
}

.search-input-wrapper {
  flex: 1;
  width: 100%;
}

.search-buttons {
  display: flex;
  gap: 0.5rem;
}

.search-button {
  min-width: 6rem;
  background: v-bind('styles.gradients.primaryPurple');
  border: none;
  border-radius: v-bind('styles.borderRadius.lg');
  font-weight: 600;
  transition: all 0.3s;
}

.search-button:hover {
  transform: translateY(-0.125rem);
  box-shadow: v-bind('styles.shadows.lg');
}

.clear-button {
  min-width: 6rem;
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

.results-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

@media (min-width: 768px) {
  .results-header {
    flex-direction: row;
    align-items: center;
  }
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('styles.colors.primary');
}

.results-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.loading-section {
  padding: 2.5rem 0;
}

.task-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.25rem 0;
}

@media (min-width: 768px) {
  .task-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .task-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.task-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: v-bind('styles.borderRadius.lg');
  animation: slideInUp 0.6s ease-out;
}

.task-card:hover {
  transform: translateY(-0.25rem);
  box-shadow: v-bind('styles.shadows.xl');
}

.task-card:nth-child(1) { animation-delay: 0.1s; }
.task-card:nth-child(2) { animation-delay: 0.2s; }
.task-card:nth-child(3) { animation-delay: 0.3s; }
.task-card:nth-child(4) { animation-delay: 0.4s; }
.task-card:nth-child(5) { animation-delay: 0.5s; }
.task-card:nth-child(6) { animation-delay: 0.6s; }

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.task-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('styles.colors.gray800');
  flex: 1;
  line-height: 1.25;
}

.task-card-content {
  padding: 1rem 0;
}

.task-description {
  color: v-bind('styles.colors.gray600');
  font-size: 0.875rem;
  line-height: 1.625;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: v-bind('styles.colors.gray600');
  font-size: 0.875rem;
}

.task-detail-icon {
  color: v-bind('styles.colors.primary');
}

.task-card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-button {
  min-width: 5rem;
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
