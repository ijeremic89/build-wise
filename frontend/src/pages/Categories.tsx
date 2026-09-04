import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Avatar, Typography, Modal, Form, Input, InputNumber, Spin, Alert, App as AntApp } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { categoriesApi } from '../api/categories';
import type { CategoryRequest } from '../types';
import { iconForCategory } from '../utils/categoryIcons';

const { Text } = Typography;

function Categories() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message } = AntApp.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

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
        onError: () => {
            message.error('Greška pri dodavanju kategorije.');
        },
    });

    const handleCreate = () => {
        form.validateFields().then((values) => {
            createMutation.mutate({
                name: values.name.trim(),
                plannedBudget: values.plannedBudget ?? null,
                description: values.description?.trim() || null,
            });
        });
    };

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju kategorija." showIcon />;

    return (
        <div>
            <h1>Kategorije</h1>

            <Row gutter={[16, 16]} justify="center">
                {categories?.map((category) => (
                    <Col key={category.id}>
                        <Card
                            hoverable
                            onClick={() => navigate(`/categories/${category.id}`)}
                            styles={{ body: { padding: 20 } }}
                            style={{ width: 140, textAlign: 'center' }}
                        >
                            <Avatar size={64} style={{ backgroundColor: 'var(--accent-bg)', fontSize: 32 }}>
                                {iconForCategory(category.name)}
                            </Avatar>
                            <div style={{ marginTop: 12 }}>
                                <Text strong>{category.name}</Text>
                            </div>
                        </Card>
                    </Col>
                ))}

                <Col>
                    <Card
                        hoverable
                        onClick={() => setIsModalOpen(true)}
                        styles={{ body: { padding: 20 } }}
                        style={{ width: 140, textAlign: 'center', borderStyle: 'dashed' }}
                    >
                        <Avatar size={64} style={{ backgroundColor: 'transparent', color: 'var(--accent)', fontSize: 28 }} icon={<PlusOutlined />} />
                        <div style={{ marginTop: 12 }}>
                            <Text strong>Dodaj kategoriju</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

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
                    <Form.Item name="plannedBudget" label="Planirani budžet">
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="0" addonAfter="€" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Categories;
