import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Alert, Modal, Form, Input, InputNumber, Button, App as AntApp } from 'antd';
import { categoriesApi, subcategoriesApi } from '../api/categories';
import { expensesApi } from '../api/expenses';
import type { CategoryRequest, SubcategoryRequest } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { AttachmentsPanel } from '../components/AttachmentsPanel';

function CategoryDetail() {
    const { id } = useParams();
    const categoryId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm] = Form.useForm();

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [subForm] = Form.useForm();

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const { data: expenses } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const category = categories?.find((c) => c.id === categoryId);

    const updateMutation = useMutation({
        mutationFn: (request: CategoryRequest) => categoriesApi.update(categoryId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsEditOpen(false);
        },
        onError: () => message.error('Greška pri spremanju kategorije.'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => categoriesApi.delete(categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate('/categories');
        },
        onError: () => message.error('Greška pri brisanju kategorije.'),
    });

    const createSubMutation = useMutation({
        mutationFn: (request: SubcategoryRequest) => subcategoriesApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsSubModalOpen(false);
            subForm.resetFields();
        },
        onError: () => message.error('Greška pri dodavanju podkategorije.'),
    });

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju kategorije." showIcon />;
    if (!category) return <Alert type="warning" message="Kategorija nije pronađena." showIcon />;

    const spent = (expenses ?? [])
        .filter((e) => e.categoryId === category.id && e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);

    const categoryExpenses = (expenses ?? [])
        .filter((e) => e.categoryId === category.id && e.status === 'PAID')
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));

    const plannedBudget = category.plannedBudget ?? 0;
    const percent = plannedBudget > 0 ? Math.min(100, Math.round((spent / plannedBudget) * 100)) : 0;
    const isOver = plannedBudget > 0 && spent > plannedBudget;

    const openEdit = () => {
        editForm.setFieldsValue({
            name: category.name,
            description: category.description ?? '',
            plannedBudget: category.plannedBudget,
        });
        setIsEditOpen(true);
    };

    const handleEditSave = () => {
        editForm.validateFields().then((values) => {
            updateMutation.mutate({
                name: values.name.trim(),
                plannedBudget: values.plannedBudget ?? null,
                description: values.description?.trim() || null,
            });
        });
    };

    const handleDelete = () => {
        modal.confirm({
            title: 'Obriši kategoriju',
            content: 'Jesi li siguran da želiš obrisati ovu kategoriju? Ova radnja se ne može poništiti.',
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteMutation.mutate(),
        });
    };

    const openAddSub = () => {
        subForm.resetFields();
        setIsSubModalOpen(true);
    };

    const handleSubSave = () => {
        subForm.validateFields().then((values) => {
            createSubMutation.mutate({
                categoryId: category.id,
                name: values.name.trim(),
                plannedBudget: values.plannedBudget ?? null,
            });
        });
    };

    return (
        <div>
            <Link className="nc-back" to="/categories">
                &larr; Natrag na kategorije
            </Link>

            <div className="nc-detail" style={{ marginTop: 16 }}>
                <div className="nc-detail-head">
                    <span className="nc-tile-icon">
                        <CategoryIcon name={category.name} />
                    </span>
                    <h1>{category.name}</h1>
                    <div className="actions hide-on-mobile">
                        <Button className="nc-btn" onClick={openEdit}>
                            Uredi
                        </Button>
                        <Button
                            className="nc-btn nc-btn-danger"
                            onClick={handleDelete}
                            loading={deleteMutation.isPending}
                        >
                            Obriši
                        </Button>
                    </div>
                </div>

                <div className="nc-detail-body">
                    <p className="nc-desc">{category.description || 'Bez opisa.'}</p>

                    <div className="nc-stats">
                        <div className="nc-stat">
                            <div className="label">Planirani budžet</div>
                            <div className="value">{plannedBudget.toLocaleString('hr-HR')} €</div>
                        </div>
                        <div className="nc-stat">
                            <div className="label">Trenutno potrošeno</div>
                            <div className="value">{spent.toLocaleString('hr-HR')} €</div>
                        </div>
                    </div>
                    {plannedBudget > 0 && (
                        <div className={`nc-progress${isOver ? ' is-over' : ''}`}>
                            <div style={{ width: `${percent}%` }} />
                        </div>
                    )}

                    <div className="nc-sub-title">Podkategorije</div>
                    <div className="nc-table">
                        {category.subcategories.length === 0 && (
                            <div className="nc-row" style={{ color: 'var(--faint)' }}>
                                Nema podkategorija.
                            </div>
                        )}
                        {category.subcategories.map((sub) => {
                            const subSpent = (expenses ?? [])
                                .filter((e) => e.subcategoryId === sub.id && e.status === 'PAID')
                                .reduce((sum, e) => sum + e.amount, 0);
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    className="nc-row nc-row-link"
                                    onClick={() => navigate(`/categories/${category.id}/subcategories/${sub.id}`)}
                                >
                                    <span>{sub.name}</span>
                                    <span className="amt">{subSpent.toLocaleString('hr-HR')} €</span>
                                </button>
                            );
                        })}
                    </div>
                    <Button className="nc-btn" style={{ marginTop: 12 }} onClick={openAddSub}>
                        + Dodaj podkategoriju
                    </Button>

                    <div className="nc-sub-title" style={{ marginTop: 24 }}>
                        Troškovi
                    </div>
                    <div className="nc-table">
                        {categoryExpenses.length === 0 && (
                            <div className="nc-row" style={{ color: 'var(--faint)' }}>
                                Nema troškova.
                            </div>
                        )}
                        {categoryExpenses.map((expense) => (
                            <Link key={expense.id} to={`/expenses/${expense.id}`} className="nc-row nc-row-link">
                                <span>{expense.name}</span>
                                <span className="amt">{expense.amount.toLocaleString('hr-HR')} €</span>
                            </Link>
                        ))}
                    </div>

                    <AttachmentsPanel ownerType="CATEGORY" ownerId={category.id} />

                    <div className="mobile-only-row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                        <Button className="nc-btn" onClick={openEdit}>
                            Uredi
                        </Button>
                        <Button
                            className="nc-btn nc-btn-danger"
                            onClick={handleDelete}
                            loading={deleteMutation.isPending}
                        >
                            Obriši
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                title="Uredi kategoriju"
                open={isEditOpen}
                onOk={handleEditSave}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={updateMutation.isPending}
                okText="Spremi"
                cancelText="Odustani"
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="name" label="Naziv" rules={[{ required: true, message: 'Unesi naziv kategorije' }]}>
                        <Input placeholder="Naziv kategorije" />
                    </Form.Item>
                    <Form.Item name="description" label="Opis">
                        <Input.TextArea placeholder="Opis kategorije (opcionalno)" rows={3} />
                    </Form.Item>
                    <Form.Item name="plannedBudget" label="Planirani budžet">
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="0" addonAfter="€" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Nova podkategorija"
                open={isSubModalOpen}
                onOk={handleSubSave}
                onCancel={() => setIsSubModalOpen(false)}
                confirmLoading={createSubMutation.isPending}
                okText="Dodaj"
                cancelText="Odustani"
            >
                <Form form={subForm} layout="vertical">
                    <Form.Item name="name" label="Naziv" rules={[{ required: true, message: 'Unesi naziv podkategorije' }]}>
                        <Input placeholder="Naziv podkategorije" />
                    </Form.Item>
                    <Form.Item name="plannedBudget" label="Planirani budžet">
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="0" addonAfter="€" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CategoryDetail;
