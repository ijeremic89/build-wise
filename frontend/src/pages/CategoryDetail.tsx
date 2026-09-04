import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Avatar,
    Typography,
    Spin,
    Alert,
    Statistic,
    Progress,
    Row,
    Col,
    List,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Space,
    App as AntApp,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { categoriesApi, subcategoriesApi } from '../api/categories';
import { expensesApi } from '../api/expenses';
import type { CategoryRequest, Subcategory, SubcategoryRequest } from '../types';
import { iconForCategory } from '../utils/categoryIcons';

const { Title, Paragraph, Text } = Typography;

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: () => message.error('Greška pri brisanju podkategorije.'),
    });

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju kategorije." showIcon />;
    if (!category) return <Alert type="warning" message="Kategorija nije pronađena." showIcon />;

    const spent = (expenses ?? [])
        .filter((e) => e.categoryId === category.id && e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);

    const plannedBudget = category.plannedBudget ?? 0;
    const percent = plannedBudget > 0 ? Math.round((spent / plannedBudget) * 100) : 0;

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
        <div style={{ textAlign: 'left', maxWidth: 640, margin: '0 auto' }}>
            <Link to="/categories">
                <ArrowLeftOutlined /> Natrag na kategorije
            </Link>

            <Row align="middle" gutter={16} style={{ marginTop: 16 }}>
                <Col>
                    <Avatar size={56} style={{ backgroundColor: 'var(--accent-bg)', fontSize: 28 }}>
                        {iconForCategory(category.name)}
                    </Avatar>
                </Col>
                <Col flex="auto">
                    <Title level={2} style={{ margin: 0 }}>{category.name}</Title>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<EditOutlined />} onClick={openEdit}>Uredi</Button>
                        <Button icon={<DeleteOutlined />} danger onClick={handleDelete} loading={deleteMutation.isPending}>
                            Obriši
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Paragraph type="secondary" style={{ marginTop: 16 }}>
                {category.description || 'Bez opisa.'}
            </Paragraph>

            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                    <Statistic title="Planirani budžet" value={plannedBudget} suffix="€" />
                </Col>
                <Col span={12}>
                    <Statistic title="Trenutno potrošeno" value={spent} suffix="€" />
                </Col>
            </Row>
            {plannedBudget > 0 && (
                <Progress
                    percent={percent}
                    status={spent > plannedBudget ? 'exception' : 'active'}
                    style={{ marginTop: 8 }}
                />
            )}

            <Title level={4} style={{ marginTop: 32 }}>Podkategorije</Title>
            <List
                bordered
                dataSource={category.subcategories}
                locale={{ emptyText: 'Nema podkategorija.' }}
                renderItem={(sub) => (
                    <List.Item
                        actions={[
                            <Button key="edit" size="small" icon={<EditOutlined />} onClick={() => openEditSub(sub)} />,
                            <Button
                                key="delete"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteSub(sub)}
                            />,
                        ]}
                    >
                        <Text>{sub.name}</Text>
                        {sub.plannedBudget !== null && <Text type="secondary"> — {sub.plannedBudget} €</Text>}
                    </List.Item>
                )}
            />
            <Button type="dashed" icon={<PlusOutlined />} onClick={openAddSub} style={{ marginTop: 12 }}>
                Dodaj podkategoriju
            </Button>

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
