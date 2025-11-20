// src/features/system/update-stream/queries.ts
import { useQuery, QueryClient } from "@tanstack/react-query";
import { systemClient } from "@/api/system";
import type {
  CatalogUpdateStatus,
  CatalogUpdateStreamListParams,
  CatalogUpdateStreamListResponse,
} from "@/api/system";

export type UpdateStreamListParams = {
  status?: CatalogUpdateStatus | "all";
  page?: number;
  pageSize?: number;
};

export const updateStreamKeys = {
  root: ["update-stream"] as const,
  list: (params: {
    status: CatalogUpdateStatus | "all";
    page: number;
    pageSize: number;
  }) => [...updateStreamKeys.root, "list", params] as const,
};

export function useUpdateStreamList(params: UpdateStreamListParams = {}) {
  const status: CatalogUpdateStatus | "all" = params.status ?? "pending";
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const apiParams: CatalogUpdateStreamListParams = {
    status: status === "all" ? undefined : (status as CatalogUpdateStatus),
    page,
    page_size: pageSize,
  };

  return useQuery<CatalogUpdateStreamListResponse>({
    queryKey: updateStreamKeys.list({ status, page, pageSize }),
    queryFn: () => systemClient.listCatalogUpdates(apiParams),
    // keepPreviousData: true,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export async function prefetchUpdateStreamList(
  qc: QueryClient,
  params: UpdateStreamListParams = {}
) {
  const status: CatalogUpdateStatus | "all" = params.status ?? "pending";
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const apiParams: CatalogUpdateStreamListParams = {
    status: status === "all" ? undefined : (status as CatalogUpdateStatus),
    page,
    page_size: pageSize,
  };

  await qc.prefetchQuery({
    queryKey: updateStreamKeys.list({ status, page, pageSize }),
    queryFn: () => systemClient.listCatalogUpdates(apiParams),
    staleTime: 30_000,
  });
}
