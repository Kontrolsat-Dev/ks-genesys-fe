// src/features/orders-dropshipping/queries.ts
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ordersDropshippingClient } from "@/api/orders-dropshipping";
import type {
  DropshippingOrderListOut,
  DropshippingOrderOut,
  ListOrdersParams,
  ListSupplierOrdersParams,
  SelectSupplierIn,
  ImportResult,
  PendingLinesListOut,

} from "@/api/orders-dropshipping";
import { prestashopClient } from "@/api/prestashop";
import type { PrestashopOrderDetail } from "@/api/prestashop";

/**
 * Query keys para cache
 */
export const ordersDropshippingKeys = {
  root: ["orders-dropshipping"] as const,
  list: (params: ListOrdersParams) =>
    [...ordersDropshippingKeys.root, "list", params] as const,
  detail: (id: number) =>
    [...ordersDropshippingKeys.root, "detail", id] as const,
  psOrder: (id: number) =>
    [...ordersDropshippingKeys.root, "ps-order", id] as const,
  pendingLines: (status?: string | null) =>
    [...ordersDropshippingKeys.root, "pending-lines", status ?? "all"] as const,
  supplierOrders: (params: ListSupplierOrdersParams) =>
    [...ordersDropshippingKeys.root, "supplier-orders", params] as const,
};

/**
 * Hook para listar encomendas dropshipping
 */
export function useOrdersDropshippingList(params: ListOrdersParams = {}) {
  const normalized = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
    status: params.status ?? null,
  };

  return useQuery<DropshippingOrderListOut & { elapsedMs: number }>({
    queryKey: ordersDropshippingKeys.list(normalized),
    queryFn: async () => {
      const started = performance.now();
      const data = await ordersDropshippingClient.list(normalized);
      const elapsedMs = Math.max(0, performance.now() - started);
      return { ...data, elapsedMs };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/**
 * Hook para listar linhas pendentes com ofertas
 */
export function usePendingLines(status?: string | null) {
  return useQuery<PendingLinesListOut>({
    queryKey: ordersDropshippingKeys.pendingLines(status),
    queryFn: () => ordersDropshippingClient.listPendingLines(status),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/**
 * Hook para obter detalhe de uma encomenda
 */
export function useOrderDropshipping(orderId: number) {
  return useQuery<DropshippingOrderOut>({
    queryKey: ordersDropshippingKeys.detail(orderId),
    queryFn: () => ordersDropshippingClient.get(orderId),
    enabled: orderId > 0,
  });
}

/**
 * Hook para selecionar fornecedor para uma linha
 */
export function useSelectSupplier() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; line_id: number },
    Error,
    { orderId: number; lineId: number; payload: SelectSupplierIn }
  >({
    mutationFn: ({ orderId, lineId, payload }) =>
      ordersDropshippingClient.selectSupplier(orderId, lineId, payload),
    onSuccess: () => {
      // Invalidar toda a cache de dropshipping
      queryClient.invalidateQueries({
        queryKey: ordersDropshippingKeys.root,
      });
    },
  });
}

/**
 * Hook para importar encomendas do PrestaShop
 */
export function useImportOrders() {
  const queryClient = useQueryClient();

  return useMutation<ImportResult, Error, string | null | undefined>({
    mutationFn: (since) => ordersDropshippingClient.import(since),
    onSuccess: () => {
      // Invalidar toda a cache de dropshipping
      queryClient.invalidateQueries({
        queryKey: ordersDropshippingKeys.root,
      });
    },
  });
}

/**
 * Hook para obter detalhe da encomenda no PrestaShop (JIT)
 */
export function usePrestashopOrder(idPsOrder: number | null) {
  return useQuery<PrestashopOrderDetail>({
    queryKey: ordersDropshippingKeys.psOrder(idPsOrder ?? 0),
    queryFn: () => prestashopClient.getOrder(idPsOrder!),
    enabled: !!idPsOrder && idPsOrder > 0,
    staleTime: 0, // Sempre buscar fresco para ser real-time
  });
}

