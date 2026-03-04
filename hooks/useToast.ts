'use client';
import { useRef } from 'react';
import { Toast } from 'primereact/toast';

export const useToast = () => {
    const toast = useRef<Toast>(null);

    const showSuccess = (summary: string, detail?: string) => {
        toast.current?.show({
            severity: 'success',
            summary,
            detail,
            life: 3000
        });
    };

    const showError = (summary: string, detail?: string) => {
        toast.current?.show({
            severity: 'error',
            summary,
            detail,
            life: 5000
        });
    };

    const showWarn = (summary: string, detail?: string) => {
        toast.current?.show({
            severity: 'warn',
            summary,
            detail,
            life: 4000
        });
    };

    const showInfo = (summary: string, detail?: string) => {
        toast.current?.show({
            severity: 'info',
            summary,
            detail,
            life: 3000
        });
    };

    return { toast, showSuccess, showError, showWarn, showInfo };
};
