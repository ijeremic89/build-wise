import { apiClient } from './client';
import type { Contractor, ContractorRequest } from '../types';

export const contractorsApi = {
    getAll: async (): Promise<Contractor[]> => {
        const { data } = await apiClient.get<Contractor[]>('/contractors');
        return data;
    },

    create: async (request: ContractorRequest): Promise<Contractor> => {
        const { data } = await apiClient.post<Contractor>('/contractors', request);
        return data;
    },

    update: async (id: number, request: ContractorRequest): Promise<Contractor> => {
        const { data } = await apiClient.put<Contractor>(`/contractors/${id}`, request);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/contractors/${id}`);
    },
};
