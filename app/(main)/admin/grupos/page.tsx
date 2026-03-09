'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Accordion, AccordionTab } from 'primereact/accordion';
import {
    GrupoSegurancaService,
    GrupoSegurancaResponseDTO,
    GrupoSegurancaRequestDTO,
    MODULOS_PERMISSOES
} from '@/services/grupo-seguranca.service';

const GruposPage = () => {
    const toast = useRef<Toast>(null);

    const [grupos, setGrupos] = useState<GrupoSegurancaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');

    // Form
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<GrupoSegurancaRequestDTO>({ nome: '', ativo: true, permissoes: [] });

    // Delete
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [grupoToDelete, setGrupoToDelete] = useState<GrupoSegurancaResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchGrupos = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await GrupoSegurancaService.listarPaginado({ page, size: rows, sort: 'nome', direction: 'asc' });
            setGrupos(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar grupos', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchGrupos(); }, [fetchGrupos]);

    const openNew = () => {
        setEditingId(null);
        setForm({ nome: '', ativo: true, permissoes: [] });
        setFormVisible(true);
    };

    const openEdit = (g: GrupoSegurancaResponseDTO) => {
        setEditingId(g.id);
        setForm({ nome: g.nome, descricao: g.descricao, ativo: g.ativo, permissoes: g.permissoes ?? [] });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.nome?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O nome do grupo é obrigatório.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await GrupoSegurancaService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Grupo atualizado!', life: 3000 });
            } else {
                await GrupoSegurancaService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Grupo criado!', life: 3000 });
            }
            setFormVisible(false);
            fetchGrupos();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao salvar.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!grupoToDelete) return;
        setDeleting(true);
        try {
            await GrupoSegurancaService.delete(grupoToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Grupo excluído', life: 3000 });
            setDeleteVisible(false);
            fetchGrupos();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir grupo', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const togglePermissao = (perm: string) => {
        const current = form.permissoes ?? [];
        const updated = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
        setForm(prev => ({ ...prev, permissoes: updated }));
    };

    const ativoTemplate = (row: GrupoSegurancaResponseDTO) =>
        <Tag value={row.ativo ? 'Ativo' : 'Inativo'} severity={row.ativo ? 'success' : 'secondary'} />;

    const usuariosTemplate = (row: GrupoSegurancaResponseDTO) =>
        <span className="font-semibold">{row.totalUsuarios ?? 0}</span>;

    const permissoesTemplate = (row: GrupoSegurancaResponseDTO) => (
        <span className="text-500 text-sm">{(row.permissoes?.length ?? 0)} permissões</span>
    );

    const acoesTemplate = (row: GrupoSegurancaResponseDTO) => (
        <div className="flex gap-1">
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(row)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setGrupoToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filtered = grupos.filter(g => {
        const q = globalFilter.toLowerCase();
        return !globalFilter || g.nome?.toLowerCase().includes(q) || g.descricao?.toLowerCase().includes(q);
    });

    const header = (
        <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar grupo..." className="w-18rem" />
        </span>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <Toolbar className="mb-4"
                        start={
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-shield text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Grupos de Segurança</h5>
                                    <span className="text-500 text-sm">Gerencie grupos de acesso e permissões</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Grupo" icon="pi pi-plus" className="p-button-success" onClick={openNew} />}
                    />
                    <DataTable value={filtered} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhum grupo encontrado."
                        stripedRows showGridlines size="small">
                        <Column field="nome" header="Nome" sortable style={{ minWidth: '200px' }} />
                        <Column field="descricao" header="Descrição" style={{ minWidth: '220px' }} />
                        <Column body={ativoTemplate} header="Status" style={{ width: '100px' }} />
                        <Column body={usuariosTemplate} header="Usuários" style={{ width: '100px' }} />
                        <Column body={permissoesTemplate} header="Permissões" style={{ width: '140px' }} />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '100px' }} />
                    </DataTable>
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '680px' }} header={editingId ? 'Editar Grupo' : 'Novo Grupo de Segurança'}
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
                        <InputText value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} className="w-full" placeholder="Ex: Vendedores, Gestores..." />
                    </div>
                    <div className="field col-12 md:col-4 flex align-items-center gap-3 pt-4">
                        <label className="font-semibold">Ativo?</label>
                        <InputSwitch checked={form.ativo ?? true} onChange={e => setForm(p => ({ ...p, ativo: e.value }))} />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Descrição</label>
                        <InputTextarea value={form.descricao ?? ''} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={2} className="w-full" autoResize />
                    </div>

                    <Divider className="col-12 my-1" />
                    <div className="col-12">
                        <h6 className="text-primary font-bold uppercase text-xs mb-3">Permissões</h6>
                        <Accordion multiple>
                            {MODULOS_PERMISSOES.map(m => (
                                <AccordionTab key={m.modulo} header={m.modulo}>
                                    <div className="grid">
                                        {m.permissoes.map(p => (
                                            <div key={p.value} className="col-12 md:col-6 flex align-items-center gap-2 py-1">
                                                <Checkbox inputId={p.value} checked={(form.permissoes ?? []).includes(p.value)}
                                                    onChange={() => togglePermissao(p.value)} />
                                                <label htmlFor={p.value} className="cursor-pointer text-sm">{p.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionTab>
                            ))}
                        </Accordion>
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
                    <span>Excluir o grupo <strong>{grupoToDelete?.nome}</strong>? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default GruposPage;
