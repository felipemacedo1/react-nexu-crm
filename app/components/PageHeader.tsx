'use client';
import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { MenuItem } from 'primereact/menuitem';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Items de breadcrumb (sem o home — adicionado automaticamente) */
    breadcrumbs?: MenuItem[];
    /** Ações extras renderizadas no canto direito */
    actions?: React.ReactNode;
}

const home: MenuItem = { icon: 'pi pi-home', url: '/' };

/**
 * Cabeçalho padrão de página com breadcrumb e título.
 *
 * @example
 * <PageHeader
 *   title="Pré-Clientes"
 *   subtitle="Gerencie seus pré-clientes"
 *   breadcrumbs={[{ label: 'CRM' }, { label: 'Pré-Clientes' }]}
 *   actions={<Button label="Novo" icon="pi pi-plus" />}
 * />
 */
export default function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-column gap-2 mb-4">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <BreadCrumb model={breadcrumbs} home={home} className="border-none p-0 bg-transparent" />
            )}
            <div className="flex align-items-center justify-content-between">
                <div>
                    <h2 className="text-2xl font-bold text-900 m-0">{title}</h2>
                    {subtitle && <p className="text-500 mt-1 mb-0">{subtitle}</p>}
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
        </div>
    );
}
