import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, DatePicker, Checkbox, Spin, Alert, Button, App as AntApp } from 'antd';
import dayjs from 'dayjs';
import { todosApi } from '../api/todos';
import type { TodoItem, TodoItemRequest } from '../types';

function Todos() {
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const { data: todos, isLoading, isError } = useQuery({
        queryKey: ['todos'],
        queryFn: todosApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (request: TodoItemRequest) => todosApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: () => message.error('Greška pri dodavanju zadatka.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, request }: { id: number; request: TodoItemRequest }) => todosApi.update(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
            setIsModalOpen(false);
            setEditingId(null);
            form.resetFields();
        },
        onError: () => message.error('Greška pri spremanju zadatka.'),
    });

    const toggleMutation = useMutation({
        mutationFn: (item: TodoItem) =>
            todosApi.update(item.id, { title: item.title, done: !item.done, dueDate: item.dueDate }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
        onError: () => message.error('Greška pri spremanju zadatka.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => todosApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
        onError: () => message.error('Greška pri brisanju zadatka.'),
    });

    const openAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEdit = (item: TodoItem) => {
        setEditingId(item.id);
        form.setFieldsValue({
            title: item.title,
            dueDate: item.dueDate ? dayjs(item.dueDate) : undefined,
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            const request: TodoItemRequest = {
                title: values.title.trim(),
                done: editingId ? (todos?.find((t) => t.id === editingId)?.done ?? false) : false,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
            };
            if (editingId) {
                updateMutation.mutate({ id: editingId, request });
            } else {
                createMutation.mutate(request);
            }
        });
    };

    const handleDelete = (item: TodoItem) => {
        modal.confirm({
            title: 'Obriši zadatak',
            content: `Jesi li siguran da želiš obrisati "${item.title}"?`,
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteMutation.mutate(item.id),
        });
    };

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju zadataka." showIcon />;

    const sorted = [...(todos ?? [])].sort((a, b) => Number(a.done) - Number(b.done) || a.id - b.id);
    const doneCount = (todos ?? []).filter((t) => t.done).length;

    return (
        <div>
            <h1>Zadaci</h1>

            <div className="nc-form-toolbar">
                <div className="nc-section-label" style={{ margin: 0, flex: 1 }}>
                    <span>
                        Zadaci — {todos?.length ?? 0} ({doneCount} gotovo)
                    </span>
                </div>
                <Button className="nc-btn" onClick={openAdd}>
                    + Dodaj zadatak
                </Button>
            </div>

            <div className="nc-table">
                {sorted.length === 0 && (
                    <div className="nc-row" style={{ color: 'var(--faint)' }}>
                        Nema zadataka.
                    </div>
                )}
                {sorted.map((item) => (
                    <div className="nc-row" key={item.id}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Checkbox checked={item.done} onChange={() => toggleMutation.mutate(item)} />
                            <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--faint)' : 'inherit' }}>
                                {item.title}
                            </span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {item.dueDate && <span className="amt">{item.dueDate}</span>}
                            <Button className="nc-btn nc-btn-icon" onClick={() => openEdit(item)}>
                                Uredi
                            </Button>
                            <Button className="nc-btn nc-btn-danger nc-btn-icon" onClick={() => handleDelete(item)}>
                                Obriši
                            </Button>
                        </span>
                    </div>
                ))}
            </div>

            <Modal
                title={editingId ? 'Uredi zadatak' : 'Novi zadatak'}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                }}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                okText={editingId ? 'Spremi' : 'Dodaj'}
                cancelText="Odustani"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Naziv" rules={[{ required: true, message: 'Unesi naziv zadatka' }]}>
                        <Input placeholder="Naziv zadatka" />
                    </Form.Item>
                    <Form.Item name="dueDate" label="Rok">
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Todos;
