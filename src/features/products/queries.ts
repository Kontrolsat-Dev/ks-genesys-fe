// src/features/products/queries.ts
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsClient } from "@/api/products";
import type {
  ProductListParams,
  ProductListResponse,
  ProductFacetsParams,
  ProductFacetsOut,
  BulkImportIn,
  BulkImportOut,
} from "@/api/products";

/**
 * Keys base para cache de produtos no React Query.
 * Mantém separado:
 *  - list  → resultados paginados
 *  - facets → ids de brands/categories/suppliers válidos para os filtros atuais
 */
export const productKeys = {
  root: ["products"] as const,

  /**
   * Cache key para a listagem de produtos (paginada).
   */
  list: (params: NormalizedListParams) =>
    [...productKeys.root, "list", params] as const,

  /**
   * Cache key para facets (brands/categories/suppliers) dados os filtros atuais.
   */
  facets: (params: ProductFacetsParams) =>
    [...productKeys.root, "facets", params] as const,
};

/**
 * Versão normalizada dos parâmetros de listagem.
 * Garante que page/pageSize/sort estão sempre presentes e que
 * campos opcionais vêm como `null` em vez de `undefined`
 * (melhor para cache e para o backend).
 */
export type NormalizedListParams = Required<
  Pick<ProductListParams, "page" | "pageSize" | "sort">
> &
  Omit<ProductListParams, "page" | "pageSize" | "sort">;

/**
 * Helper para normalizar parâmetros de listagem.
 */
export function normalizeListParams(
  params: ProductListParams = {}
): NormalizedListParams {
  return {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    sort: params.sort ?? "recent",

    q: params.q ?? null,
    gtin: params.gtin ?? null,
    partnumber: params.partnumber ?? null,

    id_brand: params.id_brand ?? null,
    brand: params.brand ?? null,

    id_category: params.id_category ?? null,
    category: params.category ?? null,

    has_stock: params.has_stock ?? null,
    id_supplier: params.id_supplier ?? null,
    imported: params.imported ?? null,
  };
}

/**
 * Hook principal de listagem de produtos (paginado).
 *
 * - Faz o mapping de parâmetros do frontend → API.
 * - Mede o tempo de resposta (elapsedMs) para mostrar no UI.
 * - Usa keepPreviousData para evitar "flash" quando mudas de página.
 */
export function useProductsList(params: ProductListParams = {}) {
  const q = normalizeListParams(params);

  return useQuery<ProductListResponse & { elapsedMs: number }>({
    queryKey: productKeys.list(q),
    queryFn: async () => {
      const started = performance.now();
      const data = await productsClient.list(q);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

/**
 * Hook para obter os **facets** (listas de IDs de marcas/categorias/fornecedores)
 * válidos para o conjunto de filtros atual.
 *
 * Importante:
 *  - Ignora paginação/ordenção: só olha para filtros de conteúdo.
 *  - Útil para “cortar” as opções de dropdown (brands/categories/suppliers)
 *    de acordo com o que está filtrado (q, has_stock, id_supplier, etc.).
 */
export function useProductsFacets(params: ProductFacetsParams = {}) {
  // Normalizamos undefined → null, para consistência com o backend e com a cache
  const f: ProductFacetsParams = {
    q: params.q ?? null,
    gtin: params.gtin ?? null,
    partnumber: params.partnumber ?? null,

    id_brand: params.id_brand ?? null,
    brand: params.brand ?? null,

    id_category: params.id_category ?? null,
    category: params.category ?? null,

    has_stock: params.has_stock ?? null,
    id_supplier: params.id_supplier ?? null,
    imported: params.imported ?? null,
  };

  return useQuery<ProductFacetsOut>({
    queryKey: productKeys.facets(f),
    queryFn: () => productsClient.facets(f),
    // facets só precisam ser recalculados quando mudam filtros;
    // podem ser considerados frescos durante algum tempo.
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Pequeno helper genérico para opções de selects.
 */
export type FilterOption = { value: string; label: string };

/**
 * Hook para importar múltiplos produtos em batch para o PrestaShop.
 */
export function useBulkImport() {
  const queryClient = useQueryClient();

  return useMutation<BulkImportOut, Error, BulkImportIn>({
    mutationFn: (payload) => productsClient.bulkImport(payload),
    onSuccess: () => {
      // Invalidate products list to refresh import status
      queryClient.invalidateQueries({ queryKey: productKeys.root });
    },
  });
}
