// src/features/products/brands/queries.ts
import { useQuery, QueryClient } from "@tanstack/react-query";
import { brandsClient } from "@/api/brands";
import type { BrandsListParams, BrandsListResponse, Brand } from "@/api/brands";

export const brandKeys = {
  root: ["brands"] as const,
  list: (params: { page: number; pageSize: number; q: string | null }) =>
    [...brandKeys.root, "list", params] as const,
  all: ["brands", "all"] as const,
};

export function useBrandsList(params: BrandsListParams = {}) {
  const q: { page: number; pageSize: number; q: string | null } = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    q: params.q ?? null,
  };

  return useQuery<BrandsListResponse & { elapsedMs?: number }>({
    queryKey: brandKeys.list(q),
    queryFn: async () => {
      const t0 = performance.now();
      const res = await brandsClient.list(q);
      const elapsedMs = performance.now() - t0;
      return { ...res, elapsedMs };
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export async function prefetchBrandsList(
  qc: QueryClient,
  params: BrandsListParams = {}
) {
  const q: { page: number; pageSize: number; q: string | null } = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    q: params.q ?? null,
  };

  await qc.prefetchQuery({
    queryKey: brandKeys.list(q),
    queryFn: async () => {
      const t0 = performance.now();
      const res = await brandsClient.list(q);
      const elapsedMs = performance.now() - t0;
      return { ...res, elapsedMs };
    },
    staleTime: 60_000,
  });
}

/**
 * Hook para carregar **todas** as brands (sem paginação),
 * para usar em dropdowns da ProductsPage.
 */
export function useAllBrands() {
  return useQuery<Brand[]>({
    queryKey: brandKeys.all,
    queryFn: async () => {
      const pageSize = 100; // ⚠️ BACKEND LE=100
      let page = 1;
      let all: Brand[] = [];

      while (true) {
        const res = await brandsClient.list({
          page,
          pageSize,
          q: null,
        });

        all = all.concat(res.items);

        // Podemos usar total para decidir quando parar
        if (all.length >= res.total || res.items.length < pageSize) {
          break;
        }

        page += 1;
      }

      all.sort((a, b) => a.name.localeCompare(b.name, "pt"));

      return all;
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
