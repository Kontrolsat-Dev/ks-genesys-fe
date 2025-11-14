// src/lib/product-search.ts
export type ProductSearchIntent =
  | { kind: "detail"; id: number }
  | {
      kind: "list";
      q?: string | null;
      gtin?: string | null;
      partnumber?: string | null;
    };

export function parseProductSearch(raw: string): ProductSearchIntent {
  const s = (raw ?? "").trim();
  if (!s) return { kind: "list" };

  // id:123 → ir direto ao detalhe
  const idMatch = /^id:(\d+)$/.exec(s.toLowerCase());
  if (idMatch) return { kind: "detail", id: Number(idMatch[1]) };

  // gtin:... (ou só dígitos de 8-14) → filtrar por GTIN
  const gtinPrefix = /^gtin:(.+)$/i.exec(s);
  if (gtinPrefix) return { kind: "list", gtin: gtinPrefix[1].trim() };
  if (/^\d{8,14}$/.test(s)) return { kind: "list", gtin: s };

  // mpn:... → partnumber
  const mpnPrefix = /^mpn:(.+)$/i.exec(s);
  if (mpnPrefix) return { kind: "list", partnumber: mpnPrefix[1].trim() };

  // default → q full-text
  return { kind: "list", q: s };
}
