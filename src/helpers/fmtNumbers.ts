export function fmtMargin(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  value = value * 100;
  return `${value.toFixed(2)}%`; // ou o que já tens
}
