import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type { RunListResponse } from "./types";

export class RunsService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http =
      http ??
      new HttpClient({
        baseUrl: Endpoints.BASE_URL,
        token: () => authStore.get(),
      });
  }

  listRuns(page = 1, pageSize = 50) {
    return this.http.get<RunListResponse>(Endpoints.RUNS, {
      params: { page, page_size: pageSize },
    });
  }

  ingestSupplier(idSupplier: number) {
    return this.http.post<any>(Endpoints.RUNS_INGEST_SUPPLIER(idSupplier));
  }
}
