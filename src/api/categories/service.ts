// src/api/categories/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type { CategoriesListResponse, CategoriesListParams } from "./types";

export class CategoriesService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  list(params: CategoriesListParams = {}) {
    const { page = 1, pageSize = 20, q = null } = params;

    return this.http.get<CategoriesListResponse>(Endpoints.CATEGORIES, {
      params: {
        page,
        page_size: pageSize,
        q,
      },
    });
  }
}
