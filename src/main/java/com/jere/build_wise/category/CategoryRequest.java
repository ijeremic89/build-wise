package com.jere.build_wise.category;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CategoryRequest(
        @NotBlank String name,
        BigDecimal plannedBudget,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}
