import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/nexocrm/api';

const TOKEN_KEY = 'nexocrm_token';
const USER_KEY = 'nexocrm_user';

// Broadcast logout para todas as abas
const LOGOUT_EVENT = 'nexocrm_logout';

export function broadcastLogout() {
    if (typeof window !== 'undefined') {
        localStorage.setItem(LOGOUT_EVENT, Date.now().toString());
        localStorage.removeItem(LOGOUT_EVENT);
    }
}

// Escuta logout em outras abas
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === LOGOUT_EVENT) {
            Cookies.remove(TOKEN_KEY);
            Cookies.remove(USER_KEY);
            window.location.href = '/auth/login';
        }
    });
}

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Adiciona token JWT
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Tratamento de erros e refresh token
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response) {
            const { status } = error.response;

            // Tenta refresh token uma vez (401 sem retry)
            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshToken = Cookies.get('nexocrm_refresh_token');
                    if (refreshToken) {
                        const { data } = await axios.post(
                            `${API_BASE_URL}/auth/refresh`,
                            { refreshToken },
                        );
                        Cookies.set(TOKEN_KEY, data.token, { expires: 1 });
                        originalRequest.headers!.Authorization = `Bearer ${data.token}`;
                        return api(originalRequest);
                    }
                } catch {
                    // Refresh falhou → logout
                }
                // Token expirado ou refresh indisponível → logout em todas as abas
                broadcastLogout();
                Cookies.remove(TOKEN_KEY);
                Cookies.remove(USER_KEY);
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
            }

            if (status === 403) console.error('Acesso negado');
            if (status === 404) console.error('Recurso não encontrado');
            if (status === 500) console.error('Erro interno do servidor');
        } else if (error.request) {
            console.error('Sem resposta do servidor. Verifique sua conexão.');
        }

        return Promise.reject(error);
    }
);

export default api;
