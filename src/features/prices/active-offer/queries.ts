// src/features/prices/active-offer/queries.ts
import { useQuery } from "@tanstack/react-query";
import { productsClient } from "@/api/products";
import type {
  ProductPriceChangeListOut,
  ProductPriceChangeListParams,
} from "@/api/products";

const ACTIVE_OFFER_PRICE_CHANGES_QUERY_KEY = [
  "prices",
  "active-offer",
] as const;

export function useActiveOfferPriceChanges(
  params: ProductPriceChangeListParams = {}
) {
  return useQuery<ProductPriceChangeListOut, Error>({
    queryKey: [...ACTIVE_OFFER_PRICE_CHANGES_QUERY_KEY, params],
    queryFn: () => productsClient.listActivityOfferPriceChanges(params),
  });
}
