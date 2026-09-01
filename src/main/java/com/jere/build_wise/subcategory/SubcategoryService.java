package com.jere.build_wise.subcategory;

import com.jere.build_wise.category.Category;
import com.jere.build_wise.category.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SubcategoryService {

    private final SubcategoryRepository subcategoryRepository;
    private final CategoryRepository categoryRepository;

    public SubcategoryDto create(SubcategoryRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + request.categoryId()));

        Subcategory sub = new Subcategory();
        sub.setCategory(category);
        sub.setName(request.name());
        sub.setPlannedBudget(request.plannedBudget());

        return SubcategoryDto.from(subcategoryRepository.save(sub));
    }

    public SubcategoryDto update(Long id, SubcategoryRequest request) {
        Subcategory sub = subcategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subcategory not found: " + id));
        sub.setName(request.name());
        sub.setPlannedBudget(request.plannedBudget());
        return SubcategoryDto.from(sub);
    }

    public void delete(Long id) {
        subcategoryRepository.deleteById(id);
    }
}
