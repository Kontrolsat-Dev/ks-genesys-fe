// src/features/system/update-stream/queries.ts
import { useQuery } from "@tanstack/react-query";
import { systemClient } from "@/api/system";
import type {
  CatalogUpdateStreamListResponse,
  CatalogUpdateStreamListParams,
  CatalogUpdateStatus,
} from "@/api/system/types";

export const catalogUpdateStreamKeys = {
  root: ["system", "catalog-update-stream"] as const,
  list: (status: CatalogUpdateStatus | null, page: number, pageSize: number) =>
    [...catalogUpdateStreamKeys.root, "list", status, page, pageSize] as const,
};

export function useUpdateStreamList(
  params: CatalogUpdateStreamListParams = {}
) {
  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 20;
  const status: CatalogUpdateStatus | null = params.status ?? null;

  return useQuery<CatalogUpdateStreamListResponse>({
    queryKey: catalogUpdateStreamKeys.list(status, page, pageSize),
    queryFn: () =>
      systemClient.listCatalogUpdates({
        status: params.status,
        page,
        page_size: pageSize,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
