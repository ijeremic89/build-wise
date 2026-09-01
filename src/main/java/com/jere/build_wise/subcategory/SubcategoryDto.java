package com.jere.build_wise.subcategory;

import java.math.BigDecimal;

public record SubcategoryDto(
        Long id,
        String name,
        BigDecimal plannedBudget
) {
    public static SubcategoryDto from(Subcategory s) {
        return new SubcategoryDto(s.getId(), s.getName(), s.getPlannedBudget());
    }
}
