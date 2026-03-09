import { BaseService, PaginatedResponse, PaginationParams } from './base.service';
import { API_ROUTES } from '@/constants/api-routes';

// ─── Tarefa ───────────────────────────────────────────────────────────────────

export interface TarefaResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    status?: string;
    prioridade?: string;
    dataVencimento?: string;
    horaVencimento?: string;
    dataInicio?: string;
    indicadorDataVencimento?: boolean;
    indicadorDataInicio?: boolean;
    tipoResponsavel?: string;
    responsavelId?: string;
    contatoId?: string;
    contatoNome?: string;
    telefoneContato?: string;
    emailContato?: string;
}

export interface TarefaRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    status?: string;
    prioridade?: string;
    dataVencimento?: string;
    dataInicio?: string;
    contatoId?: string;
    responsavelId?: string;
}

export const STATUS_TAREFA_OPTIONS = [
    { label: 'Não iniciada', value: 'Not Started' },
    { label: 'Em andamento', value: 'In Progress' },
    { label: 'Concluída', value: 'Completed' },
    { label: 'Pendente', value: 'Pending Input' },
    { label: 'Adiada', value: 'Deferred' }
];

export const PRIORIDADE_TAREFA_OPTIONS = [
    { label: 'Alta', value: 'High' },
    { label: 'Média', value: 'Medium' },
    { label: 'Baixa', value: 'Low' }
];

class TarefaServiceClass extends BaseService<TarefaResponseDTO> {
    constructor() {
        super(API_ROUTES.TAREFA);
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<TarefaResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: TarefaRequestDTO): Promise<TarefaResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: TarefaRequestDTO): Promise<TarefaResponseDTO> {
        return this.update(id, data);
    }
}

export const TarefaService = new TarefaServiceClass();
