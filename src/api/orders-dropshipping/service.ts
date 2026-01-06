// src/api/orders-dropshipping/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
  DropshippingOrderOut,
  DropshippingOrderListOut,
  SupplierOrderListOut,
  ListOrdersParams,
  ListSupplierOrdersParams,
  SelectSupplierIn,
  ImportResult,
  PendingLinesListOut,

} from "./types";

export class OrdersDropshippingService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  /**
   * Lista encomendas dropshipping com paginação e filtros
   */
  list(params: ListOrdersParams = {}) {
    const { page = 1, pageSize = 50, status = null } = params;

    return this.http.get<DropshippingOrderListOut>(Endpoints.DROPSHIPPING_ORDERS, {
      params: {
        page,
        page_size: pageSize,
        status,
      },
    });
  }

  /**
   * Obtém detalhes de uma encomenda
   */
  get(orderId: number) {
    return this.http.get<DropshippingOrderOut>(
      Endpoints.DROPSHIPPING_ORDER_BY_ID(orderId)
    );
  }

  /**
   * Lista linhas pendentes com ofertas de fornecedores
   */
  listPendingLines(status?: string | null) {
    return this.http.get<PendingLinesListOut>(Endpoints.DROPSHIPPING_PENDING_LINES, {
      params: { status },
    });
  }

  /**
   * Seleciona fornecedor para uma linha
   */
  selectSupplier(orderId: number, lineId: number, payload: SelectSupplierIn) {
    return this.http.post<{ success: boolean; line_id: number }>(
      Endpoints.DROPSHIPPING_ORDER_SELECT_SUPPLIER(orderId, lineId),
      payload
    );
  }

  /**
   * Lista pedidos a fornecedores
   */
  listSupplierOrders(params: ListSupplierOrdersParams = {}) {
    const { page = 1, pageSize = 50, id_supplier = null, status = null } = params;

    return this.http.get<SupplierOrderListOut>(Endpoints.DROPSHIPPING_SUPPLIER_ORDERS, {
      params: {
        page,
        page_size: pageSize,
        id_supplier,
        status,
      },
    });
  }

  /**
   * Importa encomendas do PrestaShop
   */
  import(since?: string | null) {
    return this.http.post<ImportResult>(Endpoints.DROPSHIPPING_IMPORT, null, {
      params: { since },
    });
  }


}

