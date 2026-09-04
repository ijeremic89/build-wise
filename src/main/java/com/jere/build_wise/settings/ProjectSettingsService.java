package com.jere.build_wise.settings;

import com.jere.build_wise.user.CurrentUser;
import com.jere.build_wise.user.User;
import com.jere.build_wise.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectSettingsService {

    private static final BigDecimal DEFAULT_PLANNED_COST = new BigDecimal("250000");

    private final ProjectSettingsRepository projectSettingsRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public ProjectSettingsDto get() {
        return ProjectSettingsDto.from(getOrCreate());
    }

    public ProjectSettingsDto update(ProjectSettingsRequest request) {
        ProjectSettings settings = getOrCreate();
        settings.setPlannedConstructionCost(request.plannedConstructionCost());
        return ProjectSettingsDto.from(settings);
    }

    private ProjectSettings getOrCreate() {
        return projectSettingsRepository.findByUserId(currentUser.id())
                .orElseGet(() -> {
                    User user = userRepository.getReferenceById(currentUser.id());
                    ProjectSettings settings = new ProjectSettings();
                    settings.setUser(user);
                    settings.setPlannedConstructionCost(DEFAULT_PLANNED_COST);
                    return projectSettingsRepository.save(settings);
                });
    }
}
