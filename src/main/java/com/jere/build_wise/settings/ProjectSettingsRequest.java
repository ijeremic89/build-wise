package com.jere.build_wise.settings;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ProjectSettingsRequest(
        @NotNull @PositiveOrZero BigDecimal plannedConstructionCost
) {}
