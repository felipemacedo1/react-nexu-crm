/**
 * Tipos de formulários para todas as entidades do NexoCRM.
 * Representa os valores dos campos de cada formulário de criação/edição.
 */

// ─── Autenticação ─────────────────────────────────────────────────────────────

export interface LoginFormValues {
    email: string;
    senha: string;
    lembrar?: boolean;
}

export interface RegisterFormValues {
    primeiroNome: string;
    ultimoNome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
}

export interface ForgotPasswordFormValues {
    email: string;
}

export interface ResetPasswordFormValues {
    novaSenha: string;
    confirmarSenha: string;
    token: string;
}

// ─── CRM ──────────────────────────────────────────────────────────────────────

export interface LeadFormValues {
    nome: string;
    webParaLeadEmail1?: string;
    webParaLeadEmail2?: string;
    nomeConta?: string;
    descricaoConta?: string;
    departamento?: string;
    origemLead?: string;
    descricaoOrigemLead?: string;
    status?: string;
    indicadoPor?: string;
    dataNascimento?: string;
    website?: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
    campanhaId?: string;
}

export interface ContaFormValues {
    nome: string;
    cnpj?: string;
    setor?: string;
    subsetor?: string;
    tipo?: string;
    website?: string;
    telefone?: string;
    fax?: string;
    descricao?: string;
    enderecoRua?: string;
    enderecoCidade?: string;
    enderecoEstado?: string;
    enderecoPais?: string;
    enderecoCep?: string;
    usuarioAtribuidoId?: string;
}

export interface ContatoFormValues {
    nome: string;
    primeiroNome?: string;
    ultimoNome?: string;
    email1?: string;
    telefoneComercial?: string;
    telefoneCelular?: string;
    cargo?: string;
    departamento?: string;
    contaId?: string;
    contaNome?: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
}

export interface OportunidadeFormValues {
    nome: string;
    contaId?: string;
    contaNome?: string;
    contatoId?: string;
    contatoNome?: string;
    valor?: number;
    probabilidade?: number;
    dataFechamento?: string;
    estagio?: string;
    tipo?: string;
    leadSource?: string;
    descricao?: string;
    usuarioAtribuidoId?: string;
}

export interface AtividadeFormValues {
    nome: string;
    tipo?: string;
    status?: string;
    prioridade?: string;
    dataVencimento?: string;
    horaInicio?: string;
    horaFim?: string;
    duracao?: number;
    descricao?: string;
    leadId?: string;
    contaId?: string;
    contatoId?: string;
    oportunidadeId?: string;
    usuarioAtribuidoId?: string;
}

// ─── Agenda ───────────────────────────────────────────────────────────────────

export interface EventoFormValues {
    nome: string;
    dataInicio: string;
    dataFim: string;
    horaInicio?: string;
    horaFim?: string;
    local?: string;
    descricao?: string;
    todoDia?: boolean;
}

export interface LembreteFormValues {
    nome: string;
    dataLembrete: string;
    horaLembrete?: string;
    descricao?: string;
    relacionadoId?: string;
    relacionadoTipo?: string;
}

export interface TarefaFormValues {
    nome: string;
    status?: string;
    prioridade?: string;
    dataVencimento?: string;
    descricao?: string;
    contatoId?: string;
    leadId?: string;
    oportunidadeId?: string;
}

// ─── Suporte ──────────────────────────────────────────────────────────────────

export interface CasoFormValues {
    nome: string;
    estado?: string;
    status?: string;
    prioridade?: string;
    interno?: boolean;
    descricao?: string;
    resolucao?: string;
    contaId?: string;
    contatoCriadoPorId?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface UsuarioFormValues {
    primeiroNome: string;
    ultimoNome: string;
    email1: string;
    nomeUsuario?: string;
    hashUsuario?: string;
    confirmarSenha?: string;
    status?: string;
    titulo?: string;
    departamento?: string;
    tipoUsuario?: string;
    ehAdmin?: boolean;
    telefoneComercial?: string;
    telefoneCelular?: string;
    reportaParaId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Estado genérico de um formulário controlado */
export interface FormState<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    isDirty: boolean;
}
