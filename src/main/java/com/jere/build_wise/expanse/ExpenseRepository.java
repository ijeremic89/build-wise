package com.jere.build_wise.expanse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);

    List<Expense> findByUserIdAndStatus(Long userId, ExpenseStatus status);

    @Query("""
        SELECT e.category.id, e.category.name, SUM(e.amount)
        FROM Expense e
        WHERE e.user.id = :userId AND e.status = :status
        GROUP BY e.category.id, e.category.name
        """)
    List<Object[]> sumAmountByCategoryAndStatus(
            @Param("userId") Long userId,
            @Param("status") ExpenseStatus status
    );
}
