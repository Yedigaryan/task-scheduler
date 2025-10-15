import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: (typeof localStorage !== 'undefined' && localStorage.getItem('access_token')) || null,
        username: null as string | null,
    }),
    getters: {
        isAuthenticated: (s) => !!s.token,
    },
    actions: {
        setToken(token: string) {
            this.token = token;
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('access_token', token);
            }
        },
        logout() {
            this.token = null;
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('access_token');
            }
        },
    },
});

import http from '../api/auth';

export async function login(username : string, password: string): Promise<unknown> {
    const { data } = await http.post('/auth/login', { username, password });
    return data; // { access_token }
}