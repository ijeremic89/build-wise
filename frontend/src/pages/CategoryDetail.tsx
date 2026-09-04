import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Alert, Modal, Form, Input, InputNumber, Button, App as AntApp } from 'antd';
import { categoriesApi, subcategoriesApi } from '../api/categories';
import { expensesApi } from '../api/expenses';
import type { CategoryRequest, Subcategory, SubcategoryRequest } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

function CategoryDetail() {
    const { id } = useParams();
    const categoryId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm] = Form.useForm();

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingSubId, setEditingSubId] = useState<number | null>(null);
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

    const updateSubMutation = useMutation({
        mutationFn: ({ id: subId, request }: { id: number; request: SubcategoryRequest }) =>
            subcategoriesApi.update(subId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsSubModalOpen(false);
            setEditingSubId(null);
            subForm.resetFields();
        },
        onError: () => message.error('Greška pri spremanju podkategorije.'),
    });

    const deleteSubMutation = useMutation({
        mutationFn: (subId: number) => subcategoriesApi.delete(subId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
        onError: () => message.error('Greška pri brisanju podkategorije.'),
    });

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju kategorije." showIcon />;
    if (!category) return <Alert type="warning" message="Kategorija nije pronađena." showIcon />;

    const spent = (expenses ?? [])
        .filter((e) => e.categoryId === category.id && e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);

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
        setEditingSubId(null);
        subForm.resetFields();
        setIsSubModalOpen(true);
    };

    const openEditSub = (sub: Subcategory) => {
        setEditingSubId(sub.id);
        subForm.setFieldsValue({ name: sub.name, plannedBudget: sub.plannedBudget });
        setIsSubModalOpen(true);
    };

    const handleSubSave = () => {
        subForm.validateFields().then((values) => {
            const request: SubcategoryRequest = {
                categoryId: category.id,
                name: values.name.trim(),
                plannedBudget: values.plannedBudget ?? null,
            };
            if (editingSubId) {
                updateSubMutation.mutate({ id: editingSubId, request });
            } else {
                createSubMutation.mutate(request);
            }
        });
    };

    const handleDeleteSub = (sub: Subcategory) => {
        modal.confirm({
            title: 'Obriši podkategoriju',
            content: `Jesi li siguran da želiš obrisati "${sub.name}"?`,
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteSubMutation.mutate(sub.id),
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
                    <div className="actions">
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
                        {category.subcategories.map((sub) => (
                            <div className="nc-row" key={sub.id}>
                                <span>{sub.name}</span>
                                <span className="amt">{sub.plannedBudget !== null ? `${sub.plannedBudget} €` : '—'}</span>
                                <span className="row-actions">
                                    <Button className="nc-btn nc-btn-icon" onClick={() => openEditSub(sub)}>
                                        Uredi
                                    </Button>
                                    <Button
                                        className="nc-btn nc-btn-icon nc-btn-danger"
                                        onClick={() => handleDeleteSub(sub)}
                                    >
                                        Obriši
                                    </Button>
                                </span>
                            </div>
                        ))}
                    </div>
                    <Button className="nc-btn" style={{ marginTop: 12 }} onClick={openAddSub}>
                        + Dodaj podkategoriju
                    </Button>
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
                title={editingSubId ? 'Uredi podkategoriju' : 'Nova podkategorija'}
                open={isSubModalOpen}
                onOk={handleSubSave}
                onCancel={() => setIsSubModalOpen(false)}
                confirmLoading={createSubMutation.isPending || updateSubMutation.isPending}
                okText={editingSubId ? 'Spremi' : 'Dodaj'}
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
