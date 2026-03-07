import { BaseService, PaginatedResponse, PaginationParams } from './base.service';

export interface ContatoDTO {
    id?: string;
    saudacao?: string;
    nome: string;
    sobrenome: string;
    titulo?: string;
    departamento?: string;
    email?: string;
    telefone?: string;
    celular?: string;
    fax?: string;
    contaId?: string;
    contaNome?: string;
    descricao?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    pais?: string;
    proprietarioAtribuidoId?: string;
    criadoEm?: string;
    atualizadoEm?: string;
}

class ContatoServiceClass extends BaseService<ContatoDTO> {
    constructor() {
        super('/contato');
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<ContatoDTO>> {
        return this.getPaginated(params);
    }

    async buscarPorId(id: string): Promise<ContatoDTO> {
        return this.getById(id);
    }

    async criar(data: Partial<ContatoDTO>): Promise<ContatoDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: Partial<ContatoDTO>): Promise<ContatoDTO> {
        return this.update(id, data);
    }

    async excluir(id: string): Promise<void> {
        return this.delete(id);
    }

    async buscarPorNome(nome: string): Promise<ContatoDTO[]> {
        return this.search({ nome });
    }

    async buscarPorConta(contaId: string): Promise<ContatoDTO[]> {
        return this.search({ contaId });
    }
}

export const ContatoService = new ContatoServiceClass();
