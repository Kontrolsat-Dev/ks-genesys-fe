// Paleta estável (tailwind-inspired). Ajusta à vontade.
/** Ex.: azul, verde, âmbar, vermelho, violeta, ciano, lima, rosa, teal, dourado */
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#ec4899",
  "#14b8a6",
  "#eab308",
];

export function getColor(index: number) {
  return COLORS[index % COLORS.length];
}
