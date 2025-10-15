import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const LoginView = () => import('../views/LoginView.vue');
const TasksListView = () => import('../views/TasksListView.vue');
const TaskCreateView = () => import('../views/TaskCreateView.vue');
const TaskEditView = () => import('../views/TaskEditView.vue');
const TaskSearchView = () => import('../views/TaskSearchView.vue');

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/login', name: 'login', component: LoginView },
        { path: '/', redirect: '/tasks' },
        { path: '/tasks', name: 'tasks', component: TasksListView, meta: { auth: true } },
        { path: '/tasks/new', name: 'task-create', component: TaskCreateView, meta: { auth: true } },
        { path: '/tasks/:id', name: 'task-view', component: TaskEditView, meta: { auth: true, readonly: true } },
        { path: '/tasks/:id/edit', name: 'task-edit', component: TaskEditView, meta: { auth: true } },
        { path: '/tasks/search', name: 'task-search', component: TaskSearchView, meta: { auth: true } },
    ],
});

router.beforeEach((to) => {
    const auth = useAuthStore();
    if (to.meta.auth && !auth.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }
});

export default router;