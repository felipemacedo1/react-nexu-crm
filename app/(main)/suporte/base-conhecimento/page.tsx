'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import {
    ArtigoService,
    ArtigoResponseDTO,
    ArtigoRequestDTO,
    STATUS_ARTIGO_OPTIONS,
    CATEGORIA_ARTIGO_OPTIONS
} from '@/services/base-conhecimento.service';

const STATUS_SEVERITY: Record<string, 'success' | 'warning' | 'info'> = {
    Draft: 'warning',
    Published: 'success',
    Archived: 'info'
};

const STATUS_LABEL: Record<string, string> = {
    Draft: 'Rascunho',
    Published: 'Publicado',
    Archived: 'Arquivado'
};

const BaseConhecimentoPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [artigos, setArtigos] = useState<ArtigoResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);

    // Form dialog
    const [formVisible, setFormVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ArtigoRequestDTO>({ titulo: '', conteudo: '', status: 'Draft' });

    // Delete
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [artigoToDelete, setArtigoToDelete] = useState<ArtigoResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    // View
    const [viewVisible, setViewVisible] = useState(false);
    const [artigoView, setArtigoView] = useState<ArtigoResponseDTO | null>(null);

    const fetchArtigos = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await ArtigoService.listarPaginado({ page, size: rows, sort: 'titulo', direction: 'asc' });
            setArtigos(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar artigos', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchArtigos(); }, [fetchArtigos]);

    const openNew = () => {
        setEditingId(null);
        setForm({ titulo: '', conteudo: '', status: 'Draft' });
        setFormVisible(true);
    };

    const openEdit = (a: ArtigoResponseDTO) => {
        setEditingId(a.id);
        setForm({ titulo: a.titulo, conteudo: a.conteudo, resumo: a.resumo, categoria: a.categoria, status: a.status });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.titulo?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'O título é obrigatório.', life: 4000 });
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await ArtigoService.atualizar(editingId, form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Artigo atualizado!', life: 3000 });
            } else {
                await ArtigoService.criar(form);
                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Artigo criado!', life: 3000 });
            }
            setFormVisible(false);
            fetchArtigos();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: err?.response?.data?.message ?? 'Erro ao salvar.', life: 5000 });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!artigoToDelete) return;
        setDeleting(true);
        try {
            await ArtigoService.delete(artigoToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Artigo excluído', life: 3000 });
            setDeleteVisible(false);
            fetchArtigos();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir artigo', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const update = (field: keyof ArtigoRequestDTO, value: any) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const statusTemplate = (row: ArtigoResponseDTO) =>
        row.status ? <Tag value={STATUS_LABEL[row.status] ?? row.status} severity={STATUS_SEVERITY[row.status] ?? 'info'} /> : null;

    const acoesTemplate = (row: ArtigoResponseDTO) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Visualizar" tooltipOptions={{ position: 'top' }}
                onClick={() => { setArtigoView(row); setViewVisible(true); }} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }}
                onClick={() => openEdit(row)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setArtigoToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filtered = artigos.filter(a => {
        const q = globalFilter.toLowerCase();
        const matchText = !globalFilter || a.titulo?.toLowerCase().includes(q) || a.resumo?.toLowerCase().includes(q);
        const matchStatus = !statusFilter || a.status === statusFilter;
        const matchCategoria = !categoriaFilter || a.categoria === categoriaFilter;
        return matchText && matchStatus && matchCategoria;
    });

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar artigo..." className="w-18rem" />
            </span>
            <div className="flex gap-2">
                <Dropdown value={statusFilter} options={[{ label: 'Todos os status', value: null }, ...STATUS_ARTIGO_OPTIONS]}
                    onChange={e => setStatusFilter(e.value)} placeholder="Status" className="w-11rem" showClear />
                <Dropdown value={categoriaFilter} options={[{ label: 'Todas as categorias', value: null }, ...CATEGORIA_ARTIGO_OPTIONS]}
                    onChange={e => setCategoriaFilter(e.value)} placeholder="Categoria" className="w-12rem" showClear />
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
                                <i className="pi pi-book text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Base de Conhecimento</h5>
                                    <span className="text-500 text-sm">Artigos e documentação de suporte</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Artigo" icon="pi pi-plus" className="p-button-success" onClick={openNew} />}
                    />
                    <DataTable value={filtered} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhum artigo encontrado."
                        stripedRows showGridlines size="small">
                        <Column field="titulo" header="Título" sortable style={{ minWidth: '240px' }} />
                        <Column field="categoria" header="Categoria" style={{ width: '130px' }} />
                        <Column body={statusTemplate} header="Status" style={{ width: '120px' }} />
                        <Column field="visualizacoes" header="Visualizações" style={{ width: '130px' }} />
                        <Column field="criadoPorNome" header="Criado por" style={{ minWidth: '160px' }} />
                        <Column body={acoesTemplate} header="Ações" style={{ width: '120px' }} />
                    </DataTable>
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog visible={formVisible} style={{ width: '700px' }} header={editingId ? 'Editar Artigo' : 'Novo Artigo'}
                modal onHide={() => setFormVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setFormVisible(false)} disabled={saving} />
                        <Button label="Salvar" icon="pi pi-save" onClick={handleSave} loading={saving} className="p-button-success" />
                    </div>
                }>
                <div className="grid formgrid pt-2">
                    <div className="field col-12 md:col-8">
                        <label className="font-semibold">Título <span className="text-red-500">*</span></label>
                        <InputText value={form.titulo} onChange={e => update('titulo', e.target.value)} className="w-full" placeholder="Título do artigo..." />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label className="font-semibold">Status</label>
                        <Dropdown value={form.status} options={STATUS_ARTIGO_OPTIONS} onChange={e => update('status', e.value)} className="w-full" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold">Categoria</label>
                        <Dropdown value={form.categoria} options={CATEGORIA_ARTIGO_OPTIONS} onChange={e => update('categoria', e.value)} className="w-full" showClear placeholder="Selecione..." />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Resumo</label>
                        <InputTextarea value={form.resumo ?? ''} onChange={e => update('resumo', e.target.value)} rows={2} className="w-full" autoResize placeholder="Breve descrição..." />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Conteúdo <span className="text-red-500">*</span></label>
                        <InputTextarea value={form.conteudo} onChange={e => update('conteudo', e.target.value)} rows={8} className="w-full" autoResize placeholder="Conteúdo do artigo..." />
                    </div>
                </div>
            </Dialog>

            {/* View Dialog */}
            <Dialog visible={viewVisible} style={{ width: '700px' }} header={artigoView?.titulo ?? 'Artigo'}
                modal onHide={() => setViewVisible(false)}
                footer={
                    <div className="flex justify-content-between align-items-center">
                        <div className="flex gap-2">
                            {artigoView?.categoria && <Tag value={artigoView.categoria} severity="info" />}
                            {artigoView?.status && <Tag value={STATUS_LABEL[artigoView.status] ?? artigoView.status} severity={STATUS_SEVERITY[artigoView.status] ?? 'info'} />}
                        </div>
                        <Button label="Fechar" icon="pi pi-times" className="p-button-text" onClick={() => setViewVisible(false)} />
                    </div>
                }>
                {artigoView && (
                    <div>
                        {artigoView.resumo && <p className="text-600 font-italic mb-3 border-left-2 pl-3 border-primary">{artigoView.resumo}</p>}
                        <Divider />
                        <div className="line-height-3 text-900 white-space-pre-wrap">{artigoView.conteudo}</div>
                    </div>
                )}
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
                    <span>Excluir o artigo <strong>{artigoToDelete?.titulo}</strong>? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default BaseConhecimentoPage;
