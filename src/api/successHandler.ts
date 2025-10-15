import { ElNotification } from 'element-plus';

// Success notification helper
export const showSuccessNotification = (title: string, message?: string) => {
    ElNotification({
        title,
        message: message || 'Operation completed successfully',
        type: 'success',
        duration: 3000,
        position: 'top-right',
        showClose: true,
    });
};

// Success notification types for different operations
export const SuccessNotifications = {
    TASK_CREATED: () => showSuccessNotification(
        'Task Created Successfully',
        'Your new task has been created and saved.'
    ),

    TASK_UPDATED: () => showSuccessNotification(
        'Task Updated Successfully',
        'Your task has been updated and saved.'
    ),

    TASK_DELETED: () => showSuccessNotification(
        'Task Deleted Successfully',
        'The task has been removed.'
    ),

    USER_LOGGED_IN: () => showSuccessNotification(
        'Login Successful',
        'Welcome back! You have been logged in successfully.'
    ),

    USER_LOGGED_OUT: () => showSuccessNotification(
        'Logged Out',
        'You have been logged out successfully.'
    ),

    TASK_REASSIGNED: () => showSuccessNotification(
        'Task Reassigned',
        'The task has been reassigned successfully.'
    ),

    STATUS_UPDATED: () => showSuccessNotification(
        'Status Updated',
        'The task status has been updated successfully.'
    ),
};
