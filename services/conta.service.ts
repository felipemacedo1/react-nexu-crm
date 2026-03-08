import { BaseService, PaginatedResponse, PaginationParams } from './base.service';
import api from './api.config';

export interface ContaDTO {
    id?: string;
    nome: string;
    site?: string;
    tickerForex?: string;
    descricao?: string;
    tipo?: string;
    setor?: string;
    telefoneEscritorio?: string;
    email?: string;
    classificacao?: string;
    faturamentoAnual?: number;
    funcionarios?: number;
    codigoSic?: string;
    proprietarioAtribuidoId?: string;
    enderecoCobranca?: string;
    cidadeCobranca?: string;
    estadoCobranca?: string;
    cepCobranca?: string;
    paisCobranca?: string;
    enderecoEntrega?: string;
    cidadeEntrega?: string;
    estadoEntrega?: string;
    cepEntrega?: string;
    paisEntrega?: string;
    criadoEm?: string;
    atualizadoEm?: string;
}

class ContaServiceClass extends BaseService<ContaDTO> {
    constructor() {
        super('/conta');
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<ContaDTO>> {
        return this.getPaginated(params);
    }

    async buscarPorId(id: string): Promise<ContaDTO> {
        return this.getById(id);
    }

    async criar(data: Partial<ContaDTO>): Promise<ContaDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: Partial<ContaDTO>): Promise<ContaDTO> {
        return this.update(id, data);
    }

    async excluir(id: string): Promise<void> {
        return this.delete(id);
    }

    async buscarPorNome(nome: string): Promise<ContaDTO[]> {
        const response = await api.get<ContaDTO[]>(`${this.endpoint}/buscar`, { params: { nome } });
        return response.data;
    }

    async listarContatos(contaId: string): Promise<any[]> {
        const response = await api.get(`${this.endpoint}/${contaId}/contatos`);
        return response.data;
    }

    async listarOportunidades(contaId: string): Promise<any[]> {
        const response = await api.get(`${this.endpoint}/${contaId}/oportunidades`);
        return response.data;
    }
}

export const ContaService = new ContaServiceClass();
