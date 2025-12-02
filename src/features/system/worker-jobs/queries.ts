// src/features/system/worker-jobs/queries.ts
import { useQuery } from "@tanstack/react-query";
import {
    workerJobsClient,
    type WorkerJobListOut,
    type WorkerJobListParams,
    type WorkerJobErrorsListParams,
    type WorkerJobStatus,
} from "@/api/worker-jobs";
import { queryClient } from "@/lib/query-client";

export const workerJobsKeys = {
    all: ["worker-jobs"] as const,
    list: (params: NormalizedWorkerJobListParams) =>
        ["worker-jobs", "list", params] as const,
    errors: (params: NormalizedWorkerJobErrorsParams) =>
        ["worker-jobs", "errors", params] as const,
};

type NormalizedWorkerJobListParams = {
    job_kind: string | null;
    status: WorkerJobStatus | null;
    page: number;
    page_size: number;
};

type NormalizedWorkerJobErrorsParams = {
    job_kind: string | null;
    page: number;
    page_size: number;
};

function normalizeListParams(
    params: WorkerJobListParams = {},
): NormalizedWorkerJobListParams {
    return {
        job_kind: params.job_kind ?? null,
        status: params.status ?? null,
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
    };
}

function normalizeErrorsParams(
    params: WorkerJobErrorsListParams = {},
): NormalizedWorkerJobErrorsParams {
    return {
        job_kind: params.job_kind ?? null,
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
    };
}

/**
 * Lista geral de jobs (GET /worker/jobs)
 */
export function useWorkerJobsList(rawParams: WorkerJobListParams = {}) {
    const params = normalizeListParams(rawParams);

    return useQuery<WorkerJobListOut>({
        queryKey: workerJobsKeys.list(params),
        queryFn: () => workerJobsClient.list(params),

        // v5: substitui o antigo keepPreviousData
        // Se não quiseres este comportamento, apaga esta linha.
        placeholderData: (prev) => prev,
    });
}

/**
 * Lista de jobs com erro (GET /worker/jobs/errors)
 */
export function useWorkerJobsErrors(
    rawParams: WorkerJobErrorsListParams = {},
) {
    const params = normalizeErrorsParams(rawParams);

    return useQuery<WorkerJobListOut>({
        queryKey: workerJobsKeys.errors(params),
        queryFn: () => workerJobsClient.listErrors(params),
        placeholderData: (prev) => prev,
    });
}

/**
 * Prefetch opcional – se quiseres pre-carregar a lista ao abrir o menu "Sistema"
 */
export function prefetchWorkerJobsList(rawParams: WorkerJobListParams = {}) {
    const params = normalizeListParams(rawParams);

    return queryClient.prefetchQuery({
        queryKey: workerJobsKeys.list(params),
        queryFn: () => workerJobsClient.list(params),
    });
}
