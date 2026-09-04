import { apiClient } from './client';
import type { ProjectSettings, ProjectSettingsRequest } from '../types';

export const settingsApi = {
    get: async (): Promise<ProjectSettings> => {
        const { data } = await apiClient.get<ProjectSettings>('/settings');
        return data;
    },

    update: async (request: ProjectSettingsRequest): Promise<ProjectSettings> => {
        const { data } = await apiClient.put<ProjectSettings>('/settings', request);
        return data;
    },
};
