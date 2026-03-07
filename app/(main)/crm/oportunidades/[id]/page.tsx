'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Timeline } from 'primereact/timeline';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { OportunidadeService, OportunidadeDTO } from '@/services/oportunidade.service';

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

const PIPELINE_STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];

const OportunidadeDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const id = params.id as string;

    const [oportunidade, setOportunidade] = useState<OportunidadeDTO | null>(null);
    const [loading, setLoading] = useState(true);

    // Delete dialog
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchOportunidade = async () => {
            setLoading(true);
            try {
                const data = await OportunidadeService.buscarPorId(id);
                setOportunidade(data);
            } catch (error: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Oportunidade não encontrada',
                    life: 5000
                });
                setTimeout(() => router.push('/crm/oportunidades'), 2000);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOportunidade();
    }, [id, router]);

    const handleDelete = async () => {
        if (!oportunidade) return;
        setDeleting(true);
        try {
            await OportunidadeService.excluir(oportunidade.id!);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Oportunidade excluída com sucesso',
                life: 3000
            });
            setDeleteDialogVisible(false);
            setTimeout(() => router.push('/crm/oportunidades'), 1000);
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

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '—';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // InfoItem helper
    const InfoItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: string }) => (
        <div className="col-12 md:col-6 lg:col-4 mb-3">
            <div className="flex align-items-start gap-2">
                {icon && <i className={`${icon} text-500 mt-1`} />}
                <div>
                    <small className="text-500 block mb-1">{label}</small>
                    <span className="font-medium">{value || '—'}</span>
                </div>
            </div>
        </div>
    );

    // Pipeline stage indicator
    const getPipelineProgress = () => {
        if (!oportunidade?.estagio) return 0;
        if (oportunidade.estagio === 'Closed Won') return 100;
        if (oportunidade.estagio === 'Closed Lost') return 0;
        const idx = PIPELINE_STAGES.indexOf(oportunidade.estagio);
        if (idx === -1) return 0;
        return Math.round(((idx + 1) / PIPELINE_STAGES.length) * 100);
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <ProgressSpinner />
            </div>
        );
    }

    if (!oportunidade) {
        return (
            <div className="card text-center p-5">
                <i className="pi pi-exclamation-circle text-4xl text-orange-500 mb-3" />
                <h3>Oportunidade não encontrada</h3>
                <Button label="Voltar para lista" icon="pi pi-arrow-left" onClick={() => router.push('/crm/oportunidades')} />
            </div>
        );
    }

    // Timeline events
    const timelineEvents = [
        {
            status: 'Criação',
            date: formatDateTime(oportunidade.criadoEm),
            icon: 'pi pi-plus-circle',
            color: '#22C55E',
            detail: 'Oportunidade registrada no sistema'
        },
        ...(oportunidade.atualizadoEm && oportunidade.atualizadoEm !== oportunidade.criadoEm ? [{
            status: 'Última Atualização',
            date: formatDateTime(oportunidade.atualizadoEm),
            icon: 'pi pi-pencil',
            color: '#F59E0B',
            detail: 'Dados da oportunidade atualizados'
        }] : [])
    ];

    // Delete dialog footer
    const deleteDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDeleteDialogVisible(false)} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" loading={deleting} onClick={handleDelete} />
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />

                <div className="card">
                    {/* Header */}
                    <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                        <div className="flex align-items-center gap-3">
                            <Button
                                icon="pi pi-arrow-left"
                                rounded
                                text
                                severity="secondary"
                                onClick={() => router.push('/crm/oportunidades')}
                            />
                            <div>
                                <h2 className="m-0 text-xl font-semibold">{oportunidade.nome}</h2>
                                <div className="flex align-items-center gap-2 mt-1">
                                    <Tag
                                        value={ESTAGIO_LABELS[oportunidade.estagio || ''] || oportunidade.estagio || 'Sem estágio'}
                                        severity={(ESTAGIO_SEVERITY[oportunidade.estagio || ''] || 'secondary') as any}
                                    />
                                    <span className="text-500">|</span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(oportunidade.montante)}
                                    </span>
                                    {oportunidade.probabilidade !== undefined && oportunidade.probabilidade !== null && (
                                        <>
                                            <span className="text-500">|</span>
                                            <span className="text-500">{oportunidade.probabilidade}% probabilidade</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Editar"
                                icon="pi pi-pencil"
                                severity="warning"
                                outlined
                                onClick={() => router.push(`/crm/oportunidades/${id}/editar`)}
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

                    {/* Pipeline Progress */}
                    {oportunidade.estagio && !['Closed Won', 'Closed Lost'].includes(oportunidade.estagio) && (
                        <div className="mb-4">
                            <div className="flex justify-content-between mb-2">
                                <small className="text-500">Progresso do Pipeline</small>
                                <small className="font-semibold">{getPipelineProgress()}%</small>
                            </div>
                            <ProgressBar value={getPipelineProgress()} showValue={false} style={{ height: '8px' }} />
                            <div className="flex justify-content-between mt-1">
                                {PIPELINE_STAGES.map((stage, idx) => (
                                    <small
                                        key={stage}
                                        className={`text-xs ${oportunidade.estagio === stage ? 'font-bold text-primary' : 'text-400'}`}
                                    >
                                        {ESTAGIO_LABELS[stage]}
                                    </small>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <TabView>
                        {/* Tab Detalhes */}
                        <TabPanel header="Detalhes" leftIcon="pi pi-info-circle mr-2">
                            <Divider align="left">
                                <span className="font-semibold">
                                    <i className="pi pi-star mr-2" />
                                    Informações da Oportunidade
                                </span>
                            </Divider>
                            <div className="grid">
                                <InfoItem label="Nome" value={oportunidade.nome} icon="pi pi-briefcase" />
                                <InfoItem
                                    label="Estágio"
                                    value={
                                        <Tag
                                            value={ESTAGIO_LABELS[oportunidade.estagio || ''] || oportunidade.estagio || '—'}
                                            severity={(ESTAGIO_SEVERITY[oportunidade.estagio || ''] || 'secondary') as any}
                                        />
                                    }
                                    icon="pi pi-chart-bar"
                                />
                                <InfoItem label="Valor" value={formatCurrency(oportunidade.montante)} icon="pi pi-dollar" />
                                <InfoItem label="Probabilidade" value={oportunidade.probabilidade !== undefined ? `${oportunidade.probabilidade}%` : '—'} icon="pi pi-percentage" />
                                <InfoItem label="Data de Fechamento" value={formatDate(oportunidade.dataFechamento)} icon="pi pi-calendar" />
                                <InfoItem label="Tipo" value={oportunidade.tipo} icon="pi pi-tag" />
                                <InfoItem label="Origem" value={oportunidade.origem} icon="pi pi-compass" />
                            </div>

                            <Divider align="left">
                                <span className="font-semibold">
                                    <i className="pi pi-link mr-2" />
                                    Associações
                                </span>
                            </Divider>
                            <div className="grid">
                                <InfoItem
                                    label="Conta"
                                    value={
                                        oportunidade.contaNome ? (
                                            <span
                                                className="text-primary cursor-pointer hover:underline"
                                                onClick={() => oportunidade.contaId && router.push(`/crm/contas/${oportunidade.contaId}`)}
                                            >
                                                {oportunidade.contaNome}
                                            </span>
                                        ) : '—'
                                    }
                                    icon="pi pi-building"
                                />
                                <InfoItem
                                    label="Contato"
                                    value={
                                        oportunidade.contatoNome ? (
                                            <span
                                                className="text-primary cursor-pointer hover:underline"
                                                onClick={() => oportunidade.contatoId && router.push(`/crm/contatos/${oportunidade.contatoId}`)}
                                            >
                                                {oportunidade.contatoNome}
                                            </span>
                                        ) : '—'
                                    }
                                    icon="pi pi-user"
                                />
                            </div>

                            {(oportunidade.descricao || oportunidade.proximoPasso) && (
                                <>
                                    <Divider align="left">
                                        <span className="font-semibold">
                                            <i className="pi pi-info-circle mr-2" />
                                            Detalhes Adicionais
                                        </span>
                                    </Divider>
                                    <div className="grid">
                                        {oportunidade.descricao && (
                                            <div className="col-12 md:col-6 mb-3">
                                                <small className="text-500 block mb-1">Descrição</small>
                                                <p className="m-0 white-space-pre-line">{oportunidade.descricao}</p>
                                            </div>
                                        )}
                                        {oportunidade.proximoPasso && (
                                            <div className="col-12 md:col-6 mb-3">
                                                <small className="text-500 block mb-1">Próximo Passo</small>
                                                <p className="m-0 white-space-pre-line">{oportunidade.proximoPasso}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <Divider align="left">
                                <span className="font-semibold">
                                    <i className="pi pi-clock mr-2" />
                                    Datas
                                </span>
                            </Divider>
                            <div className="grid">
                                <InfoItem label="Criado em" value={formatDateTime(oportunidade.criadoEm)} icon="pi pi-calendar-plus" />
                                <InfoItem label="Atualizado em" value={formatDateTime(oportunidade.atualizadoEm)} icon="pi pi-calendar-times" />
                            </div>
                        </TabPanel>

                        {/* Tab Histórico */}
                        <TabPanel header="Histórico" leftIcon="pi pi-history mr-2">
                            <div className="p-3">
                                {timelineEvents.length > 0 ? (
                                    <Timeline
                                        value={timelineEvents}
                                        align="alternate"
                                        marker={(item) => (
                                            <span
                                                className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
                                                style={{ backgroundColor: item.color }}
                                            >
                                                <i className={item.icon} style={{ fontSize: '0.8rem' }} />
                                            </span>
                                        )}
                                        content={(item) => (
                                            <div className="mb-4">
                                                <span className="font-semibold">{item.status}</span>
                                                <div className="text-500 text-sm mt-1">{item.date}</div>
                                                <div className="text-600 text-sm mt-1">{item.detail}</div>
                                            </div>
                                        )}
                                    />
                                ) : (
                                    <div className="text-center text-500 p-5">
                                        <i className="pi pi-history text-4xl mb-3 block" />
                                        <p>Nenhum histórico disponível</p>
                                    </div>
                                )}
                            </div>
                        </TabPanel>

                        {/* Tab Notas */}
                        <TabPanel header="Notas" leftIcon="pi pi-file mr-2">
                            <div className="text-center text-500 p-5">
                                <i className="pi pi-file text-4xl mb-3 block" />
                                <p className="mb-2">Módulo de notas em desenvolvimento</p>
                                <small className="text-400">Em breve será possível adicionar notas a esta oportunidade</small>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>

                {/* Dialog de exclusão */}
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
                            <strong>{oportunidade.nome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default OportunidadeDetailPage;
