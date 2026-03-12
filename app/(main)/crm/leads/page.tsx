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
import { LeadService, LeadResponseDTO, LEAD_STATUS_OPTIONS, LEAD_STATUS_LABELS, LEAD_STATUS_SEVERITY } from '@/services/lead.service';

const LeadsPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    // State
    const [leads, setLeads] = useState<LeadResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [sortField, setSortField] = useState('nome');
    const [sortOrder, setSortOrder] = useState<1 | -1>(1);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Delete dialog
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<LeadResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await LeadService.listarPaginado({
                page,
                size: rows,
                sort: sortField,
                direction: sortOrder === 1 ? 'asc' : 'desc'
            });
            setLeads(response.content);
            setTotalRecords(response.totalElements);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar pré-clientes',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    }, [first, rows, sortField, sortOrder]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

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
    const confirmDelete = (lead: LeadResponseDTO) => {
        setLeadToDelete(lead);
        setDeleteDialogVisible(true);
    };

    const handleDelete = async () => {
        if (!leadToDelete) return;
        setDeleting(true);
        try {
            await LeadService.excluir(leadToDelete.id);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Pré-cliente "${leadToDelete.nome}" excluído com sucesso`,
                life: 3000
            });
            setDeleteDialogVisible(false);
            setLeadToDelete(null);
            fetchLeads();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir pré-cliente',
                life: 5000
            });
        } finally {
            setDeleting(false);
        }
    };

    // Templates de coluna
    const statusBodyTemplate = (rowData: LeadResponseDTO) => {
        const label = LEAD_STATUS_LABELS[rowData.status || ''] || rowData.status || '—';
        const severity = (LEAD_STATUS_SEVERITY[rowData.status || ''] || 'info') as any;
        return <Tag value={label} severity={severity} />;
    };

    const dateBodyTemplate = (rowData: LeadResponseDTO) => {
        if (!rowData.dataCriacao) return '—';
        return new Date(rowData.dataCriacao).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const actionsBodyTemplate = (rowData: LeadResponseDTO) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    severity="info"
                    tooltip="Visualizar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/leads/${rowData.id}`)}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/leads/${rowData.id}/editar`)}
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
            <h2 className="m-0 text-xl font-semibold">Pré-Clientes</h2>
            <Tag value={`${totalRecords} registros`} className="ml-2" />
        </div>
    );

    const endContent = (
        <Button
            label="Novo Pré-Cliente"
            icon="pi pi-plus"
            severity="success"
            onClick={() => router.push('/crm/leads/novo')}
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
                    placeholder="Buscar pré-clientes..."
                    className="w-full sm:w-auto"
                />
            </span>
            <div className="flex gap-2">
                <Dropdown
                    value={statusFilter}
                    options={[{ label: 'Todos os Status', value: null }, ...LEAD_STATUS_OPTIONS]}
                    onChange={(e) => setStatusFilter(e.value)}
                    placeholder="Filtrar por status"
                    className="w-full sm:w-auto"
                />
                <Button
                    icon="pi pi-refresh"
                    rounded
                    text
                    severity="info"
                    tooltip="Atualizar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={fetchLeads}
                />
            </div>
        </div>
    );

    // Filtro local por status
    const filteredLeads = statusFilter
        ? leads.filter(l => l.status === statusFilter)
        : leads;

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
                        value={filteredLeads}
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
                        emptyMessage="Nenhum pré-cliente encontrado."
                        rowsPerPageOptions={[10, 20, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pré-clientes"
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
                            body={(rowData: LeadResponseDTO) => (
                                <span
                                    className="font-semibold text-primary cursor-pointer hover:underline"
                                    onClick={() => router.push(`/crm/leads/${rowData.id}`)}
                                >
                                    {rowData.nome}
                                </span>
                            )}
                        />
                        <Column
                            field="nomeConta"
                            header="Empresa"
                            sortable
                            style={{ minWidth: '150px' }}
                            body={(rowData: LeadResponseDTO) => rowData.nomeConta || '—'}
                        />
                        <Column
                            field="status"
                            header="Status"
                            sortable
                            style={{ minWidth: '120px' }}
                            body={statusBodyTemplate}
                        />
                        <Column
                            field="origemLead"
                            header="Origem"
                            sortable
                            style={{ minWidth: '120px' }}
                            body={(rowData: LeadResponseDTO) => rowData.origemLead || '—'}
                        />
                        <Column
                            field="webParaLeadEmail1"
                            header="Email"
                            style={{ minWidth: '180px' }}
                            body={(rowData: LeadResponseDTO) => rowData.webParaLeadEmail1 || '—'}
                        />
                        <Column
                            field="dataCriacao"
                            header="Criado em"
                            sortable
                            style={{ minWidth: '120px' }}
                            body={dateBodyTemplate}
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
                            Tem certeza que deseja excluir o pré-cliente{' '}
                            <strong>{leadToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default LeadsPage;
