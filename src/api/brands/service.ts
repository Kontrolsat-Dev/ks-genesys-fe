// src/api/brands/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type { BrandsListResponse, BrandsListParams } from "./types";

export class BrandsService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  list(params: BrandsListParams = {}) {
    const { page = 1, pageSize = 20, q = null } = params;

    return this.http.get<BrandsListResponse>(Endpoints.BRANDS, {
      params: {
        page,
        page_size: pageSize,
        q,
      },
    });
  }
}
