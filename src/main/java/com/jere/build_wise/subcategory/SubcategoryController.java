package com.jere.build_wise.subcategory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subcategories")
@RequiredArgsConstructor
public class SubcategoryController {

    private final SubcategoryService subcategoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubcategoryDto create(@Valid @RequestBody SubcategoryRequest request) {
        return subcategoryService.create(request);
    }

    @PutMapping("/{id}")
    public SubcategoryDto update(@PathVariable Long id, @Valid @RequestBody SubcategoryRequest request) {
        return subcategoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        subcategoryService.delete(id);
    }
}
