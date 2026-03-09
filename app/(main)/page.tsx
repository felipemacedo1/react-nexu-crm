/* eslint-disable @next/next/no-img-element */
'use client';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '@/hooks/useAuth';
import { ChartOptions } from 'chart.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardService, { DashboardResumo, FASE_LABELS } from '@/services/dashboard.service';
import { LEAD_STATUS_LABELS, LEAD_STATUS_SEVERITY } from '@/services/lead.service';

const PIPELINE_COLORS = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA', '#EF5350', '#78909C'];

const Dashboard = () => {
    const [pipelineOptions, setPipelineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);
    const { user } = useAuth();
    const router = useRouter();

    const [resumo, setResumo] = useState<DashboardResumo | null>(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchResumo();
    }, [fetchResumo]);

    const applyLightTheme = () => {
        setPipelineOptions({ plugins: { legend: { position: 'bottom', labels: { color: '#495057' } } } });
    };

    const applyDarkTheme = () => {
        setPipelineOptions({ plugins: { legend: { position: 'bottom', labels: { color: '#ebedef' } } } });
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

    const formatCurrency = (value: number) =>
        (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
            {/* Saudação */}
            <div className="col-12">
                <div className="card mb-0">
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
        </div>
    );
};

export default Dashboard;
