'use client';
import { useState, useCallback } from 'react';

export interface PaginationState {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface UsePaginationReturn extends PaginationState {
    setPage: (page: number) => void;
    setSize: (size: number) => void;
    setTotal: (totalElements: number, totalPages: number) => void;
    reset: () => void;
    /** Parâmetros prontos para enviar ao backend (0-indexed) */
    apiParams: { page: number; size: number };
    /** Estado da paginação para o DataTable do PrimeReact (0-indexed first row) */
    primeParams: { first: number; rows: number; totalRecords: number };
}

const DEFAULT_SIZE = 10;

/**
 * Hook para gerenciar estado de paginação server-side.
 * Compatível com PrimeReact DataTable e Spring Data Page.
 *
 * @example
 * const pagination = usePagination();
 * const { data } = await service.getPaginated({ page: pagination.page, size: pagination.size });
 * pagination.setTotal(data.totalElements, data.totalPages);
 */
export function usePagination(initialSize = DEFAULT_SIZE): UsePaginationReturn {
    const [state, setState] = useState<PaginationState>({
        page: 0,
        size: initialSize,
        totalElements: 0,
        totalPages: 0
    });

    const setPage = useCallback((page: number) => {
        setState(prev => ({ ...prev, page }));
    }, []);

    const setSize = useCallback((size: number) => {
        setState(prev => ({ ...prev, size, page: 0 }));
    }, []);

    const setTotal = useCallback((totalElements: number, totalPages: number) => {
        setState(prev => ({ ...prev, totalElements, totalPages }));
    }, []);

    const reset = useCallback(() => {
        setState(prev => ({ ...prev, page: 0, totalElements: 0, totalPages: 0 }));
    }, []);

    return {
        ...state,
        setPage,
        setSize,
        setTotal,
        reset,
        apiParams: {
            page: state.page,
            size: state.size
        },
        primeParams: {
            first: state.page * state.size,
            rows: state.size,
            totalRecords: state.totalElements
        }
    };
}
