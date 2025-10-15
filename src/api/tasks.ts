import http from './auth';
import type { UserLite } from './users';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type Task = {
    id: number;
    title: string;
    description?: string | null;
    status: TaskStatus;
    startAt: string; // ISO datetime string from backend
    endAt: string;   // ISO datetime string from backend
    assignee: UserLite;
    createdAt: string;
    updatedAt: string;
};

export type ListTasksParams = { status?: TaskStatus; assignee?: number };

export type CreateTaskPayload = {
    title: string;
    description?: string | null;
    status?: TaskStatus;
    startAt: string; // ISO datetime string
    endAt: string;   // ISO datetime string
    assigneeId: number;
};

export type UpdateTaskPayload = Partial<Omit<CreateTaskPayload, 'assigneeId'>> & { assigneeId?: number };

export async function listTasks(params: ListTasksParams = {}): Promise<Task[]> {
    const { data } = await http.get<Task[]>('/tasks', { params });
    return data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await http.post<Task>('/tasks', payload);
    return data;
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await http.put<Task>(`/tasks/${id}`, payload);
    return data;
}

export async function reassignTask(id: number, assigneeId: number): Promise<Task> {
    const { data } = await http.put<Task>(`/tasks/${id}/reassign`, { assigneeId });
    return data;
}

export async function deleteTask(id: number): Promise<{ success: boolean } | Task | void> {
    const { data } = await http.delete(`/tasks/${id}`);
    return data;
}

export async function searchTasks(q: string): Promise<Task[]> {
    const { data } = await http.get<Task[]>('/tasks/search', { params: { q } });
    console.log('data', data)
    return data;
}

export async function getTask(id: number): Promise<Task> {
    const { data } = await http.get<Task>(`/tasks/${id}`);
    return data;
}