import api from './api.config';
import { BaseService, PaginatedResponse, PaginationParams } from './base.service';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface GrupoSegurancaResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
    totalUsuarios?: number;
    permissoes?: string[];
}

export interface GrupoSegurancaRequestDTO {
    nome: string;
    descricao?: string;
    ativo?: boolean;
    permissoes?: string[];
}

// ─── Permissões disponíveis no sistema ───────────────────────────────────────

export const MODULOS_PERMISSOES = [
    {
        modulo: 'CRM',
        permissoes: [
            { label: 'Ver Leads', value: 'leads:read' },
            { label: 'Criar/Editar Leads', value: 'leads:write' },
            { label: 'Excluir Leads', value: 'leads:delete' },
            { label: 'Ver Contas', value: 'contas:read' },
            { label: 'Criar/Editar Contas', value: 'contas:write' },
            { label: 'Excluir Contas', value: 'contas:delete' },
            { label: 'Ver Contatos', value: 'contatos:read' },
            { label: 'Criar/Editar Contatos', value: 'contatos:write' },
            { label: 'Ver Oportunidades', value: 'oportunidades:read' },
            { label: 'Criar/Editar Oportunidades', value: 'oportunidades:write' }
        ]
    },
    {
        modulo: 'Financeiro',
        permissoes: [
            { label: 'Ver Orçamentos', value: 'orcamentos:read' },
            { label: 'Criar/Editar Orçamentos', value: 'orcamentos:write' },
            { label: 'Ver Produtos', value: 'produtos:read' },
            { label: 'Criar/Editar Produtos', value: 'produtos:write' }
        ]
    },
    {
        modulo: 'Suporte',
        permissoes: [
            { label: 'Ver Casos', value: 'casos:read' },
            { label: 'Criar/Editar Casos', value: 'casos:write' },
            { label: 'Excluir Casos', value: 'casos:delete' }
        ]
    },
    {
        modulo: 'Admin',
        permissoes: [
            { label: 'Ver Usuários', value: 'usuarios:read' },
            { label: 'Criar/Editar Usuários', value: 'usuarios:write' },
            { label: 'Gerenciar Grupos', value: 'grupos:manage' },
            { label: 'Configurações do Sistema', value: 'config:manage' }
        ]
    }
];

// ─── Service ─────────────────────────────────────────────────────────────────

class GrupoSegurancaServiceClass extends BaseService<GrupoSegurancaResponseDTO> {
    constructor() {
        super('/grupo-seguranca');
    }

    async listarPaginado(params: PaginationParams): Promise<PaginatedResponse<GrupoSegurancaResponseDTO>> {
        const { page = 0, size = 20, sort = 'nome', direction = 'asc' } = params;
        const response = await api.get<PaginatedResponse<GrupoSegurancaResponseDTO>>(this.endpoint, {
            params: { page, size, sort, direction }
        });
        return response.data;
    }

    async buscarPorId(id: string): Promise<GrupoSegurancaResponseDTO> {
        const response = await api.get<GrupoSegurancaResponseDTO>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async criar(data: GrupoSegurancaRequestDTO): Promise<GrupoSegurancaResponseDTO> {
        const response = await api.post<GrupoSegurancaResponseDTO>(this.endpoint, data);
        return response.data;
    }

    async atualizar(id: string, data: GrupoSegurancaRequestDTO): Promise<GrupoSegurancaResponseDTO> {
        const response = await api.put<GrupoSegurancaResponseDTO>(`${this.endpoint}/${id}`, data);
        return response.data;
    }
}

export const GrupoSegurancaService = new GrupoSegurancaServiceClass();
