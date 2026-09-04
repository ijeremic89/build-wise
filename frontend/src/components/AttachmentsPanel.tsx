import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, App as AntApp } from 'antd';
import { attachmentsApi } from '../api/attachments';
import type { Attachment, AttachmentOwnerType } from '../types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsPanel({ ownerType, ownerId }: { ownerType: AttachmentOwnerType; ownerId: number }) {
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryKey = ['attachments', ownerType, ownerId];

    const { data: attachments, isLoading } = useQuery({
        queryKey,
        queryFn: () => attachmentsApi.getFor(ownerType, ownerId),
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => attachmentsApi.upload(ownerType, ownerId, file),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
        onError: () => message.error('Greška pri dodavanju datoteke.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => attachmentsApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
        onError: () => message.error('Greška pri brisanju datoteke.'),
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            [...files].forEach((file) => {
                if (!ALLOWED_TYPES.includes(file.type)) {
                    message.error(`${file.name}: podržane su samo slike (JPG, PNG, GIF, WEBP) i PDF.`);
                    return;
                }
                uploadMutation.mutate(file);
            });
        }
        e.target.value = '';
    };

    const handleDelete = (attachment: Attachment) => {
        modal.confirm({
            title: 'Obriši datoteku',
            content: `Jesi li siguran da želiš obrisati "${attachment.fileName}"?`,
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteMutation.mutate(attachment.id),
        });
    };

    return (
        <div>
            <div className="nc-sub-title" style={{ marginTop: 24 }}>
                Datoteke
            </div>
            <div className="nc-table">
                {!isLoading && (attachments?.length ?? 0) === 0 && (
                    <div className="nc-row" style={{ color: 'var(--faint)' }}>
                        Nema priloženih datoteka.
                    </div>
                )}
                {attachments?.map((attachment) => (
                    <div className="nc-row" key={attachment.id}>
                        <a href={attachment.url} target="_blank" rel="noreferrer" className="nc-attachment-link">
                            {attachment.contentType.startsWith('image/') ? (
                                <img className="nc-attachment-thumb" src={attachment.url} alt="" />
                            ) : (
                                <span className="nc-attachment-thumb">
                                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <use href="#icon-file" />
                                    </svg>
                                </span>
                            )}
                            <span className="nc-attachment-name">{attachment.fileName}</span>
                        </a>
                        <span className="amt">{formatSize(attachment.fileSize)}</span>
                        <Button className="nc-btn nc-btn-danger nc-btn-icon" onClick={() => handleDelete(attachment)}>
                            Obriši
                        </Button>
                    </div>
                ))}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <Button
                className="nc-btn"
                style={{ marginTop: 12 }}
                onClick={() => fileInputRef.current?.click()}
                loading={uploadMutation.isPending}
            >
                + Dodaj datoteku
            </Button>
        </div>
    );
}
