// src/api/categories/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
  CategoriesListResponse,
  CategoriesListParams,
  CategoryMappingIn,
  CategoryMappingOut,
} from "./types";

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
    const { page = 1, pageSize = 20, q = null, autoImport = null } = params;
    const search = q && q.trim().length ? q.trim() : null;
    return this.http.get<CategoriesListResponse>(Endpoints.CATEGORIES, {
      params: {
        page,
        page_size: pageSize,
        search,
        auto_import: autoImport,
      },
    });
  }

  listMapped() {
    return this.http.get<CategoryMappingOut[]>(Endpoints.CATEGORIES_MAPPED);
  }

  updateMapping(id: number, payload: CategoryMappingIn) {
    return this.http.put<CategoryMappingOut>(
      Endpoints.CATEGORY_MAPPING(id),
      payload
    );
  }

  deleteMapping(id: number) {
    return this.http.delete(Endpoints.CATEGORY_MAPPING(id));
  }
}

