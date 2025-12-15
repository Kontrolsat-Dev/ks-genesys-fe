// src/features/products/product/queries.ts
import {
  useQuery,
  QueryClient,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { productsClient } from "@/api/products";
import type {
  ProductDetailParams,
  ProductDetailResponse,
  ProductMarginUpdate,
  ProductImportIn,
  ProductImportOut,
} from "@/api/products/types";

export const productDetailKeys = {
  root: ["product"] as const,
  detail: (id: number, params?: ProductDetailParams) =>
    [...productDetailKeys.root, id, params ?? {}] as const,
};

export function useProductDetail(
  id?: number,
  params: ProductDetailParams = {}
) {
  const enabled = typeof id === "number" && Number.isFinite(id) && id > 0;

  return useQuery<ProductDetailResponse>({
    queryKey: productDetailKeys.detail(id ?? -1, params),
    queryFn: () =>
      productsClient.get(id as number, {
        expand_meta: params.expand_meta ?? true,
        expand_offers: params.expand_offers ?? true,
        expand_events: params.expand_events ?? true,
        events_days: params.events_days ?? 90,
        events_limit: params.events_limit ?? 2000,
        aggregate_daily: params.aggregate_daily ?? true,
      }),
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export async function prefetchProductDetail(
  qc: QueryClient,
  id: number,
  params: ProductDetailParams = {}
) {
  if (!id || !Number.isFinite(id)) return;
  await qc.prefetchQuery({
    queryKey: productDetailKeys.detail(id, params),
    queryFn: () =>
      productsClient.get(id, {
        expand_meta: params.expand_meta ?? true,
        expand_offers: params.expand_offers ?? true,
        expand_events: params.expand_events ?? true,
        events_days: params.events_days ?? 90,
        events_limit: params.events_limit ?? 2000,
        aggregate_daily: params.aggregate_daily ?? true,
      }),
    staleTime: 60_000,
  });
}

// React tanstack query para update de margin
export function useUpdateProductMargin(
  id: number,
  params: ProductDetailParams = {}
) {
  const queryClient = useQueryClient();

  return useMutation<ProductDetailResponse, unknown, ProductMarginUpdate>({
    mutationFn: (payload) =>
      productsClient.updateMargin(id, payload, {
        expand_meta: params.expand_meta ?? true,
        expand_offers: params.expand_offers ?? true,
        expand_events: params.expand_events ?? true,
        events_days: params.events_days ?? 90,
        events_limit: params.events_limit ?? 2000,
        aggregate_daily: params.aggregate_daily ?? true,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(productDetailKeys.detail(id, params), data);
      // invalidar cache aqui:
      queryClient.invalidateQueries({
        queryKey: productDetailKeys.root,
      });
    },
  });
}

// Mutation hook para importar produto para PrestaShop
export function useImportProduct(id: number) {
  const queryClient = useQueryClient();

  return useMutation<ProductImportOut, Error, ProductImportIn>({
    mutationFn: (payload) => productsClient.importToPs(id, payload),
    onSuccess: () => {
      // Invalidate product detail to refresh id_ecommerce
      queryClient.invalidateQueries({
        queryKey: productDetailKeys.root,
      });
    },
  });
}

