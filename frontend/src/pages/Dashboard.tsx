import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, InputNumber, Button, Spin, Alert, App as AntApp } from 'antd';
import { settingsApi } from '../api/settings';
import { expensesApi } from '../api/expenses';

function Dashboard() {
    const queryClient = useQueryClient();
    const { message } = AntApp.useApp();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();

    const { data: settings, isLoading: settingsLoading, isError: settingsError } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsApi.get,
    });

    const { data: expenses, isLoading: expensesLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const updateMutation = useMutation({
        mutationFn: (plannedConstructionCost: number) => settingsApi.update({ plannedConstructionCost }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setIsEditOpen(false);
        },
        onError: () => message.error('Greška pri spremanju.'),
    });

    if (settingsLoading || expensesLoading) return <Spin style={{ marginTop: 40 }} />;
    if (settingsError) return <Alert type="error" message="Greška pri dohvaćanju postavki." showIcon />;

    const plannedBudget = settings?.plannedConstructionCost ?? 0;
    const spent = (expenses ?? [])
        .filter((e) => e.categoryName !== 'Zemljište' && e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);

    const percent = plannedBudget > 0 ? Math.min(100, Math.round((spent / plannedBudget) * 100)) : 0;
    const isOver = plannedBudget > 0 && spent > plannedBudget;

    const openEdit = () => {
        form.setFieldsValue({ plannedConstructionCost: plannedBudget });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            updateMutation.mutate(values.plannedConstructionCost);
        });
    };

    return (
        <div>
            <h1>Dashboard</h1>

            <div className="nc-form-toolbar">
                <div className="nc-section-label" style={{ margin: 0, flex: 1 }}>
                    <span>Pregled projekta</span>
                </div>
                <Button className="nc-btn" onClick={openEdit}>
                    Uredi planirani trošak
                </Button>
            </div>

            <div className="nc-detail">
                <div className="nc-detail-body">
                    <div className="nc-stats">
                        <div className="nc-stat">
                            <div className="label">Planirani trošak gradnje</div>
                            <div className="value">{plannedBudget.toLocaleString('hr-HR')} €</div>
                        </div>
                        <div className="nc-stat">
                            <div className="label">Trenutni trošak</div>
                            <div className="value">{spent.toLocaleString('hr-HR')} €</div>
                        </div>
                    </div>
                    <div className={`nc-progress${isOver ? ' is-over' : ''}`}>
                        <div style={{ width: `${percent}%` }} />
                    </div>
                </div>
            </div>

            <Modal
                title="Uredi planirani trošak gradnje"
                open={isEditOpen}
                onOk={handleSave}
                onCancel={() => setIsEditOpen(false)}
                confirmLoading={updateMutation.isPending}
                okText="Spremi"
                cancelText="Odustani"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="plannedConstructionCost"
                        label="Planirani trošak gradnje"
                        rules={[{ required: true, message: 'Unesi iznos' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="€" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Dashboard;
