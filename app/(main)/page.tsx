/* eslint-disable @next/next/no-img-element */
'use client';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { SelectButton } from 'primereact/selectbutton';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '@/hooks/useAuth';
import { ChartOptions } from 'chart.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardService, { DashboardResumo, FASE_LABELS } from '@/services/dashboard.service';
import { LembreteService, LembreteResponseDTO } from '@/services/evento.service';
import { LEAD_STATUS_LABELS, LEAD_STATUS_SEVERITY } from '@/services/lead.service';

const PIPELINE_COLORS = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA', '#EF5350', '#78909C'];
const PERIOD_OPTIONS = [
    { label: 'Hoje', value: 'hoje' },
    { label: 'Semana', value: 'semana' },
    { label: 'Mês', value: 'mes' },
    { label: 'Ano', value: 'ano' }
];

const Dashboard = () => {
    const [pipelineOptions, setPipelineOptions] = useState<ChartOptions>({});
    const [barOptions, setBarOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);
    const { user } = useAuth();
    const router = useRouter();

    const [resumo, setResumo] = useState<DashboardResumo | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<string>('mes');
    const [lembretes, setLembretes] = useState<LembreteResponseDTO[]>([]);
    const [loadingLembretes, setLoadingLembretes] = useState(true);

    const fetchResumo = useCallback(async () => {
        try {
            const data = await DashboardService.getResumo();
            setResumo(data);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLembretes = useCallback(async () => {
        setLoadingLembretes(true);
        try {
            const data = await LembreteService.listarPaginado({ page: 0, size: 5, sort: 'dataExecucao', direction: 'asc' });
            setLembretes(data.content || []);
        } catch {
            setLembretes([]);
        } finally {
            setLoadingLembretes(false);
        }
    }, []);

    useEffect(() => {
        fetchResumo();
        fetchLembretes();
    }, [fetchResumo, fetchLembretes]);

    const applyLightTheme = () => {
        const textColor = '#495057';
        const gridColor = 'rgba(160, 167, 181, 0.3)';
        setPipelineOptions({ plugins: { legend: { position: 'bottom', labels: { color: textColor } } } });
        setBarOptions({
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
            }
        });
    };

    const applyDarkTheme = () => {
        const textColor = '#ebedef';
        const gridColor = 'rgba(160, 167, 181, 0.2)';
        setPipelineOptions({ plugins: { legend: { position: 'bottom', labels: { color: textColor } } } });
        setBarOptions({
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: { ticks: { color: textColor }, grid: { color: gridColor } },
                y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
            }
        });
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') applyLightTheme();
        else applyDarkTheme();
    }, [layoutConfig.colorScheme]);

    const pipelineChartData = resumo?.pipeline?.length
        ? {
              labels: resumo.pipeline.map(p => FASE_LABELS[p.fase] || p.fase),
              datasets: [{
                  data: resumo.pipeline.map(p => p.quantidade),
                  backgroundColor: PIPELINE_COLORS.slice(0, resumo.pipeline.length)
              }]
          }
        : { labels: ['Sem dados'], datasets: [{ data: [1], backgroundColor: ['#e0e0e0'] }] };

    // Bar chart: oportunidades por estágio (valor)
    const barChartData = resumo?.pipeline?.length
        ? {
              labels: resumo.pipeline.map(p => FASE_LABELS[p.fase] || p.fase),
              datasets: [{
                  label: 'Valor (R$)',
                  backgroundColor: PIPELINE_COLORS.slice(0, resumo.pipeline.length),
                  borderRadius: 6,
                  data: resumo.pipeline.map(p => p.valor ?? 0)
              }]
          }
        : { labels: ['Sem dados'], datasets: [{ label: 'Valor (R$)', data: [0], backgroundColor: ['#e0e0e0'] }] };

    const formatCurrency = (value: number) =>
        (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatLembreteDate = (ts?: number) => {
        if (!ts) return '—';
        return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const saudacao = () => {
        const hora = new Date().getHours();
        if (hora < 12) return 'Bom dia';
        if (hora < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const kpis = resumo?.kpis;
    const leadsRecentes = resumo?.leadsRecentes ?? [];

    return (
        <div className="grid">
            {/* Saudação + filtro de período */}
            <div className="col-12">
                <div className="card mb-0">
                    <div className="flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="flex align-items-center gap-3">
                            <div
                                className="flex align-items-center justify-content-center bg-primary border-circle font-bold text-white"
                                style={{ width: '3rem', height: '3rem', fontSize: '1.2rem' }}
                            >
                                {user ? `${user.nome?.charAt(0) || ''}${user.sobrenome?.charAt(0) || ''}`.toUpperCase() : 'U'}
                            </div>
                            <div>
                                <div className="text-900 font-bold text-2xl">{saudacao()}, {user?.nome || 'Usuário'}!</div>
                                <span className="text-600">Aqui está o resumo do seu CRM</span>
                            </div>
                        </div>
                        <SelectButton
                            value={period}
                            onChange={(e) => e.value && setPeriod(e.value)}
                            options={PERIOD_OPTIONS}
                            className="text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Pré-Clientes</span>
                            <div className="text-900 font-medium text-xl">
                                {loading ? <ProgressSpinner style={{ width: '1.5rem', height: '1.5rem' }} strokeWidth="4" /> : (kpis?.leads.total ?? 0)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{kpis?.leads.novos ?? 0} novos </span>
                    <span className="text-500">(status "Novo")</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Oportunidades</span>
                            <div className="text-900 font-medium text-xl">
                                {loading ? <ProgressSpinner style={{ width: '1.5rem', height: '1.5rem' }} strokeWidth="4" /> : formatCurrency(kpis?.oportunidades.valorPipeline ?? 0)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{kpis?.oportunidades.total ?? 0} ativas </span>
                    <span className="text-500">no pipeline</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Empresas</span>
                            <div className="text-900 font-medium text-xl">
                                {loading ? <ProgressSpinner style={{ width: '1.5rem', height: '1.5rem' }} strokeWidth="4" /> : (kpis?.empresas.total ?? 0)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-building text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">cadastradas no CRM</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Contatos</span>
                            <div className="text-900 font-medium text-xl">
                                {loading ? <ProgressSpinner style={{ width: '1.5rem', height: '1.5rem' }} strokeWidth="4" /> : (kpis?.contatos.total ?? 0)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-id-card text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">pessoas cadastradas</span>
                </div>
            </div>

            {/* Pipeline doughnut + Ações */}
            <div className="col-12 xl:col-5">
                <div className="card">
                    <h5>Pipeline de Vendas</h5>
                    {loading ? (
                        <div className="flex justify-content-center py-6"><ProgressSpinner /></div>
                    ) : (
                        <Chart type="doughnut" data={pipelineChartData} options={pipelineOptions} />
                    )}
                </div>

                <div className="card">
                    <h5>Ações Rápidas</h5>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/crm/leads/novo">
                            <Button label="Novo Pré-Cliente" icon="pi pi-user-plus" size="small" />
                        </Link>
                        <Link href="/crm/contas/novo">
                            <Button label="Nova Empresa" icon="pi pi-building" size="small" severity="secondary" />
                        </Link>
                        <Link href="/crm/oportunidades/novo">
                            <Button label="Nova Oportunidade" icon="pi pi-dollar" size="small" severity="success" />
                        </Link>
                        <Link href="/crm/contatos/novo">
                            <Button label="Novo Contato" icon="pi pi-id-card" size="small" severity="info" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Pré-Clientes Recentes + Pipeline tabela */}
            <div className="col-12 xl:col-7">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h5 className="m-0">Pré-Clientes Recentes</h5>
                        <Link href="/crm/leads">
                            <Button label="Ver todos" icon="pi pi-arrow-right" iconPos="right" text size="small" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-content-center py-6"><ProgressSpinner /></div>
                    ) : leadsRecentes.length > 0 ? (
                        <DataTable value={leadsRecentes} rows={5} responsiveLayout="scroll">
                            <Column
                                field="nome"
                                header="Nome"
                                body={(row) => (
                                    <span
                                        className="font-semibold text-primary cursor-pointer hover:underline"
                                        onClick={() => router.push(`/crm/leads/${row.id}`)}
                                    >
                                        {row.nome}
                                    </span>
                                )}
                            />
                            <Column field="empresa" header="Empresa" body={(row) => row.empresa || '—'} />
                            <Column
                                field="status"
                                header="Status"
                                body={(row) => {
                                    const label = LEAD_STATUS_LABELS[row.status || ''] || row.status || '—';
                                    const severity = (LEAD_STATUS_SEVERITY[row.status || ''] || 'secondary') as any;
                                    return <Tag value={label} severity={severity} />;
                                }}
                            />
                            <Column
                                header=""
                                style={{ width: '4rem' }}
                                body={(row) => (
                                    <Button icon="pi pi-eye" text rounded size="small" onClick={() => router.push(`/crm/leads/${row.id}`)} />
                                )}
                            />
                        </DataTable>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center py-5">
                            <i className="pi pi-inbox text-4xl text-300 mb-3"></i>
                            <span className="text-600 mb-3">Nenhum pré-cliente cadastrado ainda</span>
                            <Link href="/crm/leads/novo">
                                <Button label="Criar primeiro pré-cliente" icon="pi pi-plus" text size="small" />
                            </Link>
                        </div>
                    )}
                </div>

                {!loading && resumo?.pipeline && resumo.pipeline.length > 0 && (
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-4">
                            <h5 className="m-0">Oportunidades por Fase</h5>
                            <Link href="/crm/oportunidades">
                                <Button label="Ver todas" icon="pi pi-arrow-right" iconPos="right" text size="small" />
                            </Link>
                        </div>
                        <DataTable value={resumo.pipeline} responsiveLayout="scroll">
                            <Column field="fase" header="Fase" body={(row) => FASE_LABELS[row.fase] || row.fase} />
                            <Column field="quantidade" header="Qtd." style={{ width: '5rem', textAlign: 'center' }} />
                            <Column field="valor" header="Valor Total" body={(row) => formatCurrency(row.valor)} />
                        </DataTable>
                    </div>
                )}
            </div>

            {/* Gráfico de barras: valor por estágio */}
            <div className="col-12 xl:col-8">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h5 className="m-0">Valor por Estágio do Pipeline</h5>
                        <Link href="/crm/oportunidades">
                            <Button label="Ver oportunidades" icon="pi pi-arrow-right" iconPos="right" text size="small" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-content-center py-6"><ProgressSpinner /></div>
                    ) : (
                        <Chart type="bar" data={barChartData} options={barOptions} style={{ height: '280px' }} />
                    )}
                </div>
            </div>

            {/* Widget Lembretes do dia */}
            <div className="col-12 xl:col-4">
                <div className="card h-full">
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div className="flex align-items-center gap-2">
                            <h5 className="m-0">Lembretes</h5>
                            {lembretes.length > 0 && (
                                <Badge value={lembretes.length} severity="warning" />
                            )}
                        </div>
                        <Link href="/agenda/lembretes">
                            <Button label="Ver todos" icon="pi pi-arrow-right" iconPos="right" text size="small" />
                        </Link>
                    </div>
                    {loadingLembretes ? (
                        <div className="flex justify-content-center py-4"><ProgressSpinner style={{ width: '2rem', height: '2rem' }} strokeWidth="4" /></div>
                    ) : lembretes.length === 0 ? (
                        <div className="flex flex-column align-items-center justify-content-center py-5 text-center">
                            <i className="pi pi-bell text-4xl text-300 mb-3" />
                            <span className="text-600">Nenhum lembrete pendente</span>
                        </div>
                    ) : (
                        <div className="flex flex-column gap-3">
                            {lembretes.map((l, idx) => (
                                <div key={l.id}>
                                    <div className="flex align-items-start gap-2">
                                        <i className="pi pi-bell text-orange-500 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-900 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                                {l.nome}
                                            </div>
                                            <div className="text-500 text-xs mt-1">
                                                {formatLembreteDate(l.dataExecucao)}
                                            </div>
                                            {l.moduloEventoRelacionado && (
                                                <Tag value={l.moduloEventoRelacionado} severity="info" className="mt-1 text-xs" />
                                            )}
                                        </div>
                                    </div>
                                    {idx < lembretes.length - 1 && <Divider className="my-2" />}
                                </div>
                            ))}
                            <Link href="/agenda/lembretes">
                                <Button label="Gerenciar lembretes" icon="pi pi-cog" text size="small" className="w-full mt-2" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
