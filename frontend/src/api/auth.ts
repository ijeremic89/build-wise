import { apiClient } from './client';
import type { AuthUser, AuthRequest } from '../types';

export const authApi = {
    me: async (): Promise<AuthUser> => {
        const { data } = await apiClient.get<AuthUser>('/auth/me');
        return data;
    },

    login: async (request: AuthRequest): Promise<AuthUser> => {
        const { data } = await apiClient.post<AuthUser>('/auth/login', request);
        return data;
    },

    register: async (request: AuthRequest): Promise<AuthUser> => {
        const { data } = await apiClient.post<AuthUser>('/auth/register', request);
        return data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },
};
