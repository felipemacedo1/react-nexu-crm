'use client';
import React from 'react';
import { Button } from 'primereact/button';

interface EmptyStateProps {
    icon?: string;
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Componente exibido quando uma listagem não possui itens.
 *
 * @example
 * <EmptyState
 *   icon="pi-users"
 *   title="Nenhum pré-cliente encontrado"
 *   message="Adicione seu primeiro pré-cliente para começar."
 *   actionLabel="Novo Pré-Cliente"
 *   onAction={() => router.push('/crm/leads/novo')}
 * />
 */
export default function EmptyState({
    icon = 'pi-inbox',
    title = 'Nenhum resultado encontrado',
    message = 'Não há itens para exibir no momento.',
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-column align-items-center justify-content-center py-8 px-4 text-center">
            <i className={`pi ${icon} text-5xl text-300 mb-4`} />
            <h3 className="text-xl font-semibold text-700 mb-2">{title}</h3>
            <p className="text-500 mb-4 max-w-30rem">{message}</p>
            {actionLabel && onAction && (
                <Button
                    label={actionLabel}
                    icon="pi pi-plus"
                    onClick={onAction}
                    className="p-button-outlined"
                />
            )}
        </div>
    );
}
