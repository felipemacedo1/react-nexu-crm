'use client';
import { useState, useCallback } from 'react';

export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * Hook genérico para chamadas à API.
 * Gerencia estado de loading, dados e erro automaticamente.
 *
 * @example
 * const { data, loading, error, execute } = useApi<Lead[]>();
 * useEffect(() => { execute(() => leadService.getAll()); }, []);
 */
export function useApi<T>() {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    const execute = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const result = await fn();
            setState({ data: result, loading: false, error: null });
            return result;
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Ocorreu um erro inesperado.';
            setState(prev => ({ ...prev, loading: false, error: message }));
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    const setData = useCallback((data: T | null) => {
        setState(prev => ({ ...prev, data }));
    }, []);

    return { ...state, execute, reset, setData };
}
