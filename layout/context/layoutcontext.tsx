'use client';
import React, { useState, createContext, useEffect } from 'react';
import { LayoutState, ChildContainerProps, LayoutConfig, LayoutContextProps } from '@/types';
export const LayoutContext = createContext({} as LayoutContextProps);

const STORAGE_KEY = 'nexocrm_layout_config';

function loadSavedConfig(): Partial<LayoutConfig> {
    if (typeof window === 'undefined') return {};
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

export const LayoutProvider = ({ children }: ChildContainerProps) => {
    const savedConfig = loadSavedConfig();

    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: savedConfig.colorScheme ?? 'light',
        theme: savedConfig.theme ?? (savedConfig.colorScheme === 'dark' ? 'lara-dark-indigo' : 'lara-light-indigo'),
        scale: savedConfig.scale ?? 14
    });

    // Persist layout config to localStorage whenever it changes
    useEffect(() => {
        try {
            const toSave: Partial<LayoutConfig> = {
                colorScheme: layoutConfig.colorScheme,
                theme: layoutConfig.theme,
                scale: layoutConfig.scale
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch {
            // ignore write errors
        }
    }, [layoutConfig.colorScheme, layoutConfig.theme, layoutConfig.scale]);

    // Sync theme link element when theme changes
    useEffect(() => {
        const themeLink = document.getElementById('theme-css') as HTMLLinkElement | null;
        if (themeLink) {
            themeLink.href = `/themes/${layoutConfig.theme}/theme.css`;
        }
    }, [layoutConfig.theme]);

    const [layoutState, setLayoutState] = useState<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    });

    const onMenuToggle = () => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayMenuActive: !prevLayoutState.overlayMenuActive }));
        }

        if (isDesktop()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive }));
        } else {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive }));
        }
    };

    const showProfileSidebar = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, profileSidebarVisible: !prevLayoutState.profileSidebarVisible }));
    };

    const isOverlay = () => {
        return layoutConfig.menuMode === 'overlay';
    };

    const isDesktop = () => {
        return window.innerWidth > 991;
    };

    const value: LayoutContextProps = {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        showProfileSidebar
    };

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};
