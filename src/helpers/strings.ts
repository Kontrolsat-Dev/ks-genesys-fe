// src/helpers/strings.ts
// Funções de manipulação de strings

/**
 * Trunca uma string para um tamanho máximo.
 */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

/**
 * Capitaliza a primeira letra de uma string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
