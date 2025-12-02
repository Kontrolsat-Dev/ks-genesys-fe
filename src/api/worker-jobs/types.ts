// src/api/worker-jobs/types.ts

export type WorkerJobStatus =
    | "pending"
    | "running"
    | "done"
    | "failed"
    | "cancelled";

export type WorkerJobListParams = {
    job_kind?: string | null;
    status?: WorkerJobStatus | null;
    page?: number;
    page_size?: number; // → enviado como page_size
};

export type WorkerJobErrorsListParams = {
    job_kind?: string | null;
    page?: number;
    page_size?: number;
};

export interface WorkerJobItem {
    id_job: number;
    job_kind: string;
    job_key: string | null;
    status: WorkerJobStatus;
    priority: number;
    attempts: number;
    not_before: string | null;
    locked_by: string | null;
    locked_at: string | null;
    started_at: string | null;
    finished_at: string | null;
    last_error: string | null;
    created_at: string;
    updated_at: string;
}

export interface WorkerJobListOut {
    items: WorkerJobItem[];
    total: number;
    page: number;
    page_size: number;
}
