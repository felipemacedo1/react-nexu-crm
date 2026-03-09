import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface FiltroSalvo {
    id: string;
    nome: string;
    entidade: string;
    filtros: Record<string, unknown>;
    criadoEm: string;
}

const STORAGE_KEY = 'nexocrm_filtros_salvos';

export function useFiltrosSalvos(entidade: string) {
    const [todos, setTodos] = useLocalStorage<FiltroSalvo[]>(STORAGE_KEY, []);

    const filtrosEntidade = todos.filter(f => f.entidade === entidade);

    const salvarFiltro = useCallback((nome: string, filtros: Record<string, unknown>) => {
        const novo: FiltroSalvo = {
            id: `${entidade}_${Date.now()}`,
            nome,
            entidade,
            filtros,
            criadoEm: new Date().toISOString(),
        };
        setTodos(prev => [novo, ...prev.filter(f => !(f.entidade === entidade && f.nome === nome))]);
        return novo;
    }, [entidade, setTodos]);

    const removerFiltro = useCallback((id: string) => {
        setTodos(prev => prev.filter(f => f.id !== id));
    }, [setTodos]);

    const limparFiltros = useCallback(() => {
        setTodos(prev => prev.filter(f => f.entidade !== entidade));
    }, [entidade, setTodos]);

    return { filtros: filtrosEntidade, salvarFiltro, removerFiltro, limparFiltros };
}
