import { apiClient } from './client';
import type { TodoItem, TodoItemRequest } from '../types';

export const todosApi = {
    getAll: async (): Promise<TodoItem[]> => {
        const { data } = await apiClient.get<TodoItem[]>('/todos');
        return data;
    },

    create: async (request: TodoItemRequest): Promise<TodoItem> => {
        const { data } = await apiClient.post<TodoItem>('/todos', request);
        return data;
    },

    update: async (id: number, request: TodoItemRequest): Promise<TodoItem> => {
        const { data } = await apiClient.put<TodoItem>(`/todos/${id}`, request);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/todos/${id}`);
    },
};
