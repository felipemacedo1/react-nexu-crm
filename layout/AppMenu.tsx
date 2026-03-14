import React, { useContext, useMemo } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import { usePermission } from '@/hooks/usePermission';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { isAdmin, canModule, can } = usePermission();

    const model: AppMenuItem[] = useMemo(() => {
        const allItems: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        // CRM — visível se tiver qualquer permissão de leads, contas, contatos ou oportunidades
        ...(isAdmin || canModule('leads') || canModule('contas') || canModule('contatos') || canModule('oportunidades') ? [{
            label: 'CRM',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                ...(isAdmin || canModule('leads')        ? [{ label: 'Pré-Clientes',   icon: 'pi pi-fw pi-filter',   to: '/crm/leads' }] : []),
                ...(isAdmin || canModule('contas')       ? [{ label: 'Empresas',        icon: 'pi pi-fw pi-building', to: '/crm/contas' }] : []),
                ...(isAdmin || canModule('contatos')     ? [{ label: 'Contatos',        icon: 'pi pi-fw pi-users',    to: '/crm/contatos' }] : []),
                ...(isAdmin || canModule('oportunidades')? [{ label: 'Oportunidades',   icon: 'pi pi-fw pi-dollar',   to: '/crm/oportunidades' }] : []),
                { label: 'Atividades', icon: 'pi pi-fw pi-clock', to: '/crm/atividades' }
            ]
        }] : []),
        {
            label: 'Agenda',
            icon: 'pi pi-fw pi-calendar',
            items: [
                { label: 'Calendário', icon: 'pi pi-fw pi-calendar', to: '/agenda/calendario' },
                { label: 'Eventos', icon: 'pi pi-fw pi-calendar-plus', to: '/agenda/eventos' },
                { label: 'Lembretes', icon: 'pi pi-fw pi-bell', to: '/agenda/lembretes' },
                { label: 'Tarefas', icon: 'pi pi-fw pi-check-square', to: '/agenda/tarefas' }
            ]
        },
        // Suporte — visível se tiver permissão de casos
        ...(isAdmin || canModule('casos') ? [{
            label: 'Suporte',
            icon: 'pi pi-fw pi-question-circle',
            items: [
                { label: 'Casos', icon: 'pi pi-fw pi-ticket', to: '/suporte/casos' },
                { label: 'Base de Conhecimento', icon: 'pi pi-fw pi-book', to: '/suporte/base-conhecimento' }
            ]
        }] : []),
        {
            label: 'Projetos',
            icon: 'pi pi-fw pi-folder',
            items: [
                { label: 'Projetos', icon: 'pi pi-fw pi-folder-open', to: '/projetos' },
                { label: 'Tarefas de Projeto', icon: 'pi pi-fw pi-list', to: '/projetos/tarefas' }
            ]
        },
        {
            label: 'Marketing',
            icon: 'pi pi-fw pi-megaphone',
            items: [
                { label: 'Campanhas', icon: 'pi pi-fw pi-send', to: '/marketing/campanhas' },
                { label: 'Pesquisas', icon: 'pi pi-fw pi-chart-bar', to: '/marketing/pesquisas' }
            ]
        },
        // Financeiro — visível se tiver permissão de orçamentos ou produtos
        ...(isAdmin || canModule('orcamentos') || canModule('produtos') ? [{
            label: 'Financeiro',
            icon: 'pi pi-fw pi-wallet',
            items: [
                ...(isAdmin || canModule('orcamentos') ? [{ label: 'Orçamentos', icon: 'pi pi-fw pi-file', to: '/financeiro/orcamentos' }] : []),
                ...(isAdmin || canModule('produtos')   ? [{ label: 'Produtos',   icon: 'pi pi-fw pi-box',  to: '/financeiro/produtos' }]   : [])
            ]
        }] : []),
        {
            label: 'Relatórios',
            icon: 'pi pi-fw pi-chart-line',
            items: [
                { label: 'Relatórios', icon: 'pi pi-fw pi-chart-bar', to: '/relatorios' }
            ]
        },
        // ── Admin-only sections ───────────────────────────────────────────────
        ...(isAdmin || can('usuarios:read') || can('grupos:manage') || can('config:manage') ? [
        {
            label: 'Admin',
            icon: 'pi pi-fw pi-cog',
            items: [
                ...(isAdmin || can('usuarios:read')  ? [{ label: 'Usuários',            icon: 'pi pi-fw pi-user',      to: '/admin/usuarios' }]      : []),
                ...(isAdmin || can('grupos:manage')  ? [{ label: 'Grupos de Segurança', icon: 'pi pi-fw pi-shield',    to: '/admin/grupos' }]         : []),
                ...(isAdmin || can('config:manage')  ? [{ label: 'Configurações',       icon: 'pi pi-fw pi-sliders-h', to: '/admin/configuracoes' }]  : [])
            ]
        }] : []),
        ...(isAdmin ? [
        {
            label: 'Integrações',
            icon: 'pi pi-fw pi-link',
            items: [
                { label: 'OAuth / APIs', icon: 'pi pi-fw pi-key',  to: '/integracao/oauth' },
                { label: 'Webhooks',     icon: 'pi pi-fw pi-bolt', to: '/integracao/webhooks' }
            ]
        }] : []),
        {
            label: 'Ferramentas',
            icon: 'pi pi-fw pi-wrench',
            items: [
                { label: 'Favoritos',         icon: 'pi pi-fw pi-star',     to: '/favoritos' },
                { label: 'Exportar / Importar', icon: 'pi pi-fw pi-arrows-h', to: '/exportacao' }
            ]
        }
    ];
        return allItems;
    }, [isAdmin, canModule, can]);

    return (
        <MenuProvider>
            <ul className="layout-menu" role="navigation" aria-label="Menu principal">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
