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
