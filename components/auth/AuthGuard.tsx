'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

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
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Salvar a URL que o usuário tentou acessar para redirecionar após login
            if (typeof window !== 'undefined' && pathname !== '/') {
                sessionStorage.setItem('nexocrm_redirect', pathname);
            }
            router.replace('/auth/login');
        }
    }, [isAuthenticated, loading, router, pathname]);

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

    return <>{children}</>;
};

export default AuthGuard;
