import http from './auth';

export type UserLite = { id: number; username: string; name: string };

export async function listUsers(): Promise<UserLite[]> {
    const { data } = await http.get('/users');
    return data;
}


