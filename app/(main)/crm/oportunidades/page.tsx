'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { OportunidadeService, OportunidadeDTO } from '@/services/oportunidade.service';

const ESTAGIO_OPTIONS = [
    { label: 'Prospecção', value: 'Prospecting' },
    { label: 'Qualificação', value: 'Qualification' },
    { label: 'Proposta', value: 'Proposal' },
    { label: 'Negociação', value: 'Negotiation' },
    { label: 'Fechado - Ganho', value: 'Closed Won' },
    { label: 'Fechado - Perdido', value: 'Closed Lost' }
];

const ESTAGIO_LABELS: Record<string, string> = {
    'Prospecting': 'Prospecção',
    'Qualification': 'Qualificação',
    'Proposal': 'Proposta',
    'Negotiation': 'Negociação',
    'Closed Won': 'Fechado - Ganho',
    'Closed Lost': 'Fechado - Perdido'
};

const ESTAGIO_SEVERITY: Record<string, string> = {
    'Prospecting': 'info',
    'Qualification': 'warning',
    'Proposal': 'warning',
    'Negotiation': 'info',
    'Closed Won': 'success',
    'Closed Lost': 'danger'
};

const OportunidadesPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    // State
    const [oportunidades, setOportunidades] = useState<OportunidadeDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [sortField, setSortField] = useState('nome');
    const [sortOrder, setSortOrder] = useState<1 | -1>(1);
    const [globalFilter, setGlobalFilter] = useState('');
    const [estagioFilter, setEstagioFilter] = useState<string | null>(null);

    // Delete dialog
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [oportunidadeToDelete, setOportunidadeToDelete] = useState<OportunidadeDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchOportunidades = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await OportunidadeService.listarPaginado({
                page,
                size: rows,
                sort: sortField,
                direction: sortOrder === 1 ? 'asc' : 'desc'
            });
            setOportunidades(response.content);
            setTotalRecords(response.totalElements);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar oportunidades',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    }, [first, rows, sortField, sortOrder]);

    useEffect(() => {
        fetchOportunidades();
    }, [fetchOportunidades]);

    const onPage = (event: DataTablePageEvent) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const onSort = (event: any) => {
        setSortField(event.sortField);
        setSortOrder(event.sortOrder);
        setFirst(0);
    };

    // Delete
    const confirmDelete = (oportunidade: OportunidadeDTO) => {
        setOportunidadeToDelete(oportunidade);
        setDeleteDialogVisible(true);
    };

    const handleDelete = async () => {
        if (!oportunidadeToDelete) return;
        setDeleting(true);
        try {
            await OportunidadeService.excluir(oportunidadeToDelete.id!);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Oportunidade "${oportunidadeToDelete.nome}" excluída com sucesso`,
                life: 3000
            });
            setDeleteDialogVisible(false);
            setOportunidadeToDelete(null);
            fetchOportunidades();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir oportunidade',
                life: 5000
            });
        } finally {
            setDeleting(false);
        }
    };

    // Templates
    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '—';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const estagioBodyTemplate = (rowData: OportunidadeDTO) => {
        const label = ESTAGIO_LABELS[rowData.estagio || ''] || rowData.estagio || '—';
        const severity = (ESTAGIO_SEVERITY[rowData.estagio || ''] || 'secondary') as any;
        return <Tag value={label} severity={severity} />;
    };

    const dateBodyTemplate = (rowData: OportunidadeDTO) => {
        if (!rowData.dataFechamento) return '—';
        return new Date(rowData.dataFechamento).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const probabilidadeTemplate = (rowData: OportunidadeDTO) => {
        if (rowData.probabilidade === undefined || rowData.probabilidade === null) return '—';
        return `${rowData.probabilidade}%`;
    };

    const actionsBodyTemplate = (rowData: OportunidadeDTO) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    severity="info"
                    tooltip="Visualizar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/oportunidades/${rowData.id}`)}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/oportunidades/${rowData.id}/editar`)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    tooltip="Excluir"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => confirmDelete(rowData)}
                />
            </div>
        );
    };

    // Toolbar
    const startContent = (
        <div className="flex flex-wrap gap-2 align-items-center">
            <h2 className="m-0 text-xl font-semibold">Oportunidades</h2>
            <Tag value={`${totalRecords} registros`} className="ml-2" />
        </div>
    );

    const endContent = (
        <Button
            label="Nova Oportunidade"
            icon="pi pi-plus"
            severity="success"
            onClick={() => router.push('/crm/oportunidades/novo')}
        />
    );

    // Header da DataTable
    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar oportunidades..."
                    className="w-full sm:w-auto"
                />
            </span>
            <div className="flex gap-2">
                <Dropdown
                    value={estagioFilter}
                    options={[{ label: 'Todos os Estágios', value: null }, ...ESTAGIO_OPTIONS]}
                    onChange={(e) => setEstagioFilter(e.value)}
                    placeholder="Filtrar por estágio"
                    className="w-full sm:w-auto"
                />
                <Button
                    icon="pi pi-refresh"
                    rounded
                    text
                    severity="secondary"
                    tooltip="Atualizar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={fetchOportunidades}
                />
            </div>
        </div>
    );

    const filteredOportunidades = estagioFilter
        ? oportunidades.filter(o => o.estagio === estagioFilter)
        : oportunidades;

    // Delete dialog footer
    const deleteDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Cancelar"
                icon="pi pi-times"
                outlined
                onClick={() => setDeleteDialogVisible(false)}
            />
            <Button
                label="Excluir"
                icon="pi pi-trash"
                severity="danger"
                loading={deleting}
                onClick={handleDelete}
            />
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />

                <div className="card">
                    <Toolbar start={startContent} end={endContent} className="mb-4" />

                    <DataTable
                        value={filteredOportunidades}
                        lazy
                        paginator
                        first={first}
                        rows={rows}
                        totalRecords={totalRecords}
                        onPage={onPage}
                        onSort={onSort}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        loading={loading}
                        header={header}
                        emptyMessage="Nenhuma oportunidade encontrada."
                        rowsPerPageOptions={[10, 20, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} oportunidades"
                        globalFilter={globalFilter}
                        dataKey="id"
                        stripedRows
                        rowHover
                        responsiveLayout="scroll"
                        className="datatable-responsive"
                    >
                        <Column
                            field="nome"
                            header="Nome"
                            sortable
                            style={{ minWidth: '200px' }}
                            body={(rowData: OportunidadeDTO) => (
                                <span
                                    className="font-semibold text-primary cursor-pointer hover:underline"
                                    onClick={() => router.push(`/crm/oportunidades/${rowData.id}`)}
                                >
                                    {rowData.nome}
                                </span>
                            )}
                        />
                        <Column
                            field="contaNome"
                            header="Empresa"
                            sortable
                            style={{ minWidth: '150px' }}
                            body={(rowData: OportunidadeDTO) =>
                                rowData.contaNome ? (
                                    <span
                                        className="text-primary cursor-pointer hover:underline"
                                        onClick={() => rowData.contaId && router.push(`/crm/contas/${rowData.contaId}`)}
                                    >
                                        {rowData.contaNome}
                                    </span>
                                ) : '—'
                            }
                        />
                        <Column
                            field="estagio"
                            header="Estágio"
                            sortable
                            style={{ minWidth: '140px' }}
                            body={estagioBodyTemplate}
                        />
                        <Column
                            field="montante"
                            header="Valor"
                            sortable
                            style={{ minWidth: '140px' }}
                            body={(rowData: OportunidadeDTO) => formatCurrency(rowData.montante)}
                        />
                        <Column
                            field="probabilidade"
                            header="Prob."
                            sortable
                            style={{ minWidth: '80px' }}
                            body={probabilidadeTemplate}
                        />
                        <Column
                            field="dataFechamento"
                            header="Data Fechamento"
                            sortable
                            style={{ minWidth: '140px' }}
                            body={dateBodyTemplate}
                        />
                        <Column
                            field="contatoNome"
                            header="Contato"
                            style={{ minWidth: '140px' }}
                            body={(rowData: OportunidadeDTO) => rowData.contatoNome || '—'}
                        />
                        <Column
                            header="Ações"
                            style={{ minWidth: '150px', textAlign: 'center' }}
                            body={actionsBodyTemplate}
                            frozen
                            alignFrozen="right"
                        />
                    </DataTable>
                </div>

                {/* Dialog de confirmação de exclusão */}
                <Dialog
                    visible={deleteDialogVisible}
                    style={{ width: '450px' }}
                    header="Confirmar Exclusão"
                    modal
                    footer={deleteDialogFooter}
                    onHide={() => setDeleteDialogVisible(false)}
                >
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-exclamation-triangle text-4xl text-orange-500" />
                        <span>
                            Tem certeza que deseja excluir a oportunidade{' '}
                            <strong>{oportunidadeToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default OportunidadesPage;
