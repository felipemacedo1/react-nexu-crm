import { BaseService } from './base.service';

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

    async buscarPorEstagio(estagio: string): Promise<OportunidadeDTO[]> {
        return this.search({ estagio });
    }

    async buscarPorConta(contaId: string): Promise<OportunidadeDTO[]> {
        return this.search({ contaId });
    }
}

export const OportunidadeService = new OportunidadeServiceClass();
