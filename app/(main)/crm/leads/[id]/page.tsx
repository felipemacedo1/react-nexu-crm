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
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { LeadService, LeadResponseDTO, LEAD_STATUS_LABELS, LEAD_STATUS_SEVERITY, LeadConversionPayload } from '@/services/lead.service';
import ActivityTimeline, { TimelineEvent } from '@/components/shared/ActivityTimeline';

const LeadDetalhesPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const id = params.id as string;

    const [lead, setLead] = useState<LeadResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Conversão de lead
    const [convertDialogVisible, setConvertDialogVisible] = useState(false);
    const [converting, setConverting] = useState(false);
    const [conversionPayload, setConversionPayload] = useState<LeadConversionPayload>({
        criarContato: true,
        criarConta: true,
        criarOportunidade: false,
        nomeOportunidade: ''
    });

    const fetchLead = useCallback(async () => {
        setLoading(true);
        try {
            const data = await LeadService.buscarPorId(id);
            setLead(data);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Pré-cliente não encontrado',
                life: 5000
            });
            setTimeout(() => router.push('/crm/leads'), 2000);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) {
            fetchLead();
        }
    }, [id, fetchLead]);

    const handleDelete = async () => {
        if (!lead) return;
        setDeleting(true);
        try {
            await LeadService.excluir(lead.id);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Pré-cliente "${lead.nome}" excluído com sucesso`,
                life: 3000
            });
            setTimeout(() => router.push('/crm/leads'), 1000);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir pré-cliente',
                life: 5000
            });
        } finally {
            setDeleting(false);
            setDeleteDialogVisible(false);
        }
    };

    const handleConvert = async () => {
        if (!lead) return;
        setConverting(true);
        try {
            const result = await LeadService.converter(lead.id, conversionPayload);
            toast.current?.show({
                severity: 'success',
                summary: 'Lead Convertido!',
                detail: result.mensagem || 'Lead convertido com sucesso.',
                life: 4000
            });
            setConvertDialogVisible(false);
            // Reload lead to reflect new status and linked IDs
            await fetchLead();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro na conversão',
                detail: error?.response?.data?.message || 'Não foi possível converter o lead.',
                life: 5000
            });
        } finally {
            setConverting(false);
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

    const InfoItem = ({ label, value, icon }: { label: string; value?: string | null; icon?: string }) => (
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

    if (!lead) {
        return (
            <div className="card text-center py-6">
                <i className="pi pi-exclamation-circle text-6xl text-orange-500 mb-3" />
                <h3>Pré-cliente não encontrado</h3>
                <Button label="Voltar para Pré-Clientes" icon="pi pi-arrow-left" onClick={() => router.push('/crm/leads')} />
            </div>
        );
    }

    const statusLabel = LEAD_STATUS_LABELS[lead.status || ''] || lead.status || '—';
    const statusSeverity = (LEAD_STATUS_SEVERITY[lead.status || ''] || 'info') as any;

    const deleteDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDeleteDialogVisible(false)} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" loading={deleting} onClick={handleDelete} />
        </div>
    );

    // Timeline de atividades
    const timelineEvents: TimelineEvent[] = [
        {
            id: 'criacao',
            titulo: 'Pré-Cliente Criado',
            data: lead.dataCriacao,
            tipo: 'criacao',
            usuario: lead.criadoPor
        },
        ...(lead.dataModificacao && lead.dataModificacao !== lead.dataCriacao
            ? [{
                id: 'atualizacao',
                titulo: 'Última Atualização',
                data: lead.dataModificacao,
                tipo: 'atualizacao' as const
            }]
            : []),
        ...(lead.status === 'Converted'
            ? [{
                id: 'conversao',
                titulo: 'Lead Convertido',
                descricao: 'Este lead foi convertido em contato/conta/oportunidade.',
                tipo: 'conversao' as const
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
                                severity="info"
                                onClick={() => router.push('/crm/leads')}
                                tooltip="Voltar"
                                tooltipOptions={{ position: 'top' }}
                            />
                            <div>
                                <h2 className="m-0 text-xl font-semibold">{lead.nome}</h2>
                                <div className="flex align-items-center gap-2 mt-1">
                                    <Tag value={statusLabel} severity={statusSeverity} />
                                    {lead.nomeConta && (
                                        <span className="text-500 text-sm">
                                            <i className="pi pi-building mr-1" />
                                            {lead.nomeConta}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {lead.status !== 'Converted' && (
                                <Button
                                    label="Converter Lead"
                                    icon="pi pi-sync"
                                    severity="success"
                                    onClick={() => setConvertDialogVisible(true)}
                                />
                            )}
                            <Button
                                label="Editar"
                                icon="pi pi-pencil"
                                severity="warning"
                                onClick={() => router.push(`/crm/leads/${id}/editar`)}
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
                                <i className="pi pi-user mr-2" />
                                Informações Principais
                            </h4>
                            <div className="grid">
                                <InfoItem label="Nome" value={lead.nome} icon="pi pi-user" />
                                <InfoItem label="Empresa" value={lead.nomeConta} icon="pi pi-building" />
                                <InfoItem label="Status" value={statusLabel} icon="pi pi-flag" />
                                <InfoItem label="Origem" value={lead.origemLead} icon="pi pi-globe" />
                                <InfoItem label="Departamento" value={lead.departamento} icon="pi pi-sitemap" />
                                <InfoItem label="Indicado Por" value={lead.indicadoPor} icon="pi pi-share-alt" />
                            </div>

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-envelope mr-2" />
                                Informações de Contato
                            </h4>
                            <div className="grid">
                                <InfoItem label="Email Principal" value={lead.webParaLeadEmail1} icon="pi pi-envelope" />
                                <InfoItem label="Email Secundário" value={lead.webParaLeadEmail2} icon="pi pi-envelope" />
                                <InfoItem
                                    label="Website"
                                    value={lead.website}
                                    icon="pi pi-globe"
                                />
                                <InfoItem label="Data de Nascimento" value={lead.dataNascimento ? new Date(lead.dataNascimento).toLocaleDateString('pt-BR') : undefined} icon="pi pi-calendar" />
                            </div>

                            {lead.descricao && (
                                <>
                                    <Divider />
                                    <h4 className="mb-3">
                                        <i className="pi pi-align-left mr-2" />
                                        Descrição
                                    </h4>
                                    <p className="text-700 line-height-3 m-0">{lead.descricao}</p>
                                </>
                            )}

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-info-circle mr-2" />
                                Metadados
                            </h4>
                            <div className="grid">
                                <InfoItem label="ID" value={lead.id} icon="pi pi-key" />
                                <InfoItem label="Criado em" value={formatDate(lead.dataCriacao)} icon="pi pi-calendar-plus" />
                                <InfoItem label="Modificado em" value={formatDate(lead.dataModificacao)} icon="pi pi-calendar-times" />
                                <InfoItem label="Criado por" value={lead.criadoPor} icon="pi pi-user" />
                                <InfoItem label="Campanha" value={lead.campanhaNome} icon="pi pi-send" />
                            </div>

                            {/* Conversão */}
                            {(lead.contatoId || lead.contaId || lead.oportunidadeId) && (
                                <>
                                    <Divider />
                                    <h4 className="mb-3">
                                        <i className="pi pi-sync mr-2" />
                                        Conversão
                                    </h4>
                                    <div className="grid">
                                        {lead.contatoId && (
                                            <div className="col-12 md:col-4 mb-3">
                                                <Button
                                                    label="Ver Contato"
                                                    icon="pi pi-users"
                                                    outlined
                                                    className="w-full"
                                                    onClick={() => router.push(`/crm/contatos/${lead.contatoId}`)}
                                                />
                                            </div>
                                        )}
                                        {lead.contaId && (
                                            <div className="col-12 md:col-4 mb-3">
                                                <Button
                                                    label="Ver Conta"
                                                    icon="pi pi-building"
                                                    outlined
                                                    className="w-full"
                                                    onClick={() => router.push(`/crm/contas/${lead.contaId}`)}
                                                />
                                            </div>
                                        )}
                                        {lead.oportunidadeId && (
                                            <div className="col-12 md:col-4 mb-3">
                                                <Button
                                                    label="Ver Oportunidade"
                                                    icon="pi pi-dollar"
                                                    outlined
                                                    className="w-full"
                                                    onClick={() => router.push(`/crm/oportunidades/${lead.oportunidadeId}`)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </TabPanel>

                        {/* Tab Histórico */}
                        <TabPanel header="Histórico" leftIcon="pi pi-history mr-2">
                            <div className="py-2">
                                <ActivityTimeline events={timelineEvents} />
                            </div>
                        </TabPanel>

                        {/* Tab Notas (placeholder) */}
                        <TabPanel header="Notas" leftIcon="pi pi-file mr-2">
                            <div className="text-center text-500 py-6">
                                <i className="pi pi-file-edit text-4xl mb-3 block" />
                                <p className="mb-3">Nenhuma nota adicionada ainda.</p>
                                <Button label="Adicionar Nota" icon="pi pi-plus" outlined disabled />
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
                            Tem certeza que deseja excluir o pré-cliente{' '}
                            <strong>{lead.nome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>

                {/* Dialog de conversão de lead */}
                <Dialog
                    visible={convertDialogVisible}
                    style={{ width: '480px' }}
                    header={
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-sync text-primary text-xl" />
                            <span>Converter Pré-Cliente</span>
                        </div>
                    }
                    modal
                    onHide={() => setConvertDialogVisible(false)}
                    footer={
                        <div className="flex justify-content-end gap-2">
                            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setConvertDialogVisible(false)} disabled={converting} />
                            <Button label="Converter" icon="pi pi-sync" severity="success" loading={converting} onClick={handleConvert} />
                        </div>
                    }
                >
                    <div className="flex flex-column gap-4">
                        <Message
                            severity="info"
                            text="Selecione o que deseja criar a partir deste pré-cliente:"
                            className="w-full"
                        />

                        <div className="flex flex-column gap-3">
                            <div className="flex align-items-center gap-3 p-3 surface-100 border-round">
                                <Checkbox
                                    inputId="chk-contato"
                                    checked={conversionPayload.criarContato}
                                    onChange={(e) => setConversionPayload(prev => ({ ...prev, criarContato: !!e.checked }))}
                                />
                                <label htmlFor="chk-contato" className="flex align-items-center gap-2 cursor-pointer">
                                    <i className="pi pi-id-card text-primary" />
                                    <div>
                                        <div className="font-semibold">Criar Contato</div>
                                        <div className="text-500 text-sm">Novo contato vinculado a este lead</div>
                                    </div>
                                </label>
                            </div>

                            <div className="flex align-items-center gap-3 p-3 surface-100 border-round">
                                <Checkbox
                                    inputId="chk-conta"
                                    checked={conversionPayload.criarConta}
                                    onChange={(e) => setConversionPayload(prev => ({ ...prev, criarConta: !!e.checked }))}
                                />
                                <label htmlFor="chk-conta" className="flex align-items-center gap-2 cursor-pointer">
                                    <i className="pi pi-building text-primary" />
                                    <div>
                                        <div className="font-semibold">Criar Empresa</div>
                                        <div className="text-500 text-sm">{lead.nomeConta ? `"${lead.nomeConta}"` : 'Nova empresa a partir dos dados do lead'}</div>
                                    </div>
                                </label>
                            </div>

                            <div className="flex flex-column gap-2 p-3 surface-100 border-round">
                                <div className="flex align-items-center gap-3">
                                    <Checkbox
                                        inputId="chk-oportunidade"
                                        checked={conversionPayload.criarOportunidade}
                                        onChange={(e) => setConversionPayload(prev => ({ ...prev, criarOportunidade: !!e.checked }))}
                                    />
                                    <label htmlFor="chk-oportunidade" className="flex align-items-center gap-2 cursor-pointer">
                                        <i className="pi pi-dollar text-primary" />
                                        <div>
                                            <div className="font-semibold">Criar Oportunidade</div>
                                            <div className="text-500 text-sm">Iniciar pipeline de vendas</div>
                                        </div>
                                    </label>
                                </div>
                                {conversionPayload.criarOportunidade && (
                                    <div className="mt-2 ml-6">
                                        <label className="block text-sm text-600 mb-1">Nome da Oportunidade</label>
                                        <InputText
                                            value={conversionPayload.nomeOportunidade || ''}
                                            onChange={(e) => setConversionPayload(prev => ({ ...prev, nomeOportunidade: e.target.value }))}
                                            placeholder={`Oportunidade - ${lead.nome}`}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default LeadDetalhesPage;
