import { BaseService } from './base.service';

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

    async buscarPorNome(nome: string): Promise<ContaDTO[]> {
        return this.search({ nome });
    }
}

export const ContaService = new ContaServiceClass();
