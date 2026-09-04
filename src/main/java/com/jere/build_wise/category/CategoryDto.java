package com.jere.build_wise.category;

import com.jere.build_wise.subcategory.SubcategoryDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CategoryDto(
        Long id,
        String name,
        BigDecimal plannedBudget,
        LocalDate startDate,
        LocalDate endDate,
        String description,
        List<SubcategoryDto> subcategories
) {
    public static CategoryDto from(Category c) {
        return new CategoryDto(
                c.getId(),
                c.getName(),
                c.getPlannedBudget(),
                c.getStartDate(),
                c.getEndDate(),
                c.getDescription(),
                c.getSubcategories().stream().map(SubcategoryDto::from).toList()
        );
    }
}
