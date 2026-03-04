export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'NexoCRM';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

export const STATUS_LEAD = [
    { label: 'Novo', value: 'NOVO' },
    { label: 'Em Contato', value: 'EM_CONTATO' },
    { label: 'Qualificado', value: 'QUALIFICADO' },
    { label: 'Não Qualificado', value: 'NAO_QUALIFICADO' },
    { label: 'Convertido', value: 'CONVERTIDO' },
    { label: 'Perdido', value: 'PERDIDO' }
];

export const ESTAGIOS_OPORTUNIDADE = [
    { label: 'Prospecção', value: 'PROSPECCAO' },
    { label: 'Qualificação', value: 'QUALIFICACAO' },
    { label: 'Proposta', value: 'PROPOSTA' },
    { label: 'Negociação', value: 'NEGOCIACAO' },
    { label: 'Ganho', value: 'GANHO' },
    { label: 'Perdido', value: 'PERDIDO' }
];

export const SETORES = [
    { label: 'Tecnologia', value: 'TECNOLOGIA' },
    { label: 'Saúde', value: 'SAUDE' },
    { label: 'Financeiro', value: 'FINANCEIRO' },
    { label: 'Educação', value: 'EDUCACAO' },
    { label: 'Varejo', value: 'VAREJO' },
    { label: 'Indústria', value: 'INDUSTRIA' },
    { label: 'Serviços', value: 'SERVICOS' },
    { label: 'Construção', value: 'CONSTRUCAO' },
    { label: 'Agronegócio', value: 'AGRONEGOCIO' },
    { label: 'Outro', value: 'OUTRO' }
];

export const ORIGENS_LEAD = [
    { label: 'Site', value: 'SITE' },
    { label: 'Indicação', value: 'INDICACAO' },
    { label: 'Redes Sociais', value: 'REDES_SOCIAIS' },
    { label: 'Evento', value: 'EVENTO' },
    { label: 'Cold Call', value: 'COLD_CALL' },
    { label: 'Email Marketing', value: 'EMAIL_MARKETING' },
    { label: 'Outro', value: 'OUTRO' }
];

export const PRIORIDADES = [
    { label: 'Baixa', value: 'BAIXA', severity: 'info' },
    { label: 'Normal', value: 'NORMAL', severity: 'success' },
    { label: 'Alta', value: 'ALTA', severity: 'warning' },
    { label: 'Urgente', value: 'URGENTE', severity: 'danger' }
];

export const TIPOS_ATIVIDADE = [
    { label: 'Chamada', value: 'CHAMADA', icon: 'pi pi-phone' },
    { label: 'Email', value: 'EMAIL', icon: 'pi pi-envelope' },
    { label: 'Reunião', value: 'REUNIAO', icon: 'pi pi-users' },
    { label: 'Tarefa', value: 'TAREFA', icon: 'pi pi-check-square' },
    { label: 'Nota', value: 'NOTA', icon: 'pi pi-file' }
];
