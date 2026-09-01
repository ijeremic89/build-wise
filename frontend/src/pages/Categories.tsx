import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, subcategoriesApi } from '../api/categories';
import type { CategoryRequest, Subcategory, SubcategoryRequest } from '../types';

function Categories() {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [plannedBudget, setPlannedBudget] = useState('');

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (request: CategoryRequest) => categoriesApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setName('');
            setPlannedBudget('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        createMutation.mutate({
            name: name.trim(),
            plannedBudget: plannedBudget !== '' ? Number(plannedBudget) : null,
        });
    };

    if (isLoading) return <p>Učitavanje...</p>;
    if (isError) return <p>Greška pri dohvaćanju kategorija.</p>;

    return (
        <div>
            <h1>Kategorije</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Naziv kategorije"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Planirani budžet"
                    value={plannedBudget}
                    onChange={(e) => setPlannedBudget(e.target.value)}
                />
                <button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Dodajem...' : 'Dodaj kategoriju'}
                </button>
                {createMutation.isError && (
                    <p style={{ color: 'red' }}>Greška pri dodavanju kategorije.</p>
                )}
            </form>

            <ul>
                {categories?.map((category) => (
                    <li key={category.id}>
                        <strong>{category.name}</strong>
                        {category.plannedBudget !== null && (
                            <span> — planirano: {category.plannedBudget} €</span>
                        )}
                        <button
                            onClick={() => deleteMutation.mutate(category.id)}
                            disabled={deleteMutation.isPending}
                        >
                            Obriši
                        </button>

                        <SubcategoryList categoryId={category.id} subcategories={category.subcategories} />
                        <SubcategoryForm categoryId={category.id} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SubcategoryList({
                             categoryId,
                             subcategories,
                         }: {
    categoryId: number;
    subcategories: Subcategory[];
}) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editBudget, setEditBudget] = useState('');

    const updateMutation = useMutation({
        mutationFn: ({ id, request }: { id: number; request: SubcategoryRequest }) =>
            subcategoriesApi.update(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setEditingId(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => subcategoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    if (subcategories.length === 0) return null;

    const startEdit = (sub: Subcategory) => {
        setEditingId(sub.id);
        setEditName(sub.name);
        setEditBudget(sub.plannedBudget !== null ? String(sub.plannedBudget) : '');
    };

    const saveEdit = (id: number) => {
        if (!editName.trim()) return;
        updateMutation.mutate({
            id,
            request: {
                categoryId,
                name: editName.trim(),
                plannedBudget: editBudget !== '' ? Number(editBudget) : null,
            },
        });
    };

    return (
        <ul>
            {subcategories.map((sub) => (
                <li key={sub.id}>
                    {editingId === sub.id ? (
                        <>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            <input
                                type="number"
                                value={editBudget}
                                onChange={(e) => setEditBudget(e.target.value)}
                            />
                            <button onClick={() => saveEdit(sub.id)} disabled={updateMutation.isPending}>
                                Spremi
                            </button>
                            <button onClick={() => setEditingId(null)}>Odustani</button>
                        </>
                    ) : (
                        <>
                            {sub.name}
                            {sub.plannedBudget !== null && ` — ${sub.plannedBudget} €`}
                            <button onClick={() => startEdit(sub)}>Uredi</button>
                            <button
                                onClick={() => deleteMutation.mutate(sub.id)}
                                disabled={deleteMutation.isPending}
                            >
                                Obriši
                            </button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}

function SubcategoryForm({ categoryId }: { categoryId: number }) {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [plannedBudget, setPlannedBudget] = useState('');

    const createMutation = useMutation({
        mutationFn: (request: SubcategoryRequest) => subcategoriesApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setName('');
            setPlannedBudget('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        createMutation.mutate({
            categoryId,
            name: name.trim(),
            plannedBudget: plannedBudget !== '' ? Number(plannedBudget) : null,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Naziv podkategorije"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="number"
                placeholder="Planirani budžet"
                value={plannedBudget}
                onChange={(e) => setPlannedBudget(e.target.value)}
            />
            <button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Dodajem...' : 'Dodaj podkategoriju'}
            </button>
            {createMutation.isError && (
                <p style={{ color: 'red' }}>Greška pri dodavanju podkategorije.</p>
            )}
        </form>
    );
}

export default Categories;