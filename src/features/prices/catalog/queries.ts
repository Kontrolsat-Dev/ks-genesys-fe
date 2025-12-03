// src/features/prices/catalog/queries.ts
import { useQuery } from "@tanstack/react-query";
import { productsClient } from "@/api/products";
import type {
  ProductPriceChangeListOut,
  ProductPriceChangeListParams,
} from "@/api/products";

const CATALOG_PRICE_CHANGES_QUERY_KEY = ["prices", "catalog"] as const;

// Alias semântico para esta página
export type CatalogPriceChangesParams = ProductPriceChangeListParams;

export function useCatalogPriceChanges(params: CatalogPriceChangesParams = {}) {
  return useQuery<ProductPriceChangeListOut, Error>({
    queryKey: [...CATALOG_PRICE_CHANGES_QUERY_KEY, params],
    queryFn: () => productsClient.listCatalogPriceChanges(params),
  });
}
