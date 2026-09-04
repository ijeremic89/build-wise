import { apiClient } from './client';
import type { Attachment, AttachmentOwnerType } from '../types';

export const attachmentsApi = {
    getFor: async (ownerType: AttachmentOwnerType, ownerId: number): Promise<Attachment[]> => {
        const { data } = await apiClient.get<Attachment[]>('/attachments', {
            params: { ownerType, ownerId },
        });
        return data;
    },

    upload: async (ownerType: AttachmentOwnerType, ownerId: number, file: File): Promise<Attachment> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ownerType', ownerType);
        formData.append('ownerId', String(ownerId));

        const { data } = await apiClient.post<Attachment>('/attachments', formData, {
            // let the browser set the multipart boundary itself
            headers: { 'Content-Type': undefined },
        });
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/attachments/${id}`);
    },
};
