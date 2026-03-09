import { BaseService, PaginatedResponse, PaginationParams } from './base.service';
import api from './api.config';
import { API_ROUTES } from '@/constants/api-routes';

// ─── Evento ───────────────────────────────────────────────────────────────────

export interface EventoResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    duracaoMinutos?: number;
    dataInicio?: string;
    dataFim?: string;
    link?: string;
    tipoStatusAtividade?: string;
}

export interface EventoRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    duracaoMinutos?: number;
    dataInicio?: string;
    dataFim?: string;
    link?: string;
    tipoStatusAtividade?: string;
}

export const TIPO_STATUS_EVENTO_OPTIONS = [
    { label: 'Planejado', value: 'Planned' },
    { label: 'Realizado', value: 'Held' },
    { label: 'Não realizado', value: 'Not Held' }
];

// ─── Lembrete ─────────────────────────────────────────────────────────────────

export interface LembreteResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    email?: boolean;
    emailEnviado?: boolean;
    temporizadorPopup?: string;
    temporizadorEmail?: string;
    moduloEventoRelacionado?: string;
    moduloEventoRelacionadoId?: string;
    dataExecucao?: number;
    popupVisualizado?: boolean;
}

export interface LembreteRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    email?: boolean;
    temporizadorPopup?: string;
    temporizadorEmail?: string;
    moduloEventoRelacionado?: string;
    moduloEventoRelacionadoId?: string;
    dataExecucao?: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

class EventoServiceClass extends BaseService<EventoResponseDTO> {
    constructor() {
        super(API_ROUTES.EVENTO);
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<EventoResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: EventoRequestDTO): Promise<EventoResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: EventoRequestDTO): Promise<EventoResponseDTO> {
        return this.update(id, data);
    }
}

class LembreteServiceClass extends BaseService<LembreteResponseDTO> {
    constructor() {
        super(API_ROUTES.LEMBRETE);
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<LembreteResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: LembreteRequestDTO): Promise<LembreteResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: LembreteRequestDTO): Promise<LembreteResponseDTO> {
        return this.update(id, data);
    }
}

export const EventoService = new EventoServiceClass();
export const LembreteService = new LembreteServiceClass();
