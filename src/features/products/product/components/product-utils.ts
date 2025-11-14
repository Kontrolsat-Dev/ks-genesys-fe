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
export function fmtMoney(s?: string | null) {
  if (s == null || s === "") return "—";
  const n = Number(s);
  if (!Number.isFinite(n)) return String(s);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}
export function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}
