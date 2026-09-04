package com.jere.build_wise.settings;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class ProjectSettingsController {

    private final ProjectSettingsService projectSettingsService;

    @GetMapping
    public ProjectSettingsDto get() {
        return projectSettingsService.get();
    }

    @PutMapping
    public ProjectSettingsDto update(@Valid @RequestBody ProjectSettingsRequest request) {
        return projectSettingsService.update(request);
    }
}
