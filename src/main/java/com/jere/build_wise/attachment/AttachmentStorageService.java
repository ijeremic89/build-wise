package com.jere.build_wise.attachment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Component
public class AttachmentStorageService {

    private final Path rootDir;

    public AttachmentStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.rootDir = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + rootDir, e);
        }
    }

    public String store(MultipartFile file, String contentType) {
        String storedName = UUID.randomUUID() + extensionFor(contentType);
        try {
            Files.copy(file.getInputStream(), rootDir.resolve(storedName));
            return storedName;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }
    }

    public InputStream read(String storedName) {
        try {
            return Files.newInputStream(rootDir.resolve(storedName));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read file: " + storedName, e);
        }
    }

    public void delete(String storedName) {
        try {
            Files.deleteIfExists(rootDir.resolve(storedName));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete file: " + storedName, e);
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "application/pdf" -> ".pdf";
            default -> "";
        };
    }
}
