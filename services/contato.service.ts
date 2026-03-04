import { BaseService } from './base.service';

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

    async buscarPorNome(nome: string): Promise<ContatoDTO[]> {
        return this.search({ nome });
    }

    async buscarPorConta(contaId: string): Promise<ContatoDTO[]> {
        return this.search({ contaId });
    }
}

export const ContatoService = new ContatoServiceClass();
