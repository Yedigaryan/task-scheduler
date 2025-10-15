import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { ElNotification } from 'element-plus';

const http = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE,
    baseURL: 'http://localhost:3000',
});

// Request interceptor
http.interceptors.request.use((config) => {
    const auth = useAuthStore();
    if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
});

// Response interceptor for error handling
http.interceptors.response.use(
    (response) => {
        // Return successful responses as-is
        return response;
    },
    (error) => {
        // Handle all HTTP errors centrally
        const errorResponse = error?.response?.data;
        const statusCode = errorResponse?.statusCode || error?.response?.status;
        const errorMessage = errorResponse?.message || error?.message || 'An unexpected error occurred';

        let notificationType: 'error' | 'warning' | 'info' = 'error';
        let notificationTitle = 'Request Failed';

        // Determine notification type based on status code and error type
        switch (statusCode) {
            case 400:
                // Bad Request - usually validation or business logic errors
                if (errorMessage.includes('overlaps') || errorMessage.includes('conflict')) {
                    notificationType = 'warning';
                    notificationTitle = 'Task Scheduling Conflict';
                } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
                    notificationType = 'warning';
                    notificationTitle = 'Validation Error';
                } else {
                    notificationType = 'warning';
                    notificationTitle = 'Invalid Request';
                }
                break;
            case 401:
                // Unauthorized
                notificationType = 'error';
                notificationTitle = 'Authentication Required';
                // Clear auth token and redirect to login
                const auth = useAuthStore();
                auth.logout();
                break;
            case 403:
                // Forbidden
                notificationType = 'error';
                notificationTitle = 'Access Denied';
                break;
            case 404:
                // Not Found
                notificationType = 'warning';
                notificationTitle = 'Resource Not Found';
                break;
            case 409:
                // Conflict
                notificationType = 'warning';
                notificationTitle = 'Conflict Detected';
                break;
            case 422:
                // Unprocessable Entity
                notificationType = 'warning';
                notificationTitle = 'Validation Error';
                break;
            case 500:
                // Internal Server Error
                notificationType = 'error';
                notificationTitle = 'Server Error';
                break;
            default:
                // Network errors or other issues
                if (error?.code === 'NETWORK_ERROR' || !error?.response) {
                    notificationType = 'error';
                    notificationTitle = 'Network Error';
                } else {
                    notificationType = 'error';
                    notificationTitle = 'Unexpected Error';
                }
        }

        // Show appropriate notification
        ElNotification({
            title: notificationTitle,
            message: errorMessage,
            type: notificationType,
            duration: notificationType === 'warning' ? 6000 : 5000, // Warnings stay longer
            position: 'top-right',
            showClose: true,
        });

        // Return the error so components can still handle it if needed
        return Promise.reject(error);
    }
);

export default http;