'use client';
import React, { useRef } from 'react';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export interface DataTableCrudColumn<T> extends Omit<ColumnProps, 'field'> {
    field?: keyof T & string;
}

export interface DataTableCrudAction<T> {
    icon: string;
    tooltip?: string;
    severity?: 'info' | 'success' | 'info' | 'warning' | 'danger' | 'help';
    onClick: (row: T) => void;
    visible?: (row: T) => boolean;
}

export interface DataTableCrudProps<T extends { id?: string | number }> {
    /** Data array to display */
    value: T[];
    /** Column definitions */
    columns: DataTableCrudColumn<T>[];
    /** Row actions (edit, delete, view...) */
    actions?: DataTableCrudAction<T>[];
    /** Loading state */
    loading?: boolean;
    /** Total records (for server-side pagination) */
    totalRecords?: number;
    /** Current first row index */
    first?: number;
    /** Rows per page */
    rows?: number;
    /** Called when page/sort changes */
    onPage?: (e: DataTablePageEvent) => void;
    onSort?: (e: DataTableSortEvent) => void;
    /** Global filter value */
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
    globalFilterPlaceholder?: string;
    /** Toolbar buttons (left side) */
    toolbarLeft?: React.ReactNode;
    /** Extra toolbar content (right side) */
    toolbarRight?: React.ReactNode;
    /** Called when "New" button in toolbar is clicked */
    onNew?: () => void;
    newLabel?: string;
    /** Row deletion — shows confirm dialog */
    onDelete?: (row: T) => void | Promise<void>;
    deleteConfirmMessage?: (row: T) => string;
    /** Title shown above the table (optional) */
    title?: string;
    /** PrimeReact DataTable extra props */
    tableProps?: Omit<React.ComponentProps<typeof DataTable>, 'value' | 'loading' | 'first' | 'rows' | 'totalRecords' | 'onPage' | 'onSort' | 'globalFilter'>;
}

function DataTableCrud<T extends { id?: string | number }>({
    value,
    columns,
    actions,
    loading = false,
    totalRecords,
    first = 0,
    rows = 20,
    onPage,
    onSort,
    globalFilter,
    onGlobalFilterChange,
    globalFilterPlaceholder = 'Pesquisar...',
    toolbarLeft,
    toolbarRight,
    onNew,
    newLabel = 'Novo',
    onDelete,
    deleteConfirmMessage,
    title,
    tableProps,
}: DataTableCrudProps<T>) {
    const toast = useRef<Toast>(null);

    const confirmDelete = (row: T) => {
        const message = deleteConfirmMessage
            ? deleteConfirmMessage(row)
            : 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.';

        confirmDialog({
            message,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Excluir',
            rejectLabel: 'Cancelar',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await onDelete?.(row);
                    toast.current?.show({ severity: 'success', summary: 'Excluído', detail: 'Registro removido com sucesso.', life: 3000 });
                } catch {
                    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir o registro.', life: 5000 });
                }
            }
        });
    };

    const actionBodyTemplate = (row: T) => (
        <div className="flex gap-1 justify-content-end">
            {actions?.map((action, idx) => {
                if (action.visible && !action.visible(row)) return null;
                return (
                    <Button
                        key={idx}
                        icon={`pi ${action.icon}`}
                        rounded
                        text
                        size="small"
                        severity={action.severity}
                        tooltip={action.tooltip}
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => action.onClick(row)}
                    />
                );
            })}
            {onDelete && (
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    size="small"
                    severity="danger"
                    tooltip="Excluir"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => confirmDelete(row)}
                />
            )}
        </div>
    );

    const leftToolbarContent = toolbarLeft ?? (
        <div className="flex gap-2 align-items-center flex-wrap">
            {onNew && (
                <Button label={newLabel} icon="pi pi-plus" size="small" onClick={onNew} />
            )}
        </div>
    );

    const rightToolbarContent = toolbarRight ?? (
        onGlobalFilterChange ? (
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter ?? ''}
                    onChange={(e) => onGlobalFilterChange(e.target.value)}
                    placeholder={globalFilterPlaceholder}
                    size={28}
                />
            </span>
        ) : null
    );

    const hasActions = (actions && actions.length > 0) || !!onDelete;

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            {title && <h5 className="mb-3">{title}</h5>}

            <Toolbar className="mb-4" start={leftToolbarContent} end={rightToolbarContent} />

            <DataTable
                value={value}
                loading={loading}
                paginator
                lazy={!!onPage}
                first={first}
                rows={rows}
                totalRecords={totalRecords ?? value.length}
                onPage={onPage}
                onSort={onSort}
                rowsPerPageOptions={[10, 20, 50]}
                globalFilter={globalFilter}
                responsiveLayout="scroll"
                emptyMessage="Nenhum registro encontrado."
                stripedRows
                {...(tableProps as any)}
            >
                {columns.map((col, idx) => (
                    <Column key={idx} {...(col as ColumnProps)} />
                ))}
                {hasActions && (
                    <Column
                        header="Ações"
                        body={actionBodyTemplate}
                        style={{ width: `${((actions?.length ?? 0) + (onDelete ? 1 : 0)) * 3 + 1}rem`, textAlign: 'right' }}
                        frozen
                        alignFrozen="right"
                    />
                )}
            </DataTable>
        </>
    );
}

export default DataTableCrud;
