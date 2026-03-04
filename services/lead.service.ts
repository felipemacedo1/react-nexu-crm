import { BaseService } from './base.service';

export interface LeadDTO {
    id?: string;
    saudacao?: string;
    nome: string;
    sobrenome: string;
    titulo?: string;
    empresa?: string;
    email?: string;
    telefone?: string;
    celular?: string;
    site?: string;
    fax?: string;
    status?: string;
    origem?: string;
    setor?: string;
    faturamentoAnual?: number;
    funcionarios?: number;
    descricao?: string;
    classificacao?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    pais?: string;
    convertido?: boolean;
    proprietarioAtribuidoId?: string;
    criadoEm?: string;
    atualizadoEm?: string;
}

class LeadServiceClass extends BaseService<LeadDTO> {
    constructor() {
        super('/lead');
    }

    async buscarPorNome(nome: string): Promise<LeadDTO[]> {
        return this.search({ nome });
    }

    async buscarPorStatus(status: string): Promise<LeadDTO[]> {
        return this.search({ status });
    }
}

export const LeadService = new LeadServiceClass();
