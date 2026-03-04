/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const { user, logout } = useAuth();
    const router = useRouter();
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const profileMenuRef = useRef<Menu>(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const profileMenuItems: MenuItem[] = [
        {
            label: user ? `${user.nome} ${user.sobrenome}` : 'Usuário',
            className: 'font-bold',
            disabled: true
        },
        {
            label: user?.email || '',
            className: 'text-sm opacity-70',
            disabled: true
        },
        { separator: true },
        {
            label: 'Meu Perfil',
            icon: 'pi pi-user',
            command: () => router.push('/perfil')
        },
        {
            label: 'Configurações',
            icon: 'pi pi-cog',
            command: () => router.push('/configuracoes')
        },
        { separator: true },
        {
            label: 'Sair',
            icon: 'pi pi-sign-out',
            className: 'text-red-500',
            command: () => logout()
        }
    ];

    const userInitials = user
        ? `${user.nome?.charAt(0) || ''}${user.sobrenome?.charAt(0) || ''}`.toUpperCase()
        : 'U';

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>NexoCRM</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <Link href="/agenda/calendario">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-calendar"></i>
                        <span>Calendário</span>
                    </button>
                </Link>
                <Link href="/notificacoes">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-bell"></i>
                        <span>Notificações</span>
                    </button>
                </Link>

                <Menu model={profileMenuItems} popup ref={profileMenuRef} className="w-15rem" />
                <button
                    type="button"
                    className="p-link layout-topbar-button flex align-items-center gap-2"
                    onClick={(e) => profileMenuRef.current?.toggle(e)}
                >
                    <div
                        className="flex align-items-center justify-content-center bg-primary border-circle font-bold text-white"
                        style={{ width: '2rem', height: '2rem', fontSize: '0.85rem' }}
                    >
                        {userInitials}
                    </div>
                    <span className="hidden lg:inline">{user?.nome || 'Usuário'}</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
