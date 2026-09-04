import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Alert, Modal, Form, Input, Button, App as AntApp } from 'antd';
import { contractorsApi } from '../api/contractors';
import { expensesApi } from '../api/expenses';
import type { ContractorRequest } from '../types';

function ContractorDetail() {
    const { id } = useParams();
    const contractorId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { message, modal } = AntApp.useApp();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();

    const { data: contractors, isLoading, isError } = useQuery({
        queryKey: ['contractors'],
        queryFn: contractorsApi.getAll,
    });

    const { data: expenses } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const contractor = contractors?.find((c) => c.id === contractorId);

    const updateMutation = useMutation({
        mutationFn: (request: ContractorRequest) => contractorsApi.update(contractorId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
            setIsEditOpen(false);
        },
        onError: () => message.error('Greška pri spremanju izvođača.'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => contractorsApi.delete(contractorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contractors'] });
            navigate('/contractors');
        },
        onError: () => message.error('Greška pri brisanju izvođača.'),
    });

    if (isLoading) return <Spin style={{ marginTop: 40 }} />;
    if (isError) return <Alert type="error" message="Greška pri dohvaćanju izvođača." showIcon />;
    if (!contractor) return <Alert type="warning" message="Izvođač nije pronađen." showIcon />;

    const relatedExpenses = (expenses ?? []).filter((e) => e.contractorId === contractor.id);
    const totalSpent = relatedExpenses
        .filter((e) => e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);

    const openEdit = () => {
        form.setFieldsValue({
            name: contractor.name,
            companyName: contractor.companyName ?? '',
            phone: contractor.phone ?? '',
            email: contractor.email ?? '',
            note: contractor.note ?? '',
        });
        setIsEditOpen(true);
    };

    const handleEditSave = () => {
        form.validateFields().then((values) => {
            updateMutation.mutate({
                name: values.name.trim(),
                companyName: values.companyName?.trim() || null,
                phone: values.phone?.trim() || null,
                email: values.email?.trim() || null,
                note: values.note?.trim() || null,
            });
        });
    };

    const handleDelete = () => {
        modal.confirm({
            title: 'Obriši izvođača',
            content: 'Jesi li siguran da želiš obrisati ovog izvođača? Ova radnja se ne može poništiti.',
            okText: 'Obriši',
            okType: 'danger',
            cancelText: 'Odustani',
            onOk: () => deleteMutation.mutate(),
        });
    };

    return (
        <div>
            <Link className="nc-back" to="/contractors">
                &larr; Natrag na izvođače
            </Link>

            <div className="nc-detail" style={{ marginTop: 16 }}>
                <div className="nc-detail-head">
                    <span className="nc-tile-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                            <use href="#icon-contractor" />
                        </svg>
                    </span>
                    <h1>{contractor.name}</h1>
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
                    <p className="nc-desc">{contractor.companyName || 'Bez naziva firme.'}</p>

                    <div className="nc-table">
                        <div className="nc-row">
                            <span>Telefon</span>
                            <span className="amt">{contractor.phone || '—'}</span>
                        </div>
                        <div className="nc-row">
                            <span>Email</span>
                            <span className="amt">{contractor.email || '—'}</span>
                        </div>
                        {contractor.note && (
                            <div className="nc-row">
                                <span>Napomena</span>
                                <span className="amt">{contractor.note}</span>
                            </div>
                        )}
                    </div>

                    <div className="nc-stats" style={{ marginTop: 24 }}>
                        <div className="nc-stat">
                            <div className="label">Ukupno plaćeno</div>
                            <div className="value">{totalSpent.toLocaleString('hr-HR')} €</div>
                        </div>
                        <div className="nc-stat">
                            <div className="label">Broj troškova</div>
                            <div className="value">{relatedExpenses.length}</div>
                        </div>
                    </div>

                    <div className="nc-sub-title" style={{ marginTop: 24 }}>
                        Troškovi
                    </div>
                    <div className="nc-table">
                        {relatedExpenses.length === 0 && (
                            <div className="nc-row" style={{ color: 'var(--faint)' }}>
                                Nema povezanih troškova.
                            </div>
                        )}
                        {relatedExpenses.map((expense) => (
                            <Link
                                key={expense.id}
                                to={`/expenses/${expense.id}`}
                                className="nc-row nc-row-link"
                            >
                                <span>{expense.name}</span>
                                <span className="amt">{expense.amount.toLocaleString('hr-HR')} €</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                title="Uredi izvođača"
                open={isEditOpen}
                onOk={handleEditSave}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={updateMutation.isPending}
                okText="Spremi"
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

export default ContractorDetail;
