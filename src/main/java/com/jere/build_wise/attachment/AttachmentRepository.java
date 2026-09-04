package com.jere.build_wise.attachment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByUserIdAndOwnerTypeAndOwnerIdOrderByIdAsc(
            Long userId, AttachmentOwnerType ownerType, Long ownerId
    );
}
