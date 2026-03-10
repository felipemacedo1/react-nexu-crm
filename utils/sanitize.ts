/**
 * Utilitários de sanitização de entrada do usuário.
 * Remove tags HTML, scripts e caracteres potencialmente perigosos.
 */

/**
 * Remove tags HTML e espaços extras de uma string.
 */
export const sanitizeString = (str: string): string =>
    str.replace(/<[^>]*>/g, '').trim();

/**
 * Remove caracteres especiais usados em SQL Injection básico.
 * Para proteção completa, a validação deve ocorrer no backend.
 */
export const sanitizeSQLChars = (str: string): string =>
    str.replace(/['";\\]/g, '');

/**
 * Sanitiza todos os campos de string em um objeto de formulário.
 * Campos não-string são retornados sem modificação.
 */
export const sanitizeFormData = <T extends Record<string, unknown>>(data: T): T => {
    const result = { ...data };
    for (const key in result) {
        if (typeof result[key] === 'string') {
            (result as Record<string, unknown>)[key] = sanitizeString(result[key] as string);
        }
    }
    return result;
};

/**
 * Sanitiza uma URL, aceitando apenas protocolos seguros (http, https, mailto, tel).
 */
export const sanitizeUrl = (url: string): string => {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
            return '';
        }
        return url;
    } catch {
        return '';
    }
};

/**
 * Trunca uma string ao tamanho máximo, adicionando "…" se necessário.
 */
export const truncate = (str: string, maxLength: number): string =>
    str.length > maxLength ? str.slice(0, maxLength - 1) + '…' : str;
