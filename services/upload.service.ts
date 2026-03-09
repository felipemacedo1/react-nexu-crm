import apiClient from './api.config';

export interface UploadResponse {
    id: number;
    nomeOriginal: string;
    nomeArquivo: string;
    url: string;
    tamanho: number;
    tipo: string;
    dataCriacao: string;
}

export interface AnexoDTO {
    id: number;
    nomeOriginal: string;
    url: string;
    tamanho: number;
    tipo: string;
    dataCriacao: string;
}

export const TIPOS_ACEITOS = {
    imagens: 'image/*',
    documentos: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv',
    todos: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv',
};

export const formatarTamanho = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImagem = (tipo: string): boolean =>
    tipo.startsWith('image/');

class UploadServiceClass {
    /**
     * Upload de arquivo único — retorna metadados do arquivo salvo
     */
    async upload(file: File, entidade?: string, entidadeId?: number): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('arquivo', file);
        if (entidade) formData.append('entidade', entidade);
        if (entidadeId !== undefined) formData.append('entidadeId', String(entidadeId));

        const { data } = await apiClient.post<UploadResponse>('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    }

    /**
     * Upload de múltiplos arquivos
     */
    async uploadMultiplos(files: File[], entidade?: string, entidadeId?: number): Promise<UploadResponse[]> {
        const promises = files.map(f => this.upload(f, entidade, entidadeId));
        return Promise.all(promises);
    }

    /**
     * Listar anexos de uma entidade
     */
    async listarAnexos(entidade: string, entidadeId: number): Promise<AnexoDTO[]> {
        const { data } = await apiClient.get<AnexoDTO[]>(`/upload/${entidade}/${entidadeId}`);
        return data;
    }

    /**
     * Excluir anexo
     */
    async excluir(id: number): Promise<void> {
        await apiClient.delete(`/upload/${id}`);
    }

    /**
     * Retorna a URL para visualização/download de um arquivo
     */
    getUrlDownload(nomeArquivo: string): string {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
        return `${base}/upload/arquivo/${nomeArquivo}`;
    }
}

export const UploadService = new UploadServiceClass();
