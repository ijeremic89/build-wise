package com.jere.build_wise.attachment;

import com.jere.build_wise.category.CategoryRepository;
import com.jere.build_wise.expanse.ExpenseRepository;
import com.jere.build_wise.subcategory.SubcategoryRepository;
import com.jere.build_wise.user.CurrentUser;
import com.jere.build_wise.user.User;
import com.jere.build_wise.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AttachmentService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"
    );

    private final AttachmentRepository attachmentRepository;
    private final AttachmentStorageService storageService;
    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public record Download(String fileName, String contentType, long fileSize, InputStream stream) {}

    public List<AttachmentDto> findFor(AttachmentOwnerType ownerType, Long ownerId) {
        assertOwnerBelongsToUser(ownerType, ownerId);
        return attachmentRepository
                .findByUserIdAndOwnerTypeAndOwnerIdOrderByIdAsc(currentUser.id(), ownerType, ownerId)
                .stream().map(AttachmentDto::from).toList();
    }

    public AttachmentDto upload(AttachmentOwnerType ownerType, Long ownerId, MultipartFile file) {
        assertOwnerBelongsToUser(ownerType, ownerId);

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Nepodržan tip datoteke: " + contentType);
        }
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Datoteka je prazna.");
        }

        User user = userRepository.getReferenceById(currentUser.id());
        String storedName = storageService.store(file, contentType);

        Attachment attachment = new Attachment();
        attachment.setUser(user);
        attachment.setOwnerType(ownerType);
        attachment.setOwnerId(ownerId);
        attachment.setFileName(displayFileName(file));
        attachment.setContentType(contentType);
        attachment.setFileSize(file.getSize());
        attachment.setStoragePath(storedName);

        return AttachmentDto.from(attachmentRepository.save(attachment));
    }

    public Download download(Long id) {
        Attachment attachment = findOwnedOrThrow(id);
        return new Download(
                attachment.getFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                storageService.read(attachment.getStoragePath())
        );
    }

    public void delete(Long id) {
        Attachment attachment = findOwnedOrThrow(id);
        storageService.delete(attachment.getStoragePath());
        attachmentRepository.delete(attachment);
    }

    private Attachment findOwnedOrThrow(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found: " + id));

        if (!attachment.getUser().getId().equals(currentUser.id())) {
            throw new EntityNotFoundException("Attachment not found: " + id);
        }
        return attachment;
    }

    private String displayFileName(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            return "datoteka";
        }
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        return slash >= 0 ? name.substring(slash + 1) : name;
    }

    private void assertOwnerBelongsToUser(AttachmentOwnerType ownerType, Long ownerId) {
        boolean exists = switch (ownerType) {
            case CATEGORY -> categoryRepository.findById(ownerId)
                    .map(c -> c.getUser().getId().equals(currentUser.id()))
                    .orElse(false);
            case SUBCATEGORY -> subcategoryRepository.findById(ownerId)
                    .map(s -> s.getCategory().getUser().getId().equals(currentUser.id()))
                    .orElse(false);
            case EXPENSE -> expenseRepository.findById(ownerId)
                    .map(e -> e.getUser().getId().equals(currentUser.id()))
                    .orElse(false);
        };
        if (!exists) {
            throw new EntityNotFoundException(ownerType + " not found: " + ownerId);
        }
    }
}
