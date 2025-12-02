// src/features/system/worker-jobs/components/utils.ts

/**
 * Formata uma data ISO string para formato local legível.
 * @param value - String de data ISO ou null
 * @returns Data formatada ou "—" se null
 */
export function formatDateTime(value: string | null): string {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

/**
 * Trunca uma string para um tamanho máximo.
 * @param str - String para truncar
 * @param max - Número máximo de caracteres
 * @returns String truncada com "…" se necessário
 */
export function truncate(str: string, max: number): string {
    if (str.length <= max) return str;
    return str.slice(0, max) + "…";
}
