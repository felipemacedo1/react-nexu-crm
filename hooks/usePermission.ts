'use client';
import { useAuth } from './useAuth';

/**
 * Hook para verificar permissões granulares do usuário logado.
 *
 * O sistema de permissões usa o padrão "modulo:acao", ex:
 *   leads:read, contas:write, usuarios:manage, config:manage
 *
 * Administradores têm acesso total por padrão.
 *
 * Uso:
 *   const { can, isAdmin } = usePermission();
 *   if (can('leads:write')) { ... }
 *   if (isAdmin) { ... }
 */
export const usePermission = () => {
    const { user } = useAuth();

    const isAdmin = Boolean(user?.administrador);

    /**
     * Verifica se o usuário tem uma permissão específica.
     * Admins sempre retornam true.
     * Para usuários normais, verifica o array `permissoes` retornado pelo backend
     * (disponível quando o endpoint /api/auth/me retornar permissões do grupo).
     */
    const can = (permission: string): boolean => {
        if (!user) return false;
        if (isAdmin) return true;

        return user.permissoes.includes(permission);
    };

    /**
     * Verifica se o usuário tem TODAS as permissões da lista.
     */
    const canAll = (...permissions: string[]): boolean => {
        return permissions.every(p => can(p));
    };

    /**
     * Verifica se o usuário tem PELO MENOS UMA das permissões da lista.
     */
    const canAny = (...permissions: string[]): boolean => {
        return permissions.some(p => can(p));
    };

    /**
     * Verifica acesso a um módulo inteiro (qualquer permissão do módulo).
     * Ex: canModule('leads') → true se tiver leads:read OU leads:write OU leads:delete
     */
    const canModule = (modulo: string): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        return user.permissoes.some(p => p.startsWith(`${modulo}:`));
    };

    return { can, canAll, canAny, canModule, isAdmin };
};
