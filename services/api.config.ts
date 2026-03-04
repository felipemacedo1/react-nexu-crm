import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/nexocrm/api';

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
        const token = Cookies.get('nexocrm_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Tratamento de erros
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status } = error.response;

            switch (status) {
                case 401:
                    // Token expirado ou inválido - redirecionar para login
                    Cookies.remove('nexocrm_token');
                    Cookies.remove('nexocrm_user');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/auth/login';
                    }
                    break;
                case 403:
                    console.error('Acesso negado');
                    break;
                case 404:
                    console.error('Recurso não encontrado');
                    break;
                case 500:
                    console.error('Erro interno do servidor');
                    break;
                default:
                    console.error(`Erro HTTP: ${status}`);
            }
        } else if (error.request) {
            console.error('Sem resposta do servidor. Verifique sua conexão.');
        }

        return Promise.reject(error);
    }
);

export default api;
