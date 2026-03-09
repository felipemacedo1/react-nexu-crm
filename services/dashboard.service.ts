import api from './api.config';

export interface DashboardKpiLeads {
    total: number;
    novos: number;
}

export interface DashboardKpiOportunidades {
    total: number;
    valorPipeline: number;
}

export interface DashboardKpiSimples {
    total: number;
}

export interface DashboardKpis {
    leads: DashboardKpiLeads;
    oportunidades: DashboardKpiOportunidades;
    empresas: DashboardKpiSimples;
    contatos: DashboardKpiSimples;
}

export interface PipelineItem {
    fase: string;
    quantidade: number;
    valor: number;
}

export interface LeadRecente {
    id: string;
    nome: string;
    empresa?: string;
    status?: string;
}

export interface DashboardResumo {
    kpis: DashboardKpis;
    pipeline: PipelineItem[];
    leadsRecentes: LeadRecente[];
}

// Labels para as fases de venda no gráfico de pipeline
export const FASE_LABELS: Record<string, string> = {
    'Prospecting':         'Prospecção',
    'Qualification':       'Qualificação',
    'Needs Analysis':      'Análise',
    'Value Proposition':   'Proposta',
    'Id. Decision Makers': 'Decisores',
    'Perception Analysis': 'Percepção',
    'Proposal/Price Quote':'Cotação',
    'Negotiation/Review':  'Negociação',
    'Closed Won':          'Ganho',
    'Closed Lost':         'Perdido',
};

const DashboardService = {
    async getResumo(): Promise<DashboardResumo> {
        const response = await api.get<DashboardResumo>('/dashboard/resumo');
        return response.data;
    }
};

export default DashboardService;
