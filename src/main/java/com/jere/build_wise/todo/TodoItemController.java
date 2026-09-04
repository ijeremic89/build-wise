package com.jere.build_wise.todo;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoItemController {

    private final TodoItemService todoItemService;

    @GetMapping
    public List<TodoItemDto> findAll() {
        return todoItemService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TodoItemDto create(@Valid @RequestBody TodoItemRequest request) {
        return todoItemService.create(request);
    }

    @PutMapping("/{id}")
    public TodoItemDto update(@PathVariable Long id, @Valid @RequestBody TodoItemRequest request) {
        return todoItemService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        todoItemService.delete(id);
    }
}
