import apiClient from './api.config';

export interface SearchResultItem {
    id: number;
    tipo: 'LEAD' | 'CONTA' | 'CONTATO' | 'OPORTUNIDADE' | 'CASO' | 'EVENTO' | 'TAREFA';
    titulo: string;
    subtitulo?: string;
    url: string;
    icon: string;
}

export interface SearchResponse {
    query: string;
    total: number;
    resultados: SearchResultItem[];
}

// Mapeamento de ícones e rotas por tipo
const TIPO_META: Record<string, { icon: string; basePath: string }> = {
    LEAD:        { icon: 'pi pi-user-plus',  basePath: '/crm/leads' },
    CONTA:       { icon: 'pi pi-building',   basePath: '/crm/contas' },
    CONTATO:     { icon: 'pi pi-users',      basePath: '/crm/contatos' },
    OPORTUNIDADE:{ icon: 'pi pi-dollar',     basePath: '/crm/oportunidades' },
    CASO:        { icon: 'pi pi-ticket',     basePath: '/suporte/casos' },
    EVENTO:      { icon: 'pi pi-calendar',   basePath: '/agenda/calendario' },
    TAREFA:      { icon: 'pi pi-check-square',basePath: '/agenda/tarefas' },
};

export const SEARCH_TIPO_LABELS: Record<string, string> = {
    LEAD:         'Lead',
    CONTA:        'Conta',
    CONTATO:      'Contato',
    OPORTUNIDADE: 'Oportunidade',
    CASO:         'Caso',
    EVENTO:       'Evento',
    TAREFA:       'Tarefa',
};

class SearchServiceClass {
    /**
     * Busca global no backend — espera endpoint GET /busca?q=...
     */
    async buscarGlobal(query: string): Promise<SearchResultItem[]> {
        if (!query || query.trim().length < 2) return [];
        try {
            const { data } = await apiClient.get<SearchResponse>('/busca', {
                params: { q: query.trim(), size: 20 },
            });
            return data.resultados ?? [];
        } catch {
            // Fallback: busca local paralela quando o endpoint ainda não existe
            return this.buscarLocal(query);
        }
    }

    /**
     * Fallback: busca em paralelo nos principais endpoints
     */
    private async buscarLocal(query: string): Promise<SearchResultItem[]> {
        const q = query.toLowerCase();

        const trySearch = async <T extends { id?: number; nome?: string; titulo?: string; assunto?: string }>(
            endpoint: string,
            tipo: string,
            labelFn: (item: T) => string,
            subFn?: (item: T) => string
        ): Promise<SearchResultItem[]> => {
            try {
                const { data } = await apiClient.get<{ content?: T[]; data?: T[] } | T[]>(endpoint, {
                    params: { page: 0, size: 50 },
                });
                const list: T[] = Array.isArray(data)
                    ? data
                    : (data as { content?: T[]; data?: T[] }).content ?? (data as { content?: T[]; data?: T[] }).data ?? [];
                const meta = TIPO_META[tipo];
                return list
                    .filter(item => labelFn(item).toLowerCase().includes(q))
                    .slice(0, 5)
                    .map(item => ({
                        id: item.id ?? 0,
                        tipo: tipo as SearchResultItem['tipo'],
                        titulo: labelFn(item),
                        subtitulo: subFn ? subFn(item) : undefined,
                        url: `${meta.basePath}`,
                        icon: meta.icon,
                    }));
            } catch {
                return [];
            }
        };

        const results = await Promise.all([
            trySearch<{id?:number;nome?:string;empresa?:string}>('/lead',        'LEAD',        i => i.nome ?? '', i => i.empresa),
            trySearch<{id?:number;nome?:string;setor?:string}>('/conta',         'CONTA',       i => i.nome ?? '', i => i.setor),
            trySearch<{id?:number;nome?:string;cargo?:string}>('/contato',       'CONTATO',     i => i.nome ?? '', i => i.cargo),
            trySearch<{id?:number;titulo?:string;valor?:number}>('/oportunidade','OPORTUNIDADE',i => i.titulo ?? ''),
            trySearch<{id?:number;titulo?:string;status?:string}>('/caso',       'CASO',        i => i.titulo ?? '', i => i.status),
        ]);

        return results.flat();
    }
}

export const SearchService = new SearchServiceClass();
