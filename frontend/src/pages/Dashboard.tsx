import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, InputNumber, Select, Button, Spin, Alert, App as AntApp } from 'antd';
import { settingsApi } from '../api/settings';
import { expensesApi } from '../api/expenses';
import { categoriesApi } from '../api/categories';
import type { Category } from '../types';

function effectiveCategoryBudget(category: Category): number {
    return category.plannedBudget ?? category.subcategories.reduce((sum, s) => sum + (s.plannedBudget ?? 0), 0);
}

function Dashboard() {
    const queryClient = useQueryClient();
    const { message } = AntApp.useApp();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const { data: settings, isLoading: settingsLoading, isError: settingsError } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsApi.get,
    });

    const { data: expenses, isLoading: expensesLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.getAll(),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
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

    const budget = settings?.plannedConstructionCost ?? 0;
    const plannedFromCategories = (categories ?? [])
        .filter((c) => c.name !== 'Zemljište')
        .reduce((sum, c) => sum + effectiveCategoryBudget(c), 0);
    const spent = (expenses ?? [])
        .filter((e) => e.categoryName !== 'Zemljište' && e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);

    const plannedPercentOfBudget = budget > 0 ? Math.min(100, Math.round((plannedFromCategories / budget) * 100)) : 0;
    const spentPercentOfBudget = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
    const isPlannedOverBudget = budget > 0 && plannedFromCategories > budget;
    const isSpentOverBudget = budget > 0 && spent > budget;

    const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);
    const categoryPlanned = selectedCategory ? effectiveCategoryBudget(selectedCategory) : 0;
    const categorySpent = (expenses ?? [])
        .filter((e) => e.categoryId === selectedCategoryId && e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0);
    const categoryPercent = categoryPlanned > 0 ? Math.min(100, Math.round((categorySpent / categoryPlanned) * 100)) : 0;
    const categoryIsOver = categoryPlanned > 0 && categorySpent > categoryPlanned;

    const openEdit = () => {
        form.setFieldsValue({ plannedConstructionCost: budget });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            updateMutation.mutate(values.plannedConstructionCost);
        });
    };

    return (
        <div>
            <div className="nc-form-toolbar">
                <div className="nc-section-label" style={{ margin: 0, flex: 1 }}>
                    <span>Pregled projekta</span>
                </div>
                <Button className="nc-btn" onClick={openEdit}>
                    Uredi budžet
                </Button>
            </div>

            <div className="nc-detail">
                <div className="nc-detail-body">
                    <div className="nc-stats nc-stats-3">
                        <div className="nc-stat">
                            <div className="label">Budžet</div>
                            <div className="value">{budget.toLocaleString('hr-HR')} €</div>
                        </div>
                        <div className="nc-stat">
                            <div className="label">Planirani trošak gradnje</div>
                            <div className="value">{plannedFromCategories.toLocaleString('hr-HR')} €</div>
                        </div>
                        <div className="nc-stat">
                            <div className="label">Trenutni trošak</div>
                            <div className="value">{spent.toLocaleString('hr-HR')} €</div>
                        </div>
                    </div>

                    <div className="nc-budget-bar">
                        <div
                            className={`nc-budget-bar-planned${isPlannedOverBudget ? ' is-over' : ''}`}
                            style={{ width: `${plannedPercentOfBudget}%` }}
                        />
                        <div
                            className={`nc-budget-bar-spent${isSpentOverBudget ? ' is-over' : ''}`}
                            style={{ width: `${spentPercentOfBudget}%` }}
                        />
                    </div>
                    <div className="nc-budget-caption">
                        <span>Planirano: {plannedPercentOfBudget}% budžeta</span>
                        <span>Potrošeno: {spentPercentOfBudget}% budžeta</span>
                    </div>
                </div>
            </div>

            <div className="nc-section-label" style={{ marginTop: 32 }}>
                <span>Pregled po kategoriji</span>
            </div>
            <Select
                style={{ width: 280, marginBottom: 16 }}
                placeholder="Odaberi kategoriju"
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                allowClear
                options={categories?.map((c) => ({ value: c.id, label: c.name }))}
            />

            {selectedCategory && (
                <div className="nc-detail">
                    <div className="nc-detail-body">
                        <div className="nc-stats">
                            <div className="nc-stat">
                                <div className="label">Planirani budžet</div>
                                <div className="value">{categoryPlanned.toLocaleString('hr-HR')} €</div>
                            </div>
                            <div className="nc-stat">
                                <div className="label">Trenutno potrošeno</div>
                                <div className="value">{categorySpent.toLocaleString('hr-HR')} €</div>
                            </div>
                        </div>
                        {categoryPlanned > 0 && (
                            <div className={`nc-progress${categoryIsOver ? ' is-over' : ''}`}>
                                <div style={{ width: `${categoryPercent}%` }} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Modal
                title="Uredi budžet"
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
                        label="Budžet"
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
