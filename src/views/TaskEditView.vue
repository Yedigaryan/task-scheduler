<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TaskForm from '../components/tasks/TaskForm.vue';
import { getTask, updateTask, reassignTask } from '../api/tasks';
import { SuccessNotifications } from '../api/successHandler';

const route = useRoute();
const router = useRouter();
const initial = ref<any | null>(null);
const originalAssigneeId = ref<number | null>(null);

onMounted(async () => {
  try {
    const task = await getTask(Number(route.params.id));
    originalAssigneeId.value = task.assignee?.id || null;
    initial.value = {
      title: task.title,
      description: task.description || '',
      assigneeId: task.assignee?.id,
      startAt: task.startAt?.slice(0, 16),
      endAt: task.endAt?.slice(0, 16),
      status: task.status,
    };
  } catch (error: any) {
    console.error('Failed to load task:', error);
    // Error handling is now done by the Axios interceptor
  }
});

async function onSubmit(values: any) {
  try {
    const { assigneeId, ...updateData } = values;
    
    // Update the task without assignee
    await updateTask(Number(route.params.id), updateData);
    
    // If assignee changed, reassign the task
    if (assigneeId && assigneeId !== originalAssigneeId.value) {
      await reassignTask(Number(route.params.id), assigneeId);
    }
    
    // Show success notification
    SuccessNotifications.TASK_UPDATED();
    router.push('/tasks');
  } catch (e: any) {
    // Error handling is now done by the Axios interceptor
    // We still need to re-throw to prevent navigation on error
    throw e;
  }
}
</script>

<template>
  <TaskForm
    v-if="initial"
    :initial="initial"
    @submit="onSubmit"
    :isReadOnly="route.meta.readonly"
  />
</template>

<style scoped>
</style>
