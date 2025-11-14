// src/features/products/categories/queries.ts
import { useQuery, QueryClient } from "@tanstack/react-query";
import { categoriesClient } from "@/api/categories";
import type {
  CategoriesListParams,
  CategoriesListResponse,
} from "@/api/categories";

export const categoriesKey = {
  root: ["categories"] as const,
  list: (params: { page: number; pageSize: number; q: string | null }) =>
    [...categoriesKey.root, "list", params] as const,
};

export function useCategoriesList(params: CategoriesListParams = {}) {
  const q: { page: number; pageSize: number; q: string | null } = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    q: params.q ?? null,
  };

  return useQuery<CategoriesListResponse & { elapsedMs?: number }>({
    queryKey: categoriesKey.list(q),
    queryFn: async () => {
      const t0 = performance.now();
      const res = await categoriesClient.list(q);
      const elapsedMs = performance.now() - t0;
      return { ...res, elapsedMs };
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export async function prefetchCategoryList(
  qc: QueryClient,
  params: CategoriesListParams = {}
) {
  const q: { page: number; pageSize: number; q: string | null } = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    q: params.q ?? null,
  };

  await qc.prefetchQuery({
    queryKey: categoriesKey.list(q),
    queryFn: async () => {
      const t0 = performance.now();
      const res = await categoriesKey.list(q);
      const elapsedMs = performance.now() - t0;
      return { ...res, elapsedMs };
    },
    staleTime: 60_000,
  });
}
