package com.jere.build_wise.todo;

import com.jere.build_wise.user.CurrentUser;
import com.jere.build_wise.user.User;
import com.jere.build_wise.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TodoItemService {

    private final TodoItemRepository todoItemRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public List<TodoItemDto> findAll() {
        return todoItemRepository.findByUserIdOrderByIdAsc(currentUser.id())
                .stream().map(TodoItemDto::from).toList();
    }

    public TodoItemDto create(TodoItemRequest request) {
        User user = userRepository.getReferenceById(currentUser.id());

        TodoItem item = new TodoItem();
        item.setUser(user);
        item.setTitle(request.title());
        item.setDone(request.done());
        item.setDueDate(request.dueDate());

        return TodoItemDto.from(todoItemRepository.save(item));
    }

    public TodoItemDto update(Long id, TodoItemRequest request) {
        TodoItem item = findOwnedOrThrow(id);
        item.setTitle(request.title());
        if (request.done() && !item.isDone()) {
            item.setFinishedAt(LocalDateTime.now());
        } else if (!request.done() && item.isDone()) {
            item.setFinishedAt(null);
        }
        item.setDone(request.done());
        item.setDueDate(request.dueDate());
        return TodoItemDto.from(item);
    }

    public void delete(Long id) {
        TodoItem item = findOwnedOrThrow(id);
        todoItemRepository.delete(item);
    }

    private TodoItem findOwnedOrThrow(Long id) {
        TodoItem item = todoItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Todo item not found: " + id));

        if (!item.getUser().getId().equals(currentUser.id())) {
            throw new EntityNotFoundException("Todo item not found: " + id);
        }
        return item;
    }
}
