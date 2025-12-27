// src/helpers/fmtNumbers.ts
// Funções de formatação de números

/**
 * Formata uma margem decimal para percentagem (0.25 → "25%").
 */
export function fmtMargin(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(0)}%`;
}

/**
 * Formata uma margem decimal para percentagem com decimais (0.255 → "25.5%").
 */
export function fmtMarginDecimal(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formata um número com separador de milhares (1234567 → "1.234.567").
 */
export function fmtNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-PT");
}

/**
 * Formata duração em ms para segundos legíveis (1500 → "1.5s").
 */
export function fmtDuration(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Formata percentagem com casas decimais (0.1234 → "12.34%").
 */
export function fmtPercent(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata preço em euros (12.5 → "12,50 €").
 */
export function fmtPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(2).replace(".", ",")} €`;
}
