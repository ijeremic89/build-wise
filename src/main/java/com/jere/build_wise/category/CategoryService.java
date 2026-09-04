package com.jere.build_wise.category;

import com.jere.build_wise.user.CurrentUser;
import com.jere.build_wise.user.User;
import com.jere.build_wise.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public List<CategoryDto> findAll() {
        return categoryRepository.findByUserId(currentUser.id())
                .stream().map(CategoryDto::from).toList();
    }

    public CategoryDto create(CategoryRequest request) {
        User user = userRepository.getReferenceById(currentUser.id());

        Category category = new Category();
        category.setUser(user);
        category.setName(request.name());
        category.setPlannedBudget(request.plannedBudget());
        category.setStartDate(request.startDate());
        category.setEndDate(request.endDate());
        category.setDescription(request.description());

        return CategoryDto.from(categoryRepository.save(category));
    }

    public CategoryDto update(Long id, CategoryRequest request) {
        Category category = findOwnedOrThrow(id);
        category.setName(request.name());
        category.setPlannedBudget(request.plannedBudget());
        category.setStartDate(request.startDate());
        category.setEndDate(request.endDate());
        category.setDescription(request.description());
        return CategoryDto.from(category);
    }

    public void delete(Long id) {
        Category category = findOwnedOrThrow(id);
        categoryRepository.delete(category);
    }

    private Category findOwnedOrThrow(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));

        if (!category.getUser().getId().equals(currentUser.id())) {
            throw new EntityNotFoundException("Category not found: " + id);
        }
        return category;
    }
}
