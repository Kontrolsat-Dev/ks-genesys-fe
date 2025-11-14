export function fmtDate(dt?: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return Number.isNaN(+d) ? String(dt) : d.toLocaleString();
}
export function fmtDateShort(dt?: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return Number.isNaN(+d) ? String(dt) : d.toLocaleDateString();
}
