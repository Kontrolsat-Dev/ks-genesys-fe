// src/api/audit/types.ts
// Tipos para API de audit logs

export type AuditLogOut = {
  id: number;
  event_type: string;
  entity_type: string | null;
  entity_id: number | null;
  actor_id: string | null;
  actor_name: string | null;
  description: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type AuditLogListResponse = {
  items: AuditLogOut[];
  total: number;
  page: number;
  page_size: number;
};

export type AuditLogListParams = {
  event_type?: string | null;
  entity_type?: string | null;
  entity_id?: number | null;
  from_date?: string | null;
  to_date?: string | null;
  page?: number;
  page_size?: number;
};

export type EventTypesResponse = {
  event_types: string[];
};
