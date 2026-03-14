'use client';
import { useEffect } from 'react';

/**
 * Registers the NexoCRM Service Worker for offline support.
 * Call this hook once at the root layout level.
 *
 * The SW lives at /public/sw.js → served as /sw.js
 */
export function useServiceWorker() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        if (process.env.NODE_ENV !== 'production') {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => registration.unregister());
            });
            if ('caches' in window) {
                caches.keys().then((keys) => {
                    keys
                        .filter((key) => key.startsWith('nexocrm-'))
                        .forEach((key) => caches.delete(key));
                });
            }
            return;
        }

        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((reg) => {
                console.info('[SW] Registered, scope:', reg.scope);

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (
                            newWorker.state === 'installed' &&
                            navigator.serviceWorker.controller
                        ) {
                            console.info('[SW] Nova versão disponível — recarregue para atualizar.');
                        }
                    });
                });
            })
            .catch((err) => console.warn('[SW] Registro falhou:', err));
    }, []);
}
