import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, App as AntApp } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { expensesApi } from '../api/expenses';
import { categoriesApi } from '../api/categories';
import type { Expense, ExpenseRequest, ExpenseStatus } from '../types';

function Expenses() {
    const queryClient = useQueryClient();
    const { message } = AntApp.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const categoryId = Form.useWatch('categoryId', form);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (request: ExpenseRequest) => expensesApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: () => message.error('Greška pri dodavanju troška.'),
    });

    const availableSubcategories = categories?.find((c) => c.id === categoryId)?.subcategories ?? [];

    const handleCreate = () => {
        form.validateFields().then((values) => {
            createMutation.mutate({
                categoryId: values.categoryId,
                subcategoryId: values.subcategoryId ?? null,
                name: values.name.trim(),
                amount: values.amount,
                date: values.date.format('YYYY-MM-DD'),
                status: values.status,
                vendor: values.vendor?.trim() || null,
                note: values.note?.trim() || null,
            });
        });
    };

    const sorted = [...(expenses ?? [])].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return b.id - a.id;
    });

    const columns: ColumnsType<Expense> = [
        {
            title: 'Naziv',
            dataIndex: 'name',
            render: (name: string, expense) => <Link to={`/expenses/${expense.id}`}>{name}</Link>,
        },
        { title: 'Kategorija', dataIndex: 'categoryName' },
        {
            title: 'Iznos',
            dataIndex: 'amount',
            align: 'right',
            render: (amount: number) => <span className="tabular-cell">{amount.toLocaleString('hr-HR')} €</span>,
        },
        { title: 'Datum', dataIndex: 'date', className: 'tabular-cell' },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: ExpenseStatus) => (
                <span className={`nc-tag${status === 'PAID' ? ' is-good' : ''}`}>
                    {status === 'PLANNED' ? 'Planirano' : 'Plaćeno'}
                </span>
            ),
        },
    ];

    return (
        <div>
            <h1>Troškovi</h1>

            <div className="nc-form-toolbar">
                <div className="nc-section-label" style={{ margin: 0, flex: 1 }}>
                    <span>Troškovi — {sorted.length}</span>
                </div>
                <Button className="nc-btn" onClick={() => setIsModalOpen(true)}>
                    + Dodaj trošak
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={isLoading}
                dataSource={sorted}
                columns={columns}
                pagination={{ pageSize: 20 }}
                bordered
                size="middle"
            />

            <Modal
                title="Novi trošak"
                open={isModalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                confirmLoading={createMutation.isPending}
                okText="Spremi"
                cancelText="Odustani"
            >
                <Form form={form} layout="vertical" initialValues={{ status: 'PLANNED', date: dayjs() }}>
                    <Form.Item
                        name="categoryId"
                        label="Kategorija"
                        rules={[{ required: true, message: 'Odaberi kategoriju' }]}
                    >
                        <Select
                            placeholder="Odaberi kategoriju"
                            options={categories?.map((c) => ({ value: c.id, label: c.name }))}
                            onChange={() => form.setFieldValue('subcategoryId', undefined)}
                        />
                    </Form.Item>
                    <Form.Item name="subcategoryId" label="Podkategorija">
                        <Select
                            placeholder="Bez podkategorije"
                            allowClear
                            disabled={!categoryId}
                            options={availableSubcategories.map((s) => ({ value: s.id, label: s.name }))}
                        />
                    </Form.Item>
                    <Form.Item name="name" label="Naziv troška" rules={[{ required: true, message: 'Unesi naziv troška' }]}>
                        <Input placeholder="Naziv troška" />
                    </Form.Item>
                    <Form.Item name="amount" label="Iznos" rules={[{ required: true, message: 'Unesi iznos' }]}>
                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="€" />
                    </Form.Item>
                    <Form.Item name="date" label="Datum" rules={[{ required: true, message: 'Odaberi datum' }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="status" label="Status">
                        <Select
                            options={[
                                { value: 'PLANNED', label: 'Planirano' },
                                { value: 'PAID', label: 'Plaćeno' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="vendor" label="Dobavljač">
                        <Input placeholder="Dobavljač (opcionalno)" />
                    </Form.Item>
                    <Form.Item name="note" label="Napomena">
                        <Input placeholder="Napomena (opcionalno)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Expenses;
