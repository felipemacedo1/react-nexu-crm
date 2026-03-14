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
    permissoes: string[];
    titulo?: string;
    departamento?: string;
    foto?: string;
    telefone?: string;
}

interface UsuarioMeResponse {
    id: string;
    nome?: string;
    primeiroNome?: string;
    ultimoNome?: string;
    nomeUsuario: string;
    email1?: string;
    status?: string;
    ehAdmin?: boolean;
    administrador?: boolean;
    permissoes?: string[];
    titulo?: string;
    departamento?: string;
    foto?: string;
    telefoneComercial?: string;
    telefoneCelular?: string;
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

const persistUser = (user: UsuarioLogado) => {
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 1 });
};

const normalizeUser = (user: Partial<UsuarioLogado>): UsuarioLogado => ({
    id: user.id ?? '',
    nome: user.nome ?? '',
    sobrenome: user.sobrenome ?? '',
    email: user.email ?? '',
    nomeUsuario: user.nomeUsuario ?? '',
    ativo: user.ativo ?? false,
    administrador: user.administrador ?? false,
    permissoes: user.permissoes ?? [],
    titulo: user.titulo,
    departamento: user.departamento,
    foto: user.foto,
    telefone: user.telefone
});

const mapMeToUsuarioLogado = (data: UsuarioMeResponse): UsuarioLogado =>
    normalizeUser({
        id: data.id,
        nome: data.primeiroNome ?? data.nome ?? '',
        sobrenome: data.ultimoNome ?? '',
        email: data.email1 ?? '',
        nomeUsuario: data.nomeUsuario,
        ativo: data.status ? data.status.toLowerCase() === 'active' : true,
        administrador: data.administrador ?? data.ehAdmin ?? false,
        permissoes: data.permissoes ?? [],
        titulo: data.titulo,
        departamento: data.departamento,
        foto: data.foto,
        telefone: data.telefoneCelular ?? data.telefoneComercial
    });

export const AuthService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login', data);
        const { token } = response.data;
        const usuario = normalizeUser(response.data.usuario);

        Cookies.set(TOKEN_KEY, token, { expires: 1 }); // 1 dia
        persistUser(usuario);

        return { ...response.data, usuario };
    },

    async me(): Promise<UsuarioLogado> {
        const response = await api.get<UsuarioMeResponse>('/auth/me');
        const usuario = mapMeToUsuarioLogado(response.data);
        persistUser(usuario);
        return usuario;
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
                return normalizeUser(JSON.parse(userStr));
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
