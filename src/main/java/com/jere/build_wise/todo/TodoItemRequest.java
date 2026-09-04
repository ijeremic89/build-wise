package com.jere.build_wise.todo;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record TodoItemRequest(
        @NotBlank String title,
        boolean done,
        LocalDate dueDate
) {}
