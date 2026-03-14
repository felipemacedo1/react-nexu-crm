'use client';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * Componente de proteção de rotas.
 * Redireciona para /auth/login se o usuário não estiver autenticado.
 * Deve envolver as páginas que requerem autenticação.
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
    const { isAuthenticated, loading } = useAuth();
    const { can, isAdmin } = usePermission();
    const router = useRouter();
    const pathname = usePathname();

    const hasRoutePermission = useCallback(() => {
        const rules: Array<{ prefix: string; allowed: boolean }> = [
            { prefix: '/admin/usuarios', allowed: isAdmin || can('usuarios:read') },
            { prefix: '/admin/grupos', allowed: isAdmin || can('grupos:manage') },
            { prefix: '/admin/configuracoes', allowed: isAdmin || can('config:manage') }
        ];

        const matched = rules.find(rule => pathname.startsWith(rule.prefix));
        return matched ? matched.allowed : true;
    }, [pathname, isAdmin, can]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Salvar a URL que o usuário tentou acessar para redirecionar após login
            if (typeof window !== 'undefined' && pathname !== '/') {
                sessionStorage.setItem('nexocrm_redirect', pathname);
            }
            router.replace('/auth/login');
        }

        if (!loading && isAuthenticated && !hasRoutePermission()) {
            router.replace('/auth/access');
        }
    }, [isAuthenticated, loading, router, pathname, hasRoutePermission]);

    // Exibir loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <div className="flex flex-column align-items-center gap-3">
                    <i className="pi pi-spin pi-spinner text-primary" style={{ fontSize: '3rem' }}></i>
                    <span className="text-600 text-lg">Carregando...</span>
                </div>
            </div>
        );
    }

    // Não renderizar conteúdo se não autenticado
    if (!isAuthenticated) {
        return null;
    }

    if (!hasRoutePermission()) {
        return null;
    }

    return <>{children}</>;
};

export default AuthGuard;
