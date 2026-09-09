import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, DatePicker, Checkbox, Spin, Alert, Button, App as AntApp } from 'antd';
import { todosApi } from '../api/todos';
import type { TodoItem, TodoItemRequest } from '../types';

function Todos() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message } = AntApp.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const toggleMutation = useMutation({
        mutationFn: (item: TodoItem) =>
            todosApi.update(item.id, { title: item.title, done: !item.done, dueDate: item.dueDate }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
        onError: () => message.error('Greška pri spremanju zadatka.'),
    });

    const openAdd = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            createMutation.mutate({
                title: values.title.trim(),
                done: false,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
            });
        });
    };

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju zadataka." showIcon />;

    const sorted = [...(todos ?? [])].sort((a, b) => Number(a.done) - Number(b.done) || b.id - a.id);
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
                    <div
                        className="nc-row nc-row-link"
                        key={item.id}
                        onClick={() => navigate(`/todos/${item.id}`)}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Checkbox
                                checked={item.done}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleMutation.mutate(item)}
                            />
                            <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--faint)' : 'inherit' }}>
                                {item.title}
                            </span>
                        </span>
                        {item.dueDate && <span className="amt">{item.dueDate}</span>}
                    </div>
                ))}
            </div>

            <Modal
                title="Novi zadatak"
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={createMutation.isPending}
                okText="Dodaj"
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
