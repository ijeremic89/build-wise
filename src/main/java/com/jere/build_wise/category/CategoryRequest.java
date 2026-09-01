package com.jere.build_wise.category;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record CategoryRequest(
        @NotBlank String name,
        BigDecimal plannedBudget
) {}
