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
import { TabView, TabPanel } from 'primereact/tabview';
import { formatDateTime } from '@/utils/format';
import {
    LigacaoService,
    LigacaoResponseDTO,
    STATUS_ATIVIDADE_OPTIONS,
    TIPO_ATIVIDADE_OPTIONS
} from '@/services/atividade.service';

const STATUS_LABEL: Record<string, string> = {
    Planned: 'Planejado',
    Held: 'Realizado',
    'Not Held': 'Não realizado'
};

const STATUS_SEVERITY: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    Planned: 'info',
    Held: 'success',
    'Not Held': 'danger'
};

const DIRECAO_LABEL: Record<string, string> = {
    Inbound: 'Entrada',
    Outbound: 'Saída'
};

const ligacaoService = new LigacaoService();

const AtividadesPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    // ── Ligações ─────────────────────────────────────────────────────────────
    const [ligacoes, setLigacoes] = useState<LigacaoResponseDTO[]>([]);
    const [loadingLig, setLoadingLig] = useState(true);
    const [totalLig, setTotalLig] = useState(0);
    const [firstLig, setFirstLig] = useState(0);
    const [rowsLig, setRowsLig] = useState(20);
    const [filterLig, setFilterLig] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Delete dialog
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [ligToDelete, setLigToDelete] = useState<LigacaoResponseDTO | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchLigacoes = useCallback(async () => {
        setLoadingLig(true);
        try {
            const page = Math.floor(firstLig / rowsLig);
            const response = await ligacaoService.listarPaginado({
                page,
                size: rowsLig,
                sort: 'nome',
                direction: 'asc'
            });
            setLigacoes(response.content);
            setTotalLig(response.totalElements);
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar ligações',
                life: 5000
            });
        } finally {
            setLoadingLig(false);
        }
    }, [firstLig, rowsLig]);

    useEffect(() => {
        fetchLigacoes();
    }, [fetchLigacoes]);

    const handlePageLig = (e: DataTablePageEvent) => {
        setFirstLig(e.first);
        setRowsLig(e.rows);
    };

    const confirmDelete = (lig: LigacaoResponseDTO) => {
        setLigToDelete(lig);
        setDeleteVisible(true);
    };

    const handleDelete = async () => {
        if (!ligToDelete) return;
        setDeleting(true);
        try {
            await ligacaoService.delete(ligToDelete.id);
            toast.current?.show({
                severity: 'success',
                summary: 'Excluído',
                detail: 'Ligação excluída com sucesso',
                life: 3000
            });
            setDeleteVisible(false);
            setLigToDelete(null);
            fetchLigacoes();
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir ligação',
                life: 5000
            });
        } finally {
            setDeleting(false);
        }
    };

    // ── Templates de coluna ───────────────────────────────────────────────────

    const statusTemplate = (row: LigacaoResponseDTO) => {
        if (!row.status) return null;
        return (
            <Tag
                value={STATUS_LABEL[row.status] ?? row.status}
                severity={STATUS_SEVERITY[row.status] ?? 'info'}
            />
        );
    };

    const direcaoTemplate = (row: LigacaoResponseDTO) => {
        if (!row.direcao) return null;
        return (
            <Tag
                value={DIRECAO_LABEL[row.direcao] ?? row.direcao}
                severity={row.direcao === 'Inbound' ? 'info' : 'warning'}
            />
        );
    };

    const dataTemplate = (row: LigacaoResponseDTO) =>
        row.dataInicio ? formatDateTime(row.dataInicio) : '-';

    const duracaoTemplate = (row: LigacaoResponseDTO) => {
        const h = row.duracaoHoras ?? 0;
        const m = row.duracaoMinutos ?? 0;
        if (!h && !m) return '-';
        return `${h}h ${m}min`;
    };

    const acoesTemplate = (row: LigacaoResponseDTO) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                tooltip="Visualizar"
                tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/crm/atividades/ligacao/${row.id}`)}
            />
            <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="warning"
                tooltip="Editar"
                tooltipOptions={{ position: 'top' }}
                onClick={() => router.push(`/crm/atividades/ligacao/${row.id}/editar`)}
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

    // ── Filtros da tabela de ligações ─────────────────────────────────────────

    const headerLigacoes = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={filterLig}
                    onChange={(e) => setFilterLig(e.target.value)}
                    placeholder="Buscar ligação..."
                    className="w-20rem"
                />
            </span>
            <div className="flex gap-2 align-items-center">
                <Dropdown
                    value={statusFilter}
                    options={[{ label: 'Todos os status', value: null }, ...STATUS_ATIVIDADE_OPTIONS]}
                    onChange={(e) => setStatusFilter(e.value)}
                    placeholder="Status"
                    className="w-12rem"
                    showClear
                />
            </div>
        </div>
    );

    const filteredLig = ligacoes.filter((l) => {
        const matchText =
            !filterLig ||
            l.nome?.toLowerCase().includes(filterLig.toLowerCase()) ||
            l.contatoNome?.toLowerCase().includes(filterLig.toLowerCase());
        const matchStatus = !statusFilter || l.status === statusFilter;
        return matchText && matchStatus;
    });

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <div className="card">
                    {/* Toolbar */}
                    <Toolbar
                        className="mb-4"
                        start={
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-phone text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Atividades</h5>
                                    <span className="text-500 text-sm">
                                        Ligações, reuniões e registros de atividades
                                    </span>
                                </div>
                            </div>
                        }
                        end={
                            <div className="flex gap-2">
                                <Button
                                    label="Nova Ligação"
                                    icon="pi pi-plus"
                                    className="p-button-success"
                                    onClick={() => router.push('/crm/atividades/ligacao/nova')}
                                />
                                <Button
                                    label="Nova Reunião"
                                    icon="pi pi-calendar-plus"
                                    className="p-button-outlined"
                                    onClick={() => router.push('/crm/atividades/reuniao/nova')}
                                />
                            </div>
                        }
                    />

                    {/* Tabs por tipo de atividade */}
                    <TabView>
                        <TabPanel header="Ligações" leftIcon="pi pi-phone mr-2">
                            <DataTable
                                value={filteredLig}
                                loading={loadingLig}
                                paginator
                                lazy
                                rows={rowsLig}
                                first={firstLig}
                                totalRecords={totalLig}
                                onPage={handlePageLig}
                                rowsPerPageOptions={[10, 20, 50]}
                                header={headerLigacoes}
                                emptyMessage="Nenhuma ligação encontrada."
                                stripedRows
                                showGridlines
                                size="small"
                                responsiveLayout="scroll"
                            >
                                <Column field="nome" header="Assunto" sortable style={{ minWidth: '200px' }} />
                                <Column body={statusTemplate} header="Status" style={{ width: '130px' }} />
                                <Column body={direcaoTemplate} header="Direção" style={{ width: '110px' }} />
                                <Column field="contatoNome" header="Contato" style={{ minWidth: '150px' }} />
                                <Column body={dataTemplate} header="Data/Hora" style={{ width: '160px' }} />
                                <Column body={duracaoTemplate} header="Duração" style={{ width: '110px' }} />
                                <Column body={acoesTemplate} header="Ações" style={{ width: '130px' }} />
                            </DataTable>
                        </TabPanel>

                        <TabPanel header="Reuniões" leftIcon="pi pi-users mr-2">
                            <div className="flex flex-column align-items-center justify-content-center py-6 text-500">
                                <i className="pi pi-users text-4xl mb-3 text-300" />
                                <p>Módulo de reuniões em desenvolvimento.</p>
                                <Button
                                    label="Nova Reunião"
                                    icon="pi pi-plus"
                                    className="p-button-outlined mt-2"
                                    onClick={() => router.push('/crm/atividades/reuniao/nova')}
                                />
                            </div>
                        </TabPanel>

                        <TabPanel header="Eventos" leftIcon="pi pi-calendar mr-2">
                            <div className="flex flex-column align-items-center justify-content-center py-6 text-500">
                                <i className="pi pi-calendar text-4xl mb-3 text-300" />
                                <p>Módulo de eventos em desenvolvimento.</p>
                            </div>
                        </TabPanel>
                    </TabView>
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
                        Deseja excluir a ligação{' '}
                        <strong>{ligToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
                    </span>
                </div>
            </Dialog>
        </div>
    );
};

export default AtividadesPage;
