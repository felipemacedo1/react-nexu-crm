import { useState, useCallback, useEffect } from 'react';

export interface FavoritoItem {
    id: string;
    tipo: 'lead' | 'conta' | 'contato' | 'oportunidade' | 'caso' | 'evento';
    titulo: string;
    subtitulo?: string;
    url: string;
    adicionadoEm: string;
}

const STORAGE_KEY = 'nexocrm_favoritos';

function lerStorage(): FavoritoItem[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
        return [];
    }
}

export function useFavoritos() {
    const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);

    useEffect(() => {
        setFavoritos(lerStorage());
    }, []);

    const salvar = useCallback((itens: FavoritoItem[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
        setFavoritos(itens);
    }, []);

    const adicionar = useCallback((item: Omit<FavoritoItem, 'adicionadoEm'>) => {
        const atual = lerStorage();
        if (atual.find(f => f.id === item.id && f.tipo === item.tipo)) return;
        salvar([{ ...item, adicionadoEm: new Date().toISOString() }, ...atual]);
    }, [salvar]);

    const remover = useCallback((id: string, tipo: FavoritoItem['tipo']) => {
        salvar(lerStorage().filter(f => !(f.id === id && f.tipo === tipo)));
    }, [salvar]);

    const toggleFavorito = useCallback((item: Omit<FavoritoItem, 'adicionadoEm'>) => {
        const atual = lerStorage();
        const existe = atual.find(f => f.id === item.id && f.tipo === item.tipo);
        if (existe) {
            salvar(atual.filter(f => !(f.id === item.id && f.tipo === item.tipo)));
        } else {
            salvar([{ ...item, adicionadoEm: new Date().toISOString() }, ...atual]);
        }
    }, [salvar]);

    const isFavorito = useCallback((id: string, tipo: FavoritoItem['tipo']): boolean => {
        return favoritos.some(f => f.id === id && f.tipo === tipo);
    }, [favoritos]);

    const limpar = useCallback(() => salvar([]), [salvar]);

    return { favoritos, adicionar, remover, toggleFavorito, isFavorito, limpar };
}
