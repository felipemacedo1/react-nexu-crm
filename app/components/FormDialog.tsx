'use client';
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export interface FormDialogProps {
    /** Whether the dialog is visible */
    visible: boolean;
    /** Close callback */
    onHide: () => void;
    /** Dialog title */
    title: string;
    /** Dialog width (CSS value) */
    width?: string;
    /** Form content */
    children: React.ReactNode;
    /** Save callback — can be async */
    onSave: () => void | Promise<void>;
    /** Whether save is in progress (shows spinner on button) */
    saving?: boolean;
    /** Whether the save button is disabled */
    saveDisabled?: boolean;
    /** Label for the save button */
    saveLabel?: string;
    /** Icon for the save button */
    saveIcon?: string;
    /** Label for the cancel button */
    cancelLabel?: string;
    /** Severity / colour of save button */
    saveSeverity?: 'info' | 'success' | 'info' | 'warning' | 'danger' | 'help';
    /** Extra content shown before the action buttons */
    footerExtra?: React.ReactNode;
}

const FormDialog: React.FC<FormDialogProps> = ({
    visible,
    onHide,
    title,
    width = '560px',
    children,
    onSave,
    saving = false,
    saveDisabled = false,
    saveLabel = 'Salvar',
    saveIcon = 'pi pi-check',
    cancelLabel = 'Cancelar',
    saveSeverity,
    footerExtra,
}) => {
    const footer = (
        <div className="flex justify-content-between align-items-center w-full">
            <div>{footerExtra}</div>
            <div className="flex gap-2">
                <Button
                    label={cancelLabel}
                    icon="pi pi-times"
                    outlined
                    severity="info"
                    onClick={onHide}
                    disabled={saving}
                />
                <Button
                    label={saveLabel}
                    icon={saveIcon}
                    loading={saving}
                    disabled={saveDisabled || saving}
                    severity={saveSeverity}
                    onClick={onSave}
                />
            </div>
        </div>
    );

    return (
        <Dialog
            visible={visible}
            style={{ width }}
            header={title}
            modal
            className="p-fluid"
            footer={footer}
            onHide={onHide}
            draggable={false}
            resizable={false}
            breakpoints={{ '960px': '90vw', '641px': '100vw' }}
        >
            {children}
        </Dialog>
    );
};

export default FormDialog;
