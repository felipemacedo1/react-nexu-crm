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
import { OrcamentoService, OrcamentoResponseDTO, FASE_ORCAMENTO_OPTIONS } from '@/services/financeiro.service';
import { formatCurrency } from '@/utils/format';

const FASE_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'info'> = {
    Draft: 'info',
    'Needs Analysis': 'info',
    'Value Proposition': 'info',
    Negotiation: 'warning',
    'Closed Won': 'success',
    'Closed Lost': 'danger',
    Delivered: 'success',
    Closed: 'info'
};

const OrcamentosPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [orcamentos, setOrcamentos] = useState<OrcamentoResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');
    const [faseFilter, setFaseFilter] = useState<string | null>(null);

    // Delete
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [orcToDelete, setOrcToDelete] = useState<OrcamentoResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchOrcamentos = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await OrcamentoService.listarPaginado({ page, size: rows, sort: 'numero', direction: 'asc' });
            setOrcamentos(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar orçamentos', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchOrcamentos(); }, [fetchOrcamentos]);

    const handleDelete = async () => {
        if (!orcToDelete) return;
        setDeleting(true);
        try {
            await OrcamentoService.delete(orcToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Orçamento excluído', life: 3000 });
            setDeleteVisible(false);
            fetchOrcamentos();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir orçamento', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const faseTemplate = (row: OrcamentoResponseDTO) =>
        row.fase ? <Tag value={row.fase} severity={FASE_SEVERITY[row.fase] ?? 'info'} /> : null;

    const totalTemplate = (row: OrcamentoResponseDTO) =>
        row.valorTotal != null ? formatCurrency(row.valorTotal) : '-';

    const descontoTemplate = (row: OrcamentoResponseDTO) =>
        row.valorDesconto != null ? formatCurrency(row.valorDesconto) : '-';

    const acoesTemplate = (row: OrcamentoResponseDTO) => (
        <div className="flex gap-1">
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/financeiro/orcamentos/${row.id}/editar`)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setOrcToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filtered = orcamentos.filter(o => {
        const q = globalFilter.toLowerCase();
        const matchText = !globalFilter || String(o.numero ?? '').toLowerCase().includes(q) || o.contaCobrancaNome?.toLowerCase().includes(q) || o.oportunidadeNome?.toLowerCase().includes(q);
        const matchFase = !faseFilter || o.fase === faseFilter;
        return matchText && matchFase;
    });

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar orçamento..." className="w-18rem" />
            </span>
            <Dropdown value={faseFilter} options={[{ label: 'Todas as fases', value: null }, ...FASE_ORCAMENTO_OPTIONS]}
                onChange={e => setFaseFilter(e.value)} placeholder="Fase" className="w-13rem" showClear />
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
                                <i className="pi pi-file-edit text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Orçamentos</h5>
                                    <span className="text-500 text-sm">Gerencie os orçamentos e propostas</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Orçamento" icon="pi pi-plus" className="p-button-success" onClick={() => router.push('/financeiro/orcamentos/novo')} />}
                    />
                    <DataTable value={filtered} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhum orçamento encontrado."
                        stripedRows showGridlines size="small">
                        <Column field="numero" header="Número" sortable style={{ width: '130px' }} />
                        <Column body={faseTemplate} header="Fase" style={{ width: '150px' }} />
                        <Column field="contaCobrancaNome" header="Empresa (Cobrança)" style={{ minWidth: '200px' }} />
                        <Column field="oportunidadeNome" header="Oportunidade" style={{ minWidth: '180px' }} />
                        <Column body={descontoTemplate} header="Desconto" style={{ width: '120px' }} className="text-right" />
                        <Column body={totalTemplate} header="Total" style={{ width: '130px' }} className="font-bold text-right" />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '100px' }} />
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
                    <span>Excluir o orçamento <strong>{orcToDelete?.numero}</strong>? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default OrcamentosPage;
