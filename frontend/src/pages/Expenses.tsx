import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses';
import { categoriesApi } from '../api/categories';
import type { ExpenseRequest, ExpenseStatus } from '../types';

const PAGE_SIZE = 20;

function Expenses() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(1);

    const [categoryId, setCategoryId] = useState('');
    const [subcategoryId, setSubcategoryId] = useState('');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [status, setStatus] = useState<ExpenseStatus>('PLANNED');
    const [vendor, setVendor] = useState('');
    const [note, setNote] = useState('');

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const { data: expenses, isLoading, isError } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (request: ExpenseRequest) => expensesApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setName('');
            setAmount('');
            setVendor('');
            setNote('');
            setSubcategoryId('');
            setShowForm(false);
            setPage(1);
        },
    });

    const selectedCategory = categories?.find((c) => c.id === Number(categoryId));
    const availableSubcategories = selectedCategory?.subcategories ?? [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !categoryId || !amount || !date) return;

        createMutation.mutate({
            categoryId: Number(categoryId),
            subcategoryId: subcategoryId ? Number(subcategoryId) : null,
            name: name.trim(),
            amount: Number(amount),
            date,
            status,
            vendor: vendor.trim() || null,
            note: note.trim() || null,
        });
    };

    // Newest first: sort by date desc, then id desc as a tiebreaker
    const sorted = [...(expenses ?? [])].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return b.id - a.id;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div>
            <h1>Troškovi</h1>

            <button onClick={() => setShowForm((v) => !v)}>
                {showForm ? 'Zatvori formu' : '+ Dodaj trošak'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            setSubcategoryId('');
                        }}
                    >
                        <option value="">Odaberi kategoriju</option>
                        {categories?.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        value={subcategoryId}
                        onChange={(e) => setSubcategoryId(e.target.value)}
                        disabled={!categoryId}
                    >
                        <option value="">Bez podkategorije</option>
                        {availableSubcategories.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Naziv troška"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Iznos"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <select value={status} onChange={(e) => setStatus(e.target.value as ExpenseStatus)}>
                        <option value="PLANNED">Planirano</option>
                        <option value="PAID">Plaćeno</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Dobavljač (opcionalno)"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Napomena (opcionalno)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />

                    <button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Dodajem...' : 'Spremi trošak'}
                    </button>
                    {createMutation.isError && (
                        <p style={{ color: 'red' }}>Greška pri dodavanju troška.</p>
                    )}
                </form>
            )}

            {isLoading && <p>Učitavanje...</p>}
            {isError && <p>Greška pri dohvaćanju troškova.</p>}

            {!isLoading && !isError && (
                <>
                    <ul>
                        {pageItems.map((expense) => (
                            <li key={expense.id}>
                                <Link to={`/expenses/${expense.id}`}>
                                    {expense.name} — {expense.amount} € —{' '}
                                    [{expense.status === 'PLANNED' ? 'Planirano' : 'Plaćeno'}]
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div>
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Prethodna
                            </button>
                            <span> Stranica {currentPage} / {totalPages} </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Sljedeća
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Expenses;