import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Alert, Modal, Form, Input, InputNumber, Button, App as AntApp } from 'antd';
import { categoriesApi, subcategoriesApi } from '../api/categories';
import { expensesApi } from '../api/expenses';
import type { SubcategoryRequest } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { AttachmentsPanel } from '../components/AttachmentsPanel';

function SubcategoryDetail() {
    const { categoryId: categoryIdParam, subcategoryId } = useParams();
    const categoryId = Number(categoryIdParam);
    const subId = Number(subcategoryId);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const { data: expenses } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const category = categories?.find((c) => c.id === categoryId);
    const subcategory = category?.subcategories.find((s) => s.id === subId);

    const updateMutation = useMutation({
        mutationFn: (request: SubcategoryRequest) => subcategoriesApi.update(subId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsEditOpen(false);
        },
        onError: () => message.error('Greška pri spremanju podkategorije.'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => subcategoriesApi.delete(subId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            navigate(`/categories/${categoryId}`);
        },
        onError: () => message.error('Greška pri brisanju podkategorije.'),
    });

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju podkategorije." showIcon />;
    if (!category || !subcategory) return <Alert type="warning" message="Podkategorija nije pronađena." showIcon />;

    const spent = (expenses ?? [])
        .filter((e) => e.subcategoryId === subcategory.id && e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);

    const plannedBudget = subcategory.plannedBudget ?? 0;
    const percent = plannedBudget > 0 ? Math.min(100, Math.round((spent / plannedBudget) * 100)) : 0;
    const isOver = plannedBudget > 0 && spent > plannedBudget;

    const openEdit = () => {
        form.setFieldsValue({ name: subcategory.name, plannedBudget: subcategory.plannedBudget });
        setIsEditOpen(true);
    };

    const handleEditSave = () => {
        form.validateFields().then((values) => {
            updateMutation.mutate({
                categoryId: category.id,
                name: values.name.trim(),
                plannedBudget: values.plannedBudget ?? null,
            });
        });
    };

    const handleDelete = () => {
        modal.confirm({
            title: 'Obriši podkategoriju',
            content: `Jesi li siguran da želiš obrisati "${subcategory.name}"? Ova radnja se ne može poništiti.`,
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteMutation.mutate(),
        });
    };

    return (
        <div>
            <Link className="nc-back" to={`/categories/${category.id}`}>
                &larr; Natrag na {category.name}
            </Link>

            <div className="nc-detail" style={{ marginTop: 16 }}>
                <div className="nc-detail-head">
                    <span className="nc-tile-icon">
                        <CategoryIcon name={category.name} />
                    </span>
                    <h1>{subcategory.name}</h1>
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

                    <AttachmentsPanel ownerType="SUBCATEGORY" ownerId={subcategory.id} />
                </div>
            </div>

            <Modal
                title="Uredi podkategoriju"
                open={isEditOpen}
                onOk={handleEditSave}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={updateMutation.isPending}
                okText="Spremi"
                cancelText="Odustani"
            >
                <Form form={form} layout="vertical">
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

export default SubcategoryDetail;
