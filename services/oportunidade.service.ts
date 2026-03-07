import { BaseService, PaginatedResponse, PaginationParams } from './base.service';

export interface OportunidadeDTO {
    id?: string;
    nome: string;
    montante?: number;
    dataFechamento?: string;
    estagio?: string;
    probabilidade?: number;
    tipo?: string;
    origem?: string;
    descricao?: string;
    proximoPasso?: string;
    contaId?: string;
    contaNome?: string;
    contatoId?: string;
    contatoNome?: string;
    proprietarioAtribuidoId?: string;
    criadoEm?: string;
    atualizadoEm?: string;
}

class OportunidadeServiceClass extends BaseService<OportunidadeDTO> {
    constructor() {
        super('/oportunidade');
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<OportunidadeDTO>> {
        return this.getPaginated(params);
    }

    async buscarPorId(id: string): Promise<OportunidadeDTO> {
        return this.getById(id);
    }

    async criar(data: Partial<OportunidadeDTO>): Promise<OportunidadeDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: Partial<OportunidadeDTO>): Promise<OportunidadeDTO> {
        return this.update(id, data);
    }

    async excluir(id: string): Promise<void> {
        return this.delete(id);
    }

    async buscarPorEstagio(estagio: string): Promise<OportunidadeDTO[]> {
        return this.search({ estagio });
    }

    async buscarPorConta(contaId: string): Promise<OportunidadeDTO[]> {
        return this.search({ contaId });
    }
}

export const OportunidadeService = new OportunidadeServiceClass();
