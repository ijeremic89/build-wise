import { apiClient } from './client';
import type { Expense, ExpenseRequest } from '../types';

export const expensesApi = {
    getAll: async (categoryId?: number): Promise<Expense[]> => {
        const { data } = await apiClient.get<Expense[]>('/expenses', {
            params: categoryId ? { categoryId } : undefined,
        });
        return data;
    },

    create: async (request: ExpenseRequest): Promise<Expense> => {
        const { data } = await apiClient.post<Expense>('/expenses', request);
        return data;
    },

    update: async (id: number, request: ExpenseRequest): Promise<Expense> => {
        const { data } = await apiClient.put<Expense>(`/expenses/${id}`, request);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/expenses/${id}`);
    },
};