export type ExpenseStatus = 'PLANNED' | 'PAID';

export interface Subcategory {
    id: number;
    name: string;
    plannedBudget: number | null;
}

export interface Category {
    id: number;
    name: string;
    plannedBudget: number | null;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    subcategories: Subcategory[];
}

export interface CategoryRequest {
    name: string;
    plannedBudget: number | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
}

export interface SubcategoryRequest {
    categoryId: number;
    name: string;
    plannedBudget: number | null;
}

export interface Expense {
    id: number;
    categoryId: number;
    categoryName: string;
    subcategoryId: number | null;
    subcategoryName: string | null;
    name: string;
    amount: number;
    date: string; // ISO date string, npr "2026-08-14"
    status: ExpenseStatus;
    vendor: string | null;
    note: string | null;
}

export interface ExpenseRequest {
    categoryId: number;
    subcategoryId: number | null;
    name: string;
    amount: number;
    date: string;
    status: ExpenseStatus;
    vendor: string | null;
    note: string | null;
}