'use client';
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthService, LoginRequest, LoginResponse, RegisterRequest, UsuarioLogado } from '@/services/auth.service';
import { broadcastLogout } from '@/services/api.config';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
    user: UsuarioLogado | null;
    token: string | undefined;
    isAuthenticated: boolean;
    loading: boolean;
    login: (data: LoginRequest) => Promise<LoginResponse>;
    register: (data: RegisterRequest) => Promise<any>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UsuarioLogado | null>(null);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Recuperar dados do cookie ao montar
        const savedToken = AuthService.getToken();
        const savedUser = AuthService.getUser();

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await AuthService.login(data);
        setToken(response.token);
        setUser(response.usuario);
        return response;
    }, []);

    const register = useCallback(async (data: RegisterRequest): Promise<any> => {
        return await AuthService.register(data);
    }, []);

    const logout = useCallback(() => {
        setToken(undefined);
        setUser(null);
        broadcastLogout();   // notifica outras abas
        AuthService.logout();
    }, []);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
