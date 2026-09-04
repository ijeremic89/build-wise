package com.jere.build_wise.settings;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectSettingsRepository extends JpaRepository<ProjectSettings, Long> {

    Optional<ProjectSettings> findByUserId(Long userId);
}
