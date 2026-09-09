import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Alert, Modal, Form, Input, DatePicker, Checkbox, Button, App as AntApp } from 'antd';
import dayjs from 'dayjs';
import { todosApi } from '../api/todos';
import type { TodoItemRequest } from '../types';

function formatDateTime(value: string): string {
    return dayjs(value).format('DD.MM.YYYY HH:mm');
}

function TodoDetail() {
    const { id } = useParams();
    const todoId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();

    const { data: todos, isLoading, isError } = useQuery({
        queryKey: ['todos'],
        queryFn: todosApi.getAll,
    });

    const item = todos?.find((t) => t.id === todoId);

    const updateMutation = useMutation({
        mutationFn: (request: TodoItemRequest) => todosApi.update(todoId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
            setIsEditOpen(false);
        },
        onError: () => message.error('Greška pri spremanju zadatka.'),
    });

    const toggleMutation = useMutation({
        mutationFn: () =>
            todosApi.update(todoId, { title: item!.title, done: !item!.done, dueDate: item!.dueDate }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
        onError: () => message.error('Greška pri spremanju zadatka.'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => todosApi.delete(todoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
            navigate('/todos');
        },
        onError: () => message.error('Greška pri brisanju zadatka.'),
    });

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju zadatka." showIcon />;
    if (!item) return <Alert type="warning" message="Zadatak nije pronađen." showIcon />;

    const openEdit = () => {
        form.setFieldsValue({
            title: item.title,
            dueDate: item.dueDate ? dayjs(item.dueDate) : undefined,
        });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            updateMutation.mutate({
                title: values.title.trim(),
                done: item.done,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
            });
        });
    };

    const handleDelete = () => {
        modal.confirm({
            title: 'Obriši zadatak',
            content: `Jesi li siguran da želiš obrisati "${item.title}"?`,
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteMutation.mutate(),
        });
    };

    return (
        <div>
            <Link className="nc-back" to="/todos">
                &larr; Natrag na zadatke
            </Link>

            <div className="nc-detail" style={{ marginTop: 16 }}>
                <div className="nc-detail-head">
                    <h1>{item.title}</h1>
                    <div className="actions hide-on-mobile">
                        <Button className="nc-btn" onClick={openEdit}>
                            Uredi
                        </Button>
                        <Button className="nc-btn nc-btn-danger" onClick={handleDelete} loading={deleteMutation.isPending}>
                            Obriši
                        </Button>
                    </div>
                </div>

                <div className="nc-detail-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <Checkbox checked={item.done} onChange={() => toggleMutation.mutate()} />
                        <span className={`nc-tag${item.done ? ' is-good' : ''}`}>{item.done ? 'Gotovo' : 'U tijeku'}</span>
                    </div>

                    <div className="nc-table">
                        <div className="nc-row">
                            <span>Rok</span>
                            <span className="amt">{item.dueDate ?? '—'}</span>
                        </div>
                        <div className="nc-row">
                            <span>Kreirano</span>
                            <span className="amt">{formatDateTime(item.createdAt)}</span>
                        </div>
                        <div className="nc-row">
                            <span>Završeno</span>
                            <span className="amt">{item.finishedAt ? formatDateTime(item.finishedAt) : '—'}</span>
                        </div>
                    </div>

                    <div
                        className="mobile-only-row"
                        style={{ justifyContent: 'flex-end', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}
                    >
                        <Button className="nc-btn" onClick={openEdit}>
                            Uredi
                        </Button>
                        <Button className="nc-btn nc-btn-danger" onClick={handleDelete} loading={deleteMutation.isPending}>
                            Obriši
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                title="Uredi zadatak"
                open={isEditOpen}
                onOk={handleSave}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={updateMutation.isPending}
                okText="Spremi"
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

export default TodoDetail;
