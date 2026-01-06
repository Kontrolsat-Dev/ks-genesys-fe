// src/api/prestashop/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type { PrestashopCategoriesResponse, PrestashopOrderDetail } from "./types";

export class PrestashopService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  getCategories() {
    return this.http.get<PrestashopCategoriesResponse>(
      Endpoints.PRESTASHOP_CATEGORIES
    );
  }

  /**
   * Obtém detalhes da encomenda do PrestaShop via JIT
   */
  getOrder(id: number) {
    return this.http.get<PrestashopOrderDetail>(
      Endpoints.PRESTASHOP_ORDER_DETAIL(id)
    );
  }
}
