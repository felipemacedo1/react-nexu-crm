import api from './api.config';
import { BaseService, PaginatedResponse, PaginationParams } from './base.service';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface RelatorioFunilResponseDTO {
    estagio: string;
    totalOportunidades: number;
    valorTotal: number;
    taxaConversao: number;
}

export interface RelatorioLeadsOrigemResponseDTO {
    origem: string;
    total: number;
    percentual: number;
}

export interface RelatorioPerformanceResponseDTO {
    usuarioNome: string;
    totalOportunidades: number;
    valorFechado: number;
    taxaConversao: number;
}

export interface RelatorioKPIResponseDTO {
    totalLeads: number;
    totalContas: number;
    totalContatos: number;
    totalOportunidades: number;
    oportunidadesAbertas: number;
    valorTotalPipeline: number;
    taxaConversaoGeral: number;
    oportunidadesGanhas: number;
    oportunidadesPerdidas: number;
}

// ─── Options ─────────────────────────────────────────────────────────────────

export const PERIODO_OPTIONS = [
    { label: 'Hoje', value: 'hoje' },
    { label: 'Esta semana', value: 'semana' },
    { label: 'Este mês', value: 'mes' },
    { label: 'Este trimestre', value: 'trimestre' },
    { label: 'Este ano', value: 'ano' },
    { label: 'Personalizado', value: 'custom' }
];

export const RELATORIO_TIPOS = [
    { label: 'Funil de Vendas', value: 'funil', icon: 'pi-filter', description: 'Visão do pipeline por estágio' },
    { label: 'Leads por Origem', value: 'leads_origem', icon: 'pi-chart-pie', description: 'Distribuição de leads por origem' },
    { label: 'Performance de Vendas', value: 'performance', icon: 'pi-users', description: 'Resultados por vendedor' },
    { label: 'Oportunidades Ganhas/Perdidas', value: 'oportunidades', icon: 'pi-chart-bar', description: 'Taxa de fechamento de oportunidades' },
    { label: 'KPIs Gerais', value: 'kpis', icon: 'pi-th-large', description: 'Indicadores-chave de desempenho' }
];

// ─── Service ─────────────────────────────────────────────────────────────────

class RelatorioServiceClass {
    private readonly base = '/relatorio';

    async getKPIs(): Promise<RelatorioKPIResponseDTO> {
        const response = await api.get<RelatorioKPIResponseDTO>(`${this.base}/kpis`);
        return response.data;
    }

    async getFunilVendas(): Promise<RelatorioFunilResponseDTO[]> {
        const response = await api.get<RelatorioFunilResponseDTO[]>(`${this.base}/funil`);
        return response.data;
    }

    async getLeadsPorOrigem(): Promise<RelatorioLeadsOrigemResponseDTO[]> {
        const response = await api.get<RelatorioLeadsOrigemResponseDTO[]>(`${this.base}/leads-por-origem`);
        return response.data;
    }

    async getPerformanceVendas(): Promise<RelatorioPerformanceResponseDTO[]> {
        const response = await api.get<RelatorioPerformanceResponseDTO[]>(`${this.base}/performance`);
        return response.data;
    }
}

export const RelatorioService = new RelatorioServiceClass();
