'use client';
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface ConfirmDialogProps {
    visible: boolean;
    message: string;
    header?: string;
    icon?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    acceptSeverity?: 'success' | 'info' | 'warning' | 'danger';
    loading?: boolean;
    onAccept: () => void;
    onReject: () => void;
}

/**
 * Diálogo de confirmação reutilizável.
 *
 * @example
 * <ConfirmDialog
 *   visible={visible}
 *   message={`Excluir "${item.nome}"? Esta ação não pode ser desfeita.`}
 *   acceptLabel="Excluir"
 *   acceptSeverity="danger"
 *   loading={deleting}
 *   onAccept={handleDelete}
 *   onReject={() => setVisible(false)}
 * />
 */
export default function ConfirmDialog({
    visible,
    message,
    header = 'Confirmar',
    icon = 'pi-exclamation-triangle',
    acceptLabel = 'Confirmar',
    rejectLabel = 'Cancelar',
    acceptSeverity = 'danger',
    loading = false,
    onAccept,
    onReject
}: ConfirmDialogProps) {
    return (
        <Dialog
            visible={visible}
            style={{ width: '450px' }}
            header={header}
            modal
            footer={
                <div className="flex justify-content-end gap-2">
                    <Button
                        label={rejectLabel}
                        icon="pi pi-times"
                        className="p-button-text"
                        onClick={onReject}
                        disabled={loading}
                    />
                    <Button
                        label={acceptLabel}
                        icon="pi pi-check"
                        severity={acceptSeverity}
                        onClick={onAccept}
                        loading={loading}
                    />
                </div>
            }
            onHide={onReject}
        >
            <div className="flex align-items-center gap-3">
                <i className={`pi ${icon} text-3xl text-yellow-500`} />
                <span>{message}</span>
            </div>
        </Dialog>
    );
}
