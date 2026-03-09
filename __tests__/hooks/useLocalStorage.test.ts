import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Mock localStorage
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

describe('useLocalStorage', () => {
    beforeEach(() => localStorageMock.clear());

    it('returns initialValue when key not set', () => {
        const { result } = renderHook(() => useLocalStorage('test_key', 42));
        expect(result.current[0]).toBe(42);
    });

    it('persists value to localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('test_key', 0));
        act(() => { result.current[1](99); });
        expect(result.current[0]).toBe(99);
        expect(localStorageMock.getItem('test_key')).toBe('99');
    });

    it('removes value from localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('test_key', 'hello'));
        act(() => { result.current[1]('world'); });
        act(() => { result.current[2](); });
        expect(result.current[0]).toBe('hello');
        expect(localStorageMock.getItem('test_key')).toBeNull();
    });

    it('supports functional updater', () => {
        const { result } = renderHook(() => useLocalStorage<number[]>('arr', []));
        act(() => { result.current[1](prev => [...prev, 1]); });
        act(() => { result.current[1](prev => [...prev, 2]); });
        expect(result.current[0]).toEqual([1, 2]);
    });
});
