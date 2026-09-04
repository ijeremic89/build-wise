package com.jere.build_wise.expanse;

import com.jere.build_wise.category.Category;
import com.jere.build_wise.category.CategoryRepository;
import com.jere.build_wise.contractor.Contractor;
import com.jere.build_wise.contractor.ContractorRepository;
import com.jere.build_wise.subcategory.Subcategory;
import com.jere.build_wise.subcategory.SubcategoryRepository;
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
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final ContractorRepository contractorRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public List<ExpenseDto> findAll() {
        return expenseRepository.findByUserId(currentUser.id())
                .stream().map(ExpenseDto::from).toList();
    }

    public List<ExpenseDto> findByCategory(Long categoryId) {
        return expenseRepository.findByUserIdAndCategoryId(currentUser.id(), categoryId)
                .stream().map(ExpenseDto::from).toList();
    }

    public ExpenseDto create(ExpenseRequest request) {
        User user = userRepository.getReferenceById(currentUser.id());

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + request.categoryId()));

        Subcategory subcategory = null;
        if (request.subcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Subcategory not found: " + request.subcategoryId()));
        }

        Contractor contractor = null;
        if (request.contractorId() != null) {
            contractor = contractorRepository.findById(request.contractorId())
                    .orElseThrow(() -> new EntityNotFoundException("Contractor not found: " + request.contractorId()));
        }

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setSubcategory(subcategory);
        expense.setName(request.name());
        expense.setAmount(request.amount());
        expense.setDate(request.date());
        expense.setStatus(request.status());
        expense.setContractor(contractor);
        expense.setNote(request.note());

        return ExpenseDto.from(expenseRepository.save(expense));
    }

    public ExpenseDto update(Long id, ExpenseRequest request) {
        Expense expense = findOwnedOrThrow(id);

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + request.categoryId()));

        Subcategory subcategory = null;
        if (request.subcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Subcategory not found: " + request.subcategoryId()));
        }

        Contractor contractor = null;
        if (request.contractorId() != null) {
            contractor = contractorRepository.findById(request.contractorId())
                    .orElseThrow(() -> new EntityNotFoundException("Contractor not found: " + request.contractorId()));
        }

        expense.setCategory(category);
        expense.setSubcategory(subcategory);
        expense.setName(request.name());
        expense.setAmount(request.amount());
        expense.setDate(request.date());
        expense.setStatus(request.status());
        expense.setContractor(contractor);
        expense.setNote(request.note());

        return ExpenseDto.from(expense);
    }

    public void delete(Long id) {
        Expense expense = findOwnedOrThrow(id);
        expenseRepository.delete(expense);
    }

    private Expense findOwnedOrThrow(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found: " + id));

        if (!expense.getUser().getId().equals(currentUser.id())) {
            throw new EntityNotFoundException("Expense not found: " + id);
        }
        return expense;
    }
}
