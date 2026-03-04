/* eslint-disable @next/next/no-img-element */
'use client';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useAuth } from '@/hooks/useAuth';
import { ChartData, ChartOptions } from 'chart.js';
import Link from 'next/link';

const Dashboard = () => {
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);
    const { user } = useAuth();

    // Dados placeholder - serão substituídos por dados reais da API
    const kpis = {
        leads: { total: 0, novos: 0 },
        oportunidades: { total: 0, valor: 0 },
        contas: { total: 0, ativas: 0 },
        tarefas: { total: 0, pendentes: 0 }
    };

    const leadsRecentes: any[] = [];
    const atividadesRecentes: any[] = [];

    const lineData: ChartData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Leads',
                data: [0, 0, 0, 0, 0, 0, 0],
                fill: false,
                backgroundColor: '#2f4860',
                borderColor: '#2f4860',
                tension: 0.4
            },
            {
                label: 'Oportunidades',
                data: [0, 0, 0, 0, 0, 0, 0],
                fill: false,
                backgroundColor: '#00bb7e',
                borderColor: '#00bb7e',
                tension: 0.4
            }
        ]
    };

    const pipelineData: ChartData = {
        labels: ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento'],
        datasets: [
            {
                data: [0, 0, 0, 0, 0],
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA']
            }
        ]
    };

    const applyLightTheme = () => {
        setLineOptions({
            plugins: {
                legend: { labels: { color: '#495057' } }
            },
            scales: {
                x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
                y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } }
            }
        });
    };

    const applyDarkTheme = () => {
        setLineOptions({
            plugins: {
                legend: { labels: { color: '#ebedef' } }
            },
            scales: {
                x: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160, 167, 181, .3)' } },
                y: { ticks: { color: '#ebedef' }, grid: { color: 'rgba(160, 167, 181, .3)' } }
            }
        });
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    // TODO: Buscar dados reais da API
    // useEffect(() => {
    //     Promise.all([
    //         LeadService.getAll(),
    //         OportunidadeService.getAll(),
    //         ContaService.getAll(),
    //     ]).then(([leads, oportunidades, contas]) => { ... });
    // }, []);

    const getStatusLeadSeverity = (status: string) => {
        switch (status) {
            case 'NOVO': return 'info';
            case 'QUALIFICADO': return 'success';
            case 'EM_ANDAMENTO': return 'warning';
            case 'CONVERTIDO': return 'success';
            case 'PERDIDO': return 'danger';
            default: return 'info';
        }
    };

    const formatCurrency = (value: number) => {
        return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const saudacao = () => {
        const hora = new Date().getHours();
        if (hora < 12) return 'Bom dia';
        if (hora < 18) return 'Boa tarde';
        return 'Boa noite';
    };

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
                            <div className="text-900 font-bold text-2xl">
                                {saudacao()}, {user?.nome || 'Usuário'}!
                            </div>
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
                            <span className="block text-500 font-medium mb-3">Leads</span>
                            <div className="text-900 font-medium text-xl">{kpis.leads.total}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{kpis.leads.novos} novos </span>
                    <span className="text-500">este mês</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Oportunidades</span>
                            <div className="text-900 font-medium text-xl">{formatCurrency(kpis.oportunidades.valor)}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{kpis.oportunidades.total} ativas </span>
                    <span className="text-500">no pipeline</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Contas</span>
                            <div className="text-900 font-medium text-xl">{kpis.contas.total}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-building text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{kpis.contas.ativas} ativas </span>
                    <span className="text-500">no sistema</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Tarefas Pendentes</span>
                            <div className="text-900 font-medium text-xl">{kpis.tarefas.pendentes}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-square text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-orange-500 font-medium">{kpis.tarefas.total} total </span>
                    <span className="text-500">de tarefas</span>
                </div>
            </div>

            {/* Gráfico de Leads e Oportunidades */}
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Evolução Mensal</h5>
                    <Chart type="line" data={lineData} options={lineOptions} />
                </div>

                <div className="card">
                    <h5>Pipeline de Vendas</h5>
                    <Chart type="doughnut" data={pipelineData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
            </div>

            {/* Leads Recentes e Atividades */}
            <div className="col-12 xl:col-6">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h5>Leads Recentes</h5>
                        <Link href="/crm/leads">
                            <Button label="Ver todos" icon="pi pi-arrow-right" iconPos="right" text size="small" />
                        </Link>
                    </div>
                    {leadsRecentes.length > 0 ? (
                        <DataTable value={leadsRecentes} rows={5} responsiveLayout="scroll">
                            <Column field="nome" header="Nome" sortable />
                            <Column field="empresa" header="Empresa" sortable />
                            <Column
                                field="status"
                                header="Status"
                                body={(data) => <Tag value={data.status} severity={getStatusLeadSeverity(data.status)} />}
                            />
                            <Column
                                header="Ações"
                                body={() => <Button icon="pi pi-eye" text rounded size="small" />}
                                style={{ width: '5rem' }}
                            />
                        </DataTable>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center py-5">
                            <i className="pi pi-inbox text-4xl text-300 mb-3"></i>
                            <span className="text-600">Nenhum lead recente</span>
                            <Link href="/crm/leads">
                                <Button label="Criar primeiro lead" icon="pi pi-plus" text className="mt-3" size="small" />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-4">
                        <h5>Atividades Recentes</h5>
                        <Link href="/crm/atividades">
                            <Button label="Ver todas" icon="pi pi-arrow-right" iconPos="right" text size="small" />
                        </Link>
                    </div>
                    {atividadesRecentes.length > 0 ? (
                        <ul className="p-0 m-0 list-none">
                            {atividadesRecentes.map((atividade, index) => (
                                <li key={index} className="flex align-items-center py-2 border-bottom-1 surface-border">
                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                        <i className={`pi ${atividade.icone || 'pi-clock'} text-xl text-blue-500`} />
                                    </div>
                                    <span className="text-900 line-height-3">{atividade.descricao}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center py-5">
                            <i className="pi pi-clock text-4xl text-300 mb-3"></i>
                            <span className="text-600">Nenhuma atividade recente</span>
                        </div>
                    )}
                </div>

                {/* Atalhos Rápidos */}
                <div className="card">
                    <h5>Ações Rápidas</h5>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/crm/leads">
                            <Button label="Novo Lead" icon="pi pi-user-plus" size="small" />
                        </Link>
                        <Link href="/crm/contas">
                            <Button label="Nova Conta" icon="pi pi-building" size="small" severity="secondary" />
                        </Link>
                        <Link href="/crm/oportunidades">
                            <Button label="Nova Oportunidade" icon="pi pi-dollar" size="small" severity="success" />
                        </Link>
                        <Link href="/agenda/eventos">
                            <Button label="Novo Evento" icon="pi pi-calendar-plus" size="small" severity="info" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
