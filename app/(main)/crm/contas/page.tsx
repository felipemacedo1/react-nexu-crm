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
import { ContaService, ContaDTO } from '@/services/conta.service';

const CONTA_TIPO_OPTIONS = [
    { label: 'Cliente', value: 'Cliente' },
    { label: 'Parceiro', value: 'Parceiro' },
    { label: 'Prospect', value: 'Prospect' },
    { label: 'Fornecedor', value: 'Fornecedor' },
    { label: 'Outro', value: 'Outro' }
];

const ContasPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    // State
    const [contas, setContas] = useState<ContaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [sortField, setSortField] = useState('nome');
    const [sortOrder, setSortOrder] = useState<1 | -1>(1);
    const [globalFilter, setGlobalFilter] = useState('');
    const [tipoFilter, setTipoFilter] = useState<string | null>(null);

    // Delete dialog
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [contaToDelete, setContaToDelete] = useState<ContaDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchContas = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await ContaService.listarPaginado({
                page,
                size: rows,
                sort: sortField,
                direction: sortOrder === 1 ? 'asc' : 'desc'
            });
            setContas(response.content);
            setTotalRecords(response.totalElements);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar contas',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    }, [first, rows, sortField, sortOrder]);

    useEffect(() => {
        fetchContas();
    }, [fetchContas]);

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
    const confirmDelete = (conta: ContaDTO) => {
        setContaToDelete(conta);
        setDeleteDialogVisible(true);
    };

    const handleDelete = async () => {
        if (!contaToDelete) return;
        setDeleting(true);
        try {
            await ContaService.excluir(contaToDelete.id!);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Conta "${contaToDelete.nome}" excluída com sucesso`,
                life: 3000
            });
            setDeleteDialogVisible(false);
            setContaToDelete(null);
            fetchContas();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir conta',
                life: 5000
            });
        } finally {
            setDeleting(false);
        }
    };

    // Templates de coluna
    const formatCurrency = (value?: number) => {
        if (!value) return '—';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const dateBodyTemplate = (rowData: ContaDTO) => {
        if (!rowData.criadoEm) return '—';
        return new Date(rowData.criadoEm).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const actionsBodyTemplate = (rowData: ContaDTO) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    severity="info"
                    tooltip="Visualizar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/contas/${rowData.id}`)}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/contas/${rowData.id}/editar`)}
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
            <h2 className="m-0 text-xl font-semibold">Contas</h2>
            <Tag value={`${totalRecords} registros`} className="ml-2" />
        </div>
    );

    const endContent = (
        <Button
            label="Nova Conta"
            icon="pi pi-plus"
            severity="success"
            onClick={() => router.push('/crm/contas/novo')}
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
                    placeholder="Buscar contas..."
                    className="w-full sm:w-auto"
                />
            </span>
            <div className="flex gap-2">
                <Dropdown
                    value={tipoFilter}
                    options={[{ label: 'Todos os Tipos', value: null }, ...CONTA_TIPO_OPTIONS]}
                    onChange={(e) => setTipoFilter(e.value)}
                    placeholder="Filtrar por tipo"
                    className="w-full sm:w-auto"
                />
                <Button
                    icon="pi pi-refresh"
                    rounded
                    text
                    severity="secondary"
                    tooltip="Atualizar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={fetchContas}
                />
            </div>
        </div>
    );

    // Filtro local por tipo
    const filteredContas = tipoFilter
        ? contas.filter(c => c.tipo === tipoFilter)
        : contas;

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
                        value={filteredContas}
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
                        emptyMessage="Nenhuma conta encontrada."
                        rowsPerPageOptions={[10, 20, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} contas"
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
                            body={(rowData: ContaDTO) => (
                                <span
                                    className="font-semibold text-primary cursor-pointer hover:underline"
                                    onClick={() => router.push(`/crm/contas/${rowData.id}`)}
                                >
                                    {rowData.nome}
                                </span>
                            )}
                        />
                        <Column
                            field="tipo"
                            header="Tipo"
                            sortable
                            style={{ minWidth: '120px' }}
                            body={(rowData: ContaDTO) => rowData.tipo || '—'}
                        />
                        <Column
                            field="setor"
                            header="Setor"
                            sortable
                            style={{ minWidth: '150px' }}
                            body={(rowData: ContaDTO) => rowData.setor || '—'}
                        />
                        <Column
                            field="telefoneEscritorio"
                            header="Telefone"
                            style={{ minWidth: '140px' }}
                            body={(rowData: ContaDTO) => rowData.telefoneEscritorio || '—'}
                        />
                        <Column
                            field="email"
                            header="Email"
                            style={{ minWidth: '180px' }}
                            body={(rowData: ContaDTO) => rowData.email || '—'}
                        />
                        <Column
                            field="faturamentoAnual"
                            header="Faturamento"
                            sortable
                            style={{ minWidth: '150px' }}
                            body={(rowData: ContaDTO) => formatCurrency(rowData.faturamentoAnual)}
                        />
                        <Column
                            field="criadoEm"
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
                            Tem certeza que deseja excluir a conta{' '}
                            <strong>{contaToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default ContasPage;
