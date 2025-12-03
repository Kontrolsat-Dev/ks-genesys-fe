// src/api/worker-jobs/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";
import type {
  WorkerJobListOut,
  WorkerJobListParams,
  WorkerJobErrorsListParams,
} from "./types";

export class WorkerJobsService {
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
   * Listagem genérica de jobs (podes filtrar por job_kind e status)
   * GET /worker/jobs
   */
  list(params: WorkerJobListParams = {}) {
    const { job_kind = null, status = null, page = 1, page_size = 20 } = params;

    return this.http.get<WorkerJobListOut>(Endpoints.WORKER_JOBS, {
      params: {
        job_kind,
        status,
        page,
        page_size,
      },
    });
  }

  /**
   * Atalho para listar apenas jobs com erro.
   * GET /worker/jobs/errors
   */
  listErrors(params: WorkerJobErrorsListParams = {}) {
    const { job_kind = null, page = 1, page_size = 20 } = params;

    return this.http.get<WorkerJobListOut>(Endpoints.WORKER_JOBS_ERROR, {
      params: {
        job_kind,
        page,
        page_size,
      },
    });
  }
}
