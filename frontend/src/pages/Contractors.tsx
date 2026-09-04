import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, Spin, Alert, Button, App as AntApp } from 'antd';
import { contractorsApi } from '../api/contractors';
import type { ContractorRequest } from '../types';

function Contractors() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message } = AntApp.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const { data: contractors, isLoading, isError } = useQuery({
        queryKey: ['contractors'],
        queryFn: contractorsApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (request: ContractorRequest) => contractorsApi.create(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
            setIsModalOpen(false);
            form.resetFields();
        },
        onError: () => message.error('Greška pri dodavanju izvođača.'),
    });

    const handleCreate = () => {
        form.validateFields().then((values) => {
            createMutation.mutate({
                name: values.name.trim(),
                companyName: values.companyName?.trim() || null,
                phone: values.phone?.trim() || null,
                email: values.email?.trim() || null,
                note: values.note?.trim() || null,
            });
        });
    };

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju izvođača." showIcon />;

    return (
        <div>
            <h1>Izvođači</h1>

            <div className="nc-form-toolbar">
                <div className="nc-section-label" style={{ margin: 0, flex: 1 }}>
                    <span>Izvođači — {contractors?.length ?? 0}</span>
                </div>
                <Button className="nc-btn" onClick={() => setIsModalOpen(true)}>
                    + Dodaj izvođača
                </Button>
            </div>

            <div className="nc-grid">
                {contractors?.map((contractor) => (
                    <button
                        key={contractor.id}
                        type="button"
                        className="nc-tile"
                        onClick={() => navigate(`/contractors/${contractor.id}`)}
                    >
                        <span className="nc-tile-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                                <use href="#icon-contractor" />
                            </svg>
                        </span>
                        <span className="nc-tile-name">{contractor.name}</span>
                    </button>
                ))}
            </div>

            <Modal
                title="Novi izvođač"
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
                    <Form.Item name="name" label="Ime" rules={[{ required: true, message: 'Unesi ime izvođača' }]}>
                        <Input placeholder="Ime i prezime" />
                    </Form.Item>
                    <Form.Item name="companyName" label="Naziv firme">
                        <Input placeholder="Naziv firme (opcionalno)" />
                    </Form.Item>
                    <Form.Item name="phone" label="Telefon">
                        <Input placeholder="Broj telefona (opcionalno)" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ type: 'email', message: 'Unesi ispravan email' }]}
                    >
                        <Input placeholder="Email (opcionalno)" />
                    </Form.Item>
                    <Form.Item name="note" label="Napomena">
                        <Input.TextArea placeholder="Napomena (opcionalno)" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Contractors;
