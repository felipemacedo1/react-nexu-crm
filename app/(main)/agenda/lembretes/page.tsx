'use client';
import React, { useState, useRef, useCallback } from 'react';
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
import { InputSwitch } from 'primereact/inputswitch';
import { useEffect } from 'react';
import { formatDateTime } from '@/utils/format';
import {
    LembreteService,
    LembreteResponseDTO,
    LembreteRequestDTO
} from '@/services/evento.service';

const MODULO_OPTIONS = [
    { label: 'Ligação', value: 'Ligacao' },
    { label: 'Reunião', value: 'Reuniao' },
    { label: 'Evento', value: 'Evento' },
    { label: 'Tarefa', value: 'Tarefa' }
];

const LembretesPage = () => {
    const toast = useRef<Toast>(null);

    const [lembretes, setLembretes] = useState<LembreteResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');

    // Form
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<LembreteRequestDTO>({ nome: '', email: false });

    // Delete
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [lembreteToDelete, setLembreteToDelete] = useState<LembreteResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchLembretes = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await LembreteService.listarPaginado({ page, size: rows, sort: 'dataExecucao', direction: 'asc' });
            setLembretes(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar lembretes', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchLembretes(); }, [fetchLembretes]);

    const openNew = () => {
        setEditingId(null);
        setForm({ nome: '', email: false });
        setFormVisible(true);
    };

    const openEdit = (l: LembreteResponseDTO) => {
        setEditingId(l.id);
        setForm({
            nome: l.nome ?? '',
            email: l.email ?? false,
            dataExecucao: l.dataExecucao,
            temporizadorPopup: l.temporizadorPopup,
            temporizadorEmail: l.temporizadorEmail,
            moduloEventoRelacionado: l.moduloEventoRelacionado,
            moduloEventoRelacionadoId: l.moduloEventoRelacionadoId
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingId) {
                await LembreteService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Lembrete atualizado!', life: 3000 });
            } else {
                await LembreteService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Lembrete criado!', life: 3000 });
            }
            setFormVisible(false);
            fetchLembretes();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao salvar.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!lembreteToDelete) return;
        setDeleting(true);
        try {
            await LembreteService.delete(lembreteToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Lembrete excluído', life: 3000 });
            setDeleteVisible(false);
            fetchLembretes();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir lembrete', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const update = (field: keyof LembreteRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const emailTemplate = (row: LembreteResponseDTO) =>
        <Tag value={row.email ? 'Sim' : 'Não'} severity={row.email ? 'success' : 'info'} />;

    const popupTemplate = (row: LembreteResponseDTO) =>
        <Tag value={row.popupVisualizado ? 'Visto' : 'Pendente'} severity={row.popupVisualizado ? 'info' : 'warning'} />;

    const dataTemplate = (row: LembreteResponseDTO) =>
        row.dataExecucao ? formatDateTime(new Date(row.dataExecucao)) : '-';

    const acoesTemplate = (row: LembreteResponseDTO) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(row)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setLembreteToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filtered = lembretes.filter(l => {
        const q = globalFilter.toLowerCase();
        return !globalFilter || l.moduloEventoRelacionado?.toLowerCase().includes(q);
    });

    const header = (
        <div className="flex gap-2 align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar..." className="w-18rem" />
            </span>
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
                                <i className="pi pi-bell text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Lembretes</h5>
                                    <span className="text-500 text-sm">Gerencie seus lembretes e notificações</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Lembrete" icon="pi pi-plus" className="p-button-success" onClick={openNew} />}
                    />
                    <DataTable value={filtered} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhum lembrete encontrado."
                        stripedRows showGridlines size="small">
                        <Column field="moduloEventoRelacionado" header="Módulo" style={{ minWidth: '160px' }} />
                        <Column body={dataTemplate} header="Data/Hora Execução" style={{ width: '170px' }} />
                        <Column field="temporizadorPopup" header="Timer Popup (min)" style={{ width: '150px' }} />
                        <Column field="temporizadorEmail" header="Timer Email (min)" style={{ width: '150px' }} />
                        <Column body={emailTemplate} header="Email" style={{ width: '90px' }} />
                        <Column body={popupTemplate} header="Popup" style={{ width: '100px' }} />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '100px' }} />
                    </DataTable>
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '520px' }} header={editingId ? 'Editar Lembrete' : 'Novo Lembrete'}
                modal onHide={() => setFormVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setFormVisible(false)} disabled={saving} />
                        <Button label="Salvar" icon="pi pi-save" onClick={handleSave} loading={saving} className="p-button-success" />
                    </div>
                }>
                <div className="grid formgrid pt-2">
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Módulo relacionado</label>
                        <Dropdown value={form.moduloEventoRelacionado} options={MODULO_OPTIONS}
                            onChange={e => update('moduloEventoRelacionado', e.value)} className="w-full" placeholder="Selecione..." showClear />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Data/Hora Execução</label>
                        <Calendar value={form.dataExecucao ? new Date(form.dataExecucao) : null}
                            onChange={e => update('dataExecucao', e.value ? (e.value as Date).toISOString() : undefined)}
                            showTime hourFormat="24" dateFormat="dd/mm/yy" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Timer Popup (min)</label>
                        <InputText type="number" value={String(form.temporizadorPopup ?? '')}
                            onChange={e => update('temporizadorPopup', Number(e.target.value))} className="w-full" placeholder="ex: 15" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Timer Email (min)</label>
                        <InputText type="number" value={String(form.temporizadorEmail ?? '')}
                            onChange={e => update('temporizadorEmail', Number(e.target.value))} className="w-full" placeholder="ex: 30" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Enviar por email?</label>
                        <div className="mt-1">
                            <InputSwitch checked={form.email ?? false} onChange={e => update('email', e.value)} />
                        </div>
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
                    <span>Excluir este lembrete? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default LembretesPage;
