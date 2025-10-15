<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { ref, onMounted } from 'vue';
import { listUsers, type UserLite } from '../../api/users';
import { useStyles } from '../../composables/useStyles';

const styles = useStyles();

const emit = defineEmits(["submit", "cancel"]);
const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  isReadOnly: { type: Boolean, default: false },
});

const schema = yup.object({
  title: yup.string().required().max(255),
  description: yup.string().optional(),
  assigneeId: yup.number().required(),
  startAt: yup.string().required(), // ISO string
  endAt: yup.string().required(),
  status: yup.mixed().oneOf(["pending", "in_progress", "completed"]).optional(),
});

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    title: props.initial.title || "",
    description: props.initial.description || "",
    assigneeId: props.initial.assigneeId || null,
    startAt: props.initial.startAt || "",
    endAt: props.initial.endAt || "",
    status: props.initial.status || "pending",
  },
});

// Use useField for each form field to avoid readonly issues
const { value: title, errorMessage: titleError } = useField<string>('title');
const { value: description, errorMessage: descriptionError } = useField<string>('description');
const { value: assigneeId, errorMessage: assigneeIdError } = useField<number>('assigneeId');
const { value: startAt, errorMessage: startAtError } = useField<string>('startAt');
const { value: endAt, errorMessage: endAtError } = useField<string>('endAt');
const { value: status, errorMessage: statusError } = useField<string>('status');

const users = ref<UserLite[]>([]);
const loading = ref(false);

onMounted(async () => {
  try {
    users.value = await listUsers();
  } catch (error: any) {
    // Error handling is now done by the Axios interceptor
    console.error('Failed to load users:', error);
  }
});

const onSubmit = handleSubmit(async (vals) => {
  try {
    loading.value = true;
    await emit("submit", vals);
    // Success notification is handled by the parent component
  } catch (error: any) {
    console.error('Form submission error:', error);
    // Error handling is now done by the Axios interceptor
  } finally {
    loading.value = false;
  }
});

function formatDateTime(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
</script>

<template>
  <el-container class="task-form-container">
    <el-main class="task-form-main">
      <div class="task-form-wrapper">
        <el-card class="task-form-card" shadow="hover">
          <template #header>
            <div class="task-form-header">
              <h2 class="task-form-title">Task Details</h2>
            </div>
          </template>
          
          <el-form @submit.prevent="onSubmit" label-position="top" class="task-form">
            <el-form-item label="Title" :error="titleError" class="form-item">
              <el-input
                v-model="title"
                placeholder="Enter task title"
                :class="{ 'is-error': titleError }"
                :disabled="props.isReadOnly"
                clearable
              />
            </el-form-item>

            <el-form-item label="Description" :error="descriptionError" class="form-item">
              <el-input
                v-model="description"
                type="textarea"
                :rows="4"
                placeholder="Enter task description"
                :class="{ 'is-error': descriptionError }"
                :disabled="props.isReadOnly"
                clearable
              />
            </el-form-item>

            <el-form-item label="Assignee" :error="assigneeIdError" class="form-item">
              <el-select
                v-model="assigneeId"
                placeholder="Select assignee"
                :class="{ 'is-error': assigneeIdError }"
                :disabled="props.isReadOnly"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :label="`${user.name} (${user.username})`"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>

            <div class="date-grid">
              <template v-if="!props.isReadOnly">
                <el-form-item label="Start Date & Time" :error="startAtError">
                  <el-date-picker
                    v-model="startAt"
                    type="datetime"
                    placeholder="Select start date and time"
                    :class="{ 'is-error': startAtError }"
                    class="full-width"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                  />
                </el-form-item>
                <el-form-item label="End Date & Time" :error="endAtError">
                  <el-date-picker
                    v-model="endAt"
                    type="datetime"
                    placeholder="Select end date and time"
                    :class="{ 'is-error': endAtError }"
                    class="full-width"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                  />
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item label="Start Date & Time">
                  <div class="readonly-value">{{ formatDateTime(startAt) }}</div>
                </el-form-item>
                <el-form-item label="End Date & Time">
                  <div class="readonly-value">{{ formatDateTime(endAt) }}</div>
                </el-form-item>
              </template>
            </div>

            <el-form-item label="Status" :error="statusError" class="form-item">
              <el-select
                v-model="status"
                placeholder="Select status"
                :class="{ 'is-error': statusError }"
                :disabled="props.isReadOnly"
                class="full-width"
              >
                <el-option label="Pending" value="pending" />
                <el-option label="In Progress" value="in_progress" />
                <el-option label="Completed" value="completed" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="!props.isReadOnly">
              <div class="button-group">
                <el-button 
                  type="primary" 
                  native-type="submit" 
                  size="large" 
                  :loading="loading"
                  :disabled="titleError || descriptionError || assigneeIdError || startAtError || endAtError || statusError"
                  class="save-button"
                >
                  {{ loading ? 'Saving...' : 'Save Task' }}
                </el-button>
                <el-button 
                  size="large" 
                  @click="emit('cancel')"
                  class="cancel-button"
                >
                  Cancel
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>

<style scoped>
.task-form-container {
  min-height: 100vh;
  background: v-bind('styles.gradients.primaryPurple');
}

.task-form-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.task-form-wrapper {
  width: 100%;
  max-width: 64rem;
  padding: 1.25rem;
}

.task-form-card {
  border-radius: v-bind('styles.borderRadius.xxl');
  overflow: hidden;
  box-shadow: v-bind('styles.shadows.xxl');
}

.task-form-header {
  text-align: center;
  padding: 1.25rem 0;
}

.task-form-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: v-bind('styles.colors.primary');
  margin-bottom: 0.5rem;
}

.task-form {
  padding: 1.25rem 0;
}

.form-item {
  margin-bottom: 1.5rem;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .date-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.full-width {
  width: 100%;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.save-button {
  min-width: 8rem;
  background: v-bind('styles.gradients.primaryPurple');
  border: none;
  border-radius: v-bind('styles.borderRadius.lg');
  font-weight: 600;
  transition: all 0.3s;
}

.save-button:hover {
  transform: translateY(-0.125rem);
  box-shadow: v-bind('styles.shadows.lg');
}

.cancel-button {
  min-width: 8rem;
}

/* Custom styles for Element Plus components that need specific overrides */
.task-form .el-form-item__label {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.task-form .el-input.is-error .el-input__wrapper,
.task-form .el-select.is-error .el-select__wrapper {
  border-color: var(--el-color-danger);
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

.task-form .el-date-picker.is-error .el-input__wrapper {
  border-color: var(--el-color-danger);
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

/* Animation for form items */
.task-form .el-form-item {
  animation: slideInUp 0.6s ease-out;
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
