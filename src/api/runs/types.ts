// src/api/runs/types.ts

export type RunStatus = "running" | "ok" | "partial" | "error";

export interface Run {
  id: number;
  id_feed: number;
  supplier_id?: number | null;
  supplier_name?: string | null;
  status: RunStatus;
  started_at: string;
  finished_at?: string | null;
  rows_total: number;
  rows_changed: number;
  rows_failed: number;
  rows_unseen: number;
  http_status?: number | null;
  duration_ms?: number | null;
  error_msg?: string | null;
}

export interface RunListResponse {
  items: Run[];
  total: number;
  page: number;
  page_size: number;
}
