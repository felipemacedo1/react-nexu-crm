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
import { ProdutoService, ProdutoResponseDTO, TIPO_PRODUTO_OPTIONS } from '@/services/financeiro.service';
import { formatCurrency } from '@/utils/format';

const TIPO_SEVERITY: Record<string, 'info' | 'success' | 'warning'> = {
    Good: 'info',
    Service: 'success',
    Software: 'warning'
};

const ProdutosPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [produtos, setProdutos] = useState<ProdutoResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [globalFilter, setGlobalFilter] = useState('');
    const [tipoFilter, setTipoFilter] = useState<string | null>(null);

    // Delete
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [produtoToDelete, setProdutoToDelete] = useState<ProdutoResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProdutos = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows);
            const response = await ProdutoService.listarPaginado({ page, size: rows, sort: 'nome', direction: 'asc' });
            setProdutos(response.content);
            setTotalRecords(response.totalElements);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos', life: 5000 });
        } finally {
            setLoading(false);
        }
    }, [first, rows]);

    useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

    const handleDelete = async () => {
        if (!produtoToDelete) return;
        setDeleting(true);
        try {
            await ProdutoService.delete(produtoToDelete.id);
            toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Produto excluído', life: 3000 });
            setDeleteVisible(false);
            fetchProdutos();
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir produto', life: 5000 });
        } finally {
            setDeleting(false);
        }
    };

    const tipoTemplate = (row: ProdutoResponseDTO) =>
        row.tipo ? <Tag value={row.tipo} severity={TIPO_SEVERITY[row.tipo] ?? 'info'} /> : null;

    const precoTemplate = (row: ProdutoResponseDTO) =>
        row.preco != null ? formatCurrency(row.preco) : '-';

    const custoTemplate = (row: ProdutoResponseDTO) =>
        row.custo != null ? formatCurrency(row.custo) : '-';

    const acoesTemplate = (row: ProdutoResponseDTO) => (
        <div className="flex gap-1">
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Editar" tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/financeiro/produtos/${row.id}/editar`)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Excluir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setProdutoToDelete(row); setDeleteVisible(true); }} />
        </div>
    );

    const filtered = produtos.filter(p => {
        const q = globalFilter.toLowerCase();
        const matchText = !globalFilter || p.nome?.toLowerCase().includes(q) || p.codigoPrincipal?.toLowerCase().includes(q) || p.nomeCategoriaProduto?.toLowerCase().includes(q);
        const matchTipo = !tipoFilter || p.tipo === tipoFilter;
        return matchText && matchTipo;
    });

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Buscar produto..." className="w-18rem" />
            </span>
            <Dropdown value={tipoFilter} options={[{ label: 'Todos os tipos', value: null }, ...TIPO_PRODUTO_OPTIONS]}
                onChange={e => setTipoFilter(e.value)} placeholder="Tipo" className="w-12rem" showClear />
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
                                <i className="pi pi-box text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Produtos</h5>
                                    <span className="text-500 text-sm">Catálogo de produtos e serviços</span>
                                </div>
                            </div>
                        }
                        end={<Button label="Novo Produto" icon="pi pi-plus" className="p-button-success" onClick={() => router.push('/financeiro/produtos/novo')} />}
                    />
                    <DataTable value={filtered} loading={loading} paginator lazy rows={rows} first={first}
                        totalRecords={totalRecords} onPage={(e: DataTablePageEvent) => { setFirst(e.first); setRows(e.rows); }}
                        rowsPerPageOptions={[10, 20, 50]} header={header} emptyMessage="Nenhum produto encontrado."
                        stripedRows showGridlines size="small">
                        <Column field="nome" header="Nome" sortable style={{ minWidth: '200px' }} />
                        <Column field="codigoPrincipal" header="Código" style={{ width: '120px' }} />
                        <Column body={tipoTemplate} header="Tipo" style={{ width: '110px' }} />
                        <Column field="nomeCategoriaProduto" header="Categoria" style={{ minWidth: '160px' }} />
                        <Column body={custoTemplate} header="Custo" style={{ width: '120px' }} className="text-right" />
                        <Column body={precoTemplate} header="Preço" style={{ width: '120px' }} className="font-bold text-right" />
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
                    <span>Excluir o produto <strong>{produtoToDelete?.nome}</strong>? Esta ação não pode ser desfeita.</span>
                </div>
            </Dialog>
        </div>
    );
};

export default ProdutosPage;
