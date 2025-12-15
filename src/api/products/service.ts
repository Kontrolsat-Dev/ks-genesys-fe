// src/api/products/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
  ProductListParams,
  ProductListResponse,
  ProductDetailParams,
  ProductDetailResponse,
  ProductMarginUpdate,
  ProductPriceChangeListParams,
  ProductPriceChangeListOut,
  ProductFacetsParams,
  ProductFacetsOut,
  ProductImportIn,
  ProductImportOut,
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
      imported = null,
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
        imported,
      },
    });
  }

  // ✅ NOVO: Facets (brands/categories/suppliers válidos para os filtros atuais)
  facets(params: ProductFacetsParams = {}) {
    const {
      q = null,
      gtin = null,
      partnumber = null,
      id_brand = null,
      brand = null,
      id_category = null,
      category = null,
      has_stock = null,
      id_supplier = null,
      imported = null,
    } = params;

    return this.http.get<ProductFacetsOut>(Endpoints.PRODUCTS_FACETS, {
      params: {
        q,
        gtin,
        partnumber,
        id_brand,
        brand,
        id_category,
        category,
        has_stock,
        id_supplier,
        imported,
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

  // Update product margin
  updateMargin(
    id: number,
    payload: ProductMarginUpdate,
    params: ProductDetailParams = {}
  ) {
    return this.http.patch<ProductDetailResponse>(
      Endpoints.PRODUCT_UPDATE_MARGIN(id),
      payload,
      {
        params: {
          expand_meta: params.expand_meta ?? true,
          expand_offers: params.expand_offers ?? true,
          expand_events: params.expand_events ?? true,
          events_days: params.events_days ?? 90,
          events_limit: params.events_limit ?? 2000,
          aggregate_daily: params.aggregate_daily ?? true,
        },
      }
    );
  }

  listActivityOfferPriceChanges(params: ProductPriceChangeListParams = {}) {
    const {
      direction = "down", // default igual ao backend
      days = 7, // janela temporal default (7 dias)
      min_abs_delta = null, // sem filtro por defeito
      min_pct_delta = null, // sem filtro por defeito
      page = 1,
      page_size = 50,
    } = params;

    return this.http.get<ProductPriceChangeListOut>(
      Endpoints.PRODUCT_ACTIVE_OFFER_PRICE_CHANGES,
      {
        params: {
          direction,
          days,
          min_abs_delta,
          min_pct_delta,
          page,
          page_size,
        },
      }
    );
  }

  listCatalogPriceChanges(params: ProductPriceChangeListParams = {}) {
    const {
      direction = "down",
      days = 30,
      min_abs_delta = 0, // aqui o backend já tem default 0
      min_pct_delta = 5, // e 5%
      page = 1,
      page_size = 50,
    } = params;

    return this.http.get<ProductPriceChangeListOut>(
      Endpoints.PRODUCT_CATALOG_PRICE_CHANGES,
      {
        params: {
          direction,
          days,
          min_abs_delta,
          min_pct_delta,
          page,
          page_size,
        },
      }
    );
  }

  // Import product to PrestaShop
  importToPs(id: number, payload: ProductImportIn) {
    return this.http.post<ProductImportOut>(
      Endpoints.PRODUCT_IMPORT(id),
      payload
    );
  }
}
