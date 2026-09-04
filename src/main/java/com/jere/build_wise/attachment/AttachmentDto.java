package com.jere.build_wise.attachment;

import java.time.LocalDateTime;

public record AttachmentDto(
        Long id,
        AttachmentOwnerType ownerType,
        Long ownerId,
        String fileName,
        String contentType,
        long fileSize,
        LocalDateTime createdAt,
        String url
) {
    public static AttachmentDto from(Attachment a) {
        return new AttachmentDto(
                a.getId(),
                a.getOwnerType(),
                a.getOwnerId(),
                a.getFileName(),
                a.getContentType(),
                a.getFileSize(),
                a.getCreatedAt(),
                "/api/attachments/" + a.getId() + "/download"
        );
    }
}
