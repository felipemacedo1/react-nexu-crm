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
import { ContatoService, ContatoDTO } from '@/services/contato.service';

const ContatosPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    // State
    const [contatos, setContatos] = useState<ContatoDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [sortField, setSortField] = useState('nome');
    const [sortOrder, setSortOrder] = useState<1 | -1>(1);
    const [globalFilter, setGlobalFilter] = useState('');

    // Delete dialog
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [contatoToDelete, setContatoToDelete] = useState<ContatoDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchContatos = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await ContatoService.listarPaginado({
                page,
                size: rows,
                sort: sortField,
                direction: sortOrder === 1 ? 'asc' : 'desc'
            });
            setContatos(response.content);
            setTotalRecords(response.totalElements);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar contatos',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    }, [first, rows, sortField, sortOrder]);

    useEffect(() => {
        fetchContatos();
    }, [fetchContatos]);

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
    const confirmDelete = (contato: ContatoDTO) => {
        setContatoToDelete(contato);
        setDeleteDialogVisible(true);
    };

    const handleDelete = async () => {
        if (!contatoToDelete) return;
        setDeleting(true);
        try {
            await ContatoService.excluir(contatoToDelete.id!);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Contato "${contatoToDelete.nome} ${contatoToDelete.sobrenome}" excluído com sucesso`,
                life: 3000
            });
            setDeleteDialogVisible(false);
            setContatoToDelete(null);
            fetchContatos();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir contato',
                life: 5000
            });
        } finally {
            setDeleting(false);
        }
    };

    // Templates de coluna
    const nomeCompletoTemplate = (rowData: ContatoDTO) => {
        const nomeCompleto = `${rowData.nome} ${rowData.sobrenome || ''}`.trim();
        return (
            <span
                className="font-semibold text-primary cursor-pointer hover:underline"
                onClick={() => router.push(`/crm/contatos/${rowData.id}`)}
            >
                {nomeCompleto}
            </span>
        );
    };

    const dateBodyTemplate = (rowData: ContatoDTO) => {
        if (!rowData.criadoEm) return '—';
        return new Date(rowData.criadoEm).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const actionsBodyTemplate = (rowData: ContatoDTO) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    severity="info"
                    tooltip="Visualizar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/contatos/${rowData.id}`)}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/crm/contatos/${rowData.id}/editar`)}
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
            <h2 className="m-0 text-xl font-semibold">Contatos</h2>
            <Tag value={`${totalRecords} registros`} className="ml-2" />
        </div>
    );

    const endContent = (
        <Button
            label="Novo Contato"
            icon="pi pi-plus"
            severity="success"
            onClick={() => router.push('/crm/contatos/novo')}
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
                    placeholder="Buscar contatos..."
                    className="w-full sm:w-auto"
                />
            </span>
            <Button
                icon="pi pi-refresh"
                rounded
                text
                severity="secondary"
                tooltip="Atualizar"
                tooltipOptions={{ position: 'top' }}
                onClick={fetchContatos}
            />
        </div>
    );

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
                        value={contatos}
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
                        emptyMessage="Nenhum contato encontrado."
                        rowsPerPageOptions={[10, 20, 50]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} contatos"
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
                            body={nomeCompletoTemplate}
                        />
                        <Column
                            field="email"
                            header="Email"
                            sortable
                            style={{ minWidth: '200px' }}
                            body={(rowData: ContatoDTO) => rowData.email || '—'}
                        />
                        <Column
                            field="telefone"
                            header="Telefone"
                            style={{ minWidth: '140px' }}
                            body={(rowData: ContatoDTO) => rowData.telefone || '—'}
                        />
                        <Column
                            field="titulo"
                            header="Cargo"
                            sortable
                            style={{ minWidth: '150px' }}
                            body={(rowData: ContatoDTO) => rowData.titulo || '—'}
                        />
                        <Column
                            field="contaNome"
                            header="Empresa"
                            sortable
                            style={{ minWidth: '150px' }}
                            body={(rowData: ContatoDTO) =>
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
                            field="departamento"
                            header="Departamento"
                            style={{ minWidth: '130px' }}
                            body={(rowData: ContatoDTO) => rowData.departamento || '—'}
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
                            Tem certeza que deseja excluir o contato{' '}
                            <strong>{contatoToDelete?.nome} {contatoToDelete?.sobrenome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default ContatosPage;
