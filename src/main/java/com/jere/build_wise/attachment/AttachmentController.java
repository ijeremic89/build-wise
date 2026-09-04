package com.jere.build_wise.attachment;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping
    public List<AttachmentDto> findFor(
            @RequestParam AttachmentOwnerType ownerType,
            @RequestParam Long ownerId
    ) {
        return attachmentService.findFor(ownerType, ownerId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentDto upload(
            @RequestParam AttachmentOwnerType ownerType,
            @RequestParam Long ownerId,
            @RequestParam MultipartFile file
    ) {
        return attachmentService.upload(ownerType, ownerId, file);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable Long id) {
        AttachmentService.Download download = attachmentService.download(id);
        InputStreamResource resource = new InputStreamResource(download.stream());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(download.fileName()).build().toString())
                .contentLength(download.fileSize())
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        attachmentService.delete(id);
    }
}
