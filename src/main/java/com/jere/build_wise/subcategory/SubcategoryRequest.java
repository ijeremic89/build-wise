package com.jere.build_wise.subcategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SubcategoryRequest(
        @NotNull Long categoryId,
        @NotBlank String name,
        BigDecimal plannedBudget
) {}
