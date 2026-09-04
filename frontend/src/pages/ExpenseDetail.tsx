import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Alert, Modal, Form, Input, InputNumber, Select, DatePicker, Button, App as AntApp } from 'antd';
import dayjs from 'dayjs';
import { expensesApi } from '../api/expenses';
import { categoriesApi } from '../api/categories';
import type { ExpenseRequest } from '../types';

function ExpenseDetail() {
    const { id } = useParams();
    const expenseId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();
    const categoryId = Form.useWatch('categoryId', form);

    const { data: expenses, isLoading, isError } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });

    const expense = expenses?.find((e) => e.id === expenseId);
    const availableSubcategories = categories?.find((c) => c.id === categoryId)?.subcategories ?? [];

    const updateMutation = useMutation({
        mutationFn: (request: ExpenseRequest) => expensesApi.update(expenseId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setIsEditOpen(false);
        },
        onError: () => message.error('Greška pri spremanju troška.'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => expensesApi.delete(expenseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            navigate('/expenses');
        },
        onError: () => message.error('Greška pri brisanju troška.'),
    });

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju troška." showIcon />;
    if (!expense) return <Alert type="warning" message="Trošak nije pronađen." showIcon />;

    const openEdit = () => {
        form.setFieldsValue({
            categoryId: expense.categoryId,
            subcategoryId: expense.subcategoryId,
            name: expense.name,
            amount: expense.amount,
            date: dayjs(expense.date),
            status: expense.status,
            vendor: expense.vendor ?? '',
            note: expense.note ?? '',
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            const confirmed = window.confirm('Jesi li siguran da želiš spremiti izmjene ovog troška?');
            if (!confirmed) return;

            updateMutation.mutate({
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

    const handleDelete = () => {
        modal.confirm({
            title: 'Obriši trošak',
            content: 'Jesi li siguran da želiš obrisati ovaj trošak? Ova radnja se ne može poništiti.',
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteMutation.mutate(),
        });
    };

    return (
        <div>
            <Link className="nc-back" to="/expenses">
                &larr; Natrag na troškove
            </Link>

            <div className="nc-detail" style={{ marginTop: 16 }}>
                <div className="nc-detail-head">
                    <h1>{expense.name}</h1>
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
                            <div className="label">Iznos</div>
                            <div className="value">{expense.amount.toLocaleString('hr-HR')} €</div>
                        </div>
                        <div className="nc-stat">
                            <div className="label">Status</div>
                            <div className="value" style={{ fontSize: 16 }}>
                                <span className={`nc-tag${expense.status === 'PAID' ? ' is-good' : ''}`}>
                                    {expense.status === 'PLANNED' ? 'Planirano' : 'Plaćeno'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="nc-table" style={{ marginTop: 24 }}>
                        <div className="nc-row">
                            <span>Datum</span>
                            <span className="amt">{expense.date}</span>
                        </div>
                        <div className="nc-row">
                            <span>Kategorija</span>
                            <span className="amt">{expense.categoryName}</span>
                        </div>
                        {expense.subcategoryName && (
                            <div className="nc-row">
                                <span>Podkategorija</span>
                                <span className="amt">{expense.subcategoryName}</span>
                            </div>
                        )}
                        {expense.vendor && (
                            <div className="nc-row">
                                <span>Dobavljač</span>
                                <span className="amt">{expense.vendor}</span>
                            </div>
                        )}
                        {expense.note && (
                            <div className="nc-row">
                                <span>Napomena</span>
                                <span className="amt">{expense.note}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title="Uredi trošak"
                open={isEditOpen}
                onOk={handleSave}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={updateMutation.isPending}
                okText="Spremi"
                cancelText="Odustani"
            >
                <Form form={form} layout="vertical">
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

export default ExpenseDetail;
