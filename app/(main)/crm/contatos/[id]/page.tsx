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
import { ContatoService, ContatoDTO } from '@/services/contato.service';
import { ContaService } from '@/services/conta.service';
import { OportunidadeDTO } from '@/services/oportunidade.service';

const ContatoDetalhesPage = () => {
    const router = useRouter();
    const params = useParams();
    const toast = useRef<Toast>(null);
    const id = params.id as string;

    const [contato, setContato] = useState<ContatoDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [oportunidades, setOportunidades] = useState<OportunidadeDTO[]>([]);
    const [loadingOportunidades, setLoadingOportunidades] = useState(false);

    const fetchContato = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ContatoService.buscarPorId(id);
            setContato(data);
            // Carregar oportunidades da conta deste contato
            if (data.contaId) {
                setLoadingOportunidades(true);
                try {
                    const opps = await ContaService.listarOportunidades(data.contaId);
                    setOportunidades(opps);
                } catch {
                    // Silently handle
                } finally {
                    setLoadingOportunidades(false);
                }
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Contato não encontrado',
                life: 5000
            });
            setTimeout(() => router.push('/crm/contatos'), 2000);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (id) {
            fetchContato();
        }
    }, [id, fetchContato]);

    const handleDelete = async () => {
        if (!contato) return;
        setDeleting(true);
        try {
            await ContatoService.excluir(contato.id!);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Contato "${contato.nome} ${contato.sobrenome}" excluído com sucesso`,
                life: 3000
            });
            setTimeout(() => router.push('/crm/contatos'), 1000);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao excluir contato',
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

    if (!contato) {
        return (
            <div className="card text-center py-6">
                <i className="pi pi-exclamation-circle text-6xl text-orange-500 mb-3" />
                <h3>Contato não encontrado</h3>
                <Button label="Voltar para Contatos" icon="pi pi-arrow-left" onClick={() => router.push('/crm/contatos')} />
            </div>
        );
    }

    const nomeCompleto = `${contato.saudacao ? contato.saudacao + ' ' : ''}${contato.nome} ${contato.sobrenome || ''}`.trim();

    const deleteDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDeleteDialogVisible(false)} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" loading={deleting} onClick={handleDelete} />
        </div>
    );

    const timelineEvents = [
        {
            status: 'Contato Criado',
            date: formatDate(contato.criadoEm),
            icon: 'pi pi-plus-circle',
            color: '#22C55E'
        },
        ...(contato.atualizadoEm && contato.atualizadoEm !== contato.criadoEm
            ? [{
                status: 'Última Atualização',
                date: formatDate(contato.atualizadoEm),
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
                                onClick={() => router.push('/crm/contatos')}
                                tooltip="Voltar"
                                tooltipOptions={{ position: 'top' }}
                            />
                            <div>
                                <h2 className="m-0 text-xl font-semibold">{nomeCompleto}</h2>
                                <div className="flex align-items-center gap-2 mt-1">
                                    {contato.titulo && <Tag value={contato.titulo} severity="info" />}
                                    {contato.contaNome && (
                                        <span
                                            className="text-500 text-sm cursor-pointer hover:underline"
                                            onClick={() => contato.contaId && router.push(`/crm/contas/${contato.contaId}`)}
                                        >
                                            <i className="pi pi-building mr-1" />
                                            {contato.contaNome}
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
                                onClick={() => router.push(`/crm/contatos/${id}/editar`)}
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
                                Informações Pessoais
                            </h4>
                            <div className="grid">
                                <InfoItem label="Nome Completo" value={nomeCompleto} icon="pi pi-user" />
                                <InfoItem label="Cargo" value={contato.titulo} icon="pi pi-briefcase" />
                                <InfoItem label="Departamento" value={contato.departamento} icon="pi pi-sitemap" />
                                <InfoItem label="Conta" value={contato.contaNome} icon="pi pi-building" />
                            </div>

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-phone mr-2" />
                                Informações de Contato
                            </h4>
                            <div className="grid">
                                <InfoItem label="Email" value={contato.email} icon="pi pi-envelope" />
                                <InfoItem label="Telefone" value={contato.telefone} icon="pi pi-phone" />
                                <InfoItem label="Celular" value={contato.celular} icon="pi pi-mobile" />
                                <InfoItem label="Fax" value={contato.fax} icon="pi pi-print" />
                            </div>

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-map-marker mr-2" />
                                Endereço
                            </h4>
                            <div className="grid">
                                <InfoItem label="Endereço" value={contato.endereco} icon="pi pi-map" />
                                <InfoItem label="Cidade" value={contato.cidade} icon="pi pi-map-marker" />
                                <InfoItem label="Estado" value={contato.estado} icon="pi pi-map-marker" />
                                <InfoItem label="CEP" value={contato.cep} icon="pi pi-map-marker" />
                                <InfoItem label="País" value={contato.pais} icon="pi pi-globe" />
                            </div>

                            {contato.descricao && (
                                <>
                                    <Divider />
                                    <h4 className="mb-3">
                                        <i className="pi pi-align-left mr-2" />
                                        Descrição
                                    </h4>
                                    <p className="text-700 line-height-3 m-0">{contato.descricao}</p>
                                </>
                            )}

                            <Divider />

                            <h4 className="mb-3">
                                <i className="pi pi-info-circle mr-2" />
                                Metadados
                            </h4>
                            <div className="grid">
                                <InfoItem label="ID" value={contato.id} icon="pi pi-key" />
                                <InfoItem label="Criado em" value={formatDate(contato.criadoEm)} icon="pi pi-calendar-plus" />
                                <InfoItem label="Atualizado em" value={formatDate(contato.atualizadoEm)} icon="pi pi-calendar-times" />
                            </div>

                            {/* Link para Conta */}
                            {contato.contaId && (
                                <>
                                    <Divider />
                                    <h4 className="mb-3">
                                        <i className="pi pi-link mr-2" />
                                        Vinculações
                                    </h4>
                                    <div className="grid">
                                        <div className="col-12 md:col-4 mb-3">
                                            <Button
                                                label="Ver Conta"
                                                icon="pi pi-building"
                                                outlined
                                                className="w-full"
                                                onClick={() => router.push(`/crm/contas/${contato.contaId}`)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabPanel>

                        {/* Tab Oportunidades */}
                        <TabPanel header={`Oportunidades (${oportunidades.length})`} leftIcon="pi pi-dollar mr-2">
                            {loadingOportunidades ? (
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
                                </DataTable>
                            ) : (
                                <div className="text-center text-500 py-6">
                                    <i className="pi pi-chart-line text-4xl mb-3 block" />
                                    <p className="mb-3">Nenhuma oportunidade vinculada a este contato.</p>
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

                        {/* Tab Notas */}
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
                            Tem certeza que deseja excluir o contato{' '}
                            <strong>{contato.nome} {contato.sobrenome}</strong>? Esta ação não pode ser desfeita.
                        </span>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default ContatoDetalhesPage;
