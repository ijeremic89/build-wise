package com.jere.build_wise.todo;

import java.time.LocalDate;

public record TodoItemDto(
        Long id,
        String title,
        boolean done,
        LocalDate dueDate
) {
    public static TodoItemDto from(TodoItem t) {
        return new TodoItemDto(t.getId(), t.getTitle(), t.isDone(), t.getDueDate());
    }
}
