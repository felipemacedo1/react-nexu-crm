'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import {
    RelatorioService,
    RelatorioKPIResponseDTO,
    RelatorioFunilResponseDTO,
    RelatorioLeadsOrigemResponseDTO,
    RelatorioPerformanceResponseDTO,
    PERIODO_OPTIONS,
    RELATORIO_TIPOS
} from '@/services/relatorio.service';
import { formatCurrency } from '@/utils/format';

type RelatorioTipo = 'funil' | 'leads_origem' | 'performance' | 'oportunidades' | 'kpis';

const RelatoriosPage = () => {
    const toast = useRef<Toast>(null);
    const [periodo, setPeriodo] = useState('mes');
    const [tipoAtivo, setTipoAtivo] = useState<RelatorioTipo>('kpis');
    const [loading, setLoading] = useState(false);

    const [kpis, setKpis] = useState<RelatorioKPIResponseDTO | null>(null);
    const [funil, setFunil] = useState<RelatorioFunilResponseDTO[]>([]);
    const [leadsOrigem, setLeadsOrigem] = useState<RelatorioLeadsOrigemResponseDTO[]>([]);
    const [performance, setPerformance] = useState<RelatorioPerformanceResponseDTO[]>([]);

    const fetchRelatorio = async (tipo: RelatorioTipo) => {
        setLoading(true);
        try {
            switch (tipo) {
                case 'kpis':
                    setKpis(await RelatorioService.getKPIs());
                    break;
                case 'funil':
                    setFunil(await RelatorioService.getFunilVendas());
                    break;
                case 'leads_origem':
                    setLeadsOrigem(await RelatorioService.getLeadsPorOrigem());
                    break;
                case 'performance':
                    setPerformance(await RelatorioService.getPerformanceVendas());
                    break;
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar relatório', life: 5000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRelatorio(tipoAtivo); }, [tipoAtivo]);

    const selectRelatorio = (tipo: RelatorioTipo) => {
        setTipoAtivo(tipo);
    };

    const kpiCard = (label: string, value: string | number, icon: string, color: string) => (
        <div className="col-12 md:col-6 lg:col-3">
            <Card className="h-full shadow-2">
                <div className="flex align-items-center justify-content-between">
                    <div>
                        <span className="text-500 text-sm font-semibold block mb-1">{label}</span>
                        <span className="text-900 text-2xl font-bold">{value}</span>
                    </div>
                    <div className={`flex align-items-center justify-content-center border-round`}
                        style={{ width: '48px', height: '48px', backgroundColor: `${color}20` }}>
                        <i className={`pi ${icon} text-2xl`} style={{ color }} />
                    </div>
                </div>
            </Card>
        </div>
    );

    const percentualTemplate = (row: RelatorioLeadsOrigemResponseDTO) =>
        <span>{row.percentual?.toFixed(1)}%</span>;

    const taxaTemplate = (row: RelatorioFunilResponseDTO | RelatorioPerformanceResponseDTO) =>
        <span>{(row as any).taxaConversao?.toFixed(1)}%</span>;

    const valorTemplate = (row: any) =>
        row.valorTotal != null ? formatCurrency(row.valorTotal) :
        row.valorFechado != null ? formatCurrency(row.valorFechado) : '-';

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Header */}
            <div className="col-12">
                <div className="card">
                    <Toolbar
                        start={
                            <div className="flex align-items-center gap-3">
                                <i className="pi pi-chart-bar text-2xl text-primary" />
                                <div>
                                    <h5 className="m-0 text-xl font-bold">Relatórios</h5>
                                    <span className="text-500 text-sm">Análise e indicadores de desempenho</span>
                                </div>
                            </div>
                        }
                        end={
                            <div className="flex gap-2 align-items-center">
                                <Dropdown value={periodo} options={PERIODO_OPTIONS}
                                    onChange={e => setPeriodo(e.value)} className="w-12rem" />
                                <Button icon="pi pi-refresh" className="p-button-outlined"
                                    tooltip="Atualizar" tooltipOptions={{ position: 'left' }}
                                    onClick={() => fetchRelatorio(tipoAtivo)} />
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Sidebar de tipos de relatórios */}
            <div className="col-12 md:col-3">
                <div className="card">
                    <h6 className="mt-0 mb-3 text-primary font-bold uppercase text-xs">Tipos de Relatório</h6>
                    <div className="flex flex-column gap-2">
                        {RELATORIO_TIPOS.map(r => (
                            <Button
                                key={r.value}
                                className={`p-button-text text-left justify-content-start ${tipoAtivo === r.value ? 'p-button-primary bg-primary-50' : ''}`}
                                onClick={() => selectRelatorio(r.value as RelatorioTipo)}
                            >
                                <i className={`pi ${r.icon} mr-2`} />
                                <div className="text-left">
                                    <div className="font-semibold text-sm">{r.label}</div>
                                    <div className="text-500 text-xs">{r.description}</div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conteúdo do relatório */}
            <div className="col-12 md:col-9">
                <div className="card" style={{ minHeight: '400px' }}>
                    {loading ? (
                        <div className="flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <ProgressSpinner />
                        </div>
                    ) : (
                        <>
                            {/* KPIs Gerais */}
                            {tipoAtivo === 'kpis' && kpis && (
                                <div>
                                    <h5 className="mt-0 mb-4">KPIs Gerais</h5>
                                    <div className="grid">
                                        {kpiCard('Total de Leads', kpis.totalLeads ?? 0, 'pi-users', '#6366f1')}
                                        {kpiCard('Total de Contas', kpis.totalContas ?? 0, 'pi-building', '#22c55e')}
                                        {kpiCard('Oportunidades Abertas', kpis.oportunidadesAbertas ?? 0, 'pi-briefcase', '#f59e0b')}
                                        {kpiCard('Pipeline Total', formatCurrency(kpis.valorTotalPipeline ?? 0), 'pi-dollar', '#3b82f6')}
                                        {kpiCard('Oport. Ganhas', kpis.oportunidadesGanhas ?? 0, 'pi-check-circle', '#22c55e')}
                                        {kpiCard('Oport. Perdidas', kpis.oportunidadesPerdidas ?? 0, 'pi-times-circle', '#ef4444')}
                                        {kpiCard('Total Contatos', kpis.totalContatos ?? 0, 'pi-id-card', '#8b5cf6')}
                                        {kpiCard('Taxa de Conversão', `${(kpis.taxaConversaoGeral ?? 0).toFixed(1)}%`, 'pi-percentage', '#06b6d4')}
                                    </div>
                                </div>
                            )}

                            {/* Funil de Vendas */}
                            {tipoAtivo === 'funil' && (
                                <div>
                                    <h5 className="mt-0 mb-4">Funil de Vendas</h5>
                                    {funil.length === 0 ? (
                                        <div className="text-center text-500 py-6">
                                            <i className="pi pi-inbox text-4xl mb-2 block" />
                                            <span>Nenhum dado disponível</span>
                                        </div>
                                    ) : (
                                        <DataTable value={funil} showGridlines stripedRows>
                                            <Column field="estagio" header="Estágio" />
                                            <Column field="totalOportunidades" header="Oportunidades" />
                                            <Column body={valorTemplate} header="Valor Total" className="text-right" />
                                            <Column body={taxaTemplate} header="Taxa de Conversão" />
                                        </DataTable>
                                    )}
                                </div>
                            )}

                            {/* Leads por Origem */}
                            {tipoAtivo === 'leads_origem' && (
                                <div>
                                    <h5 className="mt-0 mb-4">Leads por Origem</h5>
                                    {leadsOrigem.length === 0 ? (
                                        <div className="text-center text-500 py-6">
                                            <i className="pi pi-inbox text-4xl mb-2 block" />
                                            <span>Nenhum dado disponível</span>
                                        </div>
                                    ) : (
                                        <DataTable value={leadsOrigem} showGridlines stripedRows>
                                            <Column field="origem" header="Origem" />
                                            <Column field="total" header="Total de Leads" />
                                            <Column body={percentualTemplate} header="Percentual" />
                                        </DataTable>
                                    )}
                                </div>
                            )}

                            {/* Performance */}
                            {tipoAtivo === 'performance' && (
                                <div>
                                    <h5 className="mt-0 mb-4">Performance de Vendas</h5>
                                    {performance.length === 0 ? (
                                        <div className="text-center text-500 py-6">
                                            <i className="pi pi-inbox text-4xl mb-2 block" />
                                            <span>Nenhum dado disponível</span>
                                        </div>
                                    ) : (
                                        <DataTable value={performance} showGridlines stripedRows>
                                            <Column field="usuarioNome" header="Vendedor" />
                                            <Column field="totalOportunidades" header="Oportunidades" />
                                            <Column body={valorTemplate} header="Valor Fechado" className="text-right" />
                                            <Column body={taxaTemplate} header="Taxa de Conversão" />
                                        </DataTable>
                                    )}
                                </div>
                            )}

                            {/* Oportunidades ganhas/perdidas — reusa KPIs */}
                            {tipoAtivo === 'oportunidades' && kpis && (
                                <div>
                                    <h5 className="mt-0 mb-4">Oportunidades Ganhas / Perdidas</h5>
                                    <div className="grid">
                                        {kpiCard('Ganhas', kpis.oportunidadesGanhas ?? 0, 'pi-check-circle', '#22c55e')}
                                        {kpiCard('Perdidas', kpis.oportunidadesPerdidas ?? 0, 'pi-times-circle', '#ef4444')}
                                        {kpiCard('Abertas', kpis.oportunidadesAbertas ?? 0, 'pi-clock', '#f59e0b')}
                                        {kpiCard('Taxa de Conversão', `${(kpis.taxaConversaoGeral ?? 0).toFixed(1)}%`, 'pi-percentage', '#3b82f6')}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RelatoriosPage;
