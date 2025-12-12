// src/features/products/categories/queries.ts
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import {
  categoriesClient,
  type CategoriesListParams,
  type CategoriesListResponse,
  type Category,
  type CategoryMappingIn,
} from "@/api/categories";

export const categoriesKey = {
  root: ["categories"] as const,
  list: (params: {
    page: number;
    pageSize: number;
    q: string | null;
    autoImport: boolean | null;
  }) => [...categoriesKey.root, "list", params] as const,
  all: ["categories", "all"] as const,
  mapped: ["categories", "mapped"] as const,
};

export function useCategoriesList(params: CategoriesListParams = {}) {
  const q: {
    page: number;
    pageSize: number;
    q: string | null;
    autoImport: boolean | null;
  } = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    q: params.q ?? null,
    autoImport: params.autoImport ?? null,
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
  const q: {
    page: number;
    pageSize: number;
    q: string | null;
    autoImport: boolean | null;
  } = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    q: params.q ?? null,
    autoImport: params.autoImport ?? null,
  };

  await qc.prefetchQuery({
    queryKey: categoriesKey.list(q),
    queryFn: async () => {
      const t0 = performance.now();
      const res = await categoriesClient.list(q);
      const elapsedMs = performance.now() - t0;
      return { ...res, elapsedMs };
    },
    staleTime: 60_000,
  });
}

/**
 * Hook para carregar **todas** as categorias (sem paginação),
 * para usar em dropdowns da ProductsPage.
 */
export function useAllCategories() {
  return useQuery<Category[]>({
    queryKey: categoriesKey.all,
    queryFn: async () => {
      const pageSize = 100; // ⚠️ BACKEND LE=100
      let page = 1;
      let all: Category[] = [];

      while (true) {
        const res = await categoriesClient.list({
          page,
          pageSize,
          q: null,
        });

        all = all.concat(res.items);

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

/**
 * Mutation para atualizar mapping de categoria para PrestaShop
 */
export function useUpdateCategoryMapping() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryMappingIn }) =>
      categoriesClient.updateMapping(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey.root });
    },
  });
}

/**
 * Mutation para remover mapping de categoria
 */
export function useDeleteCategoryMapping() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesClient.deleteMapping(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey.root });
    },
  });
}

