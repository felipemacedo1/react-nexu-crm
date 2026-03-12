import { BaseService, PaginatedResponse, PaginationParams } from './base.service';
import { API_ROUTES } from '@/constants/api-routes';

// ─── Caso ─────────────────────────────────────────────────────────────────────

export interface CasoResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    estado?: string;
    status?: string;
    prioridade?: string;
    resolucao?: string;
    textoAtualizacao?: string;
    interno?: boolean;
    contaId?: string;
    contaNome?: string;
    contatoCriadoPorId?: string;
    contatoCriadoPorNome?: string;
}

export interface CasoRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    contaId?: string;
    contatoCriadoPorId?: string;
    estado?: string;
    status?: string;
    prioridade?: string;
    resolucao?: string;
    textoAtualizacao?: string;
    interno?: boolean;
}

export const ESTADO_CASO_OPTIONS = [
    { label: 'Aberto', value: 'Open' },
    { label: 'Fechado', value: 'Closed' }
];

export const STATUS_CASO_OPTIONS = [
    { label: 'Novo', value: 'New' },
    { label: 'Atribuído', value: 'Assigned' },
    { label: 'Em revisão', value: 'In Review' },
    { label: 'Aguardando', value: 'Pending Input' },
    { label: 'Resolvido', value: 'Resolved' },
    { label: 'Fechado', value: 'Closed' }
];

export const PRIORIDADE_CASO_OPTIONS = [
    { label: 'Urgente', value: 'Urgent' },
    { label: 'Alta', value: 'High' },
    { label: 'Média', value: 'Medium' },
    { label: 'Baixa', value: 'Low' }
];

class CasoServiceClass extends BaseService<CasoResponseDTO> {
    constructor() {
        super(API_ROUTES.CASO);
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<CasoResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: CasoRequestDTO): Promise<CasoResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: CasoRequestDTO): Promise<CasoResponseDTO> {
        return this.update(id, data);
    }

    async buscarPorId(id: string): Promise<CasoResponseDTO> {
        return this.getById(id);
    }
}

export const CasoService = new CasoServiceClass();
