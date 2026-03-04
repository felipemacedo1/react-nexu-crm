import { BaseService, PaginatedResponse, PaginationParams } from './base.service';
import api from './api.config';

// DTO de resposta (vindo do backend)
export interface LeadResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    origemLead?: string;
    descricaoOrigemLead?: string;
    status?: string;
    departamento?: string;
    nomeConta?: string;
    indicadoPor?: string;
    reportaParaId?: string;
    webParaLeadEmail1?: string;
    webParaLeadEmail2?: string;
    dataNascimento?: string;
    website?: string;
    contatoId?: string;
    contaId?: string;
    oportunidadeId?: string;
    campanhaId?: string;
    campanhaNome?: string;
}

// DTO de requisição (enviado para o backend)
export interface LeadRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    origemLead?: string;
    descricaoOrigemLead?: string;
    status?: string;
    departamento?: string;
    nomeConta?: string;
    descricaoConta?: string;
    indicadoPor?: string;
    reportaParaId?: string;
    webParaLeadEmail1?: string;
    webParaLeadEmail2?: string;
    dataNascimento?: string;
    website?: string;
    campanhaId?: string;
}

// Status possíveis de Lead
export const LEAD_STATUS_OPTIONS = [
    { label: 'Novo', value: 'New' },
    { label: 'Atribuído', value: 'Assigned' },
    { label: 'Em Processo', value: 'In Process' },
    { label: 'Convertido', value: 'Converted' },
    { label: 'Reciclado', value: 'Recycled' },
    { label: 'Morto', value: 'Dead' }
];

// Origens possíveis de Lead
export const LEAD_SOURCE_OPTIONS = [
    { label: 'Web', value: 'Web' },
    { label: 'Telefone', value: 'Phone' },
    { label: 'Email', value: 'Email' },
    { label: 'Indicação', value: 'Referral' },
    { label: 'Parceiro', value: 'Partner' },
    { label: 'Campanha', value: 'Campaign' },
    { label: 'Feira', value: 'Trade Show' },
    { label: 'Outro', value: 'Other' }
];

// Labels traduzidos para status
export const LEAD_STATUS_LABELS: Record<string, string> = {
    'New': 'Novo',
    'Assigned': 'Atribuído',
    'In Process': 'Em Processo',
    'Converted': 'Convertido',
    'Recycled': 'Reciclado',
    'Dead': 'Morto'
};

// Cores para badges de status
export const LEAD_STATUS_SEVERITY: Record<string, string> = {
    'New': 'info',
    'Assigned': 'warning',
    'In Process': 'warning',
    'Converted': 'success',
    'Recycled': 'info',
    'Dead': 'danger'
};

class LeadServiceClass extends BaseService<LeadResponseDTO> {
    constructor() {
        super('/lead');
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<LeadResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: LeadRequestDTO): Promise<LeadResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: LeadRequestDTO): Promise<LeadResponseDTO> {
        return this.update(id, data);
    }

    async buscarPorId(id: string): Promise<LeadResponseDTO> {
        return this.getById(id);
    }

    async excluir(id: string): Promise<void> {
        return this.delete(id);
    }
}

export const LeadService = new LeadServiceClass();
