// src/helpers/offers.ts
import type { OfferOut } from "@/api/products/types";

/**
 * Encontra a melhor oferta (preço mais baixo) de uma lista.
 */
export function getBestOffer(
  offers: OfferOut[] | null | undefined
): OfferOut | null {
  if (!offers || offers.length === 0) return null;

  return offers.reduce((best, offer) => {
    const bestPrice = best.price ? Number(best.price) : Infinity;
    const offerPrice = offer.price ? Number(offer.price) : Infinity;
    return offerPrice < bestPrice ? offer : best;
  }, offers[0]);
}

/**
 * Obtém o preço de custo da melhor oferta.
 */
export function getBestOfferCost(
  offers: OfferOut[] | null | undefined
): number | null {
  const best = getBestOffer(offers);
  return best?.price ? Number(best.price) : null;
}
