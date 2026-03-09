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
import { Avatar } from 'primereact/avatar';
import { formatDate } from '@/utils/format';
import { UsuarioService, UsuarioDTO } from '@/services/usuario.service';

const UsuariosPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');

    // Delete dialog
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState<UsuarioDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await UsuarioService.getPaginated({
                page,
                size: rows,
                sort: 'nome',
                direction: 'asc'
            });
            setUsuarios(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar usuários',
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const handlePage = (e: DataTablePageEvent) => {
        setFirst(e.first);
        setRows(e.rows);
    };

    const confirmDelete = (usuario: UsuarioDTO) => {
        setUsuarioToDelete(usuario);
        setDeleteVisible(true);
    };

    const handleDelete = async () => {
        if (!usuarioToDelete?.id) return;
        setDeleting(true);
        try {
            await UsuarioService.delete(usuarioToDelete.id);
            toast.current?.show({
                severity: 'success',
                summary: 'Excluído',
                detail: 'Usuário excluído com sucesso',
                life: 3000
            });
            setDeleteVisible(false);
            setUsuarioToDelete(null);
            fetchUsuarios();
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir usuário',
                life: 5000
            });
        } finally {
            setDeleting(false);
        }
    };

    // ── Templates ──────────────────────────────────────────────────────────────

    const nomeTemplate = (row: UsuarioDTO) => (
        <div className="flex align-items-center gap-2">
            <Avatar
                label={row.nome?.charAt(0).toUpperCase() ?? '?'}
                shape="circle"
                style={{ backgroundColor: '#6366f1', color: '#fff', width: '2rem', height: '2rem', fontSize: '0.85rem' }}
            />
            <div>
                <div className="font-semibold">{row.nome} {row.sobrenome}</div>
                <div className="text-500 text-sm">{row.nomeUsuario}</div>
            </div>
        </div>
    );

    const adminTemplate = (row: UsuarioDTO) =>
        row.administrador ? (
            <Tag value="Admin" severity="danger" icon="pi pi-shield" />
        ) : (
            <Tag value="Usuário" severity="info" />
        );

    const ativoTemplate = (row: UsuarioDTO) =>
        row.ativo !== false ? (
            <Tag value="Ativo" severity="success" icon="pi pi-check" />
        ) : (
            <Tag value="Inativo" severity="secondary" />
        );

    const dataCriacaoTemplate = (row: UsuarioDTO) =>
        row.criadoEm ? formatDate(row.criadoEm) : '-';

    const acoesTemplate = (row: UsuarioDTO) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                tooltip="Visualizar"
                tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/admin/usuarios/${row.id}`)}
            />
            <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="warning"
                tooltip="Editar"
                tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/admin/usuarios/${row.id}/editar`)}
            />
            <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                tooltip="Excluir"
                tooltipOptions={{ position: 'top' }}
                onClick={() => confirmDelete(row)}
            />
        </div>
    );

    const filteredUsuarios = usuarios.filter((u) => {
        if (!globalFilter) return true;
        const q = globalFilter.toLowerCase();
        return (
            u.nome?.toLowerCase().includes(q) ||
            u.sobrenome?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.nomeUsuario?.toLowerCase().includes(q)
        );
    });

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar usuário..."
                    className="w-20rem"
                />
            </span>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <div className="card">
                    <Toolbar
                        className="mb-4"
                        start={
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-users text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Usuários</h5>
                                    <span className="text-500 text-sm">
                                        Gerencie os usuários do sistema
                                    </span>
                                </div>
                            </div>
                        }
                        end={
                            <Button
                                label="Novo Usuário"
                                icon="pi pi-user-plus"
                                className="p-button-success"
                                onClick={() => router.push('/admin/usuarios/novo')}
                            />
                        }
                    />

                    <DataTable
                        value={filteredUsuarios}
                        loading={loading}
                        paginator
                        lazy
                        rows={rows}
                        first={first}
                        totalRecords={totalRecords}
                        onPage={handlePage}
                        rowsPerPageOptions={[10, 20, 50]}
                        header={header}
                        emptyMessage="Nenhum usuário encontrado."
                        stripedRows
                        showGridlines
                        size="small"
                        responsiveLayout="scroll"
                    >
                        <Column body={nomeTemplate} header="Usuário" style={{ minWidth: '220px' }} />
                        <Column field="email" header="E-mail" style={{ minWidth: '200px' }} />
                        <Column field="titulo" header="Cargo" style={{ minWidth: '150px' }} />
                        <Column field="departamento" header="Departamento" style={{ minWidth: '150px' }} />
                        <Column body={adminTemplate} header="Perfil" style={{ width: '110px' }} />
                        <Column body={ativoTemplate} header="Status" style={{ width: '100px' }} />
                        <Column body={dataCriacaoTemplate} header="Criado em" style={{ width: '130px' }} />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '130px' }} />
                    </DataTable>
                </div>
            </div>

            {/* Confirmar exclusão */}
            <Dialog
                visible={deleteVisible}
                style={{ width: '450px' }}
                header="Confirmar Exclusão"
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setDeleteVisible(false)}
                            disabled={deleting}
                        />
                        <Button
                            label="Excluir"
                            icon="pi pi-trash"
                            severity="danger"
                            onClick={handleDelete}
                            loading={deleting}
                        />
                    </div>
                }
                onHide={() => setDeleteVisible(false)}
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-3xl text-yellow-500" />
                    <span>
                        Deseja excluir o usuário{' '}
                        <strong>{usuarioToDelete?.nome} {usuarioToDelete?.sobrenome}</strong>?
                        Esta ação não pode ser desfeita.
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

export default UsuariosPage;
