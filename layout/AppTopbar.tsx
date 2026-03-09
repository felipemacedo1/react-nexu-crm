/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { SearchService, SearchResultItem, SEARCH_TIPO_LABELS } from '@/services/search.service';
import { useDebounce } from '@/hooks/useDebounce';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const { user, logout } = useAuth();
    const router = useRouter();
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const profileMenuRef = useRef<Menu>(null);
    const searchPanelRef = useRef<OverlayPanel>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searching, setSearching] = useState(false);
    const [notificacoes] = useState(3); // TODO: conectar ao endpoint de notificações

    const debouncedQuery = useDebounce(searchQuery, 350);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    // Busca global com debounce
    const executarBusca = useCallback(async (q: string, evt: React.SyntheticEvent) => {
        if (!q || q.trim().length < 2) {
            setSearchResults([]);
            searchPanelRef.current?.hide();
            return;
        }
        setSearching(true);
        searchPanelRef.current?.show(evt, searchInputRef.current);
        try {
            const results = await SearchService.buscarGlobal(q);
            setSearchResults(results);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        if (debouncedQuery.trim().length >= 2) {
            // dispara busca silenciosa e atualiza resultados já no painel aberto
            SearchService.buscarGlobal(debouncedQuery).then(res => {
                setSearchResults(res);
                setSearching(false);
            });
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            searchPanelRef.current?.hide();
            setSearchQuery('');
        }
    };

    const handleResultClick = (item: SearchResultItem) => {
        searchPanelRef.current?.hide();
        setSearchQuery('');
        router.push(item.url);
    };

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

            {/* Busca Global */}
            <div className="hidden md:flex align-items-center ml-3 flex-1" style={{ maxWidth: '400px' }}>
                <span className="p-input-icon-left w-full">
                    <i className="pi pi-search" />
                    <InputText
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={e => {
                            if (searchQuery.trim().length >= 2) {
                                executarBusca(searchQuery, e);
                            }
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Buscar leads, contas, contatos..."
                        className="w-full"
                        style={{ borderRadius: '2rem', paddingLeft: '2.5rem', fontSize: '0.875rem' }}
                    />
                    {searching && (
                        <ProgressSpinner style={{ width: '18px', height: '18px', position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} strokeWidth="4" />
                    )}
                </span>

                <OverlayPanel ref={searchPanelRef} dismissable className="w-full" style={{ maxWidth: '420px' }}>
                    {searchResults.length === 0 && !searching ? (
                        <div className="flex align-items-center gap-2 p-2 text-color-secondary">
                            <i className="pi pi-info-circle" />
                            <span className="text-sm">Nenhum resultado encontrado.</span>
                        </div>
                    ) : (
                        <ul className="list-none p-0 m-0" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            {searchResults.map((item, idx) => (
                                <li key={idx}>
                                    <button
                                        type="button"
                                        className="p-link w-full flex align-items-center gap-3 p-2 hover:surface-hover border-round"
                                        onClick={() => handleResultClick(item)}
                                    >
                                        <i className={`${item.icon} text-primary`} />
                                        <div className="text-left flex-1">
                                            <div className="font-medium text-sm">{item.titulo}</div>
                                            {item.subtitulo && (
                                                <div className="text-xs text-color-secondary">{item.subtitulo}</div>
                                            )}
                                        </div>
                                        <span className="text-xs surface-200 border-round px-2 py-1">
                                            {SEARCH_TIPO_LABELS[item.tipo] ?? item.tipo}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </OverlayPanel>
            </div>

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
                    <button type="button" className="p-link layout-topbar-button p-overlay-badge" style={{ position: 'relative' }}>
                        <i className="pi pi-bell"></i>
                        {notificacoes > 0 && (
                            <Badge value={notificacoes > 9 ? '9+' : String(notificacoes)} severity="danger" style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '0.6rem', minWidth: '1.1rem', height: '1.1rem' }} />
                        )}
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
