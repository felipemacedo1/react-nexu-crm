import api from './api.config';

// ─── DTOs ──────────────────────────────────────────────────────────────────

export interface OAuthProviderDTO {
    id: string;
    nome: string;
    tipo: string;
    clientId: string;
    scopes: string;
    ativo: boolean;
    urlAutorizacao?: string;
    urlToken?: string;
    urlUserInfo?: string;
    iconeCss?: string;
}

export interface OAuthProviderRequestDTO {
    nome: string;
    tipo: string;
    clientId: string;
    clientSecret: string;
    scopes: string;
    ativo: boolean;
    urlAutorizacao?: string;
    urlToken?: string;
    urlUserInfo?: string;
}

export interface WebhookDTO {
    id: string;
    nome: string;
    url: string;
    eventos: string[];
    ativo: boolean;
    secret?: string;
    ultimaExecucao?: string;
    ultimoStatus?: string;
}

export interface WebhookRequestDTO {
    nome: string;
    url: string;
    eventos: string[];
    ativo: boolean;
    secret?: string;
}

// ─── Services ─────────────────────────────────────────────────────────────

export const OAuthService = {
    async listar(): Promise<OAuthProviderDTO[]> {
        const response = await api.get('/integracao/oauth');
        return response.data;
    },

    async criar(data: OAuthProviderRequestDTO): Promise<OAuthProviderDTO> {
        const response = await api.post('/integracao/oauth', data);
        return response.data;
    },

    async atualizar(id: string, data: OAuthProviderRequestDTO): Promise<OAuthProviderDTO> {
        const response = await api.put(`/integracao/oauth/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/integracao/oauth/${id}`);
    },

    async testarConexao(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
        const response = await api.post(`/integracao/oauth/${id}/testar`);
        return response.data;
    }
};

export const WebhookService = {
    async listar(): Promise<WebhookDTO[]> {
        const response = await api.get('/integracao/webhook');
        return response.data;
    },

    async criar(data: WebhookRequestDTO): Promise<WebhookDTO> {
        const response = await api.post('/integracao/webhook', data);
        return response.data;
    },

    async atualizar(id: string, data: WebhookRequestDTO): Promise<WebhookDTO> {
        const response = await api.put(`/integracao/webhook/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/integracao/webhook/${id}`);
    },

    async testar(id: string): Promise<{ sucesso: boolean; mensagem: string; httpStatus: number }> {
        const response = await api.post(`/integracao/webhook/${id}/testar`);
        return response.data;
    }
};

export const OAUTH_TIPO_OPTIONS = [
    { label: 'Google', value: 'GOOGLE' },
    { label: 'Microsoft / Azure AD', value: 'MICROSOFT' },
    { label: 'GitHub', value: 'GITHUB' },
    { label: 'Salesforce', value: 'SALESFORCE' },
    { label: 'Customizado', value: 'CUSTOM' }
];

export const WEBHOOK_EVENTO_OPTIONS = [
    { label: 'Lead criado', value: 'lead.created' },
    { label: 'Lead atualizado', value: 'lead.updated' },
    { label: 'Conta criada', value: 'conta.created' },
    { label: 'Contato criado', value: 'contato.created' },
    { label: 'Oportunidade criada', value: 'oportunidade.created' },
    { label: 'Oportunidade ganha', value: 'oportunidade.won' },
    { label: 'Oportunidade perdida', value: 'oportunidade.lost' },
    { label: 'Caso criado', value: 'caso.created' },
    { label: 'Caso resolvido', value: 'caso.resolved' },
    { label: 'Tarefa concluída', value: 'tarefa.completed' }
];
