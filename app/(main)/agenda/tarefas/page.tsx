'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { formatDate } from '@/utils/format';
import {
    TarefaService,
    TarefaResponseDTO,
    TarefaRequestDTO,
    STATUS_TAREFA_OPTIONS,
    PRIORIDADE_TAREFA_OPTIONS
} from '@/services/tarefa.service';

const STATUS_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'info'> = {
    'Not Started': 'info',
    'In Progress': 'info',
    Completed: 'success',
    Pending: 'warning',
    Deferred: 'danger'
};

const PRIORIDADE_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success'
};

const TarefasPage = () => {
    const toast = useRef<Toast>(null);

    const [tarefas, setTarefas] = useState<TarefaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [prioridadeFilter, setPrioridadeFilter] = useState<string | null>(null);

    // Form
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<TarefaRequestDTO>({ nome: '', status: 'Not Started', prioridade: 'Medium' });

    // Delete
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [tarefaToDelete, setTarefaToDelete] = useState<TarefaResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchTarefas = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await TarefaService.listarPaginado({ page, size: rows, sort: 'dataVencimento', direction: 'asc' });
            setTarefas(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar tarefas', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchTarefas(); }, [fetchTarefas]);

    const openNew = () => {
        setEditingId(null);
        setForm({ nome: '', status: 'Not Started', prioridade: 'Medium' });
        setFormVisible(true);
    };

    const openEdit = (t: TarefaResponseDTO) => {
        setEditingId(t.id);
        setForm({
            nome: t.nome ?? '',
            status: t.status,
            prioridade: t.prioridade,
            dataVencimento: t.dataVencimento,
            descricao: (t as any).descricao,
            contatoId: t.contatoId,
            responsavelId: t.responsavelId
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingId) {
                await TarefaService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Tarefa atualizada!', life: 3000 });
            } else {
                await TarefaService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Tarefa criada!', life: 3000 });
            }
            setFormVisible(false);
            fetchTarefas();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao salvar.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!tarefaToDelete) return;
        setDeleting(true);
        try {
            await TarefaService.delete(tarefaToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Tarefa excluída', life: 3000 });
            setDeleteVisible(false);
            fetchTarefas();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir tarefa', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const handleComplete = async (t: TarefaResponseDTO) => {
        try {
            await TarefaService.atualizar(t.id, { ...t, status: 'Completed' });
            toast.current?.show({ severity: 'success', summary: 'Concluída', detail: 'Tarefa marcada como concluída', life: 3000 });
            fetchTarefas();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar tarefa', life: 5000 });
        }
    };

    const update = (field: keyof TarefaRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const statusTemplate = (row: TarefaResponseDTO) =>
        row.status ? (
            <Tag value={row.status} severity={STATUS_SEVERITY[row.status] ?? 'info'} />
        ) : null;

    const prioridadeTemplate = (row: TarefaResponseDTO) =>
        row.prioridade ? (
            <Tag value={row.prioridade} severity={PRIORIDADE_SEVERITY[row.prioridade] ?? 'info'} />
        ) : null;

    const vencimentoTemplate = (row: TarefaResponseDTO) =>
        row.dataVencimento ? formatDate(row.dataVencimento) : '-';

    const acoesTemplate = (row: TarefaResponseDTO) => (
        <div className="flex gap-1">
            {row.status !== 'Completed' && (
                <Button icon="pi pi-check" rounded text severity="success" tooltip="Concluir" tooltipOptions={{ position: 'top' }} onClick={() => handleComplete(row)} />
            )}
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(row)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setTarefaToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filtered = tarefas.filter(t => {
        const q = globalFilter.toLowerCase();
        const matchText = !globalFilter || t.contatoNome?.toLowerCase().includes(q);
        const matchStatus = !statusFilter || t.status === statusFilter;
        const matchPrioridade = !prioridadeFilter || t.prioridade === prioridadeFilter;
        return matchText && matchStatus && matchPrioridade;
    });

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar contato..." className="w-15rem" />
            </span>
            <div className="flex gap-2">
                <Dropdown value={statusFilter} options={[{ label: 'Todos os status', value: null }, ...STATUS_TAREFA_OPTIONS]}
                    onChange={e => setStatusFilter(e.value)} placeholder="Status" className="w-12rem" showClear />
                <Dropdown value={prioridadeFilter} options={[{ label: 'Todas prioridades', value: null }, ...PRIORIDADE_TAREFA_OPTIONS]}
                    onChange={e => setPrioridadeFilter(e.value)} placeholder="Prioridade" className="w-12rem" showClear />
            </div>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <Toolbar className="mb-4"
                        start={
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-check-square text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Tarefas</h5>
                                    <span className="text-500 text-sm">Gerencie suas tarefas e atividades pendentes</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Nova Tarefa" icon="pi pi-plus" className="p-button-success" onClick={openNew} />}
                    />
                    <DataTable value={filtered} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhuma tarefa encontrada."
                        stripedRows showGridlines size="small">
                        <Column body={statusTemplate} header="Status" style={{ width: '130px' }} />
                        <Column body={prioridadeTemplate} header="Prioridade" style={{ width: '110px' }} />
                        <Column field="contatoNome" header="Contato" style={{ minWidth: '180px' }} />
                        <Column body={vencimentoTemplate} header="Vencimento" style={{ width: '130px' }} />
                        <Column field="tipoResponsavel" header="Responsável" style={{ minWidth: '140px' }} />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '130px' }} />
                    </DataTable>
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '540px' }} header={editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
                modal onHide={() => setFormVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setFormVisible(false)} disabled={saving} />
                        <Button label="Salvar" icon="pi pi-save" onClick={handleSave} loading={saving} className="p-button-success" />
                    </div>
                }>
                <div className="grid formgrid pt-2">
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Status</label>
                        <Dropdown value={form.status} options={STATUS_TAREFA_OPTIONS}
                            onChange={e => update('status', e.value)} className="w-full" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Prioridade</label>
                        <Dropdown value={form.prioridade} options={PRIORIDADE_TAREFA_OPTIONS}
                            onChange={e => update('prioridade', e.value)} className="w-full" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Data Vencimento</label>
                        <Calendar value={form.dataVencimento ? new Date(form.dataVencimento) : null}
                            onChange={e => update('dataVencimento', e.value ? (e.value as Date).toISOString().split('T')[0] : undefined)}
                            dateFormat="dd/mm/yy" className="w-full" />
                    </div>

                    <div className="field col-12">
                        <label className="font-semibold">Descrição</label>
                        <InputTextarea value={(form as any).descricao ?? ''} onChange={e => update('descricao' as any, e.target.value)}
                            rows={3} className="w-full" autoResize placeholder="Detalhes da tarefa..." />
                    </div>
                </div>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog visible={deleteVisible} style={{ width: '420px' }} header="Confirmar Exclusão" modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteVisible(false)} disabled={deleting} />
                        <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={deleting} />
                    </div>
                }
                onHide={() => setDeleteVisible(false)}>
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-3xl text-yellow-500" />
                    <span>Excluir esta tarefa? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default TarefasPage;
