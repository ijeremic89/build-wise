import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expenses';
import { categoriesApi } from '../api/categories';
import type { ExpenseRequest, ExpenseStatus } from '../types';

function ExpenseDetail() {
    const { id } = useParams();
    const expenseId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);

    const { data: expenses, isLoading, isError } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const expense = expenses?.find((e) => e.id === expenseId);

    const [categoryId, setCategoryId] = useState('');
    const [subcategoryId, setSubcategoryId] = useState('');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [status, setStatus] = useState<ExpenseStatus>('PLANNED');
    const [vendor, setVendor] = useState('');
    const [note, setNote] = useState('');

    const startEdit = () => {
        if (!expense) return;
        setCategoryId(String(expense.categoryId));
        setSubcategoryId(expense.subcategoryId ? String(expense.subcategoryId) : '');
        setName(expense.name);
        setAmount(String(expense.amount));
        setDate(expense.date);
        setStatus(expense.status);
        setVendor(expense.vendor ?? '');
        setNote(expense.note ?? '');
        setIsEditing(true);
    };

    const updateMutation = useMutation({
        mutationFn: (request: ExpenseRequest) => expensesApi.update(expenseId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setIsEditing(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => expensesApi.delete(expenseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            navigate('/expenses');
        },
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !categoryId || !amount || !date) return;

        const confirmed = window.confirm('Jesi li siguran da želiš spremiti izmjene ovog troška?');
        if (!confirmed) return;

        updateMutation.mutate({
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

    const handleDelete = () => {
        const confirmed = window.confirm(
            'Jesi li siguran da želiš obrisati ovaj trošak? Ova radnja se ne može poništiti.'
        );
        if (!confirmed) return;
        deleteMutation.mutate();
    };

    const selectedCategory = categories?.find((c) => c.id === Number(categoryId));
    const availableSubcategories = selectedCategory?.subcategories ?? [];

    if (isLoading) return <p>Učitavanje...</p>;
    if (isError) return <p>Greška pri dohvaćanju troška.</p>;
    if (!expense) return <p>Trošak nije pronađen.</p>;

    return (
        <div>
            <Link to="/expenses">&larr; Natrag na troškove</Link>
            <h1>{expense.name}</h1>

            {!isEditing ? (
                <div>
                    <p><strong>Iznos:</strong> {expense.amount} €</p>
                    <p><strong>Datum:</strong> {expense.date}</p>
                    <p><strong>Status:</strong> {expense.status === 'PLANNED' ? 'Planirano' : 'Plaćeno'}</p>
                    <p><strong>Kategorija:</strong> {expense.categoryName}</p>
                    {expense.subcategoryName && (
                        <p><strong>Podkategorija:</strong> {expense.subcategoryName}</p>
                    )}
                    {expense.vendor && <p><strong>Dobavljač:</strong> {expense.vendor}</p>}
                    {expense.note && <p><strong>Napomena:</strong> {expense.note}</p>}

                    <button onClick={startEdit}>Uredi</button>
                    <button onClick={handleDelete} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Brišem...' : 'Obriši'}
                    </button>
                    {deleteMutation.isError && (
                        <p style={{ color: 'red' }}>Greška pri brisanju.</p>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSave}>
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

                    <button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Spremam...' : 'Spremi izmjene'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)}>Odustani</button>
                    {updateMutation.isError && (
                        <p style={{ color: 'red' }}>Greška pri spremanju.</p>
                    )}
                </form>
            )}
        </div>
    );
}

export default ExpenseDetail;