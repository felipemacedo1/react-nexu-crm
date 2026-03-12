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
import { Dropdown } from 'primereact/dropdown';
import {
    CasoService,
    CasoResponseDTO,
    ESTADO_CASO_OPTIONS,
    STATUS_CASO_OPTIONS,
    PRIORIDADE_CASO_OPTIONS
} from '@/services/caso.service';

const STATUS_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'info'> = {
    New: 'info',
    Assigned: 'info',
    'In Review': 'warning',
    'Pending Input': 'warning',
    Resolved: 'success',
    Closed: 'info'
};

const PRIORIDADE_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    Low: 'success',
    Medium: 'warning',
    High: 'danger',
    Urgent: 'danger'
};

const ESTADO_SEVERITY: Record<string, 'success' | 'danger'> = {
    Open: 'success',
    Closed: 'danger'
};

const CasosPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [casos, setCasos] = useState<CasoResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [prioridadeFilter, setPrioridadeFilter] = useState<string | null>(null);

    // Delete
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [casoToDelete, setCasoToDelete] = useState<CasoResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCasos = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await CasoService.listarPaginado({ page, size: rows, sort: 'nome', direction: 'asc' });
            setCasos(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar casos', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchCasos(); }, [fetchCasos]);

    const handleDelete = async () => {
        if (!casoToDelete) return;
        setDeleting(true);
        try {
            await CasoService.delete(casoToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Caso excluído', life: 3000 });
            setDeleteVisible(false);
            fetchCasos();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir caso', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const estadoTemplate = (row: CasoResponseDTO) =>
        row.estado ? <Tag value={row.estado} severity={ESTADO_SEVERITY[row.estado] ?? 'info'} /> : null;

    const statusTemplate = (row: CasoResponseDTO) =>
        row.status ? <Tag value={row.status} severity={STATUS_SEVERITY[row.status] ?? 'info'} /> : null;

    const prioridadeTemplate = (row: CasoResponseDTO) =>
        row.prioridade ? <Tag value={row.prioridade} severity={PRIORIDADE_SEVERITY[row.prioridade] ?? 'info'} /> : null;

    const acoesTemplate = (row: CasoResponseDTO) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Ver detalhes" tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/suporte/casos/${row.id}`)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/suporte/casos/${row.id}/editar`)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setCasoToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filtered = casos.filter(c => {
        const q = globalFilter.toLowerCase();
        const matchText = !globalFilter || c.nome?.toLowerCase().includes(q) || c.contaNome?.toLowerCase().includes(q);
        const matchEstado = !estadoFilter || c.estado === estadoFilter;
        const matchStatus = !statusFilter || c.status === statusFilter;
        const matchPrioridade = !prioridadeFilter || c.prioridade === prioridadeFilter;
        return matchText && matchEstado && matchStatus && matchPrioridade;
    });

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar caso..." className="w-15rem" />
            </span>
            <div className="flex flex-wrap gap-2">
                <Dropdown value={estadoFilter} options={[{ label: 'Todos os estados', value: null }, ...ESTADO_CASO_OPTIONS]}
                    onChange={e => setEstadoFilter(e.value)} placeholder="Estado" className="w-10rem" showClear />
                <Dropdown value={statusFilter} options={[{ label: 'Todos os status', value: null }, ...STATUS_CASO_OPTIONS]}
                    onChange={e => setStatusFilter(e.value)} placeholder="Status" className="w-12rem" showClear />
                <Dropdown value={prioridadeFilter} options={[{ label: 'Prioridade', value: null }, ...PRIORIDADE_CASO_OPTIONS]}
                    onChange={e => setPrioridadeFilter(e.value)} placeholder="Prioridade" className="w-10rem" showClear />
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
                                <i className="pi pi-ticket text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Casos de Suporte</h5>
                                    <span className="text-500 text-sm">Gerencie os casos e atendimentos ao cliente</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Caso" icon="pi pi-plus" className="p-button-success" onClick={() => router.push('/suporte/casos/novo')} />}
                    />
                    <DataTable value={filtered} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhum caso encontrado."
                        stripedRows showGridlines size="small">
                        <Column field="nome" header="Nome do Caso" sortable style={{ minWidth: '220px' }} />
                        <Column body={estadoTemplate} header="Estado" style={{ width: '100px' }} />
                        <Column body={statusTemplate} header="Status" style={{ width: '130px' }} />
                        <Column body={prioridadeTemplate} header="Prioridade" style={{ width: '110px' }} />
                        <Column field="contaNome" header="Empresa" style={{ minWidth: '180px' }} />
                        <Column field="contatoCriadoPorNome" header="Criado por" style={{ minWidth: '160px' }} />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '130px' }} />
                    </DataTable>
                </div>
            </div>

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
                    <span>Excluir o caso <strong>{casoToDelete?.nome}</strong>? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default CasosPage;
