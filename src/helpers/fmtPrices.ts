export function fmtPrice(n?: number | null) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  } catch {
    return n.toFixed(2);
  }
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
