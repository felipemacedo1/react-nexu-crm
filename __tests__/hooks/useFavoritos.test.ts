import { renderHook, act } from '@testing-library/react';
import { useFavoritos } from '@/hooks/useFavoritos';

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const ITEM_LEAD = { id: '1', tipo: 'lead' as const, titulo: 'João Silva', url: '/crm/leads' };
const ITEM_CONTA = { id: '2', tipo: 'conta' as const, titulo: 'Empresa Ltda', url: '/crm/contas' };

describe('useFavoritos', () => {
    beforeEach(() => localStorageMock.clear());

    it('starts with empty favorites', () => {
        const { result } = renderHook(() => useFavoritos());
        expect(result.current.favoritos).toHaveLength(0);
    });

    it('adds a favorite', () => {
        const { result } = renderHook(() => useFavoritos());
        act(() => { result.current.adicionar(ITEM_LEAD); });
        expect(result.current.favoritos).toHaveLength(1);
        expect(result.current.isFavorito('1', 'lead')).toBe(true);
    });

    it('does not duplicate favorites', () => {
        const { result } = renderHook(() => useFavoritos());
        act(() => { result.current.adicionar(ITEM_LEAD); });
        act(() => { result.current.adicionar(ITEM_LEAD); });
        expect(result.current.favoritos).toHaveLength(1);
    });

    it('removes a favorite', () => {
        const { result } = renderHook(() => useFavoritos());
        act(() => { result.current.adicionar(ITEM_LEAD); });
        act(() => { result.current.remover('1', 'lead'); });
        expect(result.current.favoritos).toHaveLength(0);
        expect(result.current.isFavorito('1', 'lead')).toBe(false);
    });

    it('toggles a favorite', () => {
        const { result } = renderHook(() => useFavoritos());
        act(() => { result.current.toggleFavorito(ITEM_LEAD); });
        expect(result.current.isFavorito('1', 'lead')).toBe(true);
        act(() => { result.current.toggleFavorito(ITEM_LEAD); });
        expect(result.current.isFavorito('1', 'lead')).toBe(false);
    });

    it('clears all favorites', () => {
        const { result } = renderHook(() => useFavoritos());
        act(() => { result.current.adicionar(ITEM_LEAD); });
        act(() => { result.current.adicionar(ITEM_CONTA); });
        act(() => { result.current.limpar(); });
        expect(result.current.favoritos).toHaveLength(0);
    });
});
