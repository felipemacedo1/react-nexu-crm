import api from './api.config';
import Cookies from 'js-cookie';

export interface LoginRequest {
    email: string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    tipo: string;
    usuario: UsuarioLogado;
}

export interface UsuarioLogado {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    nomeUsuario: string;
    ativo: boolean;
    administrador?: boolean;
}

export interface RegisterRequest {
    nome: string;
    sobrenome: string;
    email: string;
    nomeUsuario: string;
    senha: string;
}

export interface RegisterResponse {
    message: string;
    emailEnviado: boolean;
}

export interface VerificacaoResponse {
    message: string;
    sucesso: boolean;
}

const TOKEN_KEY = 'nexocrm_token';
const USER_KEY = 'nexocrm_user';

export const AuthService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login', data);
        const { token, usuario } = response.data;

        Cookies.set(TOKEN_KEY, token, { expires: 1 }); // 1 dia
        Cookies.set(USER_KEY, JSON.stringify(usuario), { expires: 1 });

        return response.data;
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await api.post<RegisterResponse>('/auth/registrar', data);
        return response.data;
    },

    async verificarEmail(token: string): Promise<VerificacaoResponse> {
        const response = await api.get<VerificacaoResponse>('/auth/verificar-email', {
            params: { token }
        });
        return response.data;
    },

    async reenviarVerificacao(email: string): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>('/auth/reenviar-verificacao', { email });
        return response.data;
    },

    logout(): void {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(USER_KEY);
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
    },

    getToken(): string | undefined {
        return Cookies.get(TOKEN_KEY);
    },

    getUser(): UsuarioLogado | null {
        const userStr = Cookies.get(USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    isAuthenticated(): boolean {
        return !!Cookies.get(TOKEN_KEY);
    }
};
