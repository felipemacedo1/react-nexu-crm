/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'CRM',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Leads', icon: 'pi pi-fw pi-filter', to: '/crm/leads' },
                { label: 'Contas', icon: 'pi pi-fw pi-building', to: '/crm/contas' },
                { label: 'Contatos', icon: 'pi pi-fw pi-users', to: '/crm/contatos' },
                { label: 'Oportunidades', icon: 'pi pi-fw pi-dollar', to: '/crm/oportunidades' },
                { label: 'Atividades', icon: 'pi pi-fw pi-clock', to: '/crm/atividades' }
            ]
        },
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
        {
            label: 'Suporte',
            icon: 'pi pi-fw pi-question-circle',
            items: [
                { label: 'Casos', icon: 'pi pi-fw pi-ticket', to: '/suporte/casos' },
                { label: 'Base de Conhecimento', icon: 'pi pi-fw pi-book', to: '/suporte/base-conhecimento' }
            ]
        },
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
        {
            label: 'Financeiro',
            icon: 'pi pi-fw pi-wallet',
            items: [
                { label: 'Orçamentos', icon: 'pi pi-fw pi-file', to: '/financeiro/orcamentos' },
                { label: 'Produtos', icon: 'pi pi-fw pi-box', to: '/financeiro/produtos' }
            ]
        },
        {
            label: 'Relatórios',
            icon: 'pi pi-fw pi-chart-line',
            items: [
                { label: 'Relatórios', icon: 'pi pi-fw pi-chart-bar', to: '/relatorios' }
            ]
        },
        {
            label: 'Admin',
            icon: 'pi pi-fw pi-cog',
            items: [
                { label: 'Usuários', icon: 'pi pi-fw pi-user', to: '/admin/usuarios' },
                { label: 'Grupos de Segurança', icon: 'pi pi-fw pi-shield', to: '/admin/grupos' },
                { label: 'Configurações', icon: 'pi pi-fw pi-sliders-h', to: '/admin/configuracoes' }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
