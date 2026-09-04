package com.jere.build_wise.expanse;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull Long categoryId,
        Long subcategoryId,
        @NotBlank String name,
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDate date,
        @NotNull ExpenseStatus status,
        Long contractorId,
        String note
) {}
