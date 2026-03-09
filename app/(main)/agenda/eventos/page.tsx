'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { formatDateTime } from '@/utils/format';
import {
    EventoService,
    EventoResponseDTO,
    EventoRequestDTO,
    TIPO_STATUS_EVENTO_OPTIONS
} from '@/services/evento.service';

const STATUS_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    Planned: 'info',
    Held: 'success',
    'Not Held': 'danger'
};

const STATUS_LABEL: Record<string, string> = {
    Planned: 'Planejado',
    Held: 'Realizado',
    'Not Held': 'Não realizado'
};

const EventosPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [eventos, setEventos] = useState<EventoResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Form dialog
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<EventoRequestDTO>({ nome: '', tipoStatusAtividade: 'Planned' });

    // Delete dialog
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [eventoToDelete, setEventoToDelete] = useState<EventoResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchEventos = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await EventoService.listarPaginado({ page, size: rows, sort: 'nome', direction: 'asc' });
            setEventos(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar eventos', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchEventos(); }, [fetchEventos]);

    const openNew = () => {
        setEditingId(null);
        setForm({ nome: '', tipoStatusAtividade: 'Planned' });
        setFormVisible(true);
    };

    const openEdit = (evento: EventoResponseDTO) => {
        setEditingId(evento.id);
        setForm({
            nome: evento.nome,
            descricao: evento.descricao,
            tipoStatusAtividade: evento.tipoStatusAtividade,
            dataInicio: evento.dataInicio,
            dataFim: evento.dataFim,
            link: evento.link,
            duracaoMinutos: evento.duracaoMinutos
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.nome?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O nome do evento é obrigatório.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await EventoService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Evento atualizado!', life: 3000 });
            } else {
                await EventoService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Evento criado!', life: 3000 });
            }
            setFormVisible(false);
            fetchEventos();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao salvar.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!eventoToDelete) return;
        setDeleting(true);
        try {
            await EventoService.delete(eventoToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Evento excluído com sucesso', life: 3000 });
            setDeleteVisible(false);
            fetchEventos();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir evento', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const update = (field: keyof EventoRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const statusTemplate = (row: EventoResponseDTO) =>
        row.tipoStatusAtividade ? (
            <Tag value={STATUS_LABEL[row.tipoStatusAtividade] ?? row.tipoStatusAtividade}
                severity={STATUS_SEVERITY[row.tipoStatusAtividade] ?? 'info'} />
        ) : null;

    const dataTemplate = (row: EventoResponseDTO) =>
        row.dataInicio ? formatDateTime(row.dataInicio) : '-';

    const duracaoTemplate = (row: EventoResponseDTO) =>
        row.duracaoMinutos ? `${row.duracaoMinutos} min` : '-';

    const acoesTemplate = (row: EventoResponseDTO) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(row)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setEventoToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filteredEventos = eventos.filter(e => {
        const q = globalFilter.toLowerCase();
        const matchText = !globalFilter || e.nome?.toLowerCase().includes(q);
        const matchStatus = !statusFilter || e.tipoStatusAtividade === statusFilter;
        return matchText && matchStatus;
    });

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar evento..." className="w-18rem" />
            </span>
            <Dropdown value={statusFilter} options={[{ label: 'Todos', value: null }, ...TIPO_STATUS_EVENTO_OPTIONS]}
                onChange={e => setStatusFilter(e.value)} placeholder="Status" className="w-12rem" showClear />
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
                                <i className="pi pi-calendar text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Eventos</h5>
                                    <span className="text-500 text-sm">Gerencie os eventos da sua agenda</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Evento" icon="pi pi-plus" className="p-button-success" onClick={openNew} />}
                    />
                    <DataTable value={filteredEventos} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhum evento encontrado."
                        stripedRows showGridlines size="small" responsiveLayout="scroll">
                        <Column field="nome" header="Nome" sortable style={{ minWidth: '220px' }} />
                        <Column body={statusTemplate} header="Status" style={{ width: '130px' }} />
                        <Column body={dataTemplate} header="Data/Hora Início" style={{ width: '170px' }} />
                        <Column body={duracaoTemplate} header="Duração" style={{ width: '110px' }} />
                        <Column field="link" header="Link" style={{ minWidth: '160px' }} />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '110px' }} />
                    </DataTable>
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '560px' }} header={editingId ? 'Editar Evento' : 'Novo Evento'}
                modal onHide={() => setFormVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setFormVisible(false)} disabled={saving} />
                        <Button label="Salvar" icon="pi pi-save" onClick={handleSave} loading={saving} className="p-button-success" />
                    </div>
                }>
                <div className="grid formgrid pt-2">
                    <div className="field col-12 md:col-8">
                        <label className="font-semibold">Nome <span className="text-red-500">*</span></label>
                        <InputText value={form.nome} onChange={e => update('nome', e.target.value)} className="w-full" placeholder="Nome do evento" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label className="font-semibold">Status</label>
                        <Dropdown value={form.tipoStatusAtividade} options={TIPO_STATUS_EVENTO_OPTIONS}
                            onChange={e => update('tipoStatusAtividade', e.value)} className="w-full" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Data/Hora Início</label>
                        <Calendar value={form.dataInicio ? new Date(form.dataInicio) : null}
                            onChange={e => update('dataInicio', e.value ? (e.value as Date).toISOString() : undefined)}
                            showTime hourFormat="24" dateFormat="dd/mm/yy" className="w-full" placeholder="Início" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Data/Hora Fim</label>
                        <Calendar value={form.dataFim ? new Date(form.dataFim) : null}
                            onChange={e => update('dataFim', e.value ? (e.value as Date).toISOString() : undefined)}
                            showTime hourFormat="24" dateFormat="dd/mm/yy" className="w-full" placeholder="Fim" />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Link</label>
                        <InputText value={form.link ?? ''} onChange={e => update('link', e.target.value)} className="w-full" placeholder="https://..." />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Descrição</label>
                        <InputTextarea value={form.descricao ?? ''} onChange={e => update('descricao', e.target.value)} rows={3} className="w-full" autoResize />
                    </div>
                </div>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog visible={deleteVisible} style={{ width: '450px' }} header="Confirmar Exclusão" modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteVisible(false)} disabled={deleting} />
                        <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={handleDelete} loading={deleting} />
                    </div>
                }
                onHide={() => setDeleteVisible(false)}>
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-3xl text-yellow-500" />
                    <span>Excluir o evento <strong>{eventoToDelete?.nome}</strong>? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default EventosPage;
