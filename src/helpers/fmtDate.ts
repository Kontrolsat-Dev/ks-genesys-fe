// src/helpers/fmtDate.ts
// Funções de formatação de datas

/**
 * Formata uma data ISO para formato local completo.
 */
export function fmtDate(dt?: string | null): string {
  if (!dt) return "—";
  const d = new Date(dt);
  return Number.isNaN(+d) ? String(dt) : d.toLocaleString("pt-PT");
}

/**
 * Formata uma data ISO para formato local curto (só data).
 */
export function fmtDateShort(dt?: string | null): string {
  if (!dt) return "—";
  const d = new Date(dt);
  return Number.isNaN(+d) ? String(dt) : d.toLocaleDateString("pt-PT");
}

/**
 * Formata uma data como tempo relativo (ex: "2m atrás", "3h atrás").
 */
export function fmtTimeAgo(dt?: string | null): string {
  if (!dt) return "—";
  const date = new Date(dt);
  if (Number.isNaN(+date)) return String(dt);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}
