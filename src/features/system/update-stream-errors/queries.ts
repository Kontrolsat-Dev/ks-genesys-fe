import { useQuery } from "@tanstack/react-query";
import { catalogUpdateStreamClient } from "@/api/catalog-update-stream";
import type {
  CatalogUpdateStreamListResponse,
  CatalogUpdateStreamErrorsListParams,
} from "@/api/catalog-update-stream";

export const catalogUpdateStreamKeys = {
  root: ["system", "catalog-update-stream"] as const,
  errors: (page: number, pageSize: number) =>
    [...catalogUpdateStreamKeys.root, "errors", page, pageSize] as const,
};

export function useCatalogUpdateErrors(
  params: CatalogUpdateStreamErrorsListParams = {}
) {
  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 20;

  return useQuery<CatalogUpdateStreamListResponse>({
    queryKey: catalogUpdateStreamKeys.errors(page, pageSize),
    queryFn: () => catalogUpdateStreamClient.listCatalogUpdateErrors(page, pageSize),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
