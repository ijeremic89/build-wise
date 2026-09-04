package com.jere.build_wise.expanse;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseDto(
        Long id,
        Long categoryId,
        String categoryName,
        Long subcategoryId,
        String subcategoryName,
        String name,
        BigDecimal amount,
        LocalDate date,
        ExpenseStatus status,
        Long contractorId,
        String contractorName,
        String note
) {
    public static ExpenseDto from(Expense e) {
        return new ExpenseDto(
                e.getId(),
                e.getCategory().getId(),
                e.getCategory().getName(),
                e.getSubcategory() != null ? e.getSubcategory().getId() : null,
                e.getSubcategory() != null ? e.getSubcategory().getName() : null,
                e.getName(),
                e.getAmount(),
                e.getDate(),
                e.getStatus(),
                e.getContractor() != null ? e.getContractor().getId() : null,
                e.getContractor() != null ? e.getContractor().getName() : null,
                e.getNote()
        );
    }
}
