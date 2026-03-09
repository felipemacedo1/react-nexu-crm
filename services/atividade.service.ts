import { BaseService, PaginatedResponse, PaginationParams } from './base.service';
import api from './api.config';
import { API_ROUTES } from '@/constants/api-routes';

// ─── Tipos de atividade disponíveis no backend ────────────────────────────────

export type TipoAtividade = 'ligacao' | 'reuniao' | 'evento';

export const TIPO_ATIVIDADE_OPTIONS = [
    { label: 'Ligação', value: 'ligacao' },
    { label: 'Reunião', value: 'reuniao' },
    { label: 'Evento', value: 'evento' }
] as const;

export const STATUS_ATIVIDADE_OPTIONS = [
    { label: 'Planejado', value: 'Planned' },
    { label: 'Realizado', value: 'Held' },
    { label: 'Não realizado', value: 'Not Held' }
];

export const DIRECAO_LIGACAO_OPTIONS = [
    { label: 'Entrada', value: 'Inbound' },
    { label: 'Saída', value: 'Outbound' }
];

// ─── DTOs de Ligação ──────────────────────────────────────────────────────────

export interface LigacaoResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    duracaoHoras?: number;
    duracaoMinutos?: number;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
    direcao?: string;
    responsavelId?: string;
    contatoId?: string;
    contatoNome?: string;
    tipoResponsavel?: string;
}

export interface LigacaoRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    duracaoHoras?: number;
    duracaoMinutos?: number;
    dataInicio?: string;
    status?: string;
    direcao?: string;
    responsavelId?: string;
    contatoId?: string;
}

// ─── DTOs de Reunião ──────────────────────────────────────────────────────────

export interface ReuniaoResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    duracaoHoras?: number;
    duracaoMinutos?: number;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
    tipo?: string;
    localizacao?: string;
    urlEntrada?: string;
    responsavelId?: string;
}

export interface ReuniaoRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    duracaoHoras?: number;
    duracaoMinutos?: number;
    dataInicio?: string;
    status?: string;
    tipo?: string;
    localizacao?: string;
    responsavelId?: string;
}

// ─── DTOs de Evento ───────────────────────────────────────────────────────────

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
}

// ─── Services individuais ─────────────────────────────────────────────────────

export class LigacaoService extends BaseService<LigacaoResponseDTO> {
    constructor() {
        super(API_ROUTES.ATIVIDADE + '/ligacao');
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<LigacaoResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: LigacaoRequestDTO): Promise<LigacaoResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: LigacaoRequestDTO): Promise<LigacaoResponseDTO> {
        return this.update(id, data);
    }
}

export class ReuniaoService extends BaseService<ReuniaoResponseDTO> {
    constructor() {
        super('/reuniao');
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<ReuniaoResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: ReuniaoRequestDTO): Promise<ReuniaoResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: ReuniaoRequestDTO): Promise<ReuniaoResponseDTO> {
        return this.update(id, data);
    }
}

export class EventoService extends BaseService<EventoResponseDTO> {
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

// ─── Instâncias exportadas ────────────────────────────────────────────────────

export const ligacaoService = new LigacaoService();
export const reuniaoService = new ReuniaoService();
export const eventoService = new EventoService();
