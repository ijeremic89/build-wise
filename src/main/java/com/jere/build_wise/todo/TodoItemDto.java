package com.jere.build_wise.todo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TodoItemDto(
        Long id,
        String title,
        boolean done,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime finishedAt
) {
    public static TodoItemDto from(TodoItem t) {
        return new TodoItemDto(t.getId(), t.getTitle(), t.isDone(), t.getDueDate(), t.getCreatedAt(), t.getFinishedAt());
    }
}
