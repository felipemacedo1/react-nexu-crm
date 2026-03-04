import api from './api.config';

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    numberOfElements: number;
}

export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
}

export interface ApiError {
    status: number;
    message: string;
    timestamp: string;
    errors?: string[];
}

export class BaseService<T> {
    protected readonly endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async getAll(): Promise<T[]> {
        const response = await api.get<T[]>(this.endpoint);
        return response.data;
    }

    async getPaginated(params?: PaginationParams): Promise<PaginatedResponse<T>> {
        const queryParams: Record<string, any> = {};
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.size !== undefined) queryParams.size = params.size;
        if (params?.sort) {
            queryParams.sort = `${params.sort},${params.direction || 'asc'}`;
        }
        const response = await api.get<PaginatedResponse<T>>(this.endpoint, { params: queryParams });
        return response.data;
    }

    async getById(id: string): Promise<T> {
        const response = await api.get<T>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async create(data: Partial<T>): Promise<T> {
        const response = await api.post<T>(this.endpoint, data);
        return response.data;
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        const response = await api.put<T>(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await api.delete(`${this.endpoint}/${id}`);
    }

    async search(params: Record<string, any>): Promise<T[]> {
        const response = await api.get<T[]>(`${this.endpoint}/buscar`, { params });
        return response.data;
    }
}
