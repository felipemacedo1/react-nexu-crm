// Rotas da API do NexoCRM Backend
export const API_ROUTES = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/registrar'
    },

    // CRM
    CONTA: '/conta',
    CONTATO: '/contato',
    LEAD: '/lead',
    OPORTUNIDADE: '/oportunidade',
    ATIVIDADE: '/atividade',
    CASO: '/caso',

    // Agenda
    EVENTO: '/evento',
    LEMBRETE: '/lembrete',
    TAREFA: '/tarefa',
    CALENDARIO: '/conta-calendario',

    // Admin
    USUARIO: '/usuario',
    GRUPO_SEGURANCA: '/grupo-seguranca',
    PAPEL: '/papel',
    ADMINISTRACAO: '/administracao',
    AREA: '/area',

    // Financeiro
    ORCAMENTO: '/orcamento',
    PRODUTO: '/produto',
    MOEDA: '/moeda',

    // Marketing
    CAMPANHA: '/campanha',
    PESQUISA: '/pesquisa',

    // Projeto
    PROJETO: '/projeto',
    TAREFA_PROJETO: '/tarefa-projeto',

    // Relatório
    RELATORIO: '/relatorio',

    // Suporte
    BASE_CONHECIMENTO: '/base-conhecimento',
    CATEGORIA_BASE: '/categoria-base-conhecimento',

    // Integração
    EMAIL_ENTRADA: '/email-entrada',
    EMAIL_SAIDA: '/conta-email-saida',
    WEBHOOK: '/webhook'
} as const;
