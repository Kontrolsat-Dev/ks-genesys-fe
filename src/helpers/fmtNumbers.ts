export function fmtMargin(margin: number | null) {
  if (!margin) return "—";
  const m = margin * 100;
  return `${m.toString()}%`;
}
