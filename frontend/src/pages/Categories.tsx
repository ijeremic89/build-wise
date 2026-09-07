import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, InputNumber, Checkbox, Spin, Alert, Button, App as AntApp } from 'antd';
import { categoriesApi } from '../api/categories';
import type { CategoryRequest } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

function Categories() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message } = AntApp.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const manualBudget = Form.useWatch('manualBudget', form);

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (request: CategoryRequest) => categoriesApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: () => message.error('Greška pri dodavanju kategorije.'),
    });

    const handleCreate = () => {
        form.validateFields().then((values) => {
            createMutation.mutate({
                name: values.name.trim(),
                plannedBudget: values.manualBudget ? (values.plannedBudget ?? null) : null,
                description: values.description?.trim() || null,
            });
        });
    };

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju kategorija." showIcon />;

    return (
        <div>
            <h1>Kategorije</h1>

            <div className="nc-form-toolbar">
                <div className="nc-section-label" style={{ margin: 0, flex: 1 }}>
                    <span>Kategorije — {categories?.length ?? 0}</span>
                </div>
                <Button className="nc-btn" onClick={() => setIsModalOpen(true)}>
                    + Dodaj kategoriju
                </Button>
            </div>

            <div className="nc-grid">
                {categories?.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        className="nc-tile"
                        onClick={() => navigate(`/categories/${category.id}`)}
                    >
                        <span className="nc-tile-icon">
                            <CategoryIcon name={category.name} />
                        </span>
                        <span className="nc-tile-name">{category.name}</span>
                    </button>
                ))}
            </div>

            <Modal
                title="Nova kategorija"
                open={isModalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                confirmLoading={createMutation.isPending}
                okText="Dodaj"
                cancelText="Odustani"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Naziv" rules={[{ required: true, message: 'Unesi naziv kategorije' }]}>
                        <Input placeholder="Naziv kategorije" />
                    </Form.Item>
                    <Form.Item name="description" label="Opis">
                        <Input.TextArea placeholder="Opis kategorije (opcionalno)" rows={3} />
                    </Form.Item>
                    <Form.Item name="manualBudget" valuePropName="checked" style={{ marginBottom: 8 }}>
                        <Checkbox>Ručno postavi planirani budžet</Checkbox>
                    </Form.Item>
                    {manualBudget ? (
                        <Form.Item name="plannedBudget" label="Planirani budžet">
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" addonAfter="€" />
                        </Form.Item>
                    ) : (
                        <p className="nc-desc" style={{ marginTop: -8 }}>
                            Bit će automatski zbroj planiranih budžeta podkategorija.
                        </p>
                    )}
                </Form>
            </Modal>
        </div>
    );
}

export default Categories;
