// src/api/products/index.ts (ou equivalente)
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
  ProductListParams,
  ProductListResponse,
  ProductDetailParams,
  ProductDetailResponse,
} from "./types";

export class ProductsService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  // Product list with filters
  list(params: ProductListParams = {}) {
    const {
      page = 1,
      pageSize = 20,
      q = null,
      gtin = null,
      partnumber = null,
      id_brand = null,
      brand = null,
      id_category = null,
      category = null,
      has_stock = null,
      id_supplier = null,
      sort = "recent",
    } = params;

    return this.http.get<ProductListResponse>(Endpoints.PRODUCTS, {
      params: {
        page,
        page_size: pageSize,
        q,
        gtin,
        partnumber,
        id_brand,
        brand,
        id_category,
        category,
        has_stock,
        id_supplier,
        sort,
      },
    });
  }

  // Single product complete details
  get(id: number, params: ProductDetailParams = {}) {
    return this.http.get<ProductDetailResponse>(Endpoints.PRODUCT(id), {
      params: {
        expand_meta: params.expand_meta ?? true,
        expand_offers: params.expand_offers ?? true,
        expand_events: params.expand_events ?? true,
        events_days: params.events_days ?? 90,
        events_limit: params.events_limit ?? 2000,
        aggregate_daily: params.aggregate_daily ?? true,
      },
    });
  }
}
