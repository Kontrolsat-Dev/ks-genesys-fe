import type { OfferOut } from "@/api/products/types";

/**
 * Extract price as number from OfferOut
 */
export function getPriceNumber(offer?: OfferOut | null): number | null {
  if (!offer?.price) return null;
  const num = Number.parseFloat(offer.price);
  if (!Number.isFinite(num)) return null;
  return num;
}

/**
 * Format supplier name from offer
 */
export function formatSupplier(offer?: OfferOut | null): string {
  if (!offer) return "—";
  return (
    offer.supplier_name ??
    (offer.id_supplier ? `Fornecedor #${offer.id_supplier}` : "—")
  );
}

/**
 * Format stock value from offer
 */
export function formatStock(offer?: OfferOut | null): string {
  if (typeof offer?.stock === "number") return String(offer.stock);
  return "—";
}

/**
 * Format price from offer as currency string
 */
export function formatPrice(offer?: OfferOut | null): string {
  const num = getPriceNumber(offer);
  if (num == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(num);
}
