package com.jere.build_wise.settings;

import java.math.BigDecimal;

public record ProjectSettingsDto(BigDecimal plannedConstructionCost) {
    public static ProjectSettingsDto from(ProjectSettings s) {
        return new ProjectSettingsDto(s.getPlannedConstructionCost());
    }
}
