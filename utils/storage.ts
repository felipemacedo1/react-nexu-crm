/**
 * Utilitários para gerenciamento de dados no localStorage
 */

/**
 * Salva um valor no localStorage com serialização JSON automática.
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error(`[storage] Erro ao salvar chave "${key}":`, error);
    }
}

/**
 * Recupera e desserializa um valor do localStorage.
 * Retorna `null` se a chave não existir ou ocorrer erro de parsing.
 */
export function getFromLocalStorage<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return null;
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`[storage] Erro ao ler chave "${key}":`, error);
        return null;
    }
}

/**
 * Remove um item específico do localStorage.
 */
export function removeFromLocalStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`[storage] Erro ao remover chave "${key}":`, error);
    }
}

/**
 * Limpa todo o localStorage (use com cuidado).
 */
export function clearLocalStorage(): void {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('[storage] Erro ao limpar localStorage:', error);
    }
}

/**
 * Verifica se uma chave existe no localStorage.
 */
export function existsInLocalStorage(key: string): boolean {
    try {
        return localStorage.getItem(key) !== null;
    } catch {
        return false;
    }
}
