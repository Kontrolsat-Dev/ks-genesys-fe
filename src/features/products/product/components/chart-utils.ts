import { useMemo } from "react";
import type { ProductEventOut } from "@/api/products/types";
import { getColor } from "@/constants/colors";

/**
 * Convert date string to YYYY-MM-DD format
 */
export function dayKey(d: string): string {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Metadata for a chart series (one per supplier)
 */
export type SeriesMeta = {
  key: string;
  supplierId: number;
  name: string;
  color: string;
};

export type ChartDataResult = {
  data: Record<string, any>[];
  seriesMeta: SeriesMeta[];
  totalPoints: number;
};

export type ChartContentProps = {
  events: ProductEventOut[];
  filterDays: number | null;
  height?: string;
};

/**
 * Generic hook to process events into chart data
 * @param events - Product events array
 * @param filterDays - Filter to last N days (null = all data)
 * @param valueExtractor - Function to extract numeric value from event (price or stock)
 */
export function useChartData(
  events: ProductEventOut[],
  filterDays: number | null,
  valueExtractor: (e: ProductEventOut) => number | null
): ChartDataResult {
  return useMemo(() => {
    // Build supplier map
    const suppliers = new Map<number, string>();
    for (const e of events ?? []) {
      if (typeof e.id_supplier === "number") {
        suppliers.set(e.id_supplier, e.supplier_name ?? `#${e.id_supplier}`);
      }
    }

    // Filter events by date if filterDays is set
    const cutoff = filterDays
      ? new Date(Date.now() - filterDays * 24 * 60 * 60 * 1000)
      : null;

    const filteredEvents = cutoff
      ? events.filter((e) => new Date(e.created_at) >= cutoff)
      : events;

    // Group by day
    const byDay = new Map<string, Map<number, number | null>>();
    for (const e of filteredEvents ?? []) {
      const key = dayKey(e.created_at);
      if (!byDay.has(key)) byDay.set(key, new Map());
      const perSup = byDay.get(key)!;

      const value = valueExtractor(e);

      if (typeof e.id_supplier === "number") {
        perSup.set(e.id_supplier, value);
      }
    }

    const days = Array.from(byDay.keys()).sort();
    const seriesMeta: SeriesMeta[] = Array.from(suppliers.entries()).map(
      ([id, name], idx) => ({
        key: `s_${id}`,
        supplierId: id,
        name,
        color: getColor(idx),
      })
    );

    // Build data with gap filling
    const lastKnown = new Map<number, number | null>();
    const data = days.map((k) => {
      const label = new Date(k).toLocaleDateString();
      const row: Record<string, any> = { x: label };
      const perSup = byDay.get(k)!;

      for (const { supplierId, key } of seriesMeta) {
        if (perSup.has(supplierId)) {
          const val = perSup.get(supplierId) ?? null;
          row[key] = val;
          lastKnown.set(supplierId, val);
        } else {
          row[key] = lastKnown.get(supplierId) ?? null;
        }
      }
      return row;
    });

    const totalPoints =
      data.reduce(
        (acc, row) =>
          acc + seriesMeta.reduce((n, s) => (row[s.key] != null ? n + 1 : n), 0),
        0
      ) ?? 0;

    return { data, seriesMeta, totalPoints };
  }, [events, filterDays, valueExtractor]);
}

/**
 * Extract price from event
 */
export function extractPrice(e: ProductEventOut): number | null {
  if (e.price == null || String(e.price).trim() === "") return null;
  const n = Number(String(e.price).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Extract stock from event
 */
export function extractStock(e: ProductEventOut): number | null {
  if (typeof e.stock !== "number") return null;
  return e.stock;
}
