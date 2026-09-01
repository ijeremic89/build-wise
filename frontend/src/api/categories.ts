import { apiClient } from './client';
import type { Category, CategoryRequest, Subcategory, SubcategoryRequest } from '../types';

export const categoriesApi = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await apiClient.get<Category[]>('/categories');
        return data;
    },

    create: async (request: CategoryRequest): Promise<Category> => {
        const { data } = await apiClient.post<Category>('/categories', request);
        return data;
    },

    update: async (id: number, request: CategoryRequest): Promise<Category> => {
        const { data } = await apiClient.put<Category>(`/categories/${id}`, request);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/categories/${id}`);
    },
};

export const subcategoriesApi = {
    create: async (request: SubcategoryRequest): Promise<Subcategory> => {
        const { data } = await apiClient.post<Subcategory>('/subcategories', request);
        return data;
    },

    update: async (id: number, request: SubcategoryRequest): Promise<Subcategory> => {
        const { data } = await apiClient.put<Subcategory>(`/subcategories/${id}`, request);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/subcategories/${id}`);
    },
};