import api from './api.config';
import { BaseService, PaginatedResponse, PaginationParams } from './base.service';

export interface UsuarioDTO {
    id?: string;
    nome: string;
    sobrenome: string;
    email: string;
    nomeUsuario: string;
    senha?: string;
    telefone?: string;
    titulo?: string;
    departamento?: string;
    ativo?: boolean;
    administrador?: boolean;
    grupoSegurancaId?: string;
    grupoSegurancaNome?: string;
    permissoes?: string[];
    criadoEm?: string;
    atualizadoEm?: string;
}

interface UsuarioBackendDTO {
    id?: string;
    nome?: string;
    primeiroNome?: string;
    ultimoNome?: string;
    nomeUsuario: string;
    email1?: string;
    status?: string;
    titulo?: string;
    departamento?: string;
    ehAdmin?: boolean;
    administrador?: boolean;
    grupoSegurancaId?: string;
    grupoSegurancaNome?: string;
    permissoes?: string[];
    dataCriacao?: string;
    dataModificacao?: string;
    telefoneCelular?: string;
    telefoneComercial?: string;
}

const toFrontend = (user: UsuarioBackendDTO): UsuarioDTO => ({
    id: user.id,
    nome: user.primeiroNome ?? user.nome ?? '',
    sobrenome: user.ultimoNome ?? '',
    email: user.email1 ?? '',
    nomeUsuario: user.nomeUsuario,
    telefone: user.telefoneCelular ?? user.telefoneComercial,
    titulo: user.titulo,
    departamento: user.departamento,
    ativo: user.status ? user.status.toLowerCase() === 'active' : true,
    administrador: user.administrador ?? user.ehAdmin ?? false,
    grupoSegurancaId: user.grupoSegurancaId,
    grupoSegurancaNome: user.grupoSegurancaNome,
    permissoes: user.permissoes ?? [],
    criadoEm: user.dataCriacao,
    atualizadoEm: user.dataModificacao
});

const toBackend = (user: Partial<UsuarioDTO>): Record<string, unknown> => ({
    nome: user.nome,
    sobrenome: user.sobrenome,
    email: user.email,
    nomeUsuario: user.nomeUsuario,
    senha: user.senha,
    titulo: user.titulo,
    departamento: user.departamento,
    telefoneCelular: user.telefone,
    status: user.ativo === false ? 'Inactive' : 'Active',
    ehAdmin: user.administrador ?? false,
    grupoSegurancaId: user.grupoSegurancaId
});

class UsuarioServiceClass extends BaseService<UsuarioDTO> {
    constructor() {
        super('/usuario');
    }

    async getPaginated(params?: PaginationParams): Promise<PaginatedResponse<UsuarioDTO>> {
        const queryParams: Record<string, any> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.size !== undefined) queryParams.size = params.size;
        if (params?.sort) queryParams.sort = `${params.sort},${params.direction || 'asc'}`;

        const response = await api.get<PaginatedResponse<UsuarioBackendDTO>>(this.endpoint, { params: queryParams });
        return {
            ...response.data,
            content: response.data.content.map(toFrontend)
        };
    }

    async getById(id: string): Promise<UsuarioDTO> {
        const response = await api.get<UsuarioBackendDTO>(`${this.endpoint}/${id}`);
        return toFrontend(response.data);
    }

    async create(data: Partial<UsuarioDTO>): Promise<UsuarioDTO> {
        const response = await api.post<UsuarioBackendDTO>(this.endpoint, toBackend(data));
        return toFrontend(response.data);
    }

    async update(id: string, data: Partial<UsuarioDTO>): Promise<UsuarioDTO> {
        const response = await api.put<UsuarioBackendDTO>(`${this.endpoint}/${id}`, toBackend(data));
        return toFrontend(response.data);
    }

    async buscarPorEmail(email: string): Promise<UsuarioDTO[]> {
        return this.search({ email });
    }
}

export const UsuarioService = new UsuarioServiceClass();
