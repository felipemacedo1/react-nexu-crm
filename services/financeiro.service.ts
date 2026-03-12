import { BaseService, PaginatedResponse, PaginationParams } from './base.service';
import { API_ROUTES } from '@/constants/api-routes';

// ─── Orçamento ────────────────────────────────────────────────────────────────

export interface OrcamentoResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    numero?: number;
    fase?: string;
    prazo?: string;
    statusAprovacao?: string;
    statusFatura?: string;
    validade?: string;
    valorSubtotal?: number;
    valorDesconto?: number;
    valorImposto?: number;
    valorFrete?: number;
    valorTotal?: number;
    moedaId?: string;
    moedaNome?: string;
    contaCobrancaId?: string;
    contaCobrancaNome?: string;
    contatoCobrancaId?: string;
    contatoCobrancaNome?: string;
    oportunidadeId?: string;
    oportunidadeNome?: string;
    nomeContaCobranca?: string;
    nomeContatoCobranca?: string;
    enderecoCobrancaCidade?: string;
    enderecoCobrancaEstado?: string;
    enderecoCobrancaPais?: string;
}

export interface OrcamentoRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    fase?: string;
    prazo?: string;
    validade?: string;
    contaCobrancaId?: string;
    contatoCobrancaId?: string;
    oportunidadeId?: string;
    nomeContaCobranca?: string;
    nomeContatoCobranca?: string;
    valorSubtotal?: number;
    valorDesconto?: number;
    valorImposto?: number;
    valorFrete?: number;
    moedaId?: string;
}

export const FASE_ORCAMENTO_OPTIONS = [
    { label: 'Rascunho', value: 'Draft' },
    { label: 'Em revisão', value: 'In Review' },
    { label: 'Entregue', value: 'Delivered' },
    { label: 'Em negociação', value: 'In Review/Negotiation' },
    { label: 'Aprovado', value: 'Approved' },
    { label: 'Recusado', value: 'Not Approved' }
];

// ─── Produto ──────────────────────────────────────────────────────────────────

export interface ProdutoResponseDTO {
    id: string;
    nome: string;
    descricao?: string;
    dataCriacao?: string;
    dataModificacao?: string;
    usuarioAtribuidoId?: string;
    criadoPor?: string;
    codigoPrincipal?: string;
    numeroPeca?: string;
    categoria?: string;
    tipo?: string;
    custo?: number;
    preco?: number;
    url?: string;
    imagemProduto?: string;
    nomeCategoriaProduto?: string;
    moedaId?: string;
    moedaNome?: string;
    contatoId?: string;
    contatoNome?: string;
}

export interface ProdutoRequestDTO {
    nome: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    codigoPrincipal?: string;
    numeroPeca?: string;
    tipo?: string;
    custo?: number;
    preco?: number;
    url?: string;
    moedaId?: string;
}

export const TIPO_PRODUTO_OPTIONS = [
    { label: 'Produto', value: 'Good' },
    { label: 'Serviço', value: 'Service' },
    { label: 'Software', value: 'Software' }
];

// ─── Services ────────────────────────────────────────────────────────────────

class OrcamentoServiceClass extends BaseService<OrcamentoResponseDTO> {
    constructor() {
        super(API_ROUTES.ORCAMENTO);
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<OrcamentoResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: OrcamentoRequestDTO): Promise<OrcamentoResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: OrcamentoRequestDTO): Promise<OrcamentoResponseDTO> {
        return this.update(id, data);
    }
}

class ProdutoServiceClass extends BaseService<ProdutoResponseDTO> {
    constructor() {
        super(API_ROUTES.PRODUTO);
    }

    async listarPaginado(params?: PaginationParams): Promise<PaginatedResponse<ProdutoResponseDTO>> {
        return this.getPaginated(params);
    }

    async criar(data: ProdutoRequestDTO): Promise<ProdutoResponseDTO> {
        return this.create(data);
    }

    async atualizar(id: string, data: ProdutoRequestDTO): Promise<ProdutoResponseDTO> {
        return this.update(id, data);
    }
}

export const OrcamentoService = new OrcamentoServiceClass();
export const ProdutoService = new ProdutoServiceClass();
