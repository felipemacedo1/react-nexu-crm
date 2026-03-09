'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TabView, TabPanel } from 'primereact/tabview';
import { Timeline } from 'primereact/timeline';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ContaService, ContaDTO } from '@/services/conta.service';
import { ContatoDTO } from '@/services/contato.service';
import { OportunidadeDTO } from '@/services/oportunidade.service';

const ContaDetalhesPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const id = params.id as string;

    const [conta, setConta] = useState<ContaDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [contatos, setContatos] = useState<ContatoDTO[]>([]);
    const [oportunidades, setOportunidades] = useState<OportunidadeDTO[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    const fetchConta = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ContaService.buscarPorId(id);
            setConta(data);
            // Carregar entidades relacionadas
            setLoadingRelated(true);
            try {
                const [contatosData, oportunidadesData] = await Promise.all([
                    ContaService.listarContatos(id),
                    ContaService.listarOportunidades(id)
                ]);
                setContatos(contatosData);
                setOportunidades(oportunidadesData);
            } catch {
                // Silently handle - tabs will show empty
            } finally {
                setLoadingRelated(false);
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Empresa não encontrada',
                life: 5000
            });
            setTimeout(() => router.push('/crm/contas'), 2000);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) {
            fetchConta();
        }
    }, [id, fetchConta]);

    const handleDelete = async () => {
        if (!conta) return;
        setDeleting(true);
        try {
            await ContaService.excluir(conta.id!);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Empresa "${conta.nome}" excluída com sucesso`,
                life: 3000
            });
            setTimeout(() => router.push('/crm/contas'), 1000);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir empresa',
                life: 5000
            });
        } finally {
            setDeleting(false);
            setDeleteDialogVisible(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value?: number) => {
        if (!value) return '—';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const InfoItem = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: string }) => (
        <div className="col-12 md:col-6 lg:col-4 mb-3">
            <div className="text-500 text-sm mb-1">
                {icon && <i className={`${icon} mr-1`} />}
                {label}
            </div>
            <div className="text-900 font-medium">{value || '—'}</div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <ProgressSpinner />
            </div>
        );
    }

    if (!conta) {
        return (
            <div className="card text-center py-6">
                <i className="pi pi-exclamation-circle text-6xl text-orange-500 mb-3" />
                <h3>Empresa não encontrada</h3>
                <Button label="Voltar para Empresas" icon="pi pi-arrow-left" onClick={() => router.push('/crm/contas')} />
            </div>
        );
    }

    const deleteDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDeleteDialogVisible(false)} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" loading={deleting} onClick={handleDelete} />
        </div>
    );

    const timelineEvents = [
        {
            status: 'Empresa Criada',
            date: formatDate(conta.criadoEm),
            icon: 'pi pi-plus-circle',
            color: '#22C55E'
        },
        ...(conta.atualizadoEm && conta.atualizadoEm !== conta.criadoEm
            ? [{
                status: 'Última Atualização',
                date: formatDate(conta.atualizadoEm),
                icon: 'pi pi-pencil',
                color: '#F59E0B'
            }]
            : [])
    ];

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />

                <div className="card">
                    {/* Header */}
                    <div className="flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
                        <div className="flex align-items-center gap-3">
                            <Button
                                icon="pi pi-arrow-left"
                                rounded
                                text
                                severity="secondary"
                                onClick={() => router.push('/crm/contas')}
                                tooltip="Voltar"
                                tooltipOptions={{ position: 'top' }}
                            />
                            <div>
                                <h2 className="m-0 text-xl font-semibold">{conta.nome}</h2>
                                <div className="flex align-items-center gap-2 mt-1">
                                    {conta.tipo && <Tag value={conta.tipo} severity="info" />}
                                    {conta.setor && (
                                        <span className="text-500 text-sm">
                                            <i className="pi pi-briefcase mr-1" />
                                            {conta.setor}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Editar"
                                icon="pi pi-pencil"
                                severity="warning"
                                onClick={() => router.push(`/crm/contas/${id}/editar`)}
                            />
                            <Button
                                label="Excluir"
                                icon="pi pi-trash"
                                severity="danger"
                                outlined
                                onClick={() => setDeleteDialogVisible(true)}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Tabs */}
                    <TabView>
                        {/* Tab Detalhes */}
                        <TabPanel header="Detalhes" leftIcon="pi pi-info-circle mr-2">
                            <h4 className="mb-3">
                                <i className="pi pi-building mr-2" />
                                Informações da Empresa
                            </h4>
                            <div className="grid">
                                <InfoItem label="Nome" value={conta.nome} icon="pi pi-building" />
                                <InfoItem label="Tipo" value={conta.tipo} icon="pi pi-tag" />
                                <InfoItem label="Setor" value={conta.setor} icon="pi pi-briefcase" />
                                <InfoItem label="Classificação" value={conta.classificacao} icon="pi pi-star" />
                                <InfoItem label="Website" value={conta.site} icon="pi pi-globe" />
                                <InfoItem label="Faturamento Anual" value={formatCurrency(conta.faturamentoAnual)} icon="pi pi-dollar" />
                                <InfoItem label="Nº de Funcionários" value={conta.funcionarios} icon="pi pi-users" />
                            </div>

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-phone mr-2" />
                                Informações de Contato
                            </h4>
                            <div className="grid">
                                <InfoItem label="Telefone" value={conta.telefoneEscritorio} icon="pi pi-phone" />
                                <InfoItem label="Email" value={conta.email} icon="pi pi-envelope" />
                            </div>

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-map-marker mr-2" />
                                Endereço de Cobrança
                            </h4>
                            <div className="grid">
                                <InfoItem label="Endereço" value={conta.enderecoCobranca} icon="pi pi-map" />
                                <InfoItem label="Cidade" value={conta.cidadeCobranca} icon="pi pi-map-marker" />
                                <InfoItem label="Estado" value={conta.estadoCobranca} icon="pi pi-map-marker" />
                                <InfoItem label="CEP" value={conta.cepCobranca} icon="pi pi-map-marker" />
                                <InfoItem label="País" value={conta.paisCobranca} icon="pi pi-globe" />
                            </div>

                            {(conta.enderecoEntrega || conta.cidadeEntrega) && (
                                <>
                                    <Divider />
                                    <h4 className="mb-3">
                                        <i className="pi pi-send mr-2" />
                                        Endereço de Entrega
                                    </h4>
                                    <div className="grid">
                                        <InfoItem label="Endereço" value={conta.enderecoEntrega} icon="pi pi-map" />
                                        <InfoItem label="Cidade" value={conta.cidadeEntrega} icon="pi pi-map-marker" />
                                        <InfoItem label="Estado" value={conta.estadoEntrega} icon="pi pi-map-marker" />
                                        <InfoItem label="CEP" value={conta.cepEntrega} icon="pi pi-map-marker" />
                                        <InfoItem label="País" value={conta.paisEntrega} icon="pi pi-globe" />
                                    </div>
                                </>
                            )}

                            {conta.descricao && (
                                <>
                                    <Divider />
                                    <h4 className="mb-3">
                                        <i className="pi pi-align-left mr-2" />
                                        Descrição
                                    </h4>
                                    <p className="text-700 line-height-3 m-0">{conta.descricao}</p>
                                </>
                            )}

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-info-circle mr-2" />
                                Metadados
                            </h4>
                            <div className="grid">
                                <InfoItem label="ID" value={conta.id} icon="pi pi-key" />
                                <InfoItem label="Criado em" value={formatDate(conta.criadoEm)} icon="pi pi-calendar-plus" />
                                <InfoItem label="Atualizado em" value={formatDate(conta.atualizadoEm)} icon="pi pi-calendar-times" />
                            </div>
                        </TabPanel>

                        {/* Tab Contatos */}
                        <TabPanel header={`Contatos (${contatos.length})`} leftIcon="pi pi-users mr-2">
                            {loadingRelated ? (
                                <div className="flex justify-content-center py-4"><ProgressSpinner style={{ width: '40px', height: '40px' }} /></div>
                            ) : contatos.length > 0 ? (
                                <DataTable value={contatos} stripedRows size="small" paginator rows={5} emptyMessage="Nenhum contato encontrado.">
                                    <Column
                                        header="Nome"
                                        body={(row: ContatoDTO) => (
                                            <span
                                                className="text-primary cursor-pointer hover:underline"
                                                onClick={() => router.push(`/crm/contatos/${row.id}`)}
                                            >
                                                {row.nome} {row.sobrenome || ''}
                                            </span>
                                        )}
                                    />
                                    <Column field="titulo" header="Cargo" />
                                    <Column field="email" header="Email" />
                                    <Column field="telefone" header="Telefone" />
                                </DataTable>
                            ) : (
                                <div className="text-center text-500 py-6">
                                    <i className="pi pi-users text-4xl mb-3 block" />
                                    <p className="mb-3">Nenhum contato vinculado a esta empresa.</p>
                                    <Button
                                        label="Novo Contato"
                                        icon="pi pi-plus"
                                        outlined
                                        onClick={() => router.push('/crm/contatos/novo')}
                                    />
                                </div>
                            )}
                        </TabPanel>

                        {/* Tab Oportunidades */}
                        <TabPanel header={`Oportunidades (${oportunidades.length})`} leftIcon="pi pi-dollar mr-2">
                            {loadingRelated ? (
                                <div className="flex justify-content-center py-4"><ProgressSpinner style={{ width: '40px', height: '40px' }} /></div>
                            ) : oportunidades.length > 0 ? (
                                <DataTable value={oportunidades} stripedRows size="small" paginator rows={5} emptyMessage="Nenhuma oportunidade encontrada.">
                                    <Column
                                        header="Nome"
                                        body={(row: OportunidadeDTO) => (
                                            <span
                                                className="text-primary cursor-pointer hover:underline"
                                                onClick={() => router.push(`/crm/oportunidades/${row.id}`)}
                                            >
                                                {row.nome}
                                            </span>
                                        )}
                                    />
                                    <Column field="estagio" header="Estágio" body={(row: OportunidadeDTO) => <Tag value={row.estagio} severity={row.estagio === 'Closed Won' ? 'success' : row.estagio === 'Closed Lost' ? 'danger' : 'info'} />} />
                                    <Column field="montante" header="Valor" body={(row: OportunidadeDTO) => row.montante ? row.montante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'} />
                                    <Column field="probabilidade" header="Prob." body={(row: OportunidadeDTO) => row.probabilidade != null ? `${row.probabilidade}%` : '—'} />
                                    <Column field="dataFechamento" header="Fechamento" body={(row: OportunidadeDTO) => row.dataFechamento ? new Date(row.dataFechamento).toLocaleDateString('pt-BR') : '—'} />
                                </DataTable>
                            ) : (
                                <div className="text-center text-500 py-6">
                                    <i className="pi pi-chart-line text-4xl mb-3 block" />
                                    <p className="mb-3">Nenhuma oportunidade vinculada a esta empresa.</p>
                                    <Button
                                        label="Nova Oportunidade"
                                        icon="pi pi-plus"
                                        outlined
                                        onClick={() => router.push('/crm/oportunidades/novo')}
                                    />
                                </div>
                            )}
                        </TabPanel>

                        {/* Tab Histórico */}
                        <TabPanel header="Histórico" leftIcon="pi pi-history mr-2">
                            <div className="py-4">
                                {timelineEvents.length > 0 ? (
                                    <Timeline
                                        value={timelineEvents}
                                        content={(item) => (
                                            <div>
                                                <span className="font-semibold">{item.status}</span>
                                                <div className="text-500 text-sm mt-1">{item.date}</div>
                                            </div>
                                        )}
                                        marker={(item) => (
                                            <span
                                                className="flex align-items-center justify-content-center border-circle"
                                                style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    backgroundColor: item.color,
                                                    color: '#fff'
                                                }}
                                            >
                                                <i className={item.icon} style={{ fontSize: '0.8rem' }} />
                                            </span>
                                        )}
                                    />
                                ) : (
                                    <div className="text-center text-500 py-6">
                                        <i className="pi pi-clock text-4xl mb-3 block" />
                                        <p>Nenhum registro de atividade encontrado.</p>
                                    </div>
                                )}
                            </div>
                        </TabPanel>
                    </TabView>
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
                            Tem certeza que deseja excluir a empresa{' '}
                            <strong>{conta.nome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default ContaDetalhesPage;
