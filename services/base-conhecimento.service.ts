import api from './api.config';
import { BaseService, PaginatedResponse, PaginationParams } from './base.service';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface ArtigoResponseDTO {
    id: string;
    titulo: string;
    conteudo: string;
    resumo?: string;
    categoria?: string;
    status?: string;
    visualizacoes?: number;
    criadoPorNome?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ArtigoRequestDTO {
    titulo: string;
    conteudo: string;
    resumo?: string;
    categoria?: string;
    status?: string;
}

// ─── Options ─────────────────────────────────────────────────────────────────

export const STATUS_ARTIGO_OPTIONS = [
    { label: 'Rascunho', value: 'Draft' },
    { label: 'Publicado', value: 'Published' },
    { label: 'Arquivado', value: 'Archived' }
];

export const CATEGORIA_ARTIGO_OPTIONS = [
    { label: 'Suporte', value: 'Suporte' },
    { label: 'Produto', value: 'Produto' },
    { label: 'Vendas', value: 'Vendas' },
    { label: 'Técnico', value: 'Tecnico' },
    { label: 'FAQ', value: 'FAQ' },
    { label: 'Outros', value: 'Outros' }
];

// ─── Service ─────────────────────────────────────────────────────────────────

class ArtigoServiceClass extends BaseService<ArtigoResponseDTO> {
    constructor() {
        super('/artigo');
    }

    async listarPaginado(params: PaginationParams): Promise<PaginatedResponse<ArtigoResponseDTO>> {
        const { page = 0, size = 20, sort = 'titulo', direction = 'asc' } = params;
        const response = await api.get<PaginatedResponse<ArtigoResponseDTO>>(this.endpoint, {
            params: { page, size, sort, direction }
        });
        return response.data;
    }

    async buscarPorId(id: string): Promise<ArtigoResponseDTO> {
        const response = await api.get<ArtigoResponseDTO>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async criar(data: ArtigoRequestDTO): Promise<ArtigoResponseDTO> {
        const response = await api.post<ArtigoResponseDTO>(this.endpoint, data);
        return response.data;
    }

    async atualizar(id: string, data: ArtigoRequestDTO): Promise<ArtigoResponseDTO> {
        const response = await api.put<ArtigoResponseDTO>(`${this.endpoint}/${id}`, data);
        return response.data;
    }
}

export const ArtigoService = new ArtigoServiceClass();
