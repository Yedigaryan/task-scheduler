<script setup lang="ts">
import TaskForm from '../components/tasks/TaskForm.vue';
import { createTask } from '../api/tasks';
import { useRouter } from 'vue-router';
import { SuccessNotifications } from '../api/successHandler';

const router = useRouter();

async function onSubmit(values: any) {
  try {
    await createTask(values);
    // Show success notification
    SuccessNotifications.TASK_CREATED();
    router.push('/tasks');
  } catch (e: any) {
    // Error handling is now done by the Axios interceptor
    // We still need to re-throw to prevent navigation on error
    throw e;
  }
}
</script>

<template>
  <TaskForm @submit="onSubmit" />
</template>

<style scoped>
</style>
